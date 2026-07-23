import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export interface PublicPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  updatedAt: string;
}

export async function getPublishedPageBySlug(slug: string): Promise<PublicPage | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('pages')
    .select('id, title, slug, content, updated_at')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    console.error('getPublishedPageBySlug error:', error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    content: data.content,
    updatedAt: data.updated_at,
  };
}