import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import {
  getAllPostsForAdmin,
  getAllUsers,
  getAllCommentsForAdmin,
  getAllCategories,
  getAllMedia,
  getAllPages,
} from '@/lib/admin';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
    redirect('/login');
  }

  const isAdmin = user.role === 'ADMIN';
  // Un EDITOR ne voit que ses propres contenus.
  const authorFilter = isAdmin ? undefined : user.id;

  const [posts, users, comments, categories, media, pages] = await Promise.all([
    getAllPostsForAdmin(authorFilter),
    isAdmin ? getAllUsers() : Promise.resolve([]),
    isAdmin ? getAllCommentsForAdmin() : Promise.resolve([]),
    getAllCategories(authorFilter),
    getAllMedia(authorFilter),
    isAdmin ? getAllPages() : Promise.resolve([]),
  ]);

  return (
    <AdminDashboard
      initialPosts={posts}
      initialUsers={users}
      initialComments={comments}
      initialCategories={categories}
      initialMedia={media}
      initialPages={pages}
      currentUserId={user.id}
      currentUserName={user.name ?? 'Utilisateur'}
      currentUserRole={user.role}
    />
  );
}