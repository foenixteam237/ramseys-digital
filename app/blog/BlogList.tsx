"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { estimateReadingTime } from "@/lib/readingtime";

export interface BlogListPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  createdAt: string;
  coverImageUrl: string | null;
  categoryName: string | null;
  authorName: string;
  likesCount: number;
  commentsCount: number;
}

interface BlogListProps {
  posts: BlogListPost[];
  categories: string[];
}

export default function BlogList({ posts, categories }: BlogListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeCategory) return posts;
    return posts.filter((post) => post.categoryName === activeCategory);
  }, [posts, activeCategory]);

  const [featured, ...rest] = filtered;

  return (
    <div>
      {categories.length > 0 ? (
        <div className="mb-10 flex flex-wrap gap-2">
          <FilterChip active={activeCategory === null} onClick={() => setActiveCategory(null)}>
            Tous
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              key={category}
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </FilterChip>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-rd-line bg-rd-graphite p-12 text-center">
          <p className="text-white/50">
            {activeCategory
              ? `Aucun article dans la catégorie « ${activeCategory} » pour le moment.`
              : 'Aucun article publié pour le moment.'}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {featured ? <FeaturedCard post={featured} /> : null}
          {rest.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function FilterChip({
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
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-rd-red bg-rd-red/15 text-rd-redlight"
          : "border-rd-line text-white/60 hover:border-white/30 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function PostMeta({ post }: { post: BlogListPost }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/40">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rd-red/20 text-[10px] font-bold text-rd-redlight">
        {post.authorName ? post.authorName[0].toUpperCase() : "?"}
      </span>
      <span>{post.authorName}</span>
      <span className="h-1 w-1 rounded-full bg-white/20" />
      <span>
        {new Date(post.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </span>
      <span className="h-1 w-1 rounded-full bg-white/20" />
      <span>{estimateReadingTime(post.content)} min de lecture</span>
    </div>
  );
}

function CoverImage({ post, className }: { post: BlogListPost; className: string }) {
  if (post.coverImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={post.coverImageUrl} alt={post.title} className={`${className} object-cover`} />
    );
  }

    return (
    <div className={`${className} grid-bg red-glow-radial flex items-center justify-center bg-rd-graphite`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Ramseys Digital" className="h-16 w-16 object-contain opacity-60" />
    </div>
  );

}

function FeaturedCard({ post }: { post: BlogListPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card-hover group grid overflow-hidden rounded-2xl border border-rd-line bg-rd-graphite lg:grid-cols-2"
    >
      <CoverImage post={post} className="h-56 w-full lg:h-full" />
      <div className="flex flex-col justify-center p-8">
        {post.categoryName ? (
          <span className="mb-3 inline-flex w-fit rounded-full bg-rd-red/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rd-redlight">
            {post.categoryName}
          </span>
        ) : null}
        <h2 className="font-display text-2xl font-semibold text-white transition-colors group-hover:text-rd-redlight sm:text-3xl">
          {post.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/60">{post.excerpt}</p>
        <div className="mt-6">
          <PostMeta post={post} />
        </div>
        <div className="mt-5 flex items-center gap-4 text-xs text-white/40">
          <span>{post.likesCount} likes</span>
          <span>{post.commentsCount} commentaires</span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: BlogListPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-rd-line bg-rd-graphite"
    >
      <CoverImage post={post} className="h-44 w-full" />
      <div className="flex flex-1 flex-col p-5">
        {post.categoryName ? (
          <span className="mb-2 inline-flex w-fit rounded-full bg-rd-red/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-rd-redlight">
            {post.categoryName}
          </span>
        ) : null}
        <h3 className="font-display text-lg font-semibold text-white transition-colors group-hover:text-rd-redlight">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/60">{post.excerpt}</p>
        <div className="mt-4 flex-1" />
        <div className="mt-4 border-t border-white/5 pt-4">
          <PostMeta post={post} />
        </div>
      </div>
    </Link>
  );
}
