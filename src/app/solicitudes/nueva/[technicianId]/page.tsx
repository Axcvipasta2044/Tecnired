import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceRequestForm } from "@/components/service-request-form";
import { requireUser } from "@/lib/auth";
import { getPublicTechnicianById } from "@/lib/supabase-data";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function NewServiceRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ technicianId: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const [{ technicianId }, { service: serviceId = "" }] = await Promise.all([params, searchParams]);
  const returnTo = `/solicitudes/nueva/${technicianId}${serviceId ? `?service=${encodeURIComponent(serviceId)}` : ""}`;
  const user = await requireUser("client", returnTo);
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const [technician, profileResult] = await Promise.all([
    getPublicTechnicianById(technicianId),
    supabase
      .from("profiles")
      .select("department,city,district,phone")
      .eq("id", user.id)
      .single(),
  ]);
  if (profileResult.error) throw new Error(`No se pudo cargar tu perfil: ${profileResult.error.message}`);
  if (!technician || !technician.is_available) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/tecnicos/${technician.slug}`} className="text-sm font-semibold text-blue-700 hover:text-blue-800">
        Volver al perfil de {technician.display_name ?? "técnico"}
      </Link>
      <h1 className="mt-4 text-3xl font-black text-slate-900">Solicitar un servicio</h1>
      <p className="mt-2 text-slate-600">
        Tu solicitud se enviará a {technician.display_name ?? "este técnico"} y podrás seguirla desde tu panel.
      </p>
      <div className="mt-6">
        <ServiceRequestForm
          technician={technician}
          initialServiceId={serviceId}
          profile={profileResult.data}
        />
      </div>
    </div>
  );
}
