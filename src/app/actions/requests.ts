"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentSession, requireUser } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { RequestStatus } from "@/lib/constants";

const requestSchema = z.object({
  technician_id: z.string().uuid(),
  technician_service_id: z.union([z.literal(""), z.string().uuid()]),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(4000),
  department: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(100),
  district: z.string().trim().max(100),
  service_address: z.string().trim().max(300),
  preferred_date: z.union([z.literal(""), z.string().date()]),
  budget_min: z.union([z.literal(""), z.coerce.number().nonnegative()]),
  budget_max: z.union([z.literal(""), z.coerce.number().nonnegative()]),
  contact_phone: z.string().trim().max(30),
});

export type RequestFormState = {
  error?: string;
  success?: string;
};

export async function createServiceRequestAction(
  _previousState: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  const validated = requestSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { error: "Revisa los datos: completa los campos obligatorios y verifica los presupuestos." };
  }
  const values = validated.data;
  if (
    values.budget_min !== "" &&
    values.budget_max !== "" &&
    values.budget_max < values.budget_min
  ) {
    return { error: "El presupuesto máximo debe ser igual o mayor al mínimo." };
  }

  const user = await requireUser("client");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { data: technician, error: technicianError } = await supabase
    .from("technician_profiles")
    .select("id")
    .eq("id", values.technician_id)
    .eq("is_published", true)
    .eq("is_available", true)
    .maybeSingle();
  if (technicianError) throw new Error(`No se pudo validar el técnico: ${technicianError.message}`);
  if (!technician) return { error: "Este técnico ya no recibe solicitudes." };

  const serviceId = values.technician_service_id || null;
  if (serviceId) {
    const { data: service, error: serviceError } = await supabase
      .from("technician_services")
      .select("id")
      .eq("id", serviceId)
      .eq("technician_id", technician.id)
      .eq("is_active", true)
      .maybeSingle();
    if (serviceError) throw new Error(`No se pudo validar el servicio: ${serviceError.message}`);
    if (!service) return { error: "El servicio seleccionado no está disponible." };
  }

  const { error } = await supabase.from("service_requests").insert({
    client_id: user.id,
    technician_id: technician.id,
    technician_service_id: serviceId,
    title: values.title,
    description: values.description,
    department: values.department,
    city: values.city,
    district: values.district || null,
    service_address: values.service_address || null,
    preferred_date: values.preferred_date || null,
    budget_min: values.budget_min === "" ? null : values.budget_min,
    budget_max: values.budget_max === "" ? null : values.budget_max,
    contact_phone: values.contact_phone || null,
  });
  if (error) throw new Error(`No se pudo crear la solicitud: ${error.message}`);

  revalidatePath("/cliente");
  revalidatePath("/cliente/solicitudes");
  revalidatePath("/tecnico");
  revalidatePath("/tecnico/solicitudes");
  return { success: "Tu solicitud fue enviada al técnico." };
}

const allowedTransitions: Record<string, RequestStatus[]> = {
  client: ["cancelled"],
  technician: ["accepted", "rejected", "in_progress", "completed", "cancelled"],
};

export async function updateServiceRequestAction(formData: FormData): Promise<void> {
  const requestId = z.string().uuid().safeParse(formData.get("request_id"));
  const nextStatus = z.enum(["accepted", "rejected", "in_progress", "completed", "cancelled"]).safeParse(formData.get("status"));
  if (!requestId.success || !nextStatus.success) throw new Error("La acción solicitada no es válida.");

  const { user } = await getCurrentSession();
  if (!user) throw new Error("Debes iniciar sesión para actualizar solicitudes.");
  if (!allowedTransitions[user.role]?.includes(nextStatus.data)) {
    throw new Error("Tu rol no puede realizar esta acción.");
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: request, error: requestError } = await supabase
    .from("service_requests")
    .select("id,status,client_id,technician_id")
    .eq("id", requestId.data)
    .maybeSingle();
  if (requestError) throw new Error(`No se pudo cargar la solicitud: ${requestError.message}`);
  if (!request) throw new Error("La solicitud no existe o no tienes permiso para verla.");

  const transitions: Record<RequestStatus, RequestStatus[]> = {
    pending: user.role === "client" ? ["cancelled"] : ["accepted", "rejected", "cancelled"],
    accepted: user.role === "technician" ? ["in_progress", "cancelled"] : [],
    rejected: [],
    in_progress: user.role === "technician" ? ["completed", "cancelled"] : [],
    completed: [],
    cancelled: [],
  };
  if (!transitions[request.status as RequestStatus]?.includes(nextStatus.data)) {
    throw new Error("La solicitud ya cambió o esta transición no está permitida.");
  }

  if (user.role === "client" && request.client_id !== user.id) {
    throw new Error("No tienes permiso para actualizar esta solicitud.");
  }
  if (user.role === "technician") {
    const { data: profile, error: profileError } = await supabase
      .from("technician_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileError) throw new Error(`No se pudo validar el perfil técnico: ${profileError.message}`);
    if (!profile || profile.id !== request.technician_id) {
      throw new Error("No tienes permiso para actualizar esta solicitud.");
    }
  }

  const { error } = await supabase
    .from("service_requests")
    .update({ status: nextStatus.data })
    .eq("id", request.id);
  if (error) throw new Error(`No se pudo actualizar la solicitud: ${error.message}`);

  revalidatePath("/cliente");
  revalidatePath("/cliente/solicitudes");
  revalidatePath("/tecnico");
  revalidatePath("/tecnico/solicitudes");
}
