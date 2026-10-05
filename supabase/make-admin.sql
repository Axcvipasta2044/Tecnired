-- =============================================================================
-- TecniRed — Promover usuario a administrador
-- =============================================================================
-- IMPORTANTE: Ejecutar SOLO en Supabase SQL Editor con privilegios elevados
-- (service_role). No incluir este script en el cliente ni exponerlo públicamente.
--
-- Pasos:
--   1. Registra el usuario normalmente (rol client o technician).
--   2. Ve a Authentication → Users y copia el User UID.
--   3. Reemplaza el UUID de abajo y ejecuta UNA sola fila.
--   4. El usuario debe cerrar sesión y volver a iniciar para refrescar claims.
-- =============================================================================

-- ▼ Reemplaza este UUID por el User UID real ▼
DO $$
DECLARE
  target_user_id uuid := '00000000-0000-0000-0000-000000000000';
  rows_updated   int;
BEGIN
  IF target_user_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
    RAISE EXCEPTION 'Debes reemplazar target_user_id con el UUID real del usuario';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado en auth.users: %', target_user_id;
  END IF;

  UPDATE public.profiles
  SET role = 'admin', updated_at = now()
  WHERE id = target_user_id;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;

  IF rows_updated = 0 THEN
    RAISE EXCEPTION 'No existe profile para el usuario %. Verifica handle_new_user.', target_user_id;
  END IF;

  RAISE NOTICE 'Usuario % promovido a admin correctamente.', target_user_id;
END;
$$;

-- Verificación opcional:
-- SELECT id, role, display_name, email FROM public.profiles p
-- JOIN auth.users u ON u.id = p.id
-- WHERE p.role = 'admin';
