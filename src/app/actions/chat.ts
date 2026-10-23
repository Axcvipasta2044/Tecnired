"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export type ChatFormState = { error?: string; success?: string };
const messageSchema = z.object({ conversation_id: z.string().uuid(), body: z.string().trim().min(1, "Escribe un mensaje.").max(4000) });

export async function sendMessageAction(_previous: ChatFormState, formData: FormData): Promise<ChatFormState> {
  const values = messageSchema.safeParse(Object.fromEntries(formData));
  if (!values.success) return { error: "Escribe un mensaje válido." };
  const user = await requireUser();
  if (user.role === "admin") return { error: "Esta cuenta no participa en chats." };
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { error } = await supabase.from("messages").insert({ conversation_id: values.data.conversation_id, sender_id: user.id, body: values.data.body });
  if (error) return { error: "No se pudo enviar el mensaje." };
  revalidatePath("/cliente/chat"); revalidatePath("/tecnico/chat");
  return { success: "Mensaje enviado." };
}

export async function startConversationAction(formData: FormData): Promise<void> {
  const technicianId = z.string().uuid().safeParse(formData.get("technician_id"));
  if (!technicianId.success) throw new Error("El técnico indicado no es válido.");
  const user = await requireUser("client", "/tecnicos");
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: technician } = await supabase.from("technician_profiles").select("id").eq("id", technicianId.data).eq("is_published", true).maybeSingle();
  if (!technician) throw new Error("Este técnico no está disponible.");
  const { data: existing, error: existingError } = await supabase.from("conversations").select("id").eq("client_id", user.id).eq("technician_id", technician.id).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (existingError) throw new Error("No se pudo cargar la conversación.");
  let conversationId = existing?.id;
  if (!conversationId) {
    const { data: created, error } = await supabase.from("conversations").insert({ client_id: user.id, technician_id: technician.id }).select("id").single();
    if (error || !created) throw new Error("No se pudo iniciar la conversación.");
    conversationId = created.id;
  }
  revalidatePath("/cliente/chat"); revalidatePath("/tecnico/chat");
  redirect(`/cliente/chat?conversation=${conversationId}`);
}
