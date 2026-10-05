import Link from "next/link";
import { MapPin, ShieldCheck, Star, CheckCircle2 } from "lucide-react";
import type { Technician } from "@/types/marketplace";
import { formatMoney } from "@/lib/utils";

export function TechnicianCard({ technician }: { technician: Technician }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4 border-b border-slate-100 p-4">
        {technician.avatar_url ? (
          <img
            src={technician.avatar_url}
            alt=""
            className="h-14 w-14 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
            {(technician.display_name ?? "T").slice(0, 1).toLocaleUpperCase("es-PE")}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-slate-900">{technician.display_name ?? "Técnico"}</h3>
            {technician.verification_status === "verified" && (
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            )}
          </div>
          {technician.headline && <p className="text-sm text-blue-700">{technician.headline}</p>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {[technician.city, technician.district].filter(Boolean).join(", ")}
          </span>
          {technician.review_count > 0 && (
            <span className="inline-flex items-center gap-1 font-medium text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              {technician.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {technician.services.slice(0, 2).map((service) => (
            <span key={service.title} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
              {service.title}
            </span>
          ))}
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <div className="mb-2 flex items-center justify-between font-medium text-slate-800">
            <span>{technician.primary_category ?? "Sin especialidad"}</span>
            <span>{technician.years_experience} años</span>
          </div>
          <p className="text-sm">
            {technician.is_available ? (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Disponible ahora
              </span>
            ) : (
              <span className="text-slate-500">No disponible por el momento</span>
            )}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          {technician.services.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Desde</p>
              <p className="text-lg font-bold text-slate-900">
                {formatMoney(technician.services[0]?.price_min)}
              </p>
            </div>
          )}
          <Link
            href={`/tecnicos/${technician.slug}`}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Ver perfil
          </Link>
        </div>
      </div>
    </article>
  );
}
