import Link from "next/link";
import { RecoveryForm } from "@/components/auth-forms";

export default async function RecoverPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const isRecovery = type === "recovery";

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
          {isRecovery ? "Nueva contraseña" : "Recuperar contraseña"}
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">
          {isRecovery ? "Restablece tu acceso" : "Recupera tu acceso"}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {isRecovery
            ? "Elige una contraseña nueva para tu cuenta."
            : "Ingresa tu correo y te enviaremos un enlace seguro para cambiar tu contraseña."}
        </p>
        <RecoveryForm isRecovery={isRecovery} />
        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Recordaste tu contraseña?{" "}
          <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800">Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
