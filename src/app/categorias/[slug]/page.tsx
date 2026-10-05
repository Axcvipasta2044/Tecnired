import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { notFound } from "next/navigation";
import { TechnicianCard } from "@/components/technician-card";
import { getCategories, getPublicTechnicians } from "@/lib/supabase-data";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, categories, technicians] = await Promise.all([
    params,
    getCategories(),
    getPublicTechnicians(),
  ]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const matches = technicians.filter((technician) => technician.category_slug === slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <Wrench className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Categoría</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">{category.name}</h1>
          </div>
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">{category.description}</p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Técnicos disponibles</h2>
        <Link href="/tecnicos" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {matches.length > 0 ? matches.map((tech) => <TechnicianCard key={tech.id} technician={tech} />) : <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">No hay técnicos publicados en esta categoría todavía.</div>}
      </div>

      <div className="mt-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Otras categorías</p>
        <div className="flex flex-wrap gap-3">
          {categories.filter((item) => item.slug !== category.slug).slice(0, 8).map((item) => (
            <Link key={item.slug} href={`/categorias/${item.slug}`} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700">
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
