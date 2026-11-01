import { getSupabaseServerClient } from "@/lib/supabase-server";

export type ChatMessage = { id: string; conversation_id: string; sender_id: string; sender_name: string; body: string; created_at: string; expires_at: string };
export type ChatConversation = { id: string; request_id: string | null; client_id: string; technician_id: string; title: string; client_name: string; technician_name: string; messages: ChatMessage[] };
type ChatParticipant = { conversation_id: string; participant_id: string; participant_name: string; is_target_technician: boolean };

export async function getChatData(): Promise<ChatConversation[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: rows, error } = await supabase.from("conversations").select("id,service_request_id,client_id,technician_id,service_requests(title)").order("updated_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar las conversaciones: ${error.message}`);
  const conversations = rows ?? [];
  const { data: participantRows, error: participantError } = conversations.length
    ? await supabase.rpc("get_chat_participant_profiles", { p_conversation_ids: conversations.map((row) => row.id) })
    : { data: [], error: null };
  if (participantError) throw new Error(`No se pudieron cargar los nombres del chat: ${participantError.message}`);
  const participants = (participantRows ?? []) as ChatParticipant[];
  const participantNames = new Map((participants ?? []).map((participant) => [`${participant.conversation_id}:${participant.participant_id}`, participant.participant_name]));
  const technicianNames = new Map((participants ?? []).filter((participant) => participant.is_target_technician).map((participant) => [participant.conversation_id, participant.participant_name]));
  const getParticipantName = (conversationId: string, userId: string) => participantNames.get(`${conversationId}:${userId}`) ?? "Usuario";
  return Promise.all(conversations.map(async (row) => {
    const { data: messages, error: messageError } = await supabase.from("messages").select("id,conversation_id,sender_id,body,created_at,expires_at").eq("conversation_id", row.id).gt("expires_at", new Date().toISOString()).order("created_at");
    if (messageError) throw new Error(`No se pudieron cargar los mensajes: ${messageError.message}`);
    const request = Array.isArray(row.service_requests) ? row.service_requests[0] : row.service_requests;
    return { id: row.id, request_id: row.service_request_id, client_id: row.client_id, technician_id: row.technician_id, title: request?.title ?? "Conversación directa", client_name: getParticipantName(row.id, row.client_id), technician_name: technicianNames.get(row.id) ?? "Usuario", messages: (messages ?? []).map((message) => ({ ...message, sender_name: getParticipantName(row.id, message.sender_id) })) };
  }));
}
