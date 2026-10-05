# TecniRed — Supabase

Esquema de base de datos, políticas RLS y buckets de Storage para la plataforma peruana de servicios técnicos.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `schema.sql` | Schema completo para una instalación nueva |
| `migrations/202610040001_live_marketplace.sql` | Cambios para una base donde el schema ya estaba instalado |
| `migrations/202610050001_terms_acceptance.sql` | Exige y registra aceptación versionada de términos y privacidad al registrarse |
| `make-admin.sql` | Promoción segura de un usuario a `admin` |

## Requisitos previos

- Proyecto Supabase creado en [supabase.com](https://supabase.com)
- Acceso al **SQL Editor** del dashboard

## 1. Ejecutar el schema

1. Abre tu proyecto en Supabase Dashboard.
2. Ve a **SQL Editor** → **New query**.
3. Si el proyecto está vacío, copia y pega el contenido completo de `schema.sql`.
4. Haz clic en **Run**.

`schema.sql` crea las tablas, funciones, triggers, RLS, categorías y buckets. Ejecútalo una sola vez sobre un proyecto vacío; no es repetible.

Si ya ejecutaste `schema.sql`, no lo vuelvas a ejecutar: aplica `migrations/202610040001_live_marketplace.sql` desde SQL Editor.

Antes de habilitar registros nuevos en una base existente, aplica también `migrations/202610050001_terms_acceptance.sql`. El alta de Auth fallará deliberadamente si no trae la aceptación expresa de las versiones vigentes. En una base nueva, `schema.sql` ya incluye ese control.

Si actualizas los textos legales, incrementa `TERMS_VERSION` y/o `PRIVACY_VERSION` en `src/lib/legal.ts` y sincroniza la versión esperada por el trigger en `schema.sql` y en una nueva migración. Para que una versión nueva sea aceptada también por el trigger de una base ya instalada, aplica esa migración antes de desplegar el formulario actualizado.

### Verificación rápida

```sql
SELECT count(*) FROM public.categories;        -- 14 categorías
SELECT count(*) FROM storage.buckets;          -- 3 buckets
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1;
```

## 2. Configurar Storage

Los buckets se crean automáticamente en `schema.sql`:

| Bucket | Público | Límite | Uso |
|--------|---------|--------|-----|
| `avatars` | Sí | 2 MB | Fotos de perfil |
| `portfolio` | Sí | 5 MB | Imágenes del portafolio |
| `technician-documents` | No | 10 MB | CV, certificados (PDF/imagen) |

### Convención de rutas

Sube archivos bajo la carpeta del usuario autenticado:

```
{user_id}/avatar.webp
{user_id}/portfolio/proyecto-1.jpg
{user_id}/certificados/senati.pdf
```

Ejemplo con `@supabase/supabase-js`:

```typescript
const path = `${userId}/avatar.webp`;
await supabase.storage.from("avatars").upload(path, file, { upsert: true });
const { data } = supabase.storage.from("avatars").getPublicUrl(path);
```

Para documentos privados, usa URL firmada:

```typescript
const { data } = await supabase.storage
  .from("technician-documents")
  .createSignedUrl(`${userId}/cv.pdf`, 3600);
```

### Políticas de Storage

- **Lectura pública**: `avatars` y `portfolio`.
- **Escritura**: solo el dueño en `{user_id}/...`.
- **Documentos**: lectura/escritura solo del dueño; admins pueden leer/eliminar vía `is_admin()`.
- El técnico puede cambiar la foto desde **Panel de técnico → Mi perfil → Foto de perfil**; se guarda su URL en `profiles.avatar_url`.

## 3. Crear administrador

El rol `admin` **no** se asigna en el registro. Usa `make-admin.sql`:

1. Registra el usuario en la app o en Authentication.
2. Copia su **User UID** (Authentication → Users).
3. Edita `make-admin.sql`, reemplaza el UUID placeholder.
4. Ejecuta en SQL Editor.

Alternativa directa:

```sql
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE id = 'TU-USER-UUID-AQUI';
```

## 4. Variables de entorno (Next.js)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Copia estos valores a `.env.local` en la raíz del proyecto y reinicia `npm run dev`. La app usa una clave publicable; no necesita una clave `service_role`. Nunca expongas esa clave privilegiada.

## 5. URL de autenticación

En **Authentication → URL Configuration** configura:

- Site URL: `http://localhost:3000`
- Redirect URL permitida: `http://localhost:3000/auth/callback`

Agrega el callback de producción cuando publiques el sitio. El registro, inicio de sesión y recuperación de contraseña usan el callback de Supabase.

## 6. Registro de usuarios

Al crear usuarios vía Supabase Auth, pasa metadata para el perfil:

```typescript
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: "client",       // o "technician" — nunca "admin"
      first_name: "Juan",
      last_name: "Pérez",
    },
  },
});
```

El trigger `handle_new_user` crea automáticamente la fila en `profiles`.

## 7. Vista pública

Consulta técnicos publicados con rating:

```sql
SELECT * FROM public.public_technicians
WHERE department = 'Lima'
ORDER BY avg_rating DESC NULLS LAST;
```

## Tablas principales

- `profiles` — usuarios (client, technician, admin)
- `technician_profiles` — perfil profesional del técnico
- `categories` — 14 categorías peruanas precargadas
- `technician_services` — servicios ofrecidos
- `work_experiences`, `educations`, `certifications`, `portfolio_items`
- `service_requests` + `request_status_history`
- `reviews`, `profile_views`, `reports`

## Notas de seguridad

- RLS habilitado en todas las tablas públicas.
- Funciones `current_user_role()` e `is_admin()` son `SECURITY DEFINER` para evitar recursión RLS.
- No se otorga `GRANT ALL` a `anon`; acceso público limitado a lectura de categorías, técnicos publicados y buckets públicos.
- Transiciones de estado en solicitudes validadas por trigger; estados finales bloqueados salvo admin.
- La vista pública se ejecuta con permisos de su propietario y proyecta solo campos públicos; no expone teléfonos ni rutas de documentos.
- Los paneles y las solicitudes usan las filas de Supabase con RLS; no se cargan datos de demostración.
