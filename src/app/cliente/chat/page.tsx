import { DashboardShell } from "@/components/dashboard-shell";
import { ChatView } from "@/components/chat-view";
import { getChatData } from "@/lib/chat-data";
import { requireUser } from "@/lib/auth";

export default async function ClientChatPage({ searchParams }: { searchParams: Promise<{ conversation?: string }> }) {
  const user = await requireUser("client");
  const { conversation } = await searchParams;
  return <DashboardShell role="client" title="Chat" subtitle="Comunícate con los técnicos de tus solicitudes."><ChatView conversations={await getChatData()} selectedId={conversation} userId={user.id} /></DashboardShell>;
}
