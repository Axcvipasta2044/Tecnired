"use client";

import Link from "next/link";
import { Compass, House, MessageCircle, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/constants";

export function SiteMobileMenu({ role }: { role?: UserRole }) {
  const pathname = usePathname();
  if (role === "admin") return null;

  const homeHref = role === "client" ? "/cliente" : role === "technician" ? "/tecnico" : "/";
  const chatHref = role === "client" ? "/cliente/chat" : role === "technician" ? "/tecnico/chat" : "/login";
  const profileHref = role === "client" ? "/cliente/perfil" : role === "technician" ? "/tecnico/perfil" : "/login";
  const items = [
    { href: homeHref, label: "Inicio", icon: House, active: pathname === homeHref },
    { href: "/tecnicos", label: "Explorar", icon: Compass, active: pathname.startsWith("/tecnicos") || pathname.startsWith("/categorias") },
    { href: chatHref, label: "Chat", icon: MessageCircle, active: role !== undefined && pathname.startsWith(chatHref) },
    { href: profileHref, label: "Perfil", icon: UserRound, active: role !== undefined && pathname.startsWith(profileHref) },
  ];

  return (
    <nav aria-label="Navegación principal" className="mobile-app-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      {items.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={label}
          href={href}
          aria-current={active ? "page" : undefined}
          className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold transition-colors ${active ? "text-blue-700" : "text-slate-500 hover:text-slate-900"}`}
        >
          <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
