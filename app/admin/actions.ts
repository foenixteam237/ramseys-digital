"use server";

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { getCurrentUser } from '@/lib/session';
import { createClient } from '@/utils/supabase/server';

const createPostSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  published: z.coerce.boolean().optional(),
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 120);

export async function createPostAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  const payload = createPostSchema.safeParse({
    title: formData.get('title'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    published: formData.get('published') === 'on',
  });

  if (!payload.success) {
    throw new Error('Les champs du formulaire sont invalides.');
  }

  const { title, excerpt, content, published } = payload.data;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const authorId = user.id;
  const slug = `${slugify(title)}-${Date.now()}`;

  const { error } = await supabase.from('posts').insert({
    title,
    slug,
    excerpt,
    content,
    published: published ?? true,
    author_id: authorId,
  });

  if (error) {
    throw new Error(`Impossible de publier l’article : ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/blog');
}
