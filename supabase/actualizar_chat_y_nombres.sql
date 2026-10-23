-- TecniRed: chat bilateral, nombres visibles y expiración física de mensajes.
-- Ejecutar después de schema.sql y de las migraciones existentes.

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  technician_id uuid NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  service_request_id uuid UNIQUE REFERENCES public.service_requests(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversations_distinct_participants CHECK (client_id <> technician_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

CREATE OR REPLACE FUNCTION public.set_message_expiration()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- La fecha de creación la fija la base de datos y no puede prolongarse editando el mensaje.
  IF TG_OP = 'INSERT' THEN
    NEW.created_at := now();
  ELSE
    NEW.created_at := OLD.created_at;
  END IF;
  NEW.expires_at := NEW.created_at + interval '24 hours';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_set_expiration ON public.messages;
CREATE TRIGGER messages_set_expiration
  BEFORE INSERT OR UPDATE ON public.messages FOR EACH ROW
  EXECUTE FUNCTION public.set_message_expiration();

CREATE INDEX IF NOT EXISTS idx_conversations_client ON public.conversations(client_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_technician ON public.conversations(technician_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON public.messages(expires_at);

CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = p_conversation_id
      AND (c.client_id = auth.uid() OR public.owns_technician_profile(c.technician_id))
  );
$$;

CREATE OR REPLACE FUNCTION public.create_conversation_for_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.conversations (client_id, technician_id, service_request_id)
  VALUES (NEW.client_id, NEW.technician_id, NEW.id)
  ON CONFLICT (service_request_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS service_requests_create_conversation ON public.service_requests;
CREATE TRIGGER service_requests_create_conversation
  AFTER INSERT ON public.service_requests FOR EACH ROW
  EXECUTE FUNCTION public.create_conversation_for_request();

-- Conserva el vínculo de chat también para solicitudes creadas antes de esta actualización.
INSERT INTO public.conversations (client_id, technician_id, service_request_id)
SELECT sr.client_id, sr.technician_id, sr.id
FROM public.service_requests sr
ON CONFLICT (service_request_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.touch_conversation_on_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET updated_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_touch_conversation ON public.messages;
CREATE TRIGGER messages_touch_conversation
  AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.touch_conversation_on_message();

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversations_select_participant ON public.conversations;
CREATE POLICY conversations_select_participant ON public.conversations FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR public.owns_technician_profile(technician_id));

DROP POLICY IF EXISTS conversations_insert_client ON public.conversations;
CREATE POLICY conversations_insert_client ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (
    client_id = auth.uid()
    AND public.current_user_role() = 'client'
    AND EXISTS (
      SELECT 1 FROM public.technician_profiles tp
      WHERE tp.id = technician_id
        AND tp.is_published = true
    )
  );

DROP POLICY IF EXISTS messages_select_participant ON public.messages;
CREATE POLICY messages_select_participant ON public.messages FOR SELECT TO authenticated
  USING (expires_at > now() AND public.is_conversation_participant(conversation_id));

DROP POLICY IF EXISTS messages_insert_participant ON public.messages;
CREATE POLICY messages_insert_participant ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_conversation_participant(conversation_id));

DROP POLICY IF EXISTS messages_update_sender ON public.messages;
CREATE POLICY messages_update_sender ON public.messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid() AND public.is_conversation_participant(conversation_id))
  WITH CHECK (sender_id = auth.uid() AND public.is_conversation_participant(conversation_id));

DROP POLICY IF EXISTS messages_delete_sender ON public.messages;
CREATE POLICY messages_delete_sender ON public.messages FOR DELETE TO authenticated
  USING (sender_id = auth.uid() AND public.is_conversation_participant(conversation_id));

GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;

-- Limpieza del lado de la base de datos, independiente de que haya usuarios conectados.
-- Supabase debe tener pg_cron disponible. El bloque evita duplicar el job al re-ejecutar.
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'tecnired-delete-expired-messages',
  '*/15 * * * *',
  $job$DELETE FROM public.messages WHERE expires_at <= now();$job$
)
WHERE NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'tecnired-delete-expired-messages');

-- Verificación manual posterior: SELECT jobname, schedule, active FROM cron.job
-- WHERE jobname = 'tecnired-delete-expired-messages';
