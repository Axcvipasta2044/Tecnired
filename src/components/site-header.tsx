import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, Search, UserRound } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { APP_NAME, APP_TAGLINE, DASHBOARD_PATHS } from "@/lib/constants";
import { getCurrentSession } from "@/lib/auth";

const navItems = [
  { href: "/tecnicos", label: "Técnicos" },
  { href: "/categorias/soporte-tecnico", label: "Categorías" },
  { href: "/como-funciona", label: "Cómo funciona" },
];

export async function SiteHeader() {
  const { user } = await getCurrentSession();
  const accountLinks = user ? (
    <>
      <Link href={DASHBOARD_PATHS[user.role]} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        Mi panel
      </Link>
      <SignOutButton />
    </>
  ) : (
    <>
      <Link href="/login" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        <UserRound className="h-4 w-4" /> Iniciar sesión
      </Link>
      <Link href="/registro" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
        Registrarse <ArrowRight className="h-4 w-4" />
      </Link>
    </>
  );

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${APP_NAME}, inicio`} className="flex shrink-0 items-center gap-2">
          <Image
            src="/tecnired-logo.png"
            alt=""
            width={505}
            height={372}
            priority
            className="h-11 w-[60px] object-contain"
          />
          <span>
            <span className="block text-lg font-black uppercase leading-tight tracking-tight text-slate-950">
              TECNI<span className="text-emerald-600">RED</span>
            </span>
            <span className="hidden text-[10px] leading-tight text-slate-500 sm:block">{APP_TAGLINE}</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => <Link key={item.href} href={item.href} className="transition hover:text-blue-600">{item.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/tecnicos" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            <Search className="h-4 w-4" /> Buscar
          </Link>
          {accountLinks}
        </div>
        <details className="relative md:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </summary>
          <nav className="absolute right-0 top-12 z-20 flex min-w-56 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
            {navItems.map((item) => <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-700">{item.label}</Link>)}
            <Link href="/tecnicos" className="text-sm font-medium text-slate-700">Buscar técnicos</Link>
            {accountLinks}
          </nav>
        </details>
      </div>
    </header>
  );
}
