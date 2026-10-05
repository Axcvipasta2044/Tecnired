import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Únete a TecniRed</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Crea tu cuenta</h1>
        <p className="mt-3 text-slate-600">Regístrate como cliente o técnico. Las cuentas administrativas se habilitan de forma segura desde Supabase.</p>
        <div className="mt-7"><RegisterForm /></div>
        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
