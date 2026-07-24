"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toggleLikeAction, addCommentAction, recordShareAction } from "@/app/blog/blog-actions";

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
  author_name?: string | null;
  user?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

interface Share {
  id: string;
  post_id: string;
  platform: string;
  created_at: string;
}

type SharePlatform = "WHATSAPP" | "FACEBOOK" | "LINKEDIN" | "COPY_LINK";

interface BlogInteractionsProps {
  postId: string;
  postSlug: string;
  postTitle: string;
  initialLikes: Like[];
  initialComments: Comment[];
  initialShares: Share[];
  currentUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

export default function BlogInteractions({
  postId,
  postSlug,
  postTitle,
  initialLikes,
  initialComments,
  initialShares,
  currentUser,
}: BlogInteractionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state for interactive elements
  const [likes, setLikes] = useState<Like[]>(initialLikes);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [shares, setShares] = useState<Share[]>(initialShares);
  const [commentContent, setCommentContent] = useState("");
  const [commentError, setCommentError] = useState("");
  const [copied, setCopied] = useState(false);

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

  const handleShare = async (platform: SharePlatform) => {
    const postUrl = `${window.location.origin}/blog/${postSlug}`;

    if (platform === "COPY_LINK") {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      const shareTargets: Record<Exclude<SharePlatform, "COPY_LINK">, string> = {
        WHATSAPP: `https://wa.me/?text=${encodeURIComponent(`${postTitle} — ${postUrl}`)}`,
        FACEBOOK: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
        LINKEDIN: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      };
      window.open(shareTargets[platform], "_blank", "noopener,noreferrer");
    }

    const originalShares = [...shares];
    const tempShare: Share = {
      id: Math.random().toString(),
      post_id: postId,
      platform,
      created_at: new Date().toISOString(),
    };
    setShares((prev) => [...prev, tempShare]);

    startTransition(async () => {
      try {
        await recordShareAction(postId, platform);
      } catch (err) {
        console.error("Share error:", err);
        setShares(originalShares);
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
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="flex items-center gap-6">
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

        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-mono uppercase tracking-wider text-white/30 sm:inline">
            Partager{shares.length > 0 ? ` (${shares.length})` : ""}
          </span>
          <button
            onClick={() => handleShare("WHATSAPP")}
            aria-label="Partager sur WhatsApp"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite text-white/70 transition hover:border-rd-red/60 hover:text-rd-red"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.6 14.3c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.3-.1.6.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1l1.7.8c.2.1.4.2.4.3.1.2.1.8-.1 1.3Z" />
            </svg>
          </button>
          <button
            onClick={() => handleShare("FACEBOOK")}
            aria-label="Partager sur Facebook"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite text-white/70 transition hover:border-rd-red/60 hover:text-rd-red"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 9h3V5.5h-3C11.8 5.5 10 7.3 10 9.5V12H8v3.5h2V21h3.5v-5.5H16l.5-3.5h-3V9.7c0-.5.3-.7.5-.7Z" />
            </svg>
          </button>
          <button
            onClick={() => handleShare("LINKEDIN")}
            aria-label="Partager sur LinkedIn"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-rd-line bg-rd-graphite text-white/70 transition hover:border-rd-red/60 hover:text-rd-red"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6v6.3h-4v-5.6c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-4V9Z" />
            </svg>
          </button>
          <button
            onClick={() => handleShare("COPY_LINK")}
            aria-label="Copier le lien"
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rd-line bg-rd-graphite px-3 text-xs font-semibold text-white/70 transition hover:border-rd-red/60 hover:text-rd-red"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" />
              <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" />
            </svg>
            {copied ? "Copié !" : "Copier"}
          </button>
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
              const authorName = comment.user?.name || comment.author_name || "Utilisateur anonyme";
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