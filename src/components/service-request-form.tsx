"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createServiceRequestAction, type RequestFormState } from "@/app/actions/requests";
import type { Technician } from "@/types/marketplace";

const initialState: RequestFormState = {};

export function ServiceRequestForm({
  technician,
  initialServiceId,
  profile,
}: {
  technician: Technician;
  initialServiceId: string;
  profile: { department: string | null; city: string | null; district: string | null; phone: string | null };
}) {
  const [state, action, pending] = useActionState(createServiceRequestAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-lg font-bold text-emerald-900">Solicitud enviada</h2>
        <p className="mt-2 text-sm text-emerald-800">{state.success}</p>
        <Link href="/cliente/solicitudes" className="mt-4 inline-flex font-semibold text-emerald-900 underline">
          Ver mis solicitudes
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="technician_id" value={technician.id} />
      <label className="block text-sm font-medium text-slate-700">
        Servicio
        <select name="technician_service_id" defaultValue={initialServiceId} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <option value="">Otro / por cotizar</option>
          {technician.services.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Título
        <input name="title" required minLength={3} maxLength={120} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Describe lo que necesitas
        <textarea name="description" required minLength={10} maxLength={4000} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Departamento
          <input name="department" required defaultValue={profile.department ?? ""} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Ciudad
          <input name="city" required defaultValue={profile.city ?? ""} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Distrito
          <input name="district" defaultValue={profile.district ?? ""} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Teléfono de contacto
          <input name="contact_phone" type="tel" defaultValue={profile.phone ?? ""} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Fecha preferida
          <input name="preferred_date" type="date" min={new Date().toISOString().slice(0, 10)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-slate-700">
            Presupuesto mín.
            <input name="budget_min" type="number" min="0" step="0.01" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Presupuesto máx.
            <input name="budget_max" type="number" min="0" step="0.01" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </label>
        </div>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Dirección del servicio (opcional)
        <input name="service_address" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
        {pending ? "Enviando..." : "Enviar solicitud"}
      </button>
    </form>
  );
}
