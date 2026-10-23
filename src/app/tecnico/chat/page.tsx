import { DashboardShell } from "@/components/dashboard-shell";
import { ChatView } from "@/components/chat-view";
import { getChatData } from "@/lib/chat-data";
import { requireUser } from "@/lib/auth";

export default async function TechnicianChatPage({ searchParams }: { searchParams: Promise<{ conversation?: string }> }) {
  const user = await requireUser("technician");
  const { conversation } = await searchParams;
  return <DashboardShell role="technician" title="Chat" subtitle="Responde a los clientes de tus solicitudes."><ChatView conversations={await getChatData()} selectedId={conversation} userId={user.id} /></DashboardShell>;
}
