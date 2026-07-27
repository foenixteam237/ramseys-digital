"use client";

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { updateProfileAction, uploadAvatarAction } from './actions';

interface ProfileFormProps {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  initialAvatarUrl: string;
}

export default function ProfileForm({
  initialName,
  initialEmail,
  initialPhone,
  initialAvatarUrl,
}: ProfileFormProps) {
  const router = useRouter();
  const { data: session, update } = useSession();

  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initial = (name || 'U').trim()[0]?.toUpperCase() ?? 'U';

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { url } = await uploadAvatarAction(formData);
      setAvatarUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du téléversement.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus('');
    setError('');

    const form = event.currentTarget;

    try {
      const formData = new FormData(form);
      formData.set('avatarUrl', avatarUrl);
      await updateProfileAction(formData);

      // Rafraichit la session (nom / photo affiches dans le header).
      await update({
        name: formData.get('name'),
        email: formData.get('email'),
        image: avatarUrl || null,
      });

      setStatus('Profil mis à jour avec succès.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-rd-line bg-rd-graphite p-6"
    >
      {/* Photo de profil */}
      <div className="flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-rd-line bg-rd-deep">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Photo de profil" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-rd-redlight">
              {initial}
            </span>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            id="avatar-input"
          />
          <label
            htmlFor="avatar-input"
            className="inline-flex cursor-pointer rounded-lg border border-rd-line px-4 py-2 text-xs font-semibold text-white/80 hover:border-rd-red/50"
          >
            {uploading ? 'Téléversement…' : 'Changer la photo'}
          </label>
          {avatarUrl ? (
            <button
              type="button"
              onClick={() => setAvatarUrl('')}
              className="ml-2 text-xs font-semibold text-rd-redlight hover:underline"
            >
              Retirer
            </button>
          ) : null}
          <p className="mt-1.5 text-[11px] text-white/40">JPG ou PNG, 5 Mo maximum.</p>
        </div>
      </div>

      <label className="block text-sm text-white/80">
        <span className="mb-2 block font-medium">Nom</span>
        <input
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="w-full rounded-xl border border-rd-line bg-rd-deep px-4 py-3 text-white outline-none focus:border-rd-red/60"
        />
      </label>

      <label className="block text-sm text-white/80">
        <span className="mb-2 block font-medium">Adresse email</span>
        <input
          name="email"
          type="email"
          defaultValue={initialEmail}
          required
          className="w-full rounded-xl border border-rd-line bg-rd-deep px-4 py-3 text-white outline-none focus:border-rd-red/60"
        />
      </label>

      <label className="block text-sm text-white/80">
        <span className="mb-2 block font-medium">Téléphone</span>
        <input
          name="phone"
          type="tel"
          defaultValue={initialPhone}
          placeholder="+237 6XX XX XX XX"
          className="w-full rounded-xl border border-rd-line bg-rd-deep px-4 py-3 text-white outline-none focus:border-rd-red/60"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex rounded-xl bg-rd-red px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </button>
        {session?.user?.role === 'ADMIN' || session?.user?.role === 'EDITOR' ? (
          <a
            href="/admin"
            className="rounded-xl border border-rd-line px-5 py-3 text-sm font-semibold text-white/70 hover:border-white/40"
          >
            Retour au dashboard
          </a>
        ) : (
          <a
            href="/blog"
            className="rounded-xl border border-rd-line px-5 py-3 text-sm font-semibold text-white/70 hover:border-white/40"
          >
            Retour au blog
          </a>
        )}
      </div>

      {status ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {status}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-rd-red/40 bg-rd-red/10 px-4 py-3 text-sm text-rd-redlight">
          {error}
        </p>
      ) : null}
    </form>
  );
}