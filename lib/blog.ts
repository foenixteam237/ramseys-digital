import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

const normalizePost = (post: Record<string, unknown>) => ({
  id: post.id as string,
  title: (post.title as string | undefined) ?? '',
  slug: (post.slug as string | undefined) ?? '',
  excerpt: (post.excerpt as string | undefined) ?? '',
  content: (post.content as string | undefined) ?? '',
  published: (post.published as boolean | undefined) ?? false,
  authorId: (post.author_id as string | undefined) ?? (post.authorId as string | undefined) ?? null,
  author: (post.author as Record<string, unknown> | undefined) ?? null,
  createdAt: (post.created_at as string | undefined) ?? (post.createdAt as string | undefined) ?? new Date().toISOString(),
  updatedAt: (post.updated_at as string | undefined) ?? (post.updatedAt as string | undefined) ?? new Date().toISOString(),
  coverImageUrl: (post.cover_image_url as string | null) ?? (post.coverImageUrl as string | null) ?? null,
  likes: Array.isArray(post.likes) ? post.likes : [],
  comments: Array.isArray(post.comments) ? post.comments : [],
  shares: Array.isArray(post.shares) ? post.shares : [],
});

export async function getPublishedPosts() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('posts')
    .select('*, author:users(*), likes(*), comments(*, user:users(*)), shares(*)')
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
    .select('*, author:users(*), likes(*), comments(*, user:users(*)), shares(*)')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('getPostBySlug error:', error.message);
    return null;
  }

  return data ? normalizePost(data) : null;
}
