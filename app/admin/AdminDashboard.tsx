"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminPost, AdminUser, AdminComment } from "@/lib/admin";
import {
  updatePostAction,
  togglePostPublishedAction,
  deletePostAction,
  deleteCommentAction,
  updateUserRoleAction,
} from "./actions";
import CreatePostForm from "./CreatePostForm";

type Tab = "articles" | "commentaires" | "utilisateurs";

interface AdminDashboardProps {
  initialPosts: AdminPost[];
  initialUsers: AdminUser[];
  initialComments: AdminComment[];
  currentUserId: string;
}

export default function AdminDashboard({
  initialPosts,
  initialUsers,
  initialComments,
  currentUserId,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>("articles");

  const publishedCount = initialPosts.filter((post) => post.published).length;
  const totalLikes = initialPosts.reduce((sum, post) => sum + post.likesCount, 0);
  const totalShares = initialPosts.reduce((sum, post) => sum + post.sharesCount, 0);

  return (
    <div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Articles publiés" value={publishedCount} />
        <StatCard label="Brouillons" value={initialPosts.length - publishedCount} />
        <StatCard label="Likes" value={totalLikes} />
        <StatCard label="Partages" value={totalShares} />
      </div>

      <div className="mt-10 flex gap-2 border-b border-rd-line">
        <TabButton active={tab === "articles"} onClick={() => setTab("articles")}>
          Articles ({initialPosts.length})
        </TabButton>
        <TabButton active={tab === "commentaires"} onClick={() => setTab("commentaires")}>
          Commentaires ({initialComments.length})
        </TabButton>
        <TabButton active={tab === "utilisateurs"} onClick={() => setTab("utilisateurs")}>
          Utilisateurs ({initialUsers.length})
        </TabButton>
      </div>

      <div className="mt-6">
        {tab === "articles" ? <PostsPanel posts={initialPosts} /> : null}
        {tab === "commentaires" ? <CommentsPanel comments={initialComments} /> : null}
        {tab === "utilisateurs" ? (
          <UsersPanel users={initialUsers} currentUserId={currentUserId} />
        ) : null}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-rd-line bg-rd-deep p-4">
      <div className="text-sm text-white/60">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-semibold transition-colors ${
        active ? "border-b-2 border-rd-red text-white" : "text-white/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function PostsPanel({ posts }: { posts: AdminPost[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleTogglePublished = (postId: string, published: boolean) => {
    setError("");
    startTransition(async () => {
      try {
        await togglePostPublishedAction(postId, published);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour.");
      }
    });
  };

  const handleDelete = (postId: string) => {
    if (!window.confirm("Supprimer définitivement cet article ?")) return;
    setError("");
    startTransition(async () => {
      try {
        await deletePostAction(postId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la suppression.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <CreatePostForm />

      {error ? (
        <p className="rounded-xl border border-rd-red/40 bg-rd-red/10 px-4 py-3 text-sm text-rd-redlight">
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="py-6 text-sm text-white/40 italic">Aucun article pour le moment.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="rounded-xl border border-rd-line bg-rd-deep p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                        post.published
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {post.published ? "Publié" : "Brouillon"}
                    </span>
                    <span className="text-xs text-white/40">
                      {new Date(post.createdAt).toLocaleDateString("fr-FR")} · {post.authorName}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold text-white">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/60">
                    {post.likesCount} likes · {post.commentsCount} commentaires · {post.sharesCount} partages
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setEditingId(editingId === post.id ? null : post.id)}
                    className="rounded-lg border border-rd-line px-3 py-1.5 text-xs font-semibold text-white/80 hover:border-white/40"
                  >
                    {editingId === post.id ? "Fermer" : "Modifier"}
                  </button>
                  <button
                    onClick={() => handleTogglePublished(post.id, !post.published)}
                    disabled={isPending}
                    className="rounded-lg border border-rd-line px-3 py-1.5 text-xs font-semibold text-white/80 hover:border-white/40 disabled:opacity-50"
                  >
                    {post.published ? "Dépublier" : "Publier"}
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={isPending}
                    className="rounded-lg border border-rd-red/40 px-3 py-1.5 text-xs font-semibold text-rd-redlight hover:bg-rd-red/10 disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {editingId === post.id ? (
                <EditPostForm
                  post={post}
                  onDone={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                />
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EditPostForm({ post, onDone }: { post: AdminPost; onDone: () => void }) {
  const [status, setStatus] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Enregistrement…");

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("postId", post.id);
      await updatePostAction(formData);
      onDone();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-3 border-t border-white/5 pt-5">
      <label className="block text-sm text-white/80">
        <span className="mb-1.5 block">Titre</span>
        <input
          name="title"
          type="text"
          defaultValue={post.title}
          className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-2.5 text-white outline-none"
          required
        />
      </label>
      <label className="block text-sm text-white/80">
        <span className="mb-1.5 block">Extrait</span>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={post.excerpt}
          className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-2.5 text-white outline-none"
          required
        />
      </label>
      <label className="block text-sm text-white/80">
        <span className="mb-1.5 block">Contenu</span>
        <textarea
          name="content"
          rows={6}
          defaultValue={post.content}
          className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-2.5 text-white outline-none"
          required
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-white/80">
        <input name="published" type="checkbox" defaultChecked={post.published} className="h-4 w-4" />
        <span>Publié</span>
      </label>
      <button type="submit" className="rounded-xl bg-rd-red px-4 py-2.5 text-sm font-semibold text-white">
        Enregistrer les modifications
      </button>
      {status ? <p className="text-sm text-white/60">{status}</p> : null}
    </form>
  );
}

function CommentsPanel({ comments }: { comments: AdminComment[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleDelete = (commentId: string) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    setError("");
    startTransition(async () => {
      try {
        await deleteCommentAction(commentId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la suppression.");
      }
    });
  };

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-xl border border-rd-red/40 bg-rd-red/10 px-4 py-3 text-sm text-rd-redlight">
          {error}
        </p>
      ) : null}

      {comments.length === 0 ? (
        <p className="py-6 text-sm text-white/40 italic">Aucun commentaire pour le moment.</p>
      ) : (
        comments.map((comment) => (
          <div
            key={comment.id}
            className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-rd-line bg-rd-deep p-4"
          >
            <div>
              <p className="text-xs text-white/40">
                {comment.authorName} · sur « {comment.postTitle} » ·{" "}
                {new Date(comment.createdAt).toLocaleDateString("fr-FR")}
              </p>
              <p className="mt-1.5 text-sm text-white/80">{comment.content}</p>
            </div>
            <button
              onClick={() => handleDelete(comment.id)}
              disabled={isPending}
              className="shrink-0 rounded-lg border border-rd-red/40 px-3 py-1.5 text-xs font-semibold text-rd-redlight hover:bg-rd-red/10 disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function UsersPanel({ users, currentUserId }: { users: AdminUser[]; currentUserId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleRoleToggle = (userId: string, currentRole: string) => {
    const nextRole = currentRole === "ADMIN" ? "VISITOR" : "ADMIN";
    setError("");
    startTransition(async () => {
      try {
        await updateUserRoleAction(userId, nextRole);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour du rôle.");
      }
    });
  };

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-xl border border-rd-red/40 bg-rd-red/10 px-4 py-3 text-sm text-rd-redlight">
          {error}
        </p>
      ) : null}

      {users.map((user) => (
        <div
          key={user.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rd-line bg-rd-deep p-4"
        >
          <div>
            <p className="text-sm font-semibold text-white">
              {user.name}
              {user.id === currentUserId ? (
                <span className="ml-2 text-xs font-normal text-white/40">(vous)</span>
              ) : null}
            </p>
            <p className="text-xs text-white/40">
              {user.email} · inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                user.role === "ADMIN" ? "bg-rd-red/20 text-rd-redlight" : "bg-white/10 text-white/50"
              }`}
            >
              {user.role}
            </span>
            <button
              onClick={() => handleRoleToggle(user.id, user.role)}
              disabled={isPending || user.id === currentUserId}
              className="rounded-lg border border-rd-line px-3 py-1.5 text-xs font-semibold text-white/80 hover:border-white/40 disabled:opacity-40"
            >
              {user.role === "ADMIN" ? "Retirer admin" : "Passer admin"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}