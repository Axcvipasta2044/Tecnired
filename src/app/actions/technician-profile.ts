"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { slugify } from "@/lib/utils";

export type ProfileFormState = { error?: string; success?: string };

export async function saveTechnicianAvatarAction(storagePath: string): Promise<string> {
  const user = await requireUser("technician");
  if (storagePath !== `${user.id}/avatar`) {
    throw new Error("La ruta de la foto no es válida.");
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { data } = supabase.storage.from("avatars").getPublicUrl(storagePath);
  const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id)
    .eq("role", "technician");
  if (error) throw new Error(`No se pudo actualizar tu foto: ${error.message}`);

  revalidatePath("/tecnico/perfil");
  revalidatePath("/tecnicos", "page");
  revalidatePath("/tecnicos/[slug]", "page");
  return avatarUrl;
}

const profileSchema = z.object({
  headline: z.string().trim().max(120),
  bio: z.string().trim().max(3000),
  primary_category_id: z.union([z.literal(""), z.string().uuid()]),
  years_experience: z.coerce.number().int().min(0).max(80),
  department: z.string().trim().max(80),
  city: z.string().trim().max(100),
  district: z.string().trim().max(100),
  phone: z.string().trim().max(30),
  is_available: z.literal("on").optional(),
  is_published: z.literal("on").optional(),
});

export async function saveTechnicianProfileAction(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const values = profileSchema.safeParse(Object.fromEntries(formData));
  if (!values.success) return { error: "Revisa los campos del perfil e inténtalo nuevamente." };
  const user = await requireUser("technician");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { data: existing, error: existingError } = await supabase
    .from("technician_profiles")
    .select("id,slug")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existingError) throw new Error(`No se pudo cargar el perfil técnico: ${existingError.message}`);

  const shouldPublish = values.data.is_published === "on";
  if (shouldPublish) {
    const { count, error } = await supabase
      .from("technician_services")
      .select("id", { count: "exact", head: true })
      .eq("technician_id", existing?.id ?? "")
      .eq("is_active", true);
    if (error) throw new Error(`No se pudieron validar los servicios: ${error.message}`);
    if (!count) return { error: "Agrega al menos un servicio antes de publicar tu perfil." };
    if (!values.data.headline || !values.data.primary_category_id || !values.data.city) {
      return { error: "Completa el titular, la especialidad y la ciudad antes de publicar." };
    }
  }

  const profileValues = {
    headline: values.data.headline || null,
    bio: values.data.bio || null,
    primary_category_id: values.data.primary_category_id || null,
    years_experience: values.data.years_experience,
    is_available: values.data.is_available === "on",
    is_published: shouldPublish,
  };
  const profileResult = existing
    ? await supabase.from("technician_profiles").update(profileValues).eq("id", existing.id)
    : await supabase.from("technician_profiles").insert({
        ...profileValues,
        user_id: user.id,
        slug: `${slugify(user.displayName ?? "tecnico") || "tecnico"}-${user.id.slice(0, 8)}`,
      });
  if (profileResult.error) throw new Error(`No se pudo guardar el perfil técnico: ${profileResult.error.message}`);

  const { error: personalError } = await supabase
    .from("profiles")
    .update({
      department: values.data.department || null,
      city: values.data.city || null,
      district: values.data.district || null,
      phone: values.data.phone || null,
    })
    .eq("id", user.id);
  if (personalError) throw new Error(`No se pudo guardar tu ubicación: ${personalError.message}`);

  revalidatePath("/tecnico");
  revalidatePath("/tecnico/perfil");
  revalidatePath("/tecnicos");
  return { success: "Perfil guardado." };
}

const serviceSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000),
  pricing_type: z.enum(["fixed", "range", "hourly", "quote"]),
  price_min: z.union([z.literal(""), z.coerce.number().nonnegative()]),
  price_max: z.union([z.literal(""), z.coerce.number().nonnegative()]),
});

export async function saveTechnicianServiceAction(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const values = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!values.success) return { error: "Completa el nombre del servicio y verifica los precios." };
  const { title, description, pricing_type, price_min, price_max } = values.data;
  if (price_min !== "" && price_max !== "" && price_max < price_min) {
    return { error: "El precio máximo debe ser igual o superior al mínimo." };
  }
  const user = await requireUser("technician");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: technician, error: technicianError } = await supabase
    .from("technician_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (technicianError) throw new Error(`No se pudo cargar el perfil técnico: ${technicianError.message}`);
  if (!technician) return { error: "Guarda tu perfil profesional antes de agregar servicios." };

  const { error } = await supabase.from("technician_services").insert({
    technician_id: technician.id,
    title,
    description: description || null,
    pricing_type,
    price_min: price_min === "" ? null : price_min,
    price_max: price_max === "" ? null : price_max,
  });
  if (error) throw new Error(`No se pudo guardar el servicio: ${error.message}`);
  revalidatePath("/tecnico/perfil");
  revalidatePath("/tecnico");
  revalidatePath("/tecnicos");
  return { success: "Servicio agregado." };
}

export async function deleteTechnicianServiceAction(formData: FormData): Promise<void> {
  const serviceId = z.string().uuid().safeParse(formData.get("service_id"));
  if (!serviceId.success) throw new Error("El servicio indicado no es válido.");
  const user = await requireUser("technician");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: technician, error: technicianError } = await supabase
    .from("technician_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (technicianError) throw new Error(`No se pudo validar el perfil técnico: ${technicianError.message}`);
  if (!technician) throw new Error("No existe un perfil técnico para esta cuenta.");
  const { error } = await supabase
    .from("technician_services")
    .delete()
    .eq("id", serviceId.data)
    .eq("technician_id", technician.id);
  if (error) throw new Error(`No se pudo eliminar el servicio: ${error.message}`);
  revalidatePath("/tecnico/perfil");
  revalidatePath("/tecnicos");
}
