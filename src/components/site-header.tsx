import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, UserRound } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteMobileMenu } from "@/components/site-mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
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
      <Link href={DASHBOARD_PATHS[user.role]} className="interactive-button focus-ring rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        Mi panel
      </Link>
      <SignOutButton />
    </>
  ) : (
    <>
      <Link href="/login" className="interactive-button focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        <UserRound className="h-4 w-4" /> Iniciar sesión
      </Link>
      <Link href="/registro" className="interactive-button focus-ring group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
        Registrarse <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm shadow-slate-200/40 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${APP_NAME}, inicio`} className="group flex shrink-0 items-center gap-2 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4">
          <Image
            src="/tecnired-logo.svg"
            alt=""
            width={505}
            height={372}
            priority
            className="h-11 w-[60px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <span>
            <span className="block text-lg font-black uppercase leading-tight tracking-tight text-slate-950">
              TECNI<span className="text-emerald-600">RED</span>
            </span>
            <span className="hidden text-[10px] leading-tight text-slate-500 sm:block">{APP_TAGLINE}</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => <Link key={item.href} href={item.href} className="header-link focus-ring hover:text-blue-600">{item.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link href="/tecnicos" className="interactive-button focus-ring group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            <Search className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" /> Buscar
          </Link>
          {accountLinks}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <SiteMobileMenu navItems={navItems} accountLinks={accountLinks} />
        </div>
      </div>
    </header>
  );
}
