import { redirect } from 'next/navigation';
import { getPublishedPosts } from '@/lib/blog';
import { getCurrentUser } from '@/lib/session';
import CreatePostForm from './CreatePostForm';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  const posts = await getPublishedPosts();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-24">
      <div className="rounded-2xl border border-rd-line bg-rd-graphite p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-rd-red">Dashboard admin</p>
        <h1 className="font-display text-4xl font-semibold">Tableau de bord</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-rd-line bg-rd-deep p-4">
            <div className="text-sm text-white/60">Articles publiés</div>
            <div className="mt-2 text-3xl font-semibold">{posts.length}</div>
          </div>
          <div className="rounded-xl border border-rd-line bg-rd-deep p-4">
            <div className="text-sm text-white/60">Likes</div>
            <div className="mt-2 text-3xl font-semibold">{posts.reduce((sum, post) => sum + post.likes.length, 0)}</div>
          </div>
          <div className="rounded-xl border border-rd-line bg-rd-deep p-4">
            <div className="text-sm text-white/60">Partages</div>
            <div className="mt-2 text-3xl font-semibold">{posts.reduce((sum, post) => sum + post.shares.length, 0)}</div>
          </div>
        </div>

        <CreatePostForm />
      </div>
    </main>
  );
}
