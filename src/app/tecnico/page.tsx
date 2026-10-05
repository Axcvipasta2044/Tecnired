import Link from "next/link";
import { ArrowRight, CircleDollarSign, MapPin } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { REQUEST_STATUS_LABELS, type RequestStatus } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function TechnicianDashboardPage() {
  const user = await requireUser("technician");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: profile, error: profileError } = await supabase
    .from("technician_profiles")
    .select("id,is_available,is_published,verification_status,profile_views_count")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError) throw new Error(`No se pudo cargar tu perfil técnico: ${profileError.message}`);

  const { data: requests, error: requestsError } = profile
    ? await supabase
        .from("service_requests")
        .select("id,title,status,created_at,preferred_date,budget_min,budget_max,city,district")
        .eq("technician_id", profile.id)
        .order("created_at", { ascending: false })
    : { data: [], error: null };
  if (requestsError) throw new Error(`No se pudieron cargar tus solicitudes: ${requestsError.message}`);

  const pending = requests.filter((request) => request.status === "pending").length;
  const inProgress = requests.filter((request) => ["accepted", "in_progress"].includes(request.status)).length;
  const completed = requests.filter((request) => request.status === "completed").length;

  return (
    <DashboardShell
      role="technician"
      title={`Hola${user.displayName ? `, ${user.displayName}` : ""}`}
      subtitle="Gestiona las solicitudes recibidas y la visibilidad de tu perfil."
      actions={
        <Link href="/tecnico/perfil" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          Actualizar perfil <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      {!profile && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Termina de crear tu perfil profesional para recibir solicitudes.{" "}
          <Link href="/tecnico/perfil" className="font-semibold underline">Completar perfil</Link>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Solicitudes pendientes", value: pending },
          { label: "Trabajos activos", value: inProgress },
          { label: "Trabajos completados", value: completed },
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
          <Link href="/tecnico/solicitudes" className="text-sm font-semibold text-blue-700">Ver todas</Link>
        </div>
        {requests.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">Todavía no tienes solicitudes.</p>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 5).map((request) => (
              <article key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">{REQUEST_STATUS_LABELS[request.status as RequestStatus]}</span>
                    <h3 className="mt-1 font-semibold text-slate-900">{request.title}</h3>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm text-slate-600"><CircleDollarSign className="h-4 w-4" />{formatMoney(request.budget_max ?? request.budget_min)}</span>
                </div>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><MapPin className="h-4 w-4" />{[request.city, request.district].filter(Boolean).join(", ") || "Ubicación no indicada"} · {formatDate(request.preferred_date)}</p>
              </article>
            ))}
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <span>Perfil: {profile?.is_published ? "Publicado" : "Borrador"}</span>
          <span>Verificación: {profile?.verification_status ?? "Sin perfil"}</span>
          <span>Visitas: {profile?.profile_views_count ?? 0}</span>
        </div>
      </section>
    </DashboardShell>
  );
}
