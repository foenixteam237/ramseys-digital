"use server";

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/session';
import { createClient } from '@/utils/supabase/server';

const createPostSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  published: z.coerce.boolean().optional(),
});

const updatePostSchema = z.object({
  postId: z.string().min(1),
  title: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  published: z.coerce.boolean().optional(),
});

const roleSchema = z.enum(['ADMIN', 'VISITOR']);

const combiningMarksPattern = new RegExp(
  '[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']',
  'g',
);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(combiningMarksPattern, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 120);

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  return user;
}

export async function createPostAction(formData: FormData) {
  const user = await requireAdmin();

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
    throw new Error(`Impossible de publier l'article : ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/blog');
}

export async function updatePostAction(formData: FormData) {
  await requireAdmin();

  const payload = updatePostSchema.safeParse({
    postId: formData.get('postId'),
    title: formData.get('title'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    published: formData.get('published') === 'on',
  });

  if (!payload.success) {
    throw new Error('Les champs du formulaire sont invalides.');
  }

  const { postId, title, excerpt, content, published } = payload.data;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('posts')
    .update({ title, excerpt, content, published: published ?? false })
    .eq('id', postId);

  if (error) {
    throw new Error(`Impossible de mettre à jour l'article : ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/blog');
  revalidatePath('/blog/[slug]');
}

export async function togglePostPublishedAction(postId: string, published: boolean) {
  await requireAdmin();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('posts').update({ published }).eq('id', postId);

  if (error) {
    throw new Error(`Impossible de mettre à jour l'article : ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/blog');
}

export async function deletePostAction(postId: string) {
  await requireAdmin();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) {
    throw new Error(`Impossible de supprimer l'article : ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/blog');
}

export async function deleteCommentAction(commentId: string) {
  await requireAdmin();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('comments').delete().eq('id', commentId);

  if (error) {
    throw new Error(`Impossible de supprimer le commentaire : ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/blog');
}

export async function updateUserRoleAction(userId: string, role: string) {
  const currentUser = await requireAdmin();

  const parsedRole = roleSchema.safeParse(role);
  if (!parsedRole.success) {
    throw new Error('Rôle invalide.');
  }

  if (userId === currentUser.id && parsedRole.data !== 'ADMIN') {
    throw new Error('Vous ne pouvez pas retirer votre propre rôle administrateur.');
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('users').update({ role: parsedRole.data }).eq('id', userId);

  if (error) {
    throw new Error(`Impossible de mettre à jour le rôle : ${error.message}`);
  }

  revalidatePath('/admin');
}