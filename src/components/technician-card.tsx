import Link from "next/link";
import { MapPin, ShieldCheck, Star, CheckCircle2 } from "lucide-react";
import type { Technician } from "@/types/marketplace";
import { formatMoney } from "@/lib/utils";

export function TechnicianCard({ technician }: { technician: Technician }) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="flex items-center gap-2 border-b border-slate-100 p-3 sm:gap-4 sm:p-4">
        {technician.avatar_url ? (
          <img
            src={technician.avatar_url}
            alt=""
            className="h-10 w-10 shrink-0 rounded-xl object-cover transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-14"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700 transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-14 sm:text-base">
            {(technician.display_name ?? "T").slice(0, 1).toLocaleUpperCase("es-PE")}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-lg">{technician.display_name ?? "Técnico"}</h3>
            {technician.verification_status === "verified" && (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 transition-transform duration-200 group-hover:scale-110 sm:h-4 sm:w-4" />
            )}
          </div>
          {technician.headline && <p className="truncate text-xs text-blue-700 sm:text-sm">{technician.headline}</p>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-600 sm:text-sm">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span className="truncate">
            {[technician.city, technician.district].filter(Boolean).join(", ")}
            </span>
          </span>
          {technician.review_count > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 font-medium text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" />
              {technician.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="hidden flex-wrap gap-2 sm:flex">
          {technician.services.slice(0, 2).map((service) => (
            <span key={service.title} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
              {service.title}
            </span>
          ))}
        </div>

        <div className="rounded-xl bg-slate-50 p-2 text-xs text-slate-600 sm:p-3 sm:text-sm">
          <div className="mb-2 flex items-center justify-between gap-2 font-medium text-slate-800">
            <span className="truncate">{technician.primary_category ?? "Sin especialidad"}</span>
            <span className="shrink-0">{technician.years_experience} años</span>
          </div>
          <p className="text-xs sm:text-sm">
            {technician.is_available ? (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" /> Disponible
              </span>
            ) : (
              <span className="text-slate-500">No disponible</span>
            )}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between sm:pt-3">
          {technician.services.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-500 sm:text-xs sm:tracking-[0.15em]">Desde</p>
              <p className="text-sm font-bold text-slate-900 sm:text-lg">
                {formatMoney(technician.services[0]?.price_min)}
              </p>
            </div>
          )}
          <Link
            href={`/tecnicos/${technician.slug}`}
            className="interactive-button focus-ring rounded-xl bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-blue-700 sm:px-4 sm:text-sm"
          >
            Ver perfil
          </Link>
        </div>
      </div>
    </article>
  );
}
