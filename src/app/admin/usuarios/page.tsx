import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminUsersPage() {
  await requireUser("admin");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: users, error } = await supabase
    .from("profiles")
    .select("id,display_name,role,is_active,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar las cuentas: ${error.message}`);

  return (
    <DashboardShell role="admin" title="Gestión de cuentas" subtitle="Usuarios registrados en TecniRed.">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        {users.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-600">No hay cuentas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <tr><th className="px-6 py-4">Usuario</th><th className="px-6 py-4">Rol</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Registro</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{user.display_name ?? "Sin nombre"}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4">{user.is_active ? "Activo" : "Desactivado"}</td>
                    <td className="px-6 py-4">{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
