import { CalendarClock, CircleDollarSign } from "lucide-react";
import { updateServiceRequestAction } from "@/app/actions/requests";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { REQUEST_STATUS_LABELS, type RequestStatus } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function ClientRequestsPage() {
  const user = await requireUser("client");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: requests, error } = await supabase
    .from("service_requests")
    .select("id,title,description,status,created_at,preferred_date,budget_min,budget_max")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar tus solicitudes: ${error.message}`);

  return (
    <DashboardShell role="client" title="Historial de servicios" subtitle="Solicitudes enviadas desde tu cuenta.">
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          Todavía no has enviado solicitudes.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <article key={request.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-800">
                    {REQUEST_STATUS_LABELS[request.status as RequestStatus]}
                  </span>
                  <h2 className="mt-3 text-xl font-bold text-slate-900">{request.title}</h2>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{request.description}</p>
                  <p className="mt-3 text-xs text-slate-500">Creada {formatDate(request.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2"><CalendarClock className="h-4 w-4" />{formatDate(request.preferred_date)}</span>
                  <span className="inline-flex items-center gap-2"><CircleDollarSign className="h-4 w-4" />{formatMoney(request.budget_max ?? request.budget_min)}</span>
                </div>
              </div>
              <Link href="/cliente/chat" className="mt-4 inline-flex rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">Abrir chat</Link>
              {request.status === "pending" && (
                <form action={updateServiceRequestAction} className="mt-4 border-t border-slate-100 pt-4">
                  <input type="hidden" name="request_id" value={request.id} />
                  <input type="hidden" name="status" value="cancelled" />
                  <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Cancelar solicitud
                  </button>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
