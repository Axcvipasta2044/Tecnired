import { getSupabaseServerClient } from "@/lib/supabase-server";

export type ChatMessage = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string; expires_at: string };
export type ChatConversation = { id: string; request_id: string | null; client_id: string; technician_id: string; title: string; client_name: string; technician_name: string; messages: ChatMessage[] };

export async function getChatData(): Promise<ChatConversation[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: rows, error } = await supabase.from("conversations").select("id,service_request_id,client_id,technician_id,service_requests(title)").order("updated_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar las conversaciones: ${error.message}`);
  const conversations = rows ?? [];
  const clientIds = [...new Set(conversations.map((row) => row.client_id))];
  const technicianIds = [...new Set(conversations.map((row) => row.technician_id))];
  const [{ data: clients }, { data: techProfiles }] = await Promise.all([
    clientIds.length ? supabase.from("profiles").select("id,display_name,first_name,last_name").in("id", clientIds) : Promise.resolve({ data: [] }),
    technicianIds.length ? supabase.from("technician_profiles").select("id,user_id").in("id", technicianIds) : Promise.resolve({ data: [] }),
  ]);
  const techUserIds = (techProfiles ?? []).map((profile) => profile.user_id);
  const { data: techUsers } = techUserIds.length ? await supabase.from("profiles").select("id,display_name,first_name,last_name").in("id", techUserIds) : { data: [] };
  const getName = (profile: { display_name?: string | null; first_name?: string | null; last_name?: string | null }) => profile.display_name?.trim() || [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || "Usuario";
  const clientNames = new Map((clients ?? []).map((profile) => [profile.id, getName(profile)]));
  const techUserByProfile = new Map((techProfiles ?? []).map((profile) => [profile.id, profile.user_id]));
  const techNames = new Map((techUsers ?? []).map((profile) => [profile.id, getName(profile)]));
  return Promise.all(conversations.map(async (row) => {
    const { data: messages, error: messageError } = await supabase.from("messages").select("id,conversation_id,sender_id,body,created_at,expires_at").eq("conversation_id", row.id).gt("expires_at", new Date().toISOString()).order("created_at");
    if (messageError) throw new Error(`No se pudieron cargar los mensajes: ${messageError.message}`);
    const request = Array.isArray(row.service_requests) ? row.service_requests[0] : row.service_requests;
    return { id: row.id, request_id: row.service_request_id, client_id: row.client_id, technician_id: row.technician_id, title: request?.title ?? "Conversación directa", client_name: clientNames.get(row.client_id) ?? "Usuario", technician_name: techNames.get(techUserByProfile.get(row.technician_id) ?? "") ?? "Usuario", messages: messages ?? [] };
  }));
}
