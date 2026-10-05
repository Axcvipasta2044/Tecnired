import { CalendarClock, CircleDollarSign, MapPin } from "lucide-react";
import { updateServiceRequestAction } from "@/app/actions/requests";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { REQUEST_STATUS_LABELS, type RequestStatus } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function TechnicianRequestsPage() {
  const user = await requireUser("technician");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: profile, error: profileError } = await supabase
    .from("technician_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError) throw new Error(`No se pudo cargar tu perfil técnico: ${profileError.message}`);
  if (!profile) {
    return (
      <DashboardShell role="technician" title="Solicitudes" subtitle="Completa tu perfil para recibir solicitudes.">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          <a href="/tecnico/perfil" className="font-semibold text-blue-700 underline">Crear perfil profesional</a>
        </div>
      </DashboardShell>
    );
  }

  const { data: requests, error } = await supabase
    .from("service_requests")
    .select("id,title,description,status,created_at,preferred_date,department,city,district,budget_min,budget_max")
    .eq("technician_id", profile.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar las solicitudes: ${error.message}`);

  return (
    <DashboardShell role="technician" title="Solicitudes" subtitle="Solicitudes enviadas directamente a tu perfil.">
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          Todavía no has recibido solicitudes.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <article key={request.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-800">
                  {REQUEST_STATUS_LABELS[request.status as RequestStatus]}
                </span>
                <span className="text-xs text-slate-500">Recibida {formatDate(request.created_at)}</span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-slate-900">{request.title}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{request.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{[request.city, request.district, request.department].filter(Boolean).join(", ") || "Ubicación no indicada"}</span>
                <span className="inline-flex items-center gap-2"><CalendarClock className="h-4 w-4" />{formatDate(request.preferred_date)}</span>
                <span className="inline-flex items-center gap-2"><CircleDollarSign className="h-4 w-4" />{formatMoney(request.budget_max ?? request.budget_min)}</span>
              </div>
              {request.status === "pending" && (
                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                  {(["accepted", "rejected"] as const).map((status) => (
                    <form key={status} action={updateServiceRequestAction}>
                      <input type="hidden" name="request_id" value={request.id} />
                      <input type="hidden" name="status" value={status} />
                      <button className={status === "accepted" ? "rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white" : "rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"}>
                        {status === "accepted" ? "Aceptar" : "Rechazar"}
                      </button>
                    </form>
                  ))}
                </div>
              )}
              {request.status === "accepted" && (
                <form action={updateServiceRequestAction} className="mt-5 border-t border-slate-100 pt-4">
                  <input type="hidden" name="request_id" value={request.id} />
                  <input type="hidden" name="status" value="in_progress" />
                  <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Iniciar trabajo</button>
                </form>
              )}
              {request.status === "in_progress" && (
                <form action={updateServiceRequestAction} className="mt-5 border-t border-slate-100 pt-4">
                  <input type="hidden" name="request_id" value={request.id} />
                  <input type="hidden" name="status" value="completed" />
                  <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Marcar como completado</button>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
