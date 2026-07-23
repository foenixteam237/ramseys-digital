"use client";

import { useState } from 'react';
import { createPostAction } from './actions';

export default function CreatePostForm() {
  const [status, setStatus] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Publication en cours…');

    try {
      const formData = new FormData(event.currentTarget);
      await createPostAction(formData);
      setStatus('Article publié avec succès.');
      event.currentTarget.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Une erreur est survenue.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-rd-line bg-rd-deep p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-rd-red">Ajouter un article</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Publier un nouveau contenu</h2>
        </div>
      </div>

      <label className="block text-sm text-white/80">
        <span className="mb-2 block">Titre</span>
        <input
          name="title"
          type="text"
          className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-3 text-white outline-none"
          required
        />
      </label>

      <label className="block text-sm text-white/80">
        <span className="mb-2 block">Extrait</span>
        <textarea
          name="excerpt"
          rows={3}
          className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-3 text-white outline-none"
          required
        />
      </label>

      <label className="block text-sm text-white/80">
        <span className="mb-2 block">Contenu</span>
        <textarea
          name="content"
          rows={8}
          className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-3 text-white outline-none"
          required
        />
      </label>

      <label className="flex items-center gap-3 text-sm text-white/80">
        <input name="published" type="checkbox" className="h-4 w-4" defaultChecked />
        <span>Publier immédiatement</span>
      </label>

      <button
        type="submit"
        className="inline-flex rounded-xl bg-rd-red px-4 py-3 text-sm font-semibold text-white"
      >
        Enregistrer l’article
      </button>

      {status ? (
        <div className="rounded-xl border border-rd-line bg-rd-graphite px-4 py-3 text-sm text-white/70">
          {status}
        </div>
      ) : null}
    </form>
  );
}
