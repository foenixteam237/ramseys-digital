import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { getAllPostsForAdmin, getAllUsers, getAllCommentsForAdmin } from '@/lib/admin';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  const [posts, users, comments] = await Promise.all([
    getAllPostsForAdmin(),
    getAllUsers(),
    getAllCommentsForAdmin(),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-24">
      <div className="rounded-2xl border border-rd-line bg-rd-graphite p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-rd-red">Dashboard admin</p>
        <h1 className="font-display text-4xl font-semibold">Tableau de bord</h1>

        <AdminDashboard
          initialPosts={posts}
          initialUsers={users}
          initialComments={comments}
          currentUserId={user.id}
        />
      </div>
    </main>
  );
}