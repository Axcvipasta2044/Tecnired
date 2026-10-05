"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-black text-slate-900">No pudimos cargar esta página</h1>
      <p className="mt-3 text-slate-600">
        Verifica las variables de Supabase y que hayas aplicado el esquema o la migración requerida.
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-4 overflow-auto rounded-xl bg-slate-100 p-4 text-left text-xs text-slate-700">{error.message}</pre>
      )}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Intentar de nuevo
      </button>
    </main>
  );
}
