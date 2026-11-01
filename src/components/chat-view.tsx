"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageCircle, Search } from "lucide-react";
import { sendMessageAction, type ChatFormState } from "@/app/actions/chat";
import { formatDateTime } from "@/lib/utils";
import type { ChatConversation } from "@/lib/chat-data";

const initialState: ChatFormState = {};

export function ChatView({ conversations, selectedId, userId, chatPath }: { conversations: ChatConversation[]; selectedId?: string; userId: string; chatPath: string }) {
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
  const selected = conversations.find((conversation) => conversation.id === selectedId);
  const desktopSelected = selected ?? conversations[0];
  const [state, action, pending] = useActionState(sendMessageAction, initialState);
  return <div>
    {notification && <div role="alert" className="mb-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-800"><span>Nuevo mensaje de {notification}</span><button type="button" onClick={() => setNotification(null)} aria-label="Cerrar alerta" className="px-2 text-lg">×</button></div>}
    {conversations.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
        <MessageCircle className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
        <h2 className="mt-3 font-semibold text-slate-900">Tu bandeja está vacía</h2>
        <p className="mt-1 text-sm">Cuando inicies una conversación, aparecerá aquí.</p>
        <Link href="/tecnicos" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"><Search className="h-4 w-4" /> Explorar técnicos</Link>
      </div>
    ) : (
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={`overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block ${selected ? "hidden" : "block"}`}>
          <div className="border-b border-slate-100 px-4 py-4"><h2 className="text-lg font-bold text-slate-900">Conversaciones</h2></div>
          <nav aria-label="Tus conversaciones" className="divide-y divide-slate-100">
            {conversations.map((conversation) => {
              const otherName = userId === conversation.client_id ? conversation.technician_name : conversation.client_name;
              const lastMessage = conversation.messages.at(-1);
              return <Link key={conversation.id} href={`${chatPath}?conversation=${conversation.id}`} aria-current={conversation.id === selected?.id ? "page" : undefined} className={`flex min-h-[76px] items-center gap-3 px-4 py-3 transition-colors ${conversation.id === selected?.id ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">{otherName.slice(0, 1).toLocaleUpperCase()}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{otherName}</span><span className="mt-1 block truncate text-xs text-slate-500">{lastMessage ? `${lastMessage.sender_id === userId ? "Tú: " : ""}${lastMessage.body}` : "Aún no hay mensajes"}</span></span>
                {lastMessage && <time className="shrink-0 text-[11px] text-slate-500" dateTime={lastMessage.created_at}>{formatDateTime(lastMessage.created_at)}</time>}
              </Link>;
            })}
          </nav>
        </aside>
        <section className={`h-[60dvh] min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white lg:flex lg:h-[min(70vh,720px)] ${selected ? "flex" : "hidden"}`}>
          {desktopSelected ? <>
            <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
              <Link href={chatPath} aria-label="Volver a conversaciones" title="Volver a conversaciones" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 lg:hidden"><ArrowLeft className="h-5 w-5" /></Link>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">{(userId === desktopSelected.client_id ? desktopSelected.technician_name : desktopSelected.client_name).slice(0, 1).toLocaleUpperCase()}</span>
              <div className="min-w-0"><h2 className="truncate font-bold text-slate-900">{userId === desktopSelected.client_id ? desktopSelected.technician_name : desktopSelected.client_name}</h2><p className="truncate text-xs text-slate-500">{desktopSelected.title} · Mensajes por 24 horas</p></div>
            </header>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5">
              {desktopSelected.messages.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Aún no hay mensajes. Escribe el primero.</p> : desktopSelected.messages.map((message) => <article key={message.id} className={`max-w-[85%] rounded-2xl p-3 ${message.sender_id === userId ? "ml-auto bg-blue-600 text-white" : "bg-slate-100 text-slate-900"}`}><p className="text-xs font-semibold opacity-80">{message.sender_id === userId ? "Tú" : message.sender_name}</p><p className="mt-1 whitespace-pre-wrap text-sm">{message.body}</p><time dateTime={message.created_at} className="mt-2 block text-[11px] opacity-75">{formatDateTime(message.created_at)}</time></article>)}
            </div>
            <form action={action} className="border-t border-slate-100 p-3 sm:p-4">
              <input type="hidden" name="conversation_id" value={desktopSelected.id} />
              <textarea name="body" required maxLength={4000} rows={2} placeholder="Escribe un mensaje..." className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
              {state.error && <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p>}{state.success && <p role="status" className="mt-2 text-sm text-emerald-700">{state.success}</p>}
              <div className="mt-2 flex justify-end"><button disabled={pending} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Enviando..." : "Enviar mensaje"}</button></div>
            </form>
          </> : <div className="hidden items-center justify-center text-sm text-slate-500 lg:flex">Selecciona una conversación.</div>}
        </section>
      </div>
    )}
  </div>;
}
