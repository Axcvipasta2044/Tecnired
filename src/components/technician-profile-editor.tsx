"use client";

import { useActionState } from "react";
import {
  deleteTechnicianServiceAction,
  saveTechnicianProfileAction,
  saveTechnicianServiceAction,
  type ProfileFormState,
} from "@/app/actions/technician-profile";
import { TechnicianAvatarUploader } from "@/components/technician-avatar-uploader";
import type { CategoryItem, TechnicianService } from "@/types/marketplace";

const initialState: ProfileFormState = {};

export function TechnicianProfileEditor({
  profile,
  personal,
  userId,
  displayName,
  categories,
  services,
}: {
  profile: {
    headline: string | null;
    bio: string | null;
    primary_category_id: string | null;
    years_experience: number;
    is_available: boolean;
    is_published: boolean;
  } | null;
  personal: { department: string | null; city: string | null; district: string | null; phone: string | null; avatar_url: string | null };
  userId: string;
  displayName: string | null;
  categories: CategoryItem[];
  services: TechnicianService[];
}) {
  const [profileState, profileAction, profilePending] = useActionState(saveTechnicianProfileAction, initialState);
  const [serviceState, serviceAction, servicePending] = useActionState(saveTechnicianServiceAction, initialState);

  return (
    <div className="space-y-8">
      <form action={profileAction} className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Información profesional</h2>
        <TechnicianAvatarUploader
          userId={userId}
          avatarUrl={personal.avatar_url}
          displayName={displayName}
        />
        <label className="block text-sm font-medium text-slate-700">
          Titular
          <input name="headline" defaultValue={profile?.headline ?? ""} maxLength={120} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Presentación
          <textarea name="bio" defaultValue={profile?.bio ?? ""} rows={5} maxLength={3000} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Especialidad principal
            <select name="primary_category_id" defaultValue={profile?.primary_category_id ?? ""} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <option value="">Seleccionar</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Años de experiencia
            <input name="years_experience" type="number" min="0" max="80" defaultValue={profile?.years_experience ?? 0} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Departamento
            <input name="department" defaultValue={personal.department ?? ""} maxLength={80} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Ciudad
            <input name="city" defaultValue={personal.city ?? ""} maxLength={100} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Distrito
            <input name="district" defaultValue={personal.district ?? ""} maxLength={100} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Teléfono
            <input name="phone" type="tel" defaultValue={personal.phone ?? ""} maxLength={30} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </label>
        </div>
        <div className="flex flex-wrap gap-5">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="is_available" defaultChecked={profile?.is_available ?? true} className="h-4 w-4 accent-blue-600" />
            Acepto nuevas solicitudes
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="is_published" defaultChecked={profile?.is_published ?? false} className="h-4 w-4 accent-blue-600" />
            Publicar perfil
          </label>
        </div>
        {profileState.error && <p role="alert" className="text-sm text-red-700">{profileState.error}</p>}
        {profileState.success && <p role="status" className="text-sm text-emerald-700">{profileState.success}</p>}
        <button disabled={profilePending} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {profilePending ? "Actualizando..." : "Actualizar perfil"}
        </button>
      </form>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Servicios</h2>
        {services.length > 0 && (
          <div className="mt-4 space-y-3">
            {services.map((service) => (
              <div key={service.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{service.title}</h3>
                  {service.description && <p className="text-sm text-slate-600">{service.description}</p>}
                </div>
                <form action={deleteTechnicianServiceAction}>
                  <input type="hidden" name="service_id" value={service.id} />
                  <button className="text-sm font-semibold text-red-700 hover:underline">Eliminar</button>
                </form>
              </div>
            ))}
          </div>
        )}
        <form action={serviceAction} className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Nombre del servicio
            <input name="title" required minLength={3} maxLength={120} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Tipo de precio
            <select name="pricing_type" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <option value="quote">Cotización previa</option>
              <option value="fixed">Precio fijo</option>
              <option value="range">Rango de precios</option>
              <option value="hourly">Por hora</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Descripción
            <textarea name="description" rows={3} maxLength={1000} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Precio mínimo
            <input name="price_min" type="number" min="0" step="0.01" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Precio máximo
            <input name="price_max" type="number" min="0" step="0.01" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" />
          </label>
          <div className="sm:col-span-2">
            {serviceState.error && <p role="alert" className="mb-3 text-sm text-red-700">{serviceState.error}</p>}
            {serviceState.success && <p role="status" className="mb-3 text-sm text-emerald-700">{serviceState.success}</p>}
            <button disabled={servicePending} className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-700 disabled:opacity-60">
              {servicePending ? "Agregando..." : "Agregar servicio"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
