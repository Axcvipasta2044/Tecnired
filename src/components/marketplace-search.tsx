"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import type { CategoryItem, Technician } from "@/types/marketplace";

export function MarketplaceSearch({
  categories,
  technicians,
}: {
  categories: CategoryItem[];
  technicians: Technician[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const cities = Array.from(
    new Set(technicians.map((technician) => technician.city).filter((value): value is string => Boolean(value))),
  ).sort();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    router.push(`/tecnicos${params.size ? `?${params.toString()}` : ""}`);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm text-slate-600">
        ¿Qué necesitas?
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nombre, especialidad o servicio"
          className="field-focus mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 outline-none"
        />
      </label>
      <label className="block text-sm text-slate-600">
        Especialidad
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="field-focus mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 outline-none">
          <option value="">Todas las categorías</option>
          {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
        </select>
      </label>
      <label className="block text-sm text-slate-600">
        Ciudad
        <select value={city} onChange={(event) => setCity(event.target.value)} className="field-focus mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 outline-none">
          <option value="">Todas las ciudades</option>
          {cities.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <button type="submit" className="interactive-button focus-ring group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
        <Search className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
        Buscar técnicos
      </button>
    </form>
  );
}
