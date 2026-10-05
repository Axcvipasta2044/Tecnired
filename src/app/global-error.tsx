"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="es">
      <body>
        <main style={{ margin: "4rem auto", maxWidth: "42rem", padding: "1rem", fontFamily: "sans-serif", textAlign: "center" }}>
          <h1>No se pudo iniciar TecniRed</h1>
          <p>Verifica que Supabase esté configurado y que el esquema de base de datos esté instalado.</p>
          {process.env.NODE_ENV === "development" && <pre>{error.message}</pre>}
          <button type="button" onClick={() => reset()}>Intentar de nuevo</button>
        </main>
      </body>
    </html>
  );
}
