"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
};

export function SiteMobileMenu({
  navItems,
  accountLinks,
}: {
  navItems: NavItem[];
  accountLinks: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="interactive-button flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <nav
        className={`mobile-menu-panel absolute right-0 top-12 z-20 flex min-w-60 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/70 ${
          open ? "is-open" : ""
        }`}
      >
        {navItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="mobile-menu-link text-sm font-medium text-slate-700 transition hover:text-blue-600"
            style={{ transitionDelay: `${index * 35}ms` }}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/tecnicos"
          onClick={() => setOpen(false)}
          className="mobile-menu-link text-sm font-medium text-slate-700 transition hover:text-blue-600"
          style={{ transitionDelay: `${navItems.length * 35}ms` }}
        >
          Buscar técnicos
        </Link>
        <div className="mobile-menu-link flex flex-col gap-3 border-t border-slate-100 pt-3">
          {accountLinks}
        </div>
      </nav>
    </div>
  );
}
