import { updateVerificationStatusAction } from "@/app/actions/admin";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminVerificationPage() {
  await requireUser("admin");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: profiles, error } = await supabase
    .from("technician_profiles")
    .select("id,user_id,headline,primary_category_id,verification_status,created_at")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`No se pudieron cargar las verificaciones: ${error.message}`);

  let users: { id: string; display_name: string | null }[] = [];
  let categories: { id: string; name: string }[] = [];
  if (profiles.length) {
    const [userResult, categoryResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id,display_name")
        .in("id", profiles.map((profile) => profile.user_id)),
      supabase
        .from("categories")
        .select("id,name")
        .in("id", profiles.map((profile) => profile.primary_category_id).filter((id): id is string => Boolean(id))),
    ]);
    if (userResult.error) throw new Error(`No se pudieron cargar los nombres de los técnicos: ${userResult.error.message}`);
    if (categoryResult.error) throw new Error(`No se pudieron cargar las especialidades: ${categoryResult.error.message}`);
    users = userResult.data;
    categories = categoryResult.data;
  }
  const names = new Map(users.map((user) => [user.id, user.display_name]));
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <DashboardShell role="admin" title="Verificación de perfiles" subtitle="Revisa las solicitudes de verificación pendientes.">
      {profiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          No hay perfiles pendientes de verificación.
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <article key={profile.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{names.get(profile.user_id) ?? "Sin nombre"}</h2>
                  {profile.headline && <p className="mt-1 text-sm text-slate-600">{profile.headline}</p>}
                  <p className="mt-2 text-sm text-slate-600">{categoryNames.get(profile.primary_category_id ?? "") ?? "Sin especialidad"}</p>
                </div>
                <div className="flex gap-3">
                  <form action={updateVerificationStatusAction}>
                    <input type="hidden" name="technician_id" value={profile.id} />
                    <input type="hidden" name="status" value="verified" />
                    <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Aprobar</button>
                  </form>
                  <form action={updateVerificationStatusAction}>
                    <input type="hidden" name="technician_id" value={profile.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Rechazar</button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
