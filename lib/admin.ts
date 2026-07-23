import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AdminComment {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  postTitle: string;
  postSlug: string;
}

export async function getAllPostsForAdmin(): Promise<AdminPost[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, content, published, created_at, updated_at, author:users(name), likes(id), comments(id), shares(id)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllPostsForAdmin error:', error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const post = row as unknown as Record<string, unknown>;
    const author = post.author as { name?: string } | { name?: string }[] | null;
    const authorName = Array.isArray(author) ? author[0]?.name : author?.name;

    return {
      id: post.id as string,
      title: post.title as string,
      slug: post.slug as string,
      excerpt: post.excerpt as string,
      content: post.content as string,
      published: post.published as boolean,
      createdAt: post.created_at as string,
      updatedAt: post.updated_at as string,
      authorName: authorName ?? 'Inconnu',
      likesCount: Array.isArray(post.likes) ? post.likes.length : 0,
      commentsCount: Array.isArray(post.comments) ? post.comments.length : 0,
      sharesCount: Array.isArray(post.shares) ? post.shares.length : 0,
    };
  });
}

export async function getAllUsers(): Promise<AdminUser[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllUsers error:', error.message);
    return [];
  }

  return (data ?? []).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  }));
}

export async function getAllCommentsForAdmin(): Promise<AdminComment[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, user:users(name), post:posts(title, slug)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllCommentsForAdmin error:', error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const comment = row as unknown as Record<string, unknown>;
    const user = comment.user as { name?: string } | { name?: string }[] | null;
    const post = comment.post as { title?: string; slug?: string } | { title?: string; slug?: string }[] | null;
    const authorName = Array.isArray(user) ? user[0]?.name : user?.name;
    const postEntry = Array.isArray(post) ? post[0] : post;

    return {
      id: comment.id as string,
      content: comment.content as string,
      createdAt: comment.created_at as string,
      authorName: authorName ?? 'Utilisateur supprimé',
      postTitle: postEntry?.title ?? 'Article supprimé',
      postSlug: postEntry?.slug ?? '',
    };
  });
}