"use client";

import { useState } from "react";
import { saveTechnicianAvatarAction } from "@/app/actions/technician-profile";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function TechnicianAvatarUploader({
  userId,
  avatarUrl,
  displayName,
}: {
  userId: string;
  avatarUrl: string | null;
  displayName: string | null;
}) {
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function uploadAvatar() {
    if (!file) {
      setError("Selecciona una imagen antes de actualizar tu foto.");
      setSuccess("");
      return;
    }
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError("La foto debe estar en formato JPG, PNG o WebP.");
      setSuccess("");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setError("La foto no puede superar los 2 MB.");
      setSuccess("");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase no está configurado.");
      setSuccess("");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");
    const storagePath = `${userId}/avatar`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(storagePath, file, { upsert: true, contentType: file.type });
      if (uploadError) throw new Error(`No se pudo subir la foto: ${uploadError.message}`);

      const updatedAvatarUrl = await saveTechnicianAvatarAction(storagePath);
      setCurrentAvatarUrl(updatedAvatarUrl);
      setFile(null);
      setSuccess("Foto de perfil actualizada.");
    } catch (uploadOrSaveError) {
      setError(
        uploadOrSaveError instanceof Error
          ? uploadOrSaveError.message
          : "No se pudo actualizar la foto.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-900">Foto de perfil</h3>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div
          role="img"
          aria-label={displayName ? `Foto de ${displayName}` : "Foto de perfil"}
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-100 bg-cover bg-center text-2xl font-bold text-blue-700"
          style={currentAvatarUrl ? { backgroundImage: `url("${currentAvatarUrl}")` } : undefined}
        >
          {!currentAvatarUrl && (displayName ?? "T").slice(0, 1).toLocaleUpperCase("es-PE")}
        </div>
        <div className="min-w-0 flex-1">
          <label className="block text-sm font-medium text-slate-700">
            Elige una foto (JPG, PNG o WebP; máximo 2 MB)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                setFile(event.currentTarget.files?.[0] ?? null);
                setError("");
                setSuccess("");
              }}
              className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold file:text-blue-700"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={uploadAvatar}
          disabled={isUploading || !file}
          className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? "Actualizando..." : "Actualizar foto"}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="mt-3 text-sm text-emerald-700">{success}</p>}
    </section>
  );
}
