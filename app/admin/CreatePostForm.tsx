"use client";

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPostAction } from './actions';
import ImageUploader from './ImageUploader';
import type { AdminCategory } from '@/lib/admin';

interface CreatePostFormProps {
  categories: AdminCategory[];
  isEditor?: boolean;
  onDone?: () => void;
  onCancel?: () => void;
}

export default function CreatePostForm({ categories, isEditor = false, onDone, onCancel }: CreatePostFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  function insertIntoContent(snippet: string) {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const insertText = `\n\n${snippet}\n\n`;
    textarea.value = textarea.value.slice(0, start) + insertText + textarea.value.slice(end);
    textarea.focus();
    const cursor = start + insertText.length;
    textarea.setSelectionRange(cursor, cursor);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(isEditor ? 'Envoi pour validation…' : 'Publication en cours…');
    setSubmitting(true);

    const form = event.currentTarget;

    try {
      const formData = new FormData(form);
      await createPostAction(formData);
      setStatus(isEditor ? 'Article soumis pour validation.' : 'Article publié avec succès.');
      form.reset();
      setCoverUrl('');
      router.refresh();
      onDone?.();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-rd-line bg-rd-deep p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-rd-red">Ajouter un article</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Publier un nouveau contenu</h2>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-rd-line px-3 py-1.5 text-xs font-semibold text-white/70 hover:border-white/40"
          >
            Annuler
          </button>
        ) : null}
      </div>

      <label className="block text-sm text-white/80">
        <span className="mb-2 block font-medium">Titre</span>
        <input
          name="title"
          type="text"
          placeholder="Ex : Différence VLAN vs VXLAN"
          className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-3 text-white outline-none focus:border-rd-red/60 transition-colors"
          required
        />
      </label>

      <label className="block text-sm text-white/80">
        <span className="mb-2 block font-medium">Extrait</span>
        <textarea
          name="excerpt"
          rows={3}
          placeholder="Un court résumé affiché dans la liste des articles et sous le titre."
          className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-3 text-white outline-none focus:border-rd-red/60 transition-colors"
          required
        />
      </label>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-white/80">Contenu</span>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] text-white/40 sm:inline">
              Markdown : # Titre · **gras** · | tableaux |
            </span>
            <ImageUploader
              label="Insérer une image"
              onUploaded={(url) => insertIntoContent(`![Illustration](${url})`)}
            />
          </div>
        </div>
        <textarea
          ref={contentRef}
          name="content"
          rows={18}
          placeholder={"# Introduction\n\nÉcrivez votre article en Markdown…\n\n## Sous-titre\n\n- Point clé\n- Autre point"}
          className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-3 font-mono text-sm leading-relaxed text-white outline-none focus:border-rd-red/60 transition-colors"
          required
        />
        <p className="mt-1.5 text-[11px] text-white/40">
          Astuce : « Insérer une image » téléverse le fichier et ajoute le Markdown à l&apos;endroit du curseur.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-white/80">
          <span className="mb-2 block font-medium">Catégorie</span>
          <select
            name="categoryId"
            className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-3 text-white outline-none focus:border-rd-red/60 transition-colors"
          >
            <option value="">Aucune</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <div className="block text-sm text-white/80">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-medium">Image de couverture</span>
            <ImageUploader label="Téléverser" onUploaded={(url) => setCoverUrl(url)} />
          </div>
          <input
            name="coverImageUrl"
            type="url"
            value={coverUrl}
            onChange={(event) => setCoverUrl(event.target.value)}
            placeholder="https://… ou téléversez une image"
            className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-3 text-white outline-none focus:border-rd-red/60 transition-colors"
          />
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt="Aperçu de la couverture"
              className="mt-2 h-24 w-full rounded-lg border border-rd-line object-cover"
            />
          ) : null}
        </div>
      </div>

      {isEditor ? (
        <p className="rounded-lg border border-rd-line bg-rd-graphite px-4 py-2.5 text-xs text-white/60">
          Votre article sera envoyé à un administrateur pour validation avant d&apos;être publié.
        </p>
      ) : (
        <label className="flex items-center gap-3 text-sm text-white/80">
          <input name="published" type="checkbox" className="h-4 w-4 accent-rd-red" defaultChecked />
          <span>Publier immédiatement (sinon enregistré en brouillon)</span>
        </label>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex rounded-xl bg-rd-red px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting
            ? isEditor
              ? 'Envoi…'
              : 'Enregistrement…'
            : isEditor
              ? 'Soumettre pour validation'
              : 'Enregistrer l’article'}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-rd-line px-5 py-3 text-sm font-semibold text-white/70 hover:border-white/40"
          >
            Annuler
          </button>
        ) : null}
      </div>

      {status ? (
        <div className="rounded-xl border border-rd-line bg-rd-graphite px-4 py-3 text-sm text-white/70">
          {status}
        </div>
      ) : null}
    </form>
  );
}