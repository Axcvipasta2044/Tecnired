"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { sendMessageAction, type ChatFormState } from "@/app/actions/chat";
import { formatDateTime } from "@/lib/utils";
import type { ChatConversation } from "@/lib/chat-data";

const initialState: ChatFormState = {};

export function ChatView({ conversations, selectedId, userId }: { conversations: ChatConversation[]; selectedId?: string; userId: string }) {
  const router = useRouter();
  const [notification, setNotification] = useState<string | null>(null);
  const knownMessageIds = useRef(new Set(conversations.flatMap((conversation) => conversation.messages.map((message) => message.id))));
  const firstRender = useRef(true);
  useEffect(() => {
    const interval = window.setInterval(() => router.refresh(), 15000);
    return () => window.clearInterval(interval);
  }, [router]);
  useEffect(() => {
    const incoming = conversations.flatMap((conversation) => conversation.messages.filter((message) => message.sender_id !== userId && !knownMessageIds.current.has(message.id)).map((message) => ({ message, conversation })));
    if (!firstRender.current && incoming.length > 0) {
      const item = incoming[incoming.length - 1];
      setNotification(item.message.sender_id === item.conversation.client_id ? item.conversation.client_name : item.conversation.technician_name);
    }
    conversations.forEach((conversation) => conversation.messages.forEach((message) => knownMessageIds.current.add(message.id)));
    firstRender.current = false;
  }, [conversations, userId]);
  const visibleConversations = conversations.filter((conversation) => conversation.messages.length > 0);
  const selected = visibleConversations.find((conversation) => conversation.id === selectedId) ?? visibleConversations[0];
  const [state, action, pending] = useActionState(sendMessageAction, initialState);
  if (!selected) return <>{notification && <div role="alert" className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-800">{notification}</div>}<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">Aún no tienes conversaciones con mensajes.</div></>;
  return <div>{notification && <div role="alert" className="mb-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-800"><span>{notification}</span><button type="button" onClick={() => setNotification(null)} aria-label="Cerrar alerta" className="px-2 text-lg">×</button></div>}<div className="grid gap-5 lg:grid-cols-[280px_1fr]">
    <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><h2 className="px-3 py-2 font-bold text-slate-900">Conversaciones</h2>{visibleConversations.map((conversation) => <Link key={conversation.id} href={`?conversation=${conversation.id}`} className={`mt-1 block rounded-xl p-3 text-sm ${conversation.id === selected.id ? "bg-blue-50 text-blue-800" : "hover:bg-slate-50"}`}><span className="font-semibold">{userId === conversation.client_id ? conversation.technician_name : conversation.client_name}</span></Link>)}</aside>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="border-b border-slate-100 pb-4"><h2 className="text-xl font-bold text-slate-900">{userId === selected.client_id ? selected.technician_name : selected.client_name}</h2><p className="mt-1 text-sm text-slate-500">{selected.title} · Los mensajes se conservan 24 horas.</p></div><div className="max-h-[480px] space-y-3 overflow-y-auto py-5">{selected.messages.map((message) => <article key={message.id} className={`max-w-[85%] rounded-2xl p-3 ${message.sender_id === userId ? "ml-auto bg-blue-600 text-white" : "bg-slate-100 text-slate-900"}`}><p className="text-xs font-semibold opacity-80">{message.sender_id === userId ? "Tú" : (userId === selected.client_id ? selected.technician_name : selected.client_name)}</p><p className="mt-1 whitespace-pre-wrap text-sm">{message.body}</p><time dateTime={message.created_at} className="mt-2 block text-[11px] opacity-75">{formatDateTime(message.created_at)}</time></article>)}</div><form action={action} className="border-t border-slate-100 pt-4"><input type="hidden" name="conversation_id" value={selected.id} /><textarea name="body" required maxLength={4000} rows={3} placeholder="Escribe un mensaje..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />{state.error && <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p>}{state.success && <p role="status" className="mt-2 text-sm text-emerald-700">{state.success}</p>}<button disabled={pending} className="mt-3 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Enviando..." : "Enviar mensaje"}</button></form></section>
  </div></div>;
}
