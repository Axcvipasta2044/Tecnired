import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminDashboardPage() {
  await requireUser("admin");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const [users, technicians, requests, reports] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("technician_profiles").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
    supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reports").select("id", { count: "exact", head: true }).in("status", ["open", "reviewing"]),
  ]);
  const failed = [users, technicians, requests, reports].find((result) => result.error);
  if (failed?.error) throw new Error(`No se pudieron cargar las métricas administrativas: ${failed.error.message}`);

  return (
    <DashboardShell
      role="admin"
      title="Panel administrativo"
      subtitle="Revisa las cuentas, solicitudes y verificaciones registradas en la plataforma."
      actions={
        <Link href="/admin/verificaciones" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          Revisar perfiles <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Cuentas registradas", value: users.count ?? 0 },
          { label: "Verificaciones pendientes", value: technicians.count ?? 0 },
          { label: "Solicitudes pendientes", value: requests.count ?? 0 },
          { label: "Reportes por revisar", value: reports.count ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
