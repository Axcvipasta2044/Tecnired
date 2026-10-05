import { redirect } from "next/navigation";
import { DASHBOARD_PATHS, type UserRole } from "@/lib/constants";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { safeRedirectPath } from "@/lib/utils";

export type SessionUser = {
  id: string;
  email?: string | null;
  role: UserRole;
  displayName: string | null;
};

function isUserRole(value: unknown): value is UserRole {
  return value === "client" || value === "technician" || value === "admin";
}

export async function getCurrentSession(): Promise<{ user: SessionUser | null }> {
  const client = await getSupabaseServerClient();

  if (!client) {
    throw new Error(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw new Error(`No se pudo leer la sesión: ${sessionError.message}`);
  if (!sessionData.session) return { user: null };

  const { data: authData, error } = await client.auth.getUser();

  if (error) throw new Error(`No se pudo validar la sesión: ${error.message}`);
  if (!authData.user) return { user: null };

  const { data: profileData, error: profileError } = await client
    .from("profiles")
    .select("role,display_name")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) throw new Error(`No se pudo cargar el perfil de la sesión: ${profileError.message}`);
  if (!profileData) throw new Error("La cuenta autenticada no tiene un perfil en la base de datos.");
  if (!isUserRole(profileData.role)) throw new Error("La cuenta tiene un rol no válido.");
  return {
    user: {
      id: authData.user.id,
      email: authData.user.email,
      role: profileData.role,
      displayName: profileData.display_name,
    },
  };
}

export async function requireUser(role?: UserRole, returnTo = "/") {
  const session = await getCurrentSession();

  if (!session.user) {
    const redirectTo = safeRedirectPath(returnTo, "/");
    redirect(`/login?error=unauthorized&redirect=${encodeURIComponent(redirectTo)}`);
  }

  if (role && session.user.role !== role) {
    redirect(DASHBOARD_PATHS[session.user.role] ?? "/");
  }

  return session.user;
}
