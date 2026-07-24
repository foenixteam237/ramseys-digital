"use client";

import { useRef, useState } from "react";
import { uploadImageAction } from "./actions";

interface ImageUploaderProps {
  label: string;
  onUploaded: (url: string) => void;
}

export default function ImageUploader({ label, onUploaded }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const { url } = await uploadImageAction(formData);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l’envoi.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-rd-line bg-rd-graphite px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-rd-red/50 disabled:opacity-60"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 16V4M7 9l5-5 5 5" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        {uploading ? "Envoi…" : label}
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleChange} />
      {error ? <span className="text-[11px] text-rd-redlight">{error}</span> : null}
    </span>
  );
}
