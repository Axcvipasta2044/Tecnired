-- =============================================================================
-- TecniRed — Schema completo para Supabase
-- Plataforma peruana de servicios técnicos
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extensiones
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- 2. Tipos enumerados implícitos (CHECK constraints en tablas)
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 3. Tablas base
-- ---------------------------------------------------------------------------

-- Categorías de servicios (sin dependencias de otras tablas de app)
CREATE TABLE public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  icon        text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.categories IS 'Categorías de servicios técnicos disponibles en TecniRed';

-- Perfiles de usuario (vinculados a auth.users)
CREATE TABLE public.profiles (
  id                 uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role               text NOT NULL DEFAULT 'client'
                       CHECK (role IN ('client', 'technician', 'admin')),
  first_name         text,
  last_name          text,
  display_name       text,
  avatar_url         text,
  phone              text,
  department         text,
  city               text,
  district           text,
  contact_preference text CHECK (contact_preference IN ('phone', 'whatsapp', 'email')),
  is_active          boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Perfil extendido de cada usuario registrado';

-- Constancia mínima de aceptación de términos y aviso de privacidad en el alta.
-- No se permite lectura/escritura directa desde clientes; solo la escribe el trigger de Auth.
CREATE TABLE public.terms_acceptances (
  user_id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_role    text NOT NULL CHECK (account_role IN ('client', 'technician')),
  terms_version   text NOT NULL,
  privacy_version text NOT NULL,
  accepted_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.terms_acceptances IS 'Constancia de versiones aceptadas al crear cada cuenta';

-- Perfil profesional del técnico
CREATE TABLE public.technician_profiles (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug                 text NOT NULL UNIQUE,
  headline             text,
  bio                  text,
  primary_category_id  uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  years_experience     int NOT NULL DEFAULT 0 CHECK (years_experience >= 0),
  is_available         boolean NOT NULL DEFAULT true,
  is_published         boolean NOT NULL DEFAULT false,
  verification_status  text NOT NULL DEFAULT 'unverified'
                         CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  cv_storage_path      text,
  profile_views_count  int NOT NULL DEFAULT 0 CHECK (profile_views_count >= 0),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.technician_profiles IS 'Perfil público/profesional de técnicos registrados';

-- Servicios que ofrece cada técnico
CREATE TABLE public.technician_services (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id  uuid NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  category_id    uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title          text NOT NULL,
  description    text,
  pricing_type   text NOT NULL DEFAULT 'quote'
                 CHECK (pricing_type IN ('fixed', 'range', 'hourly', 'quote')),
  price_min      numeric(12, 2) CHECK (price_min IS NULL OR price_min >= 0),
  price_max      numeric(12, 2) CHECK (price_max IS NULL OR price_max >= 0),
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT technician_services_price_range CHECK (
    price_min IS NULL OR price_max IS NULL OR price_max >= price_min
  )
);

COMMENT ON TABLE public.technician_services IS 'Servicios individuales ofrecidos por cada técnico';

-- Experiencia laboral del técnico
CREATE TABLE public.work_experiences (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id  uuid NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  company        text NOT NULL,
  job_title      text NOT NULL,
  description    text,
  start_date     date NOT NULL,
  end_date       date,
  is_current     boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.work_experiences IS 'Historial laboral del técnico';

-- Formación académica
CREATE TABLE public.educations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id   uuid NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  institution     text NOT NULL,
  degree          text NOT NULL,
  field_of_study  text,
  start_date      date,
  end_date        date,
  description     text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.educations IS 'Estudios formales del técnico';

-- Certificaciones con verificación administrativa
CREATE TABLE public.certifications (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id        uuid NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  name                 text NOT NULL,
  issuer               text NOT NULL,
  issue_date           date,
  expiration_date      date,
  storage_path         text,
  verification_status  text NOT NULL DEFAULT 'unverified'
                       CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verified_by          uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at          timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.certifications IS 'Certificaciones profesionales del técnico';

-- Portafolio de trabajos realizados
CREATE TABLE public.portfolio_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id       uuid NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  title               text NOT NULL,
  description         text,
  image_storage_path  text NOT NULL,
  category_id         uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  position            int NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.portfolio_items IS 'Galería de trabajos del técnico';

-- Solicitudes de servicio entre clientes y técnicos
CREATE TABLE public.service_requests (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  technician_id         uuid NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  technician_service_id uuid REFERENCES public.technician_services(id) ON DELETE SET NULL,
  title                 text NOT NULL,
  description           text NOT NULL,
  service_address       text,
  department            text,
  city                  text,
  district              text,
  preferred_date        date,
  budget_min            numeric(12, 2) CHECK (budget_min IS NULL OR budget_min >= 0),
  budget_max            numeric(12, 2) CHECK (budget_max IS NULL OR budget_max >= 0),
  contact_phone         text,
  status                text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  completed_at          timestamptz,
  CONSTRAINT service_requests_budget_range CHECK (
    budget_min IS NULL OR budget_max IS NULL OR budget_max >= budget_min
  )
);

COMMENT ON TABLE public.service_requests IS 'Solicitudes de servicio de clientes a técnicos';

-- Historial de cambios de estado de solicitudes
CREATE TABLE public.request_status_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  uuid NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  changed_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  old_status  text CHECK (old_status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
  new_status  text NOT NULL
              CHECK (new_status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.request_status_history IS 'Auditoría de transiciones de estado en solicitudes';

-- Reseñas (una por solicitud completada)
CREATE TABLE public.reviews (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id     uuid NOT NULL UNIQUE REFERENCES public.service_requests(id) ON DELETE CASCADE,
  client_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  technician_id  uuid NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  rating         int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment        text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reviews IS 'Reseñas de clientes sobre servicios completados';

-- Registro de visitas al perfil del técnico
CREATE TABLE public.profile_views (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id  uuid NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  viewer_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profile_views IS 'Tracking de visualizaciones de perfiles de técnicos';

-- Reportes de usuarios
CREATE TABLE public.reports (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  service_request_id  uuid REFERENCES public.service_requests(id) ON DELETE SET NULL,
  reason              text NOT NULL,
  description         text,
  status              text NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reports IS 'Reportes de conducta o incidencias entre usuarios';

-- ---------------------------------------------------------------------------
-- 4. Seed de categorías peruanas
-- ---------------------------------------------------------------------------
INSERT INTO public.categories (name, slug, description, icon, is_active)
VALUES
  ('Soporte técnico',           'soporte-tecnico',           'Asistencia y soporte informático general',           'monitor',        true),
  ('Reparación de computadoras','reparacion-computadoras',   'Mantenimiento y reparación de PCs y laptops',        'laptop',         true),
  ('Reparación de celulares',   'reparacion-celulares',      'Reparación de smartphones y tablets',                'smartphone',     true),
  ('Redes',                     'redes',                     'Instalación y configuración de redes',               'network',        true),
  ('Electricidad',              'electricidad',              'Instalaciones y reparaciones eléctricas',            'zap',            true),
  ('Refrigeración',             'refrigeracion',             'Mantenimiento de equipos de refrigeración',          'snowflake',      true),
  ('Aire acondicionado',        'aire-acondicionado',        'Instalación y mantenimiento de A/C',                 'wind',           true),
  ('Gasfitería',                'gasfiteria',                'Instalaciones sanitarias y plomería',                'droplets',       true),
  ('Mecánica',                  'mecanica',                  'Mecánica automotriz y maquinaria',                   'wrench',         true),
  ('Carpintería',               'carpinteria',               'Trabajos en madera y muebles',                       'hammer',         true),
  ('Pintura',                   'pintura',                   'Pintura de interiores y exteriores',                 'paintbrush',     true),
  ('Albañilería',               'albanileria',               'Construcción, mampostería y acabados',               'brick-wall',     true),
  ('Cerrajería',                'cerrajeria',                'Apertura, cambio de cerraduras y seguridad',         'key',            true),
  ('Electrodomésticos',         'electrodomesticos',         'Reparación de lavadoras, cocinas y electrodomésticos','plug',          true)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  icon        = EXCLUDED.icon,
  is_active   = EXCLUDED.is_active;

-- ---------------------------------------------------------------------------
-- 5. Índices
-- ---------------------------------------------------------------------------
CREATE INDEX idx_profiles_role           ON public.profiles (role);
CREATE INDEX idx_profiles_location       ON public.profiles (department, city, district);
CREATE INDEX idx_profiles_is_active      ON public.profiles (is_active) WHERE is_active = true;

CREATE INDEX idx_technician_profiles_slug              ON public.technician_profiles (slug);
CREATE INDEX idx_technician_profiles_user_id           ON public.technician_profiles (user_id);
CREATE INDEX idx_technician_profiles_primary_category  ON public.technician_profiles (primary_category_id);
CREATE INDEX idx_technician_profiles_published         ON public.technician_profiles (is_published, is_available)
  WHERE is_published = true;

CREATE INDEX idx_categories_slug         ON public.categories (slug);
CREATE INDEX idx_categories_active       ON public.categories (is_active) WHERE is_active = true;

CREATE INDEX idx_technician_services_technician  ON public.technician_services (technician_id);
CREATE INDEX idx_technician_services_category    ON public.technician_services (category_id);
CREATE INDEX idx_technician_services_active      ON public.technician_services (technician_id, is_active)
  WHERE is_active = true;

CREATE INDEX idx_work_experiences_technician   ON public.work_experiences (technician_id);
CREATE INDEX idx_educations_technician         ON public.educations (technician_id);
CREATE INDEX idx_certifications_technician     ON public.certifications (technician_id);
CREATE INDEX idx_portfolio_items_technician    ON public.portfolio_items (technician_id);

CREATE INDEX idx_service_requests_client       ON public.service_requests (client_id);
CREATE INDEX idx_service_requests_technician   ON public.service_requests (technician_id);
CREATE INDEX idx_service_requests_status       ON public.service_requests (status);
CREATE INDEX idx_service_requests_created      ON public.service_requests (created_at DESC);

CREATE INDEX idx_request_status_history_request ON public.request_status_history (request_id);

CREATE INDEX idx_reviews_technician  ON public.reviews (technician_id);
CREATE INDEX idx_reviews_client      ON public.reviews (client_id);

CREATE INDEX idx_profile_views_technician ON public.profile_views (technician_id);
CREATE INDEX idx_profile_views_created    ON public.profile_views (created_at DESC);

CREATE INDEX idx_reports_status    ON public.reports (status);
CREATE INDEX idx_reports_reporter  ON public.reports (reporter_id);

-- Búsqueda de texto simple en perfiles publicados
CREATE INDEX idx_technician_profiles_search ON public.technician_profiles
  USING gin (to_tsvector('spanish', coalesce(headline, '') || ' ' || coalesce(bio, '')));

CREATE INDEX idx_technician_services_search ON public.technician_services
  USING gin (to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, '')));

-- ---------------------------------------------------------------------------
-- 6. Funciones auxiliares (SECURITY DEFINER para evitar recursión RLS)
-- ---------------------------------------------------------------------------

-- Actualiza updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at IS 'Trigger genérico: asigna updated_at = now()';

-- Lee el rol del usuario actual sin activar RLS (evita recursión)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION public.current_user_role IS 'Retorna el rol del usuario autenticado sin recursión RLS';

-- Verifica si el usuario actual es administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin IS 'True si el usuario autenticado tiene rol admin';

-- Verifica si el usuario es dueño de un perfil de técnico
CREATE OR REPLACE FUNCTION public.owns_technician_profile(p_technician_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.technician_profiles
    WHERE id = p_technician_id AND user_id = auth.uid()
  );
$$;

COMMENT ON FUNCTION public.owns_technician_profile IS 'True si auth.uid() es dueño del technician_profile';

-- Obtiene el technician_profile.id del usuario actual
CREATE OR REPLACE FUNCTION public.my_technician_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.technician_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

COMMENT ON FUNCTION public.my_technician_profile_id IS 'UUID del perfil técnico del usuario autenticado';

-- ---------------------------------------------------------------------------
-- 7. Trigger: nuevo usuario en auth.users → crear profile
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role       text;
  v_first_name text;
  v_last_name  text;
  v_display    text;
  v_terms_version text;
  v_privacy_version text;
BEGIN
  v_role := NEW.raw_user_meta_data->>'role';
  IF v_role NOT IN ('client', 'technician') THEN
    RAISE EXCEPTION 'Selecciona un tipo de cuenta válido';
  END IF;

  v_terms_version := NEW.raw_user_meta_data->>'terms_version';
  v_privacy_version := NEW.raw_user_meta_data->>'privacy_version';
  IF NEW.raw_user_meta_data->>'terms_accepted' IS DISTINCT FROM 'true'
     OR NEW.raw_user_meta_data->>'privacy_acknowledged' IS DISTINCT FROM 'true'
     OR v_terms_version IS DISTINCT FROM '2026-10-05'
     OR v_privacy_version IS DISTINCT FROM '2026-10-05' THEN
    RAISE EXCEPTION 'Debes aceptar los términos vigentes y confirmar el aviso de privacidad';
  END IF;

  INSERT INTO public.terms_acceptances (user_id, account_role, terms_version, privacy_version)
  VALUES (NEW.id, v_role, v_terms_version, v_privacy_version);

  v_first_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), '');
  v_last_name  := NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), '');
  v_display    := NULLIF(TRIM(CONCAT(COALESCE(v_first_name, ''), ' ', COALESCE(v_last_name, ''))), '');

  INSERT INTO public.profiles (id, role, first_name, last_name, display_name)
  VALUES (NEW.id, v_role, v_first_name, v_last_name, v_display);

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS 'Crea profile al registrar usuario; role solo client|technician';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 8. Trigger: impedir que usuarios cambien su propio rol
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Solo admin (o service_role sin JWT) puede cambiar roles
    IF auth.uid() IS NOT NULL AND auth.uid() = OLD.id AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'No puedes cambiar tu propio rol';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.prevent_self_role_change IS 'Bloquea auto-promoción de rol; admin vía SQL manual';

CREATE TRIGGER profiles_prevent_self_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_role_change();

-- ---------------------------------------------------------------------------
-- 9. Triggers updated_at
-- ---------------------------------------------------------------------------
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_technician_profiles_updated_at
  BEFORE UPDATE ON public.technician_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_technician_services_updated_at
  BEFORE UPDATE ON public.technician_services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 10. Validación de transiciones de estado en service_requests
-- ---------------------------------------------------------------------------
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
    IF OLD.status = 'pending' AND NEW.status = 'cancelled'
      AND OLD.client_id = auth.uid() THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'El cliente no puede realizar esta transición';
  END IF;

  IF public.current_user_role() <> 'technician'
    OR NOT public.owns_technician_profile(OLD.technician_id) THEN
    RAISE EXCEPTION 'No autorizado para cambiar el estado de esta solicitud';
  END IF;

  -- Estados finales: sin cambios para usuarios normales
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

COMMENT ON FUNCTION public.validate_service_request_status_transition IS
  'Valida máquina de estados: pending→accepted|rejected|cancelled, etc.';

CREATE TRIGGER service_requests_validate_status
  BEFORE UPDATE OF status ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_service_request_status_transition();

-- ---------------------------------------------------------------------------
-- 11. Historial de estados y completed_at en service_requests
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_service_request_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.request_status_history (
      request_id, changed_by, old_status, new_status
    ) VALUES (
      NEW.id, auth.uid(), OLD.status, NEW.status
    );

    IF NEW.status = 'completed' THEN
      NEW.completed_at := now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.log_service_request_status_change IS
  'Registra historial y establece completed_at al completar';

CREATE TRIGGER service_requests_log_status_change
  BEFORE UPDATE OF status ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.log_service_request_status_change();

-- Registro inicial al crear solicitud
CREATE OR REPLACE FUNCTION public.log_initial_service_request_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.request_status_history (
    request_id, changed_by, old_status, new_status
  ) VALUES (
    NEW.id, auth.uid(), NULL, NEW.status
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER service_requests_log_initial_status
  AFTER INSERT ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.log_initial_service_request_status();

-- ---------------------------------------------------------------------------
-- 12. Validación de reseñas (solo solicitudes completadas, solo el cliente)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_review_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.service_requests%ROWTYPE;
BEGIN
  SELECT * INTO v_request
  FROM public.service_requests
  WHERE id = NEW.request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitud no encontrada';
  END IF;

  IF v_request.status <> 'completed' THEN
    RAISE EXCEPTION 'Solo se pueden reseñar solicitudes completadas';
  END IF;

  IF v_request.client_id <> auth.uid() THEN
    RAISE EXCEPTION 'Solo el cliente de la solicitud puede dejar una reseña';
  END IF;

  NEW.client_id     := v_request.client_id;
  NEW.technician_id := v_request.technician_id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.validate_review_insert IS
  'Permite reseñas únicamente del cliente en solicitudes completed';

CREATE TRIGGER reviews_validate_insert
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_review_insert();

-- ---------------------------------------------------------------------------
-- 13. Incrementar contador de vistas de perfil
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_profile_views_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.technician_profiles
  SET profile_views_count = profile_views_count + 1
  WHERE id = NEW.technician_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profile_views_increment_count
  AFTER INSERT ON public.profile_views
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_profile_views_count();

-- ---------------------------------------------------------------------------
-- 14. Vista pública de técnicos (proyección limitada a columnas públicas)
-- ---------------------------------------------------------------------------
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
  c.name  AS category_name,
  c.slug  AS category_slug,
  ROUND(AVG(r.rating)::numeric, 2) AS avg_rating,
  COUNT(r.id)::int                 AS review_count,
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

-- ---------------------------------------------------------------------------
-- 15. Row Level Security (RLS)
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_acceptances    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_services   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experiences      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports               ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_select_published_technicians"
  ON public.profiles FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.technician_profiles tp
      WHERE tp.user_id = profiles.id
        AND tp.is_published = true
    )
  );

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- categories ----
CREATE POLICY "categories_select_all"
  ON public.categories FOR SELECT TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "categories_select_admin_inactive"
  ON public.categories FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "categories_insert_admin"
  ON public.categories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_update_admin"
  ON public.categories FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_delete_admin"
  ON public.categories FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---- technician_profiles ----
CREATE POLICY "technician_profiles_select_own"
  ON public.technician_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "technician_profiles_select_published"
  ON public.technician_profiles FOR SELECT TO authenticated, anon
  USING (is_published = true);

CREATE POLICY "technician_profiles_select_admin"
  ON public.technician_profiles FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "technician_profiles_insert_own"
  ON public.technician_profiles FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.current_user_role() = 'technician'
  );

CREATE POLICY "technician_profiles_update_own"
  ON public.technician_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "technician_profiles_update_admin"
  ON public.technician_profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "technician_profiles_delete_own"
  ON public.technician_profiles FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "technician_profiles_delete_admin"
  ON public.technician_profiles FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---- technician_services ----
CREATE POLICY "technician_services_select_published"
  ON public.technician_services FOR SELECT TO authenticated, anon
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.technician_profiles tp
      WHERE tp.id = technician_services.technician_id
        AND tp.is_published = true
    )
  );

CREATE POLICY "technician_services_select_own"
  ON public.technician_services FOR SELECT TO authenticated
  USING (public.owns_technician_profile(technician_id));

CREATE POLICY "technician_services_select_admin"
  ON public.technician_services FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "technician_services_insert_own"
  ON public.technician_services FOR INSERT TO authenticated
  WITH CHECK (public.owns_technician_profile(technician_id));

CREATE POLICY "technician_services_update_own"
  ON public.technician_services FOR UPDATE TO authenticated
  USING (public.owns_technician_profile(technician_id))
  WITH CHECK (public.owns_technician_profile(technician_id));

CREATE POLICY "technician_services_delete_own"
  ON public.technician_services FOR DELETE TO authenticated
  USING (public.owns_technician_profile(technician_id));

CREATE POLICY "technician_services_admin_all"
  ON public.technician_services FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- work_experiences ----
CREATE POLICY "work_experiences_select_published"
  ON public.work_experiences FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.technician_profiles tp
      WHERE tp.id = work_experiences.technician_id AND tp.is_published = true
    )
  );

CREATE POLICY "work_experiences_select_own"
  ON public.work_experiences FOR SELECT TO authenticated
  USING (public.owns_technician_profile(technician_id));

CREATE POLICY "work_experiences_modify_own"
  ON public.work_experiences FOR ALL TO authenticated
  USING (public.owns_technician_profile(technician_id))
  WITH CHECK (public.owns_technician_profile(technician_id));

CREATE POLICY "work_experiences_admin_all"
  ON public.work_experiences FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- educations ----
CREATE POLICY "educations_select_published"
  ON public.educations FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.technician_profiles tp
      WHERE tp.id = educations.technician_id AND tp.is_published = true
    )
  );

CREATE POLICY "educations_select_own"
  ON public.educations FOR SELECT TO authenticated
  USING (public.owns_technician_profile(technician_id));

CREATE POLICY "educations_modify_own"
  ON public.educations FOR ALL TO authenticated
  USING (public.owns_technician_profile(technician_id))
  WITH CHECK (public.owns_technician_profile(technician_id));

CREATE POLICY "educations_admin_all"
  ON public.educations FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- certifications ----
CREATE POLICY "certifications_select_published"
  ON public.certifications FOR SELECT TO authenticated, anon
  USING (
    verification_status = 'verified'
    AND
    EXISTS (
      SELECT 1 FROM public.technician_profiles tp
      WHERE tp.id = certifications.technician_id AND tp.is_published = true
    )
  );

CREATE POLICY "certifications_select_own"
  ON public.certifications FOR SELECT TO authenticated
  USING (public.owns_technician_profile(technician_id));

CREATE POLICY "certifications_insert_own"
  ON public.certifications FOR INSERT TO authenticated
  WITH CHECK (public.owns_technician_profile(technician_id));

CREATE POLICY "certifications_update_own"
  ON public.certifications FOR UPDATE TO authenticated
  USING (public.owns_technician_profile(technician_id))
  WITH CHECK (public.owns_technician_profile(technician_id));

CREATE POLICY "certifications_delete_own"
  ON public.certifications FOR DELETE TO authenticated
  USING (public.owns_technician_profile(technician_id));

CREATE POLICY "certifications_update_admin"
  ON public.certifications FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "certifications_admin_select"
  ON public.certifications FOR SELECT TO authenticated
  USING (public.is_admin());

-- ---- portfolio_items ----
CREATE POLICY "portfolio_items_select_published"
  ON public.portfolio_items FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.technician_profiles tp
      WHERE tp.id = portfolio_items.technician_id AND tp.is_published = true
    )
  );

CREATE POLICY "portfolio_items_select_own"
  ON public.portfolio_items FOR SELECT TO authenticated
  USING (public.owns_technician_profile(technician_id));

CREATE POLICY "portfolio_items_modify_own"
  ON public.portfolio_items FOR ALL TO authenticated
  USING (public.owns_technician_profile(technician_id))
  WITH CHECK (public.owns_technician_profile(technician_id));

CREATE POLICY "portfolio_items_admin_all"
  ON public.portfolio_items FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- service_requests ----
CREATE POLICY "service_requests_select_client"
  ON public.service_requests FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "service_requests_select_technician"
  ON public.service_requests FOR SELECT TO authenticated
  USING (public.owns_technician_profile(technician_id));

CREATE POLICY "service_requests_select_admin"
  ON public.service_requests FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "service_requests_insert_client"
  ON public.service_requests FOR INSERT TO authenticated
  WITH CHECK (
    client_id = auth.uid()
    AND public.current_user_role() = 'client'
  );

CREATE POLICY "service_requests_update_client"
  ON public.service_requests FOR UPDATE TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "service_requests_update_technician"
  ON public.service_requests FOR UPDATE TO authenticated
  USING (public.owns_technician_profile(technician_id))
  WITH CHECK (public.owns_technician_profile(technician_id));

CREATE POLICY "service_requests_update_admin"
  ON public.service_requests FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- request_status_history ----
CREATE POLICY "request_status_history_select_participants"
  ON public.request_status_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_requests sr
      WHERE sr.id = request_status_history.request_id
        AND (
          sr.client_id = auth.uid()
          OR public.owns_technician_profile(sr.technician_id)
        )
    )
  );

CREATE POLICY "request_status_history_select_admin"
  ON public.request_status_history FOR SELECT TO authenticated
  USING (public.is_admin());

-- Inserciones solo vía triggers (SECURITY DEFINER); bloqueamos INSERT directo
CREATE POLICY "request_status_history_no_direct_insert"
  ON public.request_status_history FOR INSERT TO authenticated
  WITH CHECK (false);

-- ---- reviews ----
CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.technician_profiles tp
      WHERE tp.id = reviews.technician_id AND tp.is_published = true
    )
  );

CREATE POLICY "reviews_select_own_client"
  ON public.reviews FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "reviews_select_own_technician"
  ON public.reviews FOR SELECT TO authenticated
  USING (public.owns_technician_profile(technician_id));

CREATE POLICY "reviews_insert_client"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "reviews_update_own_client"
  ON public.reviews FOR UPDATE TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "reviews_admin_all"
  ON public.reviews FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- profile_views ----
CREATE POLICY "profile_views_insert_anyone"
  ON public.profile_views FOR INSERT TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "profile_views_select_technician"
  ON public.profile_views FOR SELECT TO authenticated
  USING (public.owns_technician_profile(technician_id));

CREATE POLICY "profile_views_select_admin"
  ON public.profile_views FOR SELECT TO authenticated
  USING (public.is_admin());

-- ---- reports ----
CREATE POLICY "reports_insert_reporter"
  ON public.reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "reports_select_own"
  ON public.reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());

CREATE POLICY "reports_select_admin"
  ON public.reports FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "reports_update_admin"
  ON public.reports FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 16. Storage: buckets
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',              'avatars',              true,  2097152,  ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('portfolio',            'portfolio',            true,  5242880,  ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('technician-documents', 'technician-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- 17. Storage: políticas RLS (carpeta {user_id}/...)
-- ---------------------------------------------------------------------------

-- Avatars (público lectura, escritura propia)
CREATE POLICY "storage_avatars_select"
  ON storage.objects FOR SELECT TO authenticated, anon
  USING (bucket_id = 'avatars');

CREATE POLICY "storage_avatars_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "storage_avatars_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "storage_avatars_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Portfolio (público lectura, escritura propia)
CREATE POLICY "storage_portfolio_select"
  ON storage.objects FOR SELECT TO authenticated, anon
  USING (bucket_id = 'portfolio');

CREATE POLICY "storage_portfolio_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "storage_portfolio_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'portfolio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'portfolio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "storage_portfolio_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'portfolio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Documentos de técnico (privado, solo dueño y admin)
CREATE POLICY "storage_documents_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'technician-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

CREATE POLICY "storage_documents_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'technician-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "storage_documents_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'technician-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'technician-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "storage_documents_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'technician-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- ---------------------------------------------------------------------------
-- 18. Permisos mínimos (sin GRANT ALL a anon)
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated, anon;

GRANT SELECT ON public.categories TO authenticated, anon;
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

-- Las tablas restantes acceden vía RLS con rol authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
REVOKE ALL ON TABLE public.terms_acceptances FROM PUBLIC, anon, authenticated;

-- Secuencias para gen_random_uuid no requieren grant explícito

-- ---------------------------------------------------------------------------
-- 19. Promoción a admin — SOLO vía SQL manual con service_role
-- ---------------------------------------------------------------------------
-- El rol 'admin' NUNCA se asigna en registro automático.
-- Para promover un usuario, ejecuta make-admin.sql o:
--
--   UPDATE public.profiles
--   SET role = 'admin', updated_at = now()
--   WHERE id = '00000000-0000-0000-0000-000000000000';  -- UUID del usuario
--
-- Obtén el UUID en: Authentication → Users → copiar User UID
-- =============================================================================
