"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

const navByRole = {
  client: [
    { href: "/cliente", label: "Resumen" },
    { href: "/tecnicos", label: "Buscar técnicos" },
    { href: "/cliente/solicitudes", label: "Solicitudes" },
  ],
  technician: [
    { href: "/tecnico", label: "Resumen" },
    { href: "/tecnico/solicitudes", label: "Solicitudes" },
    { href: "/tecnico/perfil", label: "Mi perfil" },
  ],
  admin: [
    { href: "/admin", label: "Resumen" },
    { href: "/admin/usuarios", label: "Usuarios" },
    { href: "/admin/verificaciones", label: "Verificaciones" },
  ],
} as const;

export function DashboardShell({
  role,
  title,
  subtitle,
  actions,
  children,
}: {
  role: "client" | "technician" | "admin";
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const items = navByRole[role];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Panel {role === "client" ? "de cliente" : role === "technician" ? "de técnico" : "administrativo"}
              </div>
              <h1 className="text-3xl font-black text-slate-900">{title}</h1>
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            </div>

            <div className="flex items-center gap-3">
              {actions}
            </div>
          </div>

          <nav className="mt-6 flex flex-wrap gap-2">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-xl border px-3 py-2 text-sm font-medium transition",
                    active
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {children}
      </div>
    </div>
  );
}
