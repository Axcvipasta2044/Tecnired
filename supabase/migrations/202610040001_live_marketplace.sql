-- Apply this migration when schema.sql was already installed.

CREATE OR REPLACE FUNCTION public.validate_service_request_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF ROW(
    NEW.client_id, NEW.technician_id, NEW.technician_service_id, NEW.title,
    NEW.description, NEW.service_address, NEW.department, NEW.city, NEW.district,
    NEW.preferred_date, NEW.budget_min, NEW.budget_max, NEW.contact_phone
  ) IS DISTINCT FROM ROW(
    OLD.client_id, OLD.technician_id, OLD.technician_service_id, OLD.title,
    OLD.description, OLD.service_address, OLD.department, OLD.city, OLD.district,
    OLD.preferred_date, OLD.budget_min, OLD.budget_max, OLD.contact_phone
  ) THEN
    RAISE EXCEPTION 'Los datos de una solicitud no se pueden modificar después de crearla';
  END IF;

  IF OLD.status = NEW.status THEN
    IF NEW.completed_at IS DISTINCT FROM OLD.completed_at THEN
      RAISE EXCEPTION 'La fecha de finalización es administrada por la plataforma';
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.status <> 'completed' AND NEW.completed_at IS DISTINCT FROM OLD.completed_at THEN
    RAISE EXCEPTION 'La fecha de finalización es administrada por la plataforma';
  END IF;

  IF public.current_user_role() = 'client' THEN
    IF OLD.status = 'pending'
      AND NEW.status = 'cancelled'
      AND OLD.client_id = auth.uid() THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'El cliente no puede realizar esta transición';
  END IF;

  IF public.current_user_role() <> 'technician'
    OR NOT public.owns_technician_profile(OLD.technician_id) THEN
    RAISE EXCEPTION 'No autorizado para cambiar el estado de esta solicitud';
  END IF;

  IF OLD.status IN ('rejected', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Estado "%" es final y no admite cambios', OLD.status;
  END IF;

  CASE OLD.status
    WHEN 'pending' THEN
      IF NEW.status NOT IN ('accepted', 'rejected', 'cancelled') THEN
        RAISE EXCEPTION 'Transición inválida: pending → %', NEW.status;
      END IF;
    WHEN 'accepted' THEN
      IF NEW.status NOT IN ('in_progress', 'cancelled') THEN
        RAISE EXCEPTION 'Transición inválida: accepted → %', NEW.status;
      END IF;
    WHEN 'in_progress' THEN
      IF NEW.status NOT IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION 'Transición inválida: in_progress → %', NEW.status;
      END IF;
    ELSE
      RAISE EXCEPTION 'Estado origen desconocido: %', OLD.status;
  END CASE;

  IF NEW.status = 'completed' THEN
    NEW.completed_at := now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE VIEW public.public_technicians
WITH (security_invoker = false)
AS
SELECT
  tp.id,
  tp.slug,
  tp.headline,
  tp.years_experience,
  tp.is_available,
  tp.verification_status,
  p.display_name,
  p.avatar_url,
  p.department,
  p.city,
  p.district,
  c.name AS category_name,
  c.slug AS category_slug,
  ROUND(AVG(r.rating)::numeric, 2) AS avg_rating,
  COUNT(r.id)::int AS review_count,
  tp.bio
FROM public.technician_profiles tp
INNER JOIN public.profiles p ON p.id = tp.user_id
LEFT JOIN public.categories c ON c.id = tp.primary_category_id
LEFT JOIN public.reviews r ON r.technician_id = tp.id
WHERE tp.is_published = true
  AND p.is_active = true
GROUP BY
  tp.id, tp.slug, tp.headline, tp.years_experience, tp.is_available,
  tp.verification_status, p.display_name, p.avatar_url,
  p.department, p.city, p.district, c.name, c.slug, tp.bio;

COMMENT ON VIEW public.public_technicians IS
  'Proyección pública segura de técnicos publicados con rating promedio; no incluye datos de contacto';

DROP POLICY IF EXISTS "certifications_select_published" ON public.certifications;
CREATE POLICY "certifications_select_published"
  ON public.certifications FOR SELECT TO authenticated, anon
  USING (
    verification_status = 'verified'
    AND EXISTS (
      SELECT 1 FROM public.technician_profiles tp
      WHERE tp.id = certifications.technician_id AND tp.is_published = true
    )
  );

GRANT SELECT ON public.public_technicians TO authenticated, anon;
GRANT SELECT ON public.technician_services TO authenticated, anon;
GRANT SELECT (id, technician_id, company, job_title, description, start_date, end_date, is_current, created_at)
  ON public.work_experiences TO anon;
GRANT SELECT (id, technician_id, institution, degree, field_of_study, start_date, end_date, description, created_at)
  ON public.educations TO anon;
GRANT SELECT (id, technician_id, name, issuer, issue_date, expiration_date, verification_status, created_at)
  ON public.certifications TO anon;
GRANT SELECT (id, technician_id, title, description, image_storage_path, category_id, position, created_at, updated_at)
  ON public.portfolio_items TO anon;
GRANT SELECT (id, technician_id, rating, comment, created_at)
  ON public.reviews TO anon;
