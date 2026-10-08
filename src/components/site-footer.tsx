import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { APP_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <Reveal as="footer" className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <p className="text-xl font-black uppercase tracking-tight">
            <span className="text-white">TECNI</span><span className="text-emerald-500">RED</span>
          </p>
          <p className="text-sm text-slate-300">
            Facilitamos el contacto entre clientes y profesionales técnicos en Perú.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Plataforma</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li><Link href="/tecnicos" className="transition hover:text-white">Buscar técnicos</Link></li>
            <li><Link href="/como-funciona" className="transition hover:text-white">Cómo funciona</Link></li>
            <li><Link href="/login" className="transition hover:text-white">Iniciar sesión</Link></li>
            <li><Link href="/registro" className="transition hover:text-white">Registrarse</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Legal</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li><Link href="/terminos" className="transition hover:text-white">Términos</Link></li>
            <li><Link href="/privacidad" className="transition hover:text-white">Privacidad</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Para profesionales</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li><Link href="/registro" className="transition hover:text-white">Crea una cuenta de técnico</Link></li>
            <li><Link href="/como-funciona" className="transition hover:text-white">Conoce el flujo de solicitudes</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-xs text-slate-400 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {APP_NAME}.</p>
          <p>Versión MVP • Perú</p>
        </div>
      </div>
    </Reveal>
  );
}
