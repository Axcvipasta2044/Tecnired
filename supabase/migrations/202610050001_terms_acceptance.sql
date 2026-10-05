-- Require explicit, versioned acceptance before an Auth account can be created.
-- Apply after schema.sql and any earlier migrations.

CREATE TABLE IF NOT EXISTS public.terms_acceptances (
  user_id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_role    text NOT NULL CHECK (account_role IN ('client', 'technician')),
  terms_version   text NOT NULL,
  privacy_version text NOT NULL,
  accepted_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.terms_acceptances IS
  'Constancia de versiones aceptadas al crear cada cuenta';

ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.terms_acceptances FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_first_name text;
  v_last_name text;
  v_display text;
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
  v_last_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), '');
  v_display := NULLIF(TRIM(CONCAT(COALESCE(v_first_name, ''), ' ', COALESCE(v_last_name, ''))), '');

  INSERT INTO public.profiles (id, role, first_name, last_name, display_name)
  VALUES (NEW.id, v_role, v_first_name, v_last_name, v_display);

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS
  'Valida aceptación versionada y crea profile al registrar usuario; role solo client|technician';
