import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, MapPin, ShieldCheck, Star } from "lucide-react";
import { getTechnicianDetailsBySlug } from "@/lib/supabase-data";
import { formatMoney } from "@/lib/utils";
import { startConversationAction } from "@/app/actions/chat";

export default async function TechnicianProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tech = await getTechnicianDetailsBySlug(slug);
  if (!tech) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/tecnicos" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-700">
        <ArrowLeft className="h-4 w-4" />
        Volver a técnicos
      </Link>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-100 p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              {tech.avatar_url ? (
                <img src={tech.avatar_url} alt="" className="h-28 w-28 rounded-2xl object-cover ring-4 ring-white" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-blue-100 text-3xl font-bold text-blue-700">
                  {(tech.display_name ?? "T").slice(0, 1).toLocaleUpperCase("es-PE")}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black text-slate-900">{tech.display_name ?? "Técnico"}</h1>
                  {tech.verification_status === "verified" && <ShieldCheck className="h-5 w-5 text-emerald-600" aria-label="Verificado" />}
                </div>
                {tech.headline && <p className="mt-2 text-lg font-medium text-blue-700">{tech.headline}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  {(tech.city || tech.district) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {[tech.city, tech.district].filter(Boolean).join(", ")}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    {tech.years_experience} años de experiencia
                  </span>
                  {tech.review_count > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {tech.rating.toFixed(1)} ({tech.review_count} reseñas)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-7 p-6">
            {tech.bio && (
              <section>
                <h2 className="text-lg font-bold text-slate-900">Descripción</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{tech.bio}</p>
              </section>
            )}

            {tech.services.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900">Servicios ofrecidos</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {tech.services.map((service) => (
                    <article key={service.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="font-semibold text-slate-900">{service.title}</h3>
                      {service.description && <p className="mt-2 text-sm text-slate-600">{service.description}</p>}
                      <p className="mt-3 font-bold text-slate-900">
                        {service.price_min === null ? "A cotizar" : formatMoney(service.price_min)}
                        {service.price_min !== null && service.price_max !== null && service.price_max !== service.price_min
                          ? ` – ${formatMoney(service.price_max)}`
                          : ""}
                      </p>
                      <Link
                        href={`/solicitudes/nueva/${tech.id}?service=${service.id}`}
                        className="mt-4 inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Solicitar este servicio
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {tech.experience.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900">Experiencia laboral</h2>
                <div className="mt-4 space-y-3">
                  {tech.experience.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="font-semibold text-slate-900">{item.job_title}</h3>
                      <p className="text-sm text-slate-600">{item.company}</p>
                      {item.description && <p className="mt-2 text-sm text-slate-600">{item.description}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {tech.education.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900">Formación</h2>
                <div className="mt-4 space-y-3">
                  {tech.education.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="font-semibold text-slate-900">{item.degree}</h3>
                      <p className="text-sm text-slate-600">{item.institution}{item.field_of_study ? ` · ${item.field_of_study}` : ""}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {tech.certifications.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900">Certificaciones verificadas</h2>
                <div className="mt-4 space-y-3">
                  {tech.certifications.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="font-semibold text-slate-900">{item.name}</h3>
                      <p className="text-sm text-slate-600">{item.issuer}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {tech.portfolio.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900">Portafolio</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {tech.portfolio.map((item) => (
                    <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <img src={item.image_url} alt={item.title} className="h-40 w-full object-cover" />
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        {item.description && <p className="mt-2 text-sm text-slate-600">{item.description}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {tech.reviews.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900">Reseñas</h2>
                <div className="mt-4 space-y-3">
                  {tech.reviews.map((review) => (
                    <article key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <time className="text-sm text-slate-500" dateTime={review.created_at}>
                          {new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(review.created_at))}
                        </time>
                        <span className="inline-flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" /> {review.rating}/5
                        </span>
                      </div>
                      {review.comment && <p className="mt-2 text-sm text-slate-600">{review.comment}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Disponibilidad</h2>
              <span className={tech.is_available ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-600"}>
                {tech.is_available ? "Disponible" : "No disponible"}
              </span>
            </div>
            {tech.services.length === 0 && <p className="mt-4 text-sm text-slate-600">Este perfil todavía no tiene servicios publicados.</p>}
            <form action={startConversationAction} className="mt-5 border-t border-slate-100 pt-5">
              <input type="hidden" name="technician_id" value={tech.id} />
              <button className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                Escribir al técnico
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
