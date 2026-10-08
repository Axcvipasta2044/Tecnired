"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase no está configurado.");
      return;
    }
    setBusy(true);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      setBusy(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void signOut()}
        disabled={busy}
        className="interactive-button focus-ring rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {busy ? "Saliendo..." : "Cerrar sesión"}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
