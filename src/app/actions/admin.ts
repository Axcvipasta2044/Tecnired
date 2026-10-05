"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function updateVerificationStatusAction(formData: FormData): Promise<void> {
  await requireUser("admin");
  const technicianId = z.string().uuid().safeParse(formData.get("technician_id"));
  const status = z.enum(["verified", "rejected"]).safeParse(formData.get("status"));
  if (!technicianId.success || !status.success) throw new Error("La acción de verificación no es válida.");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { error } = await supabase
    .from("technician_profiles")
    .update({ verification_status: status.data })
    .eq("id", technicianId.data);
  if (error) throw new Error(`No se pudo actualizar la verificación: ${error.message}`);
  revalidatePath("/admin");
  revalidatePath("/admin/verificaciones");
}
