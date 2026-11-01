import { DashboardShell } from "@/components/dashboard-shell";
import { ChatView } from "@/components/chat-view";
import { getChatData } from "@/lib/chat-data";
import { requireUser } from "@/lib/auth";

export default async function ClientChatPage({ searchParams }: { searchParams: Promise<{ conversation?: string }> }) {
  const user = await requireUser("client");
  const { conversation } = await searchParams;
  return <DashboardShell role="client" title="Chat" subtitle="Habla directamente con los técnicos y sigue tus conversaciones."><ChatView conversations={await getChatData()} selectedId={conversation} userId={user.id} chatPath="/cliente/chat" /></DashboardShell>;
}
