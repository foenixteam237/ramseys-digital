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
  categoryId: string | null;
  categoryName: string | null;
  coverImageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  likeDates: string[];
  commentDates: string[];
  shareDates: string[];
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

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface AdminMediaItem {
  id: string;
  filename: string;
  url: string;
  sizeBytes: number | null;
  createdAt: string;
}

export interface AdminPageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

function firstOf<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

export async function getAllPostsForAdmin(): Promise<AdminPost[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, title, slug, excerpt, content, published, created_at, updated_at, cover_image_url, category_id, ' +
        'author:users(name), category:categories(name), likes(created_at), comments(created_at), shares(created_at)',
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllPostsForAdmin error:', error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const post = row as unknown as Record<string, unknown>;
    const author = firstOf(post.author as { name?: string } | { name?: string }[] | null);
    const category = firstOf(post.category as { name?: string } | { name?: string }[] | null);
    const likes = Array.isArray(post.likes) ? (post.likes as { created_at: string }[]) : [];
    const comments = Array.isArray(post.comments) ? (post.comments as { created_at: string }[]) : [];
    const shares = Array.isArray(post.shares) ? (post.shares as { created_at: string }[]) : [];

    return {
      id: post.id as string,
      title: post.title as string,
      slug: post.slug as string,
      excerpt: post.excerpt as string,
      content: post.content as string,
      published: post.published as boolean,
      createdAt: post.created_at as string,
      updatedAt: post.updated_at as string,
      authorName: author?.name ?? 'Inconnu',
      categoryId: (post.category_id as string | null) ?? null,
      categoryName: category?.name ?? null,
      coverImageUrl: (post.cover_image_url as string | null) ?? null,
      likesCount: likes.length,
      commentsCount: comments.length,
      sharesCount: shares.length,
      likeDates: likes.map((like) => like.created_at),
      commentDates: comments.map((comment) => comment.created_at),
      shareDates: shares.map((share) => share.created_at),
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
    const user = firstOf(comment.user as { name?: string } | { name?: string }[] | null);
    const post = firstOf(
      comment.post as { title?: string; slug?: string } | { title?: string; slug?: string }[] | null,
    );

    return {
      id: comment.id as string,
      content: comment.content as string,
      createdAt: comment.created_at as string,
      authorName: user?.name ?? 'Utilisateur supprimé',
      postTitle: post?.title ?? 'Article supprimé',
      postSlug: post?.slug ?? '',
    };
  });
}

export async function getAllCategories(): Promise<AdminCategory[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, posts(id)')
    .order('name', { ascending: true });

  if (error) {
    console.error('getAllCategories error:', error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const category = row as unknown as Record<string, unknown>;
    return {
      id: category.id as string,
      name: category.name as string,
      slug: category.slug as string,
      postCount: Array.isArray(category.posts) ? category.posts.length : 0,
    };
  });
}

export async function getAllMedia(): Promise<AdminMediaItem[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('media')
    .select('id, filename, url, size_bytes, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllMedia error:', error.message);
    return [];
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    filename: item.filename,
    url: item.url,
    sizeBytes: item.size_bytes,
    createdAt: item.created_at,
  }));
}

export async function getAllPages(): Promise<AdminPageItem[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('pages')
    .select('id, title, slug, content, published, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllPages error:', error.message);
    return [];
  }

  return (data ?? []).map((page) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    content: page.content,
    published: page.published,
    createdAt: page.created_at,
    updatedAt: page.updated_at,
  }));
}