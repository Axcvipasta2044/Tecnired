import Link from "next/link";
import { CalendarClock, CircleDollarSign, Search } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { REQUEST_STATUS_LABELS, type RequestStatus } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function ClientDashboardPage() {
  const user = await requireUser("client");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const [{ data: profile, error: profileError }, { data: requests, error: requestsError }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    supabase
      .from("service_requests")
      .select("id,title,status,created_at,preferred_date,budget_min,budget_max")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  if (profileError) throw new Error(`No se pudo cargar tu perfil: ${profileError.message}`);
  if (requestsError) throw new Error(`No se pudieron cargar tus solicitudes: ${requestsError.message}`);

  const activeCount = requests.filter((item) => ["pending", "accepted", "in_progress"].includes(item.status)).length;
  const completedCount = requests.filter((item) => item.status === "completed").length;

  return (
    <DashboardShell
      role="client"
      title={`Hola${profile.display_name ? `, ${profile.display_name}` : ""}`}
      subtitle="Consulta el estado de tus solicitudes y encuentra profesionales."
      actions={
        <Link href="/tecnicos" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
          <Search className="h-4 w-4" /> Buscar técnico
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Solicitudes activas", value: activeCount },
          { label: "Solicitudes completadas", value: completedCount },
          { label: "Solicitudes totales", value: requests.length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Solicitudes recientes</h2>
          <Link href="/cliente/solicitudes" className="text-sm font-semibold text-blue-700 hover:text-blue-800">Ver todo</Link>
        </div>
        {requests.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
            Aún no has enviado solicitudes. Explora los perfiles publicados para encontrar un técnico.
          </p>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 5).map((request) => (
              <article key={request.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-800">
                    {REQUEST_STATUS_LABELS[request.status as RequestStatus]}
                  </span>
                  <h3 className="mt-2 font-semibold text-slate-900">{request.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">Creada {formatDate(request.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2"><CalendarClock className="h-4 w-4" />{formatDate(request.preferred_date)}</span>
                  <span className="inline-flex items-center gap-2"><CircleDollarSign className="h-4 w-4" />{formatMoney(request.budget_max ?? request.budget_min)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
