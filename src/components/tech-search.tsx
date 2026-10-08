"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TechnicianCard } from "@/components/technician-card";
import type { Technician } from "@/types/marketplace";

export function TechSearch({
  technicians,
  categories,
  initialQuery = "",
  initialCategory = "",
  initialCity = "",
}: {
  technicians: Technician[];
  categories: { slug: string; name: string }[];
  initialQuery?: string;
  initialCategory?: string;
  initialCity?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [rating, setRating] = useState(0);
  const [sort, setSort] = useState<"relevance" | "rating" | "experience">("relevance");

  const results = useMemo(() => {
    const filtered = technicians.filter((tech) => {
      const searchableText = [
        tech.display_name ?? "",
        tech.headline ?? "",
        tech.primary_category ?? "",
        tech.city ?? "",
        tech.district ?? "",
        ...tech.services.map((service) => service.title),
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !query.trim() || searchableText.includes(query.trim().toLowerCase());
      const matchesCategory = !category || tech.category_slug === category;
      const matchesCity = !city || tech.city === city;
      const matchesAvailability = !onlyAvailable || tech.is_available;
      const matchesRating = tech.rating >= rating;

      return matchesQuery && matchesCategory && matchesCity && matchesAvailability && matchesRating;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "experience") return b.years_experience - a.years_experience;
      return b.rating * 10 + b.years_experience - (a.rating * 10 + a.years_experience);
    });
  }, [category, city, onlyAvailable, query, rating, sort, technicians]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Buscar</span>
            <div className="field-focus flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Search className="h-4 w-4 text-slate-400 transition-transform duration-200 focus-within:-translate-y-0.5" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nombre, especialidad o servicio"
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Especialidad</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="field-focus w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none"
            >
              <option value="">Todas las especialidades</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>{item.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ciudad</span>
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="field-focus w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none"
            >
              <option value="">Todas</option>
              {Array.from(new Set(technicians.map((t) => t.city).filter((item): item is string => Boolean(item)))).sort().map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={onlyAvailable} onChange={() => setOnlyAvailable((value) => !value)} className="h-4 w-4 accent-blue-600" />
            Solo disponibles
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-sm text-slate-600">Valoración mínima</label>
            <select
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              className="field-focus rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
            >
              <option value={0}>Cualquiera</option>
              <option value={4}>4.0+</option>
              <option value={4.5}>4.5+</option>
              <option value={4.8}>4.8+</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Ordenar por</label>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "relevance" | "rating" | "experience")}
              className="field-focus rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
            >
              <option value="relevance">Relevancia</option>
              <option value="rating">Valoración</option>
              <option value="experience">Experiencia</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{results.length} resultados</p>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h3 className="text-xl font-semibold text-slate-900">
            {technicians.length ? "No encontramos coincidencias" : "Todavía no hay perfiles publicados"}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {technicians.length
              ? "Prueba otra especialidad, ciudad o disponibilidad."
              : "Los perfiles profesionales publicados aparecerán aquí."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-6 xl:grid-cols-3">
          {results.map((technician) => (
            <TechnicianCard key={technician.id} technician={technician} />
          ))}
        </div>
      )}
    </div>
  );
}
