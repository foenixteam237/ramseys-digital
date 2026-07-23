"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type {
  AdminPost,
  AdminUser,
  AdminComment,
  AdminCategory,
  AdminMediaItem,
  AdminPageItem,
} from "@/lib/admin";
import {
  updatePostAction,
  togglePostPublishedAction,
  deletePostAction,
  deleteCommentAction,
  updateUserRoleAction,
  createCategoryAction,
  deleteCategoryAction,
  uploadMediaAction,
  deleteMediaAction,
  createPageAction,
  updatePageAction,
  togglePagePublishedAction,
  deletePageAction,
} from "./actions";
import CreatePostForm from "./CreatePostForm";

type Tab =
  | "dashboard"
  | "articles"
  | "categories"
  | "media"
  | "pages"
  | "commentaires"
  | "utilisateurs"
  | "apparence"
  | "parametres";

interface AdminDashboardProps {
  initialPosts: AdminPost[];
  initialUsers: AdminUser[];
  initialComments: AdminComment[];
  initialCategories: AdminCategory[];
  initialMedia: AdminMediaItem[];
  initialPages: AdminPageItem[];
  currentUserId: string;
  currentUserName: string;
}

// ---------- Icons ----------

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 11 12 4l8 7" />
      <path d="M6 9.5V20h12V9.5" />
    </svg>
  );
}

function IconPosts() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h4l2 2h7A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5Z" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 17 5-5 4 4 3-3 4 4" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3h7l4 4v14H7Z" />
      <path d="M14 3v4h4" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 6.5 8 6 8-6" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9" r="2.3" />
      <path d="M15.5 14.2c2.6.4 4.5 2.7 4.5 5.3" />
    </svg>
  );
}

function IconPaint() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 1.4-3.4 2 2 0 0 1 1.4-3.4H18a3 3 0 0 0 3-3 8 8 0 0 0-9-8.2Z" />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconGear() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ---------- Data helpers ----------

function computeGrowth(dates: string[]) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const last30 = dates.filter((d) => now - new Date(d).getTime() <= 30 * day).length;
  const prev30 = dates.filter((d) => {
    const diff = now - new Date(d).getTime();
    return diff > 30 * day && diff <= 60 * day;
  }).length;

  if (prev30 === 0) {
    return { last30, deltaPercent: last30 > 0 ? 100 : 0 };
  }

  return { last30, deltaPercent: Math.round(((last30 - prev30) / prev30) * 100) };
}

function getMonthlyPostCounts(posts: AdminPost[], months = 6) {
  const now = new Date();
  const buckets: { label: string; count: number }[] = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const bucketDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = posts.filter((post) => {
      const created = new Date(post.createdAt);
      return created.getFullYear() === bucketDate.getFullYear() && created.getMonth() === bucketDate.getMonth();
    }).length;

    buckets.push({ label: bucketDate.toLocaleDateString("fr-FR", { month: "short" }), count });
  }

  return buckets;
}

function getDailyActivity(posts: AdminPost[], days = 14) {
  const allLikes = posts.flatMap((post) => post.likeDates);
  const allComments = posts.flatMap((post) => post.commentDates);
  const allShares = posts.flatMap((post) => post.shareDates);
  const now = new Date();

  const isSameDay = (iso: string, reference: Date) => {
    const parsed = new Date(iso);
    return (
      parsed.getFullYear() === reference.getFullYear() &&
      parsed.getMonth() === reference.getMonth() &&
      parsed.getDate() === reference.getDate()
    );
  };

  const buckets = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    buckets.push({
      label: String(day.getDate()),
      likes: allLikes.filter((d) => isSameDay(d, day)).length,
      comments: allComments.filter((d) => isSameDay(d, day)).length,
      shares: allShares.filter((d) => isSameDay(d, day)).length,
    });
  }

  return buckets;
}

const matches = (haystack: string, needle: string) => haystack.toLowerCase().includes(needle.toLowerCase());

// ---------- Charts ----------

function BarChart({ data }: { data: { label: string; count: number }[] }) {
  const width = 560;
  const height = 200;
  const max = Math.max(1, ...data.map((d) => d.count));
  const gap = 18;
  const barWidth = (width - gap * (data.length - 1)) / data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height + 24}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
        <line
          key={fraction}
          x1={0}
          x2={width}
          y1={height - height * fraction}
          y2={height - height * fraction}
          stroke="rgba(255,255,255,0.06)"
        />
      ))}
      {data.map((entry, index) => {
        const barHeight = (entry.count / max) * (height - 10);
        const x = index * (barWidth + gap);
        const y = height - barHeight;
        const isMax = entry.count === max && max > 0;

        return (
          <g key={`${entry.label}-${index}`}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 2)}
              rx={6}
              fill={isMax ? "#D61F26" : "rgba(214,31,38,0.3)"}
            />
            <text x={x + barWidth / 2} y={height + 18} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={11}>
              {entry.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface LineSeries {
  key: "likes" | "comments" | "shares";
  color: string;
  label: string;
}

function LineChart({ data, series }: { data: ReturnType<typeof getDailyActivity>; series: LineSeries[] }) {
  const width = 560;
  const height = 200;
  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => d[s.key])));
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const buildPoints = (key: LineSeries["key"]) =>
    data
      .map((entry, index) => {
        const x = index * stepX;
        const y = height - (entry[key] / max) * (height - 10);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height + 6}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
          <line
            key={fraction}
            x1={0}
            x2={width}
            y1={height - height * fraction}
            y2={height - height * fraction}
            stroke="rgba(255,255,255,0.06)"
          />
        ))}
        {series.map((s) => (
          <polyline key={s.key} points={buildPoints(s.key)} fill="none" stroke={s.color} strokeWidth={2} />
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/60">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------- Layout ----------

const NAV_ITEMS: { tab: Tab; label: string; icon: ReactNode }[] = [
  { tab: "dashboard", label: "Dashboard", icon: <IconHome /> },
  { tab: "articles", label: "Articles", icon: <IconPosts /> },
  { tab: "categories", label: "Catégories", icon: <IconFolder /> },
  { tab: "media", label: "Média", icon: <IconImage /> },
  { tab: "pages", label: "Pages", icon: <IconFile /> },
  { tab: "commentaires", label: "Commentaires", icon: <IconMail /> },
  { tab: "utilisateurs", label: "Utilisateurs", icon: <IconUsers /> },
];

const SYSTEM_ITEMS: { tab: Tab; label: string; icon: ReactNode }[] = [
  { tab: "apparence", label: "Apparence", icon: <IconPaint /> },
  { tab: "parametres", label: "Paramètres", icon: <IconGear /> },
];

export default function AdminDashboard({
  initialPosts,
  initialUsers,
  initialComments,
  initialCategories,
  initialMedia,
  initialPages,
  currentUserId,
  currentUserName,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");

  return (
    <div className="flex min-h-screen bg-rd-deep text-white">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-rd-line bg-rd-graphite/60 px-4 py-6 lg:flex">
        <div className="flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rd-red/20 font-display text-sm font-bold text-rd-redlight">
            R
          </span>
          <span className="font-display text-base font-semibold">
            Ramseys <span className="text-rd-red">Admin</span>
          </span>
        </div>

        <nav className="mt-8 flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.tab} active={tab === item.tab} onClick={() => setTab(item.tab)} icon={item.icon}>
              {item.label}
              {item.tab === "commentaires" && initialComments.length > 0 ? (
                <span className="ml-auto rounded-full bg-rd-red/20 px-2 py-0.5 text-[10px] font-bold text-rd-redlight">
                  {initialComments.length}
                </span>
              ) : null}
            </SidebarLink>
          ))}

          <p className="mt-6 px-3 text-[10px] font-mono uppercase tracking-widest text-white/30">Système</p>
          {SYSTEM_ITEMS.map((item) => (
            <SidebarLink key={item.tab} active={tab === item.tab} onClick={() => setTab(item.tab)} icon={item.icon}>
              {item.label}
            </SidebarLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-rd-line px-6 py-5 lg:px-10">
          <div>
            <p className="text-sm text-white/50">Bienvenue 👋</p>
            <p className="font-display text-lg font-semibold text-white">{currentUserName}</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher…"
              className="hidden w-56 rounded-xl border border-rd-line bg-rd-deep px-4 py-2 text-sm text-white outline-none focus:border-rd-red/60 sm:block"
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rd-red/20 font-display text-sm font-bold text-rd-redlight">
              {currentUserName ? currentUserName[0].toUpperCase() : "A"}
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-10">
          {tab === "dashboard" ? (
            <DashboardPanel
              posts={initialPosts}
              comments={initialComments}
              categories={initialCategories}
              media={initialMedia}
              onNavigate={setTab}
            />
          ) : null}
          {tab === "articles" ? <PostsPanel posts={initialPosts} categories={initialCategories} search={search} /> : null}
          {tab === "categories" ? <CategoriesPanel categories={initialCategories} /> : null}
          {tab === "media" ? <MediaPanel media={initialMedia} /> : null}
          {tab === "pages" ? <PagesPanel pages={initialPages} /> : null}
          {tab === "commentaires" ? <CommentsPanel comments={initialComments} search={search} /> : null}
          {tab === "utilisateurs" ? (
            <UsersPanel users={initialUsers} currentUserId={currentUserId} search={search} />
          ) : null}
          {tab === "apparence" ? <ComingSoonPanel title="Apparence" /> : null}
          {tab === "parametres" ? <ComingSoonPanel title="Paramètres" /> : null}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active ? "bg-rd-red text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex flex-1 items-center">{children}</span>
    </button>
  );
}

function StatCard({
  label,
  value,
  growth,
}: {
  label: string;
  value: number;
  growth?: { last30: number; deltaPercent: number };
}) {
  return (
    <div className="rounded-2xl border border-rd-line bg-rd-graphite p-5">
      <div className="text-sm text-white/60">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      {growth ? (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="text-white/40">30 derniers jours</span>
          <span
            className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${
              growth.deltaPercent >= 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-rd-red/15 text-rd-redlight"
            }`}
          >
            {growth.deltaPercent >= 0 ? "↑" : "↓"} {Math.abs(growth.deltaPercent)}%
          </span>
        </div>
      ) : null}
    </div>
  );
}

// ---------- Dashboard tab ----------

function DashboardPanel({
  posts,
  comments,
  categories,
  media,
  onNavigate,
}: {
  posts: AdminPost[];
  comments: AdminComment[];
  categories: AdminCategory[];
  media: AdminMediaItem[];
  onNavigate: (tab: Tab) => void;
}) {
  const postsGrowth = computeGrowth(posts.map((p) => p.createdAt));
  const commentsGrowth = computeGrowth(comments.map((c) => c.createdAt));
  const mediaGrowth = computeGrowth(media.map((m) => m.createdAt));
  const monthly = getMonthlyPostCounts(posts);
  const daily = getDailyActivity(posts);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total articles" value={posts.length} growth={postsGrowth} />
        <StatCard label="Total catégories" value={categories.length} />
        <StatCard label="Fichiers média" value={media.length} growth={mediaGrowth} />
        <StatCard label="Commentaires" value={comments.length} growth={commentsGrowth} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-rd-line bg-rd-graphite p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Croissance des articles</h3>
            <span className="text-xs font-mono text-white/40">6 derniers mois</span>
          </div>
          <div className="mt-6">
            <BarChart data={monthly} />
          </div>
        </div>
        <div className="rounded-2xl border border-rd-line bg-rd-graphite p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Activité</h3>
            <span className="text-xs font-mono text-white/40">14 derniers jours</span>
          </div>
          <div className="mt-6">
            <LineChart
              data={daily}
              series={[
                { key: "likes", color: "#D61F26", label: "Likes" },
                { key: "comments", color: "#3B82F6", label: "Commentaires" },
                { key: "shares", color: "#10B981", label: "Partages" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-rd-line bg-rd-graphite p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Derniers articles</h3>
            <button onClick={() => onNavigate("articles")} className="text-xs font-semibold text-rd-redlight hover:underline">
              Voir tout
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {posts.length === 0 ? (
              <p className="py-4 text-sm text-white/40 italic">Aucun article.</p>
            ) : (
              posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 text-sm">
                  <span className="truncate text-white/80">{post.title}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase ${
                      post.published ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/50"
                    }`}
                  >
                    {post.published ? "Publié" : "Brouillon"}
                  </span>
                  <span className="shrink-0 text-xs text-white/40">
                    {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-rd-line bg-rd-graphite p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Derniers commentaires</h3>
            <button
              onClick={() => onNavigate("commentaires")}
              className="text-xs font-semibold text-rd-redlight hover:underline"
            >
              Voir tout
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {comments.length === 0 ? (
              <p className="py-4 text-sm text-white/40 italic">Aucun commentaire.</p>
            ) : (
              comments.slice(0, 5).map((comment) => (
                <div key={comment.id} className="border-b border-white/5 pb-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-white/80">{comment.authorName}</span>
                    <span className="shrink-0 text-xs text-white/40">
                      {new Date(comment.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-white/60">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Articles ----------

function PostsPanel({
  posts,
  categories,
  search,
}: {
  posts: AdminPost[];
  categories: AdminCategory[];
  search: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = search ? posts.filter((post) => matches(post.title, search)) : posts;

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
      <CreatePostForm categories={categories} />

      {error ? (
        <p className="rounded-xl border border-rd-red/40 bg-rd-red/10 px-4 py-3 text-sm text-rd-redlight">{error}</p>
      ) : null}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="py-6 text-sm text-white/40 italic">Aucun article pour le moment.</p>
        ) : (
          filtered.map((post) => (
            <div key={post.id} className="rounded-xl border border-rd-line bg-rd-deep p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                        post.published
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {post.published ? "Publié" : "Brouillon"}
                    </span>
                    {post.categoryName ? (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                        {post.categoryName}
                      </span>
                    ) : null}
                    <span className="text-xs text-white/40">
                      {new Date(post.createdAt).toLocaleDateString("fr-FR")} · {post.authorName}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold text-white">{post.title}</h3>
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
                  categories={categories}
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

function EditPostForm({
  post,
  categories,
  onDone,
}: {
  post: AdminPost;
  categories: AdminCategory[];
  onDone: () => void;
}) {
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
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-white/80">
          <span className="mb-1.5 block">Catégorie</span>
          <select
            name="categoryId"
            defaultValue={post.categoryId ?? ""}
            className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-2.5 text-white outline-none"
          >
            <option value="">Aucune</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-white/80">
          <span className="mb-1.5 block">Image de couverture (URL)</span>
          <input
            name="coverImageUrl"
            type="url"
            defaultValue={post.coverImageUrl ?? ""}
            placeholder="https://…"
            className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-2.5 text-white outline-none"
          />
        </label>
      </div>
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

// ---------- Comments ----------

function CommentsPanel({ comments, search }: { comments: AdminComment[]; search: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const filtered = search
    ? comments.filter(
        (comment) =>
          matches(comment.content, search) ||
          matches(comment.authorName, search) ||
          matches(comment.postTitle, search),
      )
    : comments;

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
        <p className="rounded-xl border border-rd-red/40 bg-rd-red/10 px-4 py-3 text-sm text-rd-redlight">{error}</p>
      ) : null}

      {filtered.length === 0 ? (
        <p className="py-6 text-sm text-white/40 italic">Aucun commentaire pour le moment.</p>
      ) : (
        filtered.map((comment) => (
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

// ---------- Users ----------

function UsersPanel({
  users,
  currentUserId,
  search,
}: {
  users: AdminUser[];
  currentUserId: string;
  search: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const filtered = search
    ? users.filter((user) => matches(user.name, search) || matches(user.email, search))
    : users;

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
        <p className="rounded-xl border border-rd-red/40 bg-rd-red/10 px-4 py-3 text-sm text-rd-redlight">{error}</p>
      ) : null}

      {filtered.map((user) => (
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

// ---------- Categories ----------

function CategoriesPanel({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.set("name", name);
      await createCategoryAction(formData);
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création.");
    }
  };

  const handleDelete = (categoryId: string) => {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    setError("");
    startTransition(async () => {
      try {
        await deleteCategoryAction(categoryId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la suppression.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex flex-wrap gap-3 rounded-2xl border border-rd-line bg-rd-deep p-5">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nom de la catégorie"
          className="flex-1 rounded-xl border border-rd-line bg-rd-graphite px-4 py-2.5 text-sm text-white outline-none focus:border-rd-red/60"
          required
        />
        <button type="submit" className="rounded-xl bg-rd-red px-4 py-2.5 text-sm font-semibold text-white">
          Ajouter
        </button>
      </form>

      {error ? (
        <p className="rounded-xl border border-rd-red/40 bg-rd-red/10 px-4 py-3 text-sm text-rd-redlight">{error}</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 ? (
          <p className="py-6 text-sm text-white/40 italic">Aucune catégorie pour le moment.</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-rd-line bg-rd-deep p-4"
            >
              <div>
                <p className="text-sm font-semibold text-white">{category.name}</p>
                <p className="text-xs text-white/40">
                  {category.postCount} article{category.postCount > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => handleDelete(category.id)}
                disabled={isPending}
                className="rounded-lg border border-rd-red/40 px-2.5 py-1 text-xs font-semibold text-rd-redlight hover:bg-rd-red/10 disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------- Media ----------

function MediaPanel({ media }: { media: AdminMediaItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Envoi en cours…");
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      await uploadMediaAction(formData);
      setStatus("Fichier envoyé.");
      event.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setStatus("");
      setError(err instanceof Error ? err.message : "Erreur lors de l’envoi.");
    }
  };

  const handleDelete = (item: AdminMediaItem) => {
    if (!window.confirm("Supprimer ce fichier ?")) return;
    setError("");
    startTransition(async () => {
      try {
        await deleteMediaAction(item.id, item.filename, item.url);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la suppression.");
      }
    });
  };

  const handleCopy = async (item: AdminMediaItem) => {
    await navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleUpload}
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-rd-line bg-rd-deep p-5"
      >
        <input
          name="file"
          type="file"
          accept="image/*"
          required
          className="text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-rd-red file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
        />
        <button type="submit" className="rounded-xl bg-rd-red px-4 py-2.5 text-sm font-semibold text-white">
          Envoyer
        </button>
        {status ? <span className="text-xs text-white/60">{status}</span> : null}
      </form>

      {error ? (
        <p className="rounded-xl border border-rd-red/40 bg-rd-red/10 px-4 py-3 text-sm text-rd-redlight">{error}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {media.length === 0 ? (
          <p className="py-6 text-sm text-white/40 italic">Aucun fichier pour le moment.</p>
        ) : (
          media.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-rd-line bg-rd-deep">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.filename} className="h-32 w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-xs font-semibold text-white/80">{item.filename}</p>
                <p className="text-[11px] text-white/40">{formatSize(item.sizeBytes)}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleCopy(item)}
                    className="flex-1 rounded-lg border border-rd-line px-2 py-1 text-[11px] font-semibold text-white/70 hover:border-white/40"
                  >
                    {copiedId === item.id ? "Copié !" : "Copier URL"}
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={isPending}
                    className="rounded-lg border border-rd-red/40 px-2 py-1 text-[11px] font-semibold text-rd-redlight hover:bg-rd-red/10 disabled:opacity-50"
                  >
                    Suppr.
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------- Pages ----------

function PagesPanel({ pages }: { pages: AdminPageItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleToggle = (pageId: string, published: boolean) => {
    setError("");
    startTransition(async () => {
      try {
        await togglePagePublishedAction(pageId, published);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour.");
      }
    });
  };

  const handleDelete = (pageId: string) => {
    if (!window.confirm("Supprimer cette page ?")) return;
    setError("");
    startTransition(async () => {
      try {
        await deletePageAction(pageId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la suppression.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Pages statiques</h3>
        <button
          onClick={() => setCreating((prev) => !prev)}
          className="rounded-lg border border-rd-line px-3 py-1.5 text-xs font-semibold text-white/80 hover:border-white/40"
        >
          {creating ? "Fermer" : "+ Nouvelle page"}
        </button>
      </div>

      {creating ? (
        <CreatePageForm
          onDone={() => {
            setCreating(false);
            router.refresh();
          }}
        />
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rd-red/40 bg-rd-red/10 px-4 py-3 text-sm text-rd-redlight">{error}</p>
      ) : null}

      <div className="space-y-3">
        {pages.length === 0 ? (
          <p className="py-6 text-sm text-white/40 italic">Aucune page pour le moment.</p>
        ) : (
          pages.map((page) => (
            <div key={page.id} className="rounded-xl border border-rd-line bg-rd-deep p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase ${
                        page.published ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/50"
                      }`}
                    >
                      {page.published ? "Publiée" : "Brouillon"}
                    </span>
                    <span className="text-xs text-white/40">/pages/{page.slug}</span>
                  </div>
                  <h4 className="mt-2 font-display text-lg font-semibold text-white">{page.title}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setEditingId(editingId === page.id ? null : page.id)}
                    className="rounded-lg border border-rd-line px-3 py-1.5 text-xs font-semibold text-white/80 hover:border-white/40"
                  >
                    {editingId === page.id ? "Fermer" : "Modifier"}
                  </button>
                  <button
                    onClick={() => handleToggle(page.id, !page.published)}
                    disabled={isPending}
                    className="rounded-lg border border-rd-line px-3 py-1.5 text-xs font-semibold text-white/80 hover:border-white/40 disabled:opacity-50"
                  >
                    {page.published ? "Dépublier" : "Publier"}
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    disabled={isPending}
                    className="rounded-lg border border-rd-red/40 px-3 py-1.5 text-xs font-semibold text-rd-redlight hover:bg-rd-red/10 disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {editingId === page.id ? (
                <EditPageForm
                  page={page}
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

function CreatePageForm({ onDone }: { onDone: () => void }) {
  const [status, setStatus] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Création…");

    try {
      const formData = new FormData(event.currentTarget);
      await createPageAction(formData);
      onDone();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Erreur.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-rd-line bg-rd-deep p-5">
      <label className="block text-sm text-white/80">
        <span className="mb-1.5 block">Titre</span>
        <input
          name="title"
          type="text"
          required
          className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-2.5 text-white outline-none"
        />
      </label>
      <label className="block text-sm text-white/80">
        <span className="mb-1.5 block">Contenu (Markdown)</span>
        <textarea
          name="content"
          rows={6}
          required
          className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-2.5 text-white outline-none"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-white/80">
        <input name="published" type="checkbox" defaultChecked className="h-4 w-4" />
        <span>Publier immédiatement</span>
      </label>
      <button type="submit" className="rounded-xl bg-rd-red px-4 py-2.5 text-sm font-semibold text-white">
        Créer la page
      </button>
      {status ? <p className="text-sm text-white/60">{status}</p> : null}
    </form>
  );
}

function EditPageForm({ page, onDone }: { page: AdminPageItem; onDone: () => void }) {
  const [status, setStatus] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Enregistrement…");

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("pageId", page.id);
      await updatePageAction(formData);
      onDone();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Erreur.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-3 border-t border-white/5 pt-5">
      <label className="block text-sm text-white/80">
        <span className="mb-1.5 block">Titre</span>
        <input
          name="title"
          type="text"
          defaultValue={page.title}
          required
          className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-2.5 text-white outline-none"
        />
      </label>
      <label className="block text-sm text-white/80">
        <span className="mb-1.5 block">Contenu (Markdown)</span>
        <textarea
          name="content"
          rows={6}
          defaultValue={page.content}
          required
          className="w-full rounded-xl border border-rd-line bg-rd-graphite px-4 py-2.5 text-white outline-none"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-white/80">
        <input name="published" type="checkbox" defaultChecked={page.published} className="h-4 w-4" />
        <span>Publiée</span>
      </label>
      <button type="submit" className="rounded-xl bg-rd-red px-4 py-2.5 text-sm font-semibold text-white">
        Enregistrer
      </button>
      {status ? <p className="text-sm text-white/60">{status}</p> : null}
    </form>
  );
}

// ---------- Coming soon ----------

function ComingSoonPanel({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rd-line bg-rd-graphite p-16 text-center">
      <p className="font-display text-xl font-semibold text-white">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-white/50">
        Cette section arrive bientôt. Aucun réglage n’est encore configurable ici.
      </p>
    </div>
  );
}