import { TechSearch } from "@/components/tech-search";
import { getCategories, getPublicTechnicians } from "@/lib/supabase-data";

export default async function TecnicosPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; category?: string; city?: string }>;
}) {
  const [{ query = "", category = "", city = "" }, categories, technicians] = await Promise.all([
    searchParams,
    getCategories(),
    getPublicTechnicians(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Técnicos</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Encuentra profesionales por especialidad y ubicación</h1>
      </div>
      <TechSearch
        technicians={technicians}
        categories={categories.map(({ slug, name }) => ({ slug, name }))}
        initialQuery={query}
        initialCategory={category}
        initialCity={city}
      />
    </div>
  );
}
