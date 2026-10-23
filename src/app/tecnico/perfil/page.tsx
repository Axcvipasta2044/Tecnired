import { DashboardShell } from "@/components/dashboard-shell";
import { TechnicianProfileEditor } from "@/components/technician-profile-editor";
import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/supabase-data";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { DisplayNameEditor } from "@/components/display-name-editor";

export default async function TechnicianProfilePage() {
  const user = await requireUser("technician");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const [{ data: profile, error: profileError }, { data: personal, error: personalError }, categories] =
    await Promise.all([
      supabase
        .from("technician_profiles")
        .select("id,headline,bio,primary_category_id,years_experience,is_available,is_published")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("department,city,district,phone,avatar_url")
        .eq("id", user.id)
        .single(),
      getCategories(),
    ]);
  if (profileError) throw new Error(`No se pudo cargar tu perfil profesional: ${profileError.message}`);
  if (personalError) throw new Error(`No se pudo cargar tu información personal: ${personalError.message}`);

  const { data: services, error: servicesError } = profile
    ? await supabase
        .from("technician_services")
        .select("id,title,description,pricing_type,price_min,price_max")
        .eq("technician_id", profile.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
    : { data: [], error: null };
  if (servicesError) throw new Error(`No se pudieron cargar tus servicios: ${servicesError.message}`);

  return (
    <DashboardShell role="technician" title="Mi perfil profesional" subtitle="Actualiza la información que ven tus posibles clientes.">
      <div className="space-y-8">
      <DisplayNameEditor displayName={user.displayName} />
      <TechnicianProfileEditor
        profile={profile}
        personal={personal}
        userId={user.id}
        displayName={user.displayName}
        categories={categories}
        services={services}
      />
      </div>
    </DashboardShell>
  );
}
