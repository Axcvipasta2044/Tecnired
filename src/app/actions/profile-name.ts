"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const nameSchema = z.object({ display_name: z.string().trim().min(1, "El nombre no puede estar vacío.").max(120) });
export type NameFormState = { error?: string; success?: string };

export async function saveDisplayNameAction(_previous: NameFormState, formData: FormData): Promise<NameFormState> {
  const parsed = nameSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Nombre no válido." };
  const user = await requireUser();
  if (user.role === "admin") return { error: "Esta cuenta no puede editar este nombre." };
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { error } = await supabase.from("profiles").update({ display_name: parsed.data.display_name }).eq("id", user.id);
  if (error) return { error: "No se pudo actualizar el nombre." };
  revalidatePath("/cliente"); revalidatePath("/cliente/perfil"); revalidatePath("/cliente/chat");
  revalidatePath("/tecnico"); revalidatePath("/tecnico/perfil"); revalidatePath("/tecnico/chat");
  revalidatePath("/tecnicos", "page");
  return { success: "Nombre actualizado." };
}
