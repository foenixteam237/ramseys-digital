import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import {
  getAllPostsForAdmin,
  getAllUsers,
  getAllCommentsForAdmin,
  getAllCategories,
  getCategoryRequests,
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
  // Un EDITOR ne voit que ses propres articles et médias.
  const authorFilter = isAdmin ? undefined : user.id;

  const [posts, users, comments, categories, categoryRequests, media, pages] = await Promise.all([
    getAllPostsForAdmin(authorFilter),
    isAdmin ? getAllUsers() : Promise.resolve([]),
    isAdmin ? getAllCommentsForAdmin() : Promise.resolve([]),
    // Toutes les catégories sont visibles (pour pouvoir les assigner à un article).
    getAllCategories(),
    // ADMIN : demandes en attente ; EDITOR : ses propres demandes.
    getCategoryRequests(authorFilter),
    getAllMedia(authorFilter),
    isAdmin ? getAllPages() : Promise.resolve([]),
  ]);

  return (
    <AdminDashboard
      initialPosts={posts}
      initialUsers={users}
      initialComments={comments}
      initialCategories={categories}
      initialCategoryRequests={categoryRequests}
      initialMedia={media}
      initialPages={pages}
      currentUserId={user.id}
      currentUserName={user.name ?? 'Utilisateur'}
      currentUserRole={user.role}
    />
  );
}