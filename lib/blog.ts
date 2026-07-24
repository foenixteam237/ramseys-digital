import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export interface PostLike {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface PostComment {
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

export interface PostShare {
  id: string;
  post_id: string;
  platform: string;
  created_at: string;
}

function firstOf<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

const normalizePost = (post: Record<string, unknown>) => {
  const category = firstOf(post.category as { name?: string } | { name?: string }[] | null);
  const author = firstOf(post.author as { name?: string } | { name?: string }[] | null);
  // Le nom denormalise (author_name) prime : il survit a la suppression de l'auteur.
  const authorName = (post.author_name as string | undefined) ?? author?.name ?? 'Ramseys Digital';

  return {
    id: post.id as string,
    title: (post.title as string | undefined) ?? '',
    slug: (post.slug as string | undefined) ?? '',
    excerpt: (post.excerpt as string | undefined) ?? '',
    content: (post.content as string | undefined) ?? '',
    published: (post.published as boolean | undefined) ?? false,
    authorId: (post.author_id as string | undefined) ?? (post.authorId as string | undefined) ?? null,
    authorName,
    author: (post.author as Record<string, unknown> | undefined) ?? null,
    createdAt: (post.created_at as string | undefined) ?? (post.createdAt as string | undefined) ?? new Date().toISOString(),
    updatedAt: (post.updated_at as string | undefined) ?? (post.updatedAt as string | undefined) ?? new Date().toISOString(),
    coverImageUrl: (post.cover_image_url as string | null) ?? (post.coverImageUrl as string | null) ?? null,
    categoryId: (post.category_id as string | null) ?? null,
    categoryName: category?.name ?? null,
    views: (post.views as number | undefined) ?? 0,
    likes: (Array.isArray(post.likes) ? post.likes : []) as PostLike[],
    comments: (Array.isArray(post.comments) ? post.comments : []) as PostComment[],
    shares: (Array.isArray(post.shares) ? post.shares : []) as PostShare[],
  };
};

const POST_SELECT =
  '*, author:users(*), category:categories(name), likes(*), comments(*, user:users(*)), shares(*)';

export async function getPublishedPosts() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getPublishedPosts error:', error.message);
    return [];
  }

  return (data ?? []).map((post) => normalizePost(post));
}

export async function getPostBySlug(slug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('getPostBySlug error:', error.message);
    return null;
  }

  return data ? normalizePost(data) : null;
}