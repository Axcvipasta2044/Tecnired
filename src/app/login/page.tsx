import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth-forms";

const loginBenefits = [
  "Busca perfiles profesionales publicados",
  "Gestiona tus solicitudes desde tu cuenta",
  "Acceso separado para clientes y técnicos",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; password_updated?: string }>;
}) {
  const params = await searchParams;
  const errorMessage =
    params.error === "unauthorized"
      ? "Inicia sesión para continuar."
      : params.error === "missing_code"
        ? "El enlace de acceso no es válido o ya venció."
        : params.error === "supabase_not_configured"
          ? "Supabase no está configurado en este entorno."
        : params.error
          ? "No se pudo completar la autenticación. Intenta nuevamente."
          : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Accede a tu cuenta</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Bienvenido a TecniRed</h1>
          <p className="mt-3 max-w-xl text-slate-600">
            Gestiona tus solicitudes y tu perfil con los datos de tu cuenta.
          </p>
          <div className="mt-8 space-y-4">
            {loginBenefits.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Iniciar sesión</h2>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <LockKeyhole className="h-5 w-5" />
            </div>
          </div>
          {errorMessage && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
          {params.password_updated && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">Contraseña actualizada. Inicia sesión con tu nueva contraseña.</p>}
          <LoginForm />
          <p className="mt-5 text-center text-sm text-slate-600">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-semibold text-blue-700 hover:text-blue-800">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
