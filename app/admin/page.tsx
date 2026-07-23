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

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  const [posts, users, comments, categories, media, pages] = await Promise.all([
    getAllPostsForAdmin(),
    getAllUsers(),
    getAllCommentsForAdmin(),
    getAllCategories(),
    getAllMedia(),
    getAllPages(),
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
      currentUserName={user.name ?? 'Admin'}
    />
  );
}