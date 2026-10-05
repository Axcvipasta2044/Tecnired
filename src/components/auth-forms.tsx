"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { DASHBOARD_PATHS, type UserRole } from "@/lib/constants";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";
import { safeRedirectPath } from "@/lib/utils";

function getAuthError(error: Error | null, fallback: string) {
  if (!error) return fallback;
  if (error.message.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (error.message.includes("User already registered")) return "Ya existe una cuenta con ese correo.";
  return error.message;
}

function isUserRole(value: unknown): value is UserRole {
  return value === "client" || value === "technician" || value === "admin";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase no está configurado. Revisa las variables de entorno.");
      setBusy(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    });

    if (error) {
      setMessage(getAuthError(error, "No se pudo iniciar sesión."));
      setBusy(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    if (profileError) {
      setMessage(`La sesión se inició, pero no se pudo cargar el perfil: ${profileError.message}`);
      setBusy(false);
      return;
    }

    if (!isUserRole(profile.role)) {
      setMessage("Tu cuenta no tiene un rol válido. Contacta al administrador.");
      setBusy(false);
      return;
    }
    const requested = searchParams.get("redirect");
    const destination =
      safeRedirectPath(requested, DASHBOARD_PATHS[profile.role] ?? "/");
    router.replace(destination);
    router.refresh();
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(new FormData(event.currentTarget));
      }}
    >
      <label className="block text-sm font-medium text-slate-700">
        Correo electrónico
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none"
        />
      </label>
      {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
      <div className="flex justify-end">
        <Link href="/recuperar-password" className="text-sm font-medium text-blue-700 hover:text-blue-800">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <button
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState<"client" | "technician">("client");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase no está configurado. Revisa las variables de entorno.");
      setBusy(false);
      return;
    }

    const submittedRole = String(formData.get("role"));
    if (submittedRole !== "client" && submittedRole !== "technician") {
      setMessage("Selecciona un tipo de cuenta válido.");
      setBusy(false);
      return;
    }
    if (formData.get("terms_accepted") !== "on" || formData.get("privacy_acknowledged") !== "on") {
      setMessage("Debes aceptar los términos de tu tipo de cuenta y confirmar que leíste el aviso de privacidad.");
      setBusy(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=%2Fauth%2Ffinish`,
        data: {
          role: submittedRole,
          first_name: String(formData.get("first_name") ?? "").trim(),
          last_name: String(formData.get("last_name") ?? "").trim(),
          terms_accepted: true,
          privacy_acknowledged: true,
          terms_version: TERMS_VERSION,
          privacy_version: PRIVACY_VERSION,
        },
      },
    });

    if (error) {
      setMessage(getAuthError(error, "No se pudo crear la cuenta."));
      setBusy(false);
      return;
    }

    if (!data.session) {
      setMessage("Cuenta creada. Revisa tu correo y confirma la dirección para continuar.");
      setBusy(false);
      return;
    }
    if (!data.user) {
      setMessage("La cuenta se creó, pero Supabase no devolvió un usuario válido.");
      setBusy(false);
      return;
    }

    if (submittedRole === "technician") {
      const displayName = [
        String(formData.get("first_name") ?? "").trim(),
        String(formData.get("last_name") ?? "").trim(),
      ].filter(Boolean).join(" ");
      const slug = `${displayName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tecnico"}-${data.user.id.slice(0, 8)}`;
      const { error: technicianProfileError } = await supabase
        .from("technician_profiles")
        .insert({ user_id: data.user.id, slug });
      if (technicianProfileError) {
        setMessage(`La cuenta se creó, pero no pudimos iniciar tu perfil técnico: ${technicianProfileError.message}`);
        setBusy(false);
        return;
      }
    }

    router.replace(DASHBOARD_PATHS[submittedRole]);
    router.refresh();
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(new FormData(event.currentTarget));
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Nombre
          <input name="first_name" autoComplete="given-name" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Apellido
          <input name="last_name" autoComplete="family-name" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Tipo de cuenta
        <select
          name="role"
          required
          value={role}
          onChange={(event) => {
            const selectedRole = event.currentTarget.value;
            if (selectedRole === "client" || selectedRole === "technician") {
              if (selectedRole !== role) setTermsAccepted(false);
              setRole(selectedRole);
            }
          }}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
        >
          <option value="client">Cliente</option>
          <option value="technician">Técnico</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Correo electrónico
        <input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Contraseña
        <input name="password" type="password" autoComplete="new-password" minLength={8} required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
        <span className="mt-1 block text-xs text-slate-500">Mínimo 8 caracteres.</span>
      </label>
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <label className="flex items-start gap-3">
          <input
            name="terms_accepted"
            type="checkbox"
            required
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.currentTarget.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
          />
          <span>
            Acepto los{" "}
            <Link
              href={`/terminos?tipo=${role}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-700 underline"
            >
              términos y condiciones para {role === "client" ? "clientes" : "técnicos"}
            </Link>
            .
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input
            name="privacy_acknowledged"
            type="checkbox"
            required
            checked={privacyAcknowledged}
            onChange={(event) => setPrivacyAcknowledged(event.currentTarget.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
          />
          <span>
            Confirmo que leí el{" "}
            <Link href="/privacidad" target="_blank" rel="noreferrer" className="font-semibold text-blue-700 underline">
              aviso de privacidad
            </Link>
            .
          </span>
        </label>
      </div>
      {message && <p role="status" className="text-sm text-blue-800">{message}</p>}
      <button
        disabled={busy}
        className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}

export function RecoveryForm({ isRecovery }: { isRecovery: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase no está configurado. Revisa las variables de entorno.");
      setBusy(false);
      return;
    }

    if (isRecovery) {
      const password = String(formData.get("password") ?? "");
      const confirmation = String(formData.get("password_confirmation") ?? "");
      if (password.length < 8 || password !== confirmation) {
        setMessage("Las contraseñas deben coincidir y tener al menos 8 caracteres.");
        setBusy(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
        setBusy(false);
        return;
      }
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setMessage(`La contraseña cambió, pero no se pudo cerrar la sesión: ${signOutError.message}`);
        setBusy(false);
        return;
      }
      router.replace("/login?password_updated=1");
      return;
    }

    const email = String(formData.get("email") ?? "").trim();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=%2Frecuperar-password%3Ftype%3Drecovery`,
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Si el correo está registrado, recibirás un enlace para restablecer la contraseña.");
    }
    setBusy(false);
  }

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(new FormData(event.currentTarget));
      }}
    >
      {isRecovery ? (
        <>
          <label className="block text-sm font-medium text-slate-700">
            Nueva contraseña
            <input name="password" type="password" minLength={8} autoComplete="new-password" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Confirmar contraseña
            <input name="password_confirmation" type="password" minLength={8} autoComplete="new-password" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
          </label>
        </>
      ) : (
        <label className="block text-sm font-medium text-slate-700">
          Correo electrónico
          <input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
        </label>
      )}
      {message && <p role="status" className="text-sm text-blue-800">{message}</p>}
      <button disabled={busy} className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {busy ? "Procesando..." : isRecovery ? "Guardar contraseña" : "Enviar enlace"}
      </button>
    </form>
  );
}
