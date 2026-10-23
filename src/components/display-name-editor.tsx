"use client";

import { useActionState } from "react";
import { saveDisplayNameAction, type NameFormState } from "@/app/actions/profile-name";

const initialState: NameFormState = {};

export function DisplayNameEditor({ displayName }: { displayName: string | null }) {
  const [state, action, pending] = useActionState(saveDisplayNameAction, initialState);
  return (
    <form action={action} className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div><h2 className="text-xl font-bold text-slate-900">Nombre visible</h2><p className="mt-1 text-sm text-slate-600">Este nombre aparecerá en tu perfil y en el chat.</p></div>
      <label className="block text-sm font-medium text-slate-700">Nombre actual y nuevo
        <input name="display_name" required minLength={1} maxLength={120} defaultValue={displayName ?? ""} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-700">{state.success}</p>}
      <button disabled={pending} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Guardando..." : "Guardar nombre"}</button>
    </form>
  );
}
