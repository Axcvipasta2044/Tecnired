import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { TechnicianCard } from "@/components/technician-card";
import { MarketplaceSearch } from "@/components/marketplace-search";
import { APP_TAGLINE } from "@/lib/constants";
import { getCategories, getPublicTechnicians } from "@/lib/supabase-data";

const howItWorks = [
  { title: "Busca por especialidad", description: "Filtra técnicos por categoría, ciudad y disponibilidad." },
  { title: "Revisa perfiles", description: "Compara experiencia, educación, servicios y reseñas públicas." },
  { title: "Solicita el servicio", description: "Contacta al profesional y coordina el trabajo de forma segura." },
];

const benefits = [
  "Perfiles con información profesional publicada",
  "Coordinación rápida para clientes y técnicos",
  "Búsqueda por ubicación y especialidad",
  "Plataforma diseñada para Perú",
];

export default async function HomePage() {
  const [categories, technicians] = await Promise.all([
    getCategories(),
    getPublicTechnicians(),
  ]);
  const featured = technicians.slice(0, 3);

  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
              <Sparkles className="h-4 w-4" />
              Plataforma para servicios técnicos en Perú
            </div>
            <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {APP_TAGLINE}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Conectamos clientes con técnicos certificados y profesionales independientes para resolver mantenimiento, instalación y soporte rápido y confiable.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tecnicos" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                Explorar técnicos
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/registro" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
                Registrarme
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-600">
              <div className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                Perfiles profesionales publicados
              </div>
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Ubicación visible en cada perfil
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Buscar técnico</p>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Disponible</span>
              </div>

              <MarketplaceSearch categories={categories} technicians={technicians} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Categorías populares</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Encuentra la solución que necesitas</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link key={category.id} href={`/categorias/${category.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Técnicos destacados</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Profesionales con mejor valoración</h2>
          </div>
          <Link href="/tecnicos" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            Ver todos
          </Link>
        </div>

        {featured.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((tech) => (
              <TechnicianCard key={tech.id} technician={tech} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-xl font-semibold text-slate-900">Aún no hay técnicos publicados</h3>
            <p className="mt-2 text-sm text-slate-600">Sé el primero en crear un perfil profesional y aparecer en la plataforma.</p>
            <Link href="/registro" className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              Registrarme como técnico
            </Link>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Cómo funciona</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Una experiencia simple para clientes y técnicos</h2>
            <div className="mt-6 space-y-4">
              {howItWorks.map((item, index) => (
                <div key={item.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">{index + 1}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Para técnicos</p>
            <h3 className="mt-3 text-2xl font-bold">Publica tu perfil y recibe solicitudes de calidad</h3>
            <p className="mt-4 text-sm text-slate-300">
              Crea tu perfil, agrega tu experiencia, portafolio y CV para destacar ante clientes reales en Perú.
            </p>
            <div className="mt-6 space-y-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-slate-200">{benefit}</span>
                </div>
              ))}
            </div>
            <Link href="/registro" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              Registrarme como técnico
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { label: "Perfiles publicados", value: technicians.length },
              { label: "Categorías activas", value: categories.length },
              { label: "Ciudades con perfiles", value: new Set(technicians.map((item) => item.city).filter(Boolean)).size },
              { label: "Perfiles verificados", value: technicians.filter((item) => item.verification_status === "verified").length },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <h3 className="mt-3 text-3xl font-black text-slate-900">{item.value.toLocaleString("es-PE")}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-blue-50 p-8 text-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Registro</p>
              <h3 className="mt-2 text-2xl font-bold">¿Eres técnico? Publica tu perfil y empieza a recibir solicitudes.</h3>
            </div>
            <Link href="/registro" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              Crear mi perfil
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
