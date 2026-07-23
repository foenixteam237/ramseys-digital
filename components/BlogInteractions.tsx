"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toggleLikeAction, addCommentAction } from "@/app/blog/blog-actions";

interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

interface BlogInteractionsProps {
  postId: string;
  initialLikes: Like[];
  initialComments: Comment[];
  currentUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

export default function BlogInteractions({
  postId,
  initialLikes,
  initialComments,
  currentUser,
}: BlogInteractionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state for interactive elements
  const [likes, setLikes] = useState<Like[]>(initialLikes);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentContent, setCommentContent] = useState("");
  const [commentError, setCommentError] = useState("");

  const hasLiked = currentUser
    ? likes.some((like) => like.user_id === currentUser.id || (like as any).userId === currentUser.id)
    : false;

  const handleLike = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    // Optimistic UI Update
    const originalLikes = [...likes];
    if (hasLiked) {
      setLikes((prev) =>
        prev.filter(
          (l) => l.user_id !== currentUser.id && (l as any).userId !== currentUser.id
        )
      );
    } else {
      const tempLike: Like = {
        id: Math.random().toString(),
        user_id: currentUser.id,
        post_id: postId,
        created_at: new Date().toISOString(),
      };
      setLikes((prev) => [...prev, tempLike]);
    }

    startTransition(async () => {
      try {
        await toggleLikeAction(postId);
      } catch (err) {
        console.error("Like error:", err);
        // Rollback state on error
        setLikes(originalLikes);
      }
    });
  };

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (!commentContent.trim() || commentContent.trim().length < 2) {
      setCommentError("Le commentaire doit faire au moins 2 caractères.");
      return;
    }

    setCommentError("");

    // Optimistic Comment addition (simplified)
    const tempComment: Comment = {
      id: Math.random().toString(),
      content: commentContent.trim(),
      user_id: currentUser.id,
      post_id: postId,
      created_at: new Date().toISOString(),
      user: {
        id: currentUser.id,
        name: currentUser.name || "Moi",
        avatar_url: null,
      },
    };

    setComments((prev) => [...prev, tempComment]);
    const originalComments = [...comments];
    const textToSubmit = commentContent;
    setCommentContent("");

    try {
      await addCommentAction(postId, textToSubmit);
      // Let next-auth/next router update server component data
      router.refresh();
    } catch (err) {
      setComments(originalComments);
      setCommentContent(textToSubmit);
      setCommentError(
        err instanceof Error ? err.message : "Erreur de publication."
      );
    }
  };

  return (
    <div className="mt-12 border-t border-white/5 pt-8">
      {/* Interaction Summary Row */}
      <div className="flex items-center gap-6 border-b border-white/5 pb-6">
        <button
          onClick={handleLike}
          disabled={isPending}
          className={`group flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
            hasLiked
              ? "border-rd-red bg-rd-red/10 text-rd-redlight"
              : "border-rd-line bg-rd-graphite text-white/70 hover:border-white/20 hover:text-white"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={hasLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            className="transition-transform group-hover:scale-110"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <span>
            {likes.length} {likes.length > 1 ? "Likes" : "Like"}
          </span>
        </button>

        <div className="flex items-center gap-2 text-sm text-white/60">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>
            {comments.length} {comments.length > 1 ? "Commentaires" : "Commentaire"}
          </span>
        </div>
      </div>

      {/* Comments List */}
      <div className="mt-8 space-y-6">
        <h3 className="font-display text-lg font-semibold text-white">Commentaires</h3>

        {comments.length === 0 ? (
          <p className="py-6 text-sm text-white/40 italic">
            Soyez le premier à commenter cet article !
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const authorName = comment.user?.name || "Utilisateur anonyme";
              const initials = authorName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={comment.id}
                  className="rounded-xl border border-rd-line bg-rd-graphite/40 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rd-red/25 text-xs font-bold text-rd-redlight">
                        {initials}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white">
                          {authorName}
                        </span>
                        <span className="ml-3 text-[11px] text-white/40">
                          {new Date(comment.created_at).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-white/80 leading-relaxed pl-1">
                    {comment.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Comment Input */}
      <div className="mt-8 border-t border-white/5 pt-8">
        {currentUser ? (
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <label className="block text-sm text-white/80">
              <span className="mb-2 block font-medium">Ajouter un commentaire</span>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-rd-line bg-rd-deep px-4 py-3 text-sm text-white outline-none focus:border-rd-red/60 transition-colors"
                placeholder="Votre commentaire..."
                required
              />
            </label>

            {commentError ? (
              <p className="text-xs text-rd-redlight">{commentError}</p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex rounded-xl bg-rd-red px-5 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              Publier le commentaire
            </button>
          </form>
        ) : (
          <div className="rounded-xl border border-rd-line bg-rd-graphite/30 p-5 text-center text-sm text-white/60">
            Vous devez être connecté pour participer.{" "}
            <Link href="/login" className="text-rd-redlight font-semibold hover:underline">
              Se connecter
            </Link>{" "}
            ou{" "}
            <Link href="/login" className="text-rd-redlight font-semibold hover:underline">
              Créer un compte
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}
