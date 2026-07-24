"use server";

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/session';
import { createClient } from '@/utils/supabase/server';
import { sendEmail, buildNewPostEmail, getSiteUrl } from '@/lib/email';

const createPostSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  published: z.coerce.boolean().optional(),
  categoryId: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

const updatePostSchema = createPostSchema.extend({
  postId: z.string().min(1),
});

const roleSchema = z.enum(['ADMIN', 'EDITOR', 'VISITOR']);

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

async function notifyNewPost(post: {
  title: string;
  excerpt: string;
  slug: string;
  authorId: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: recipients, error } = await supabase
    .from('users')
    .select('id, email, email_verified')
    .eq('notify_new_posts', true)
    .neq('id', post.authorId);

  if (error || !recipients || recipients.length === 0) {
    return;
  }

  const link = `/blog/${post.slug}`;

  const notificationRows = recipients.map((recipient) => ({
    user_id: recipient.id,
    type: 'NEW_POST',
    title: 'Nouvel article',
    message: `Un nouvel article a été publié : "${post.title}"`,
    link,
  }));

  await supabase.from('notifications').insert(notificationRows);

  const postUrl = `${getSiteUrl()}${link}`;
  const { subject, html } = buildNewPostEmail(post.title, post.excerpt, postUrl);

  await Promise.all(
    recipients
      .filter((recipient) => recipient.email_verified && recipient.email)
      .map((recipient) => sendEmail({ to: recipient.email as string, subject, html })),
  );
}

export async function createPostAction(formData: FormData) {
  const user = await requireAdmin();

  const payload = createPostSchema.safeParse({
    title: formData.get('title'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    published: formData.get('published') === 'on',
    categoryId: formData.get('categoryId') || undefined,
    coverImageUrl: formData.get('coverImageUrl') || undefined,
  });

  if (!payload.success) {
    throw new Error('Les champs du formulaire sont invalides.');
  }

  const { title, excerpt, content, published, categoryId, coverImageUrl } = payload.data;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const authorId = user.id;
  const slug = `${slugify(title)}-${Date.now()}`;

  const isPublished = published ?? true;

  const { error } = await supabase.from('posts').insert({
    title,
    slug,
    excerpt,
    content,
    published: isPublished,
    author_id: authorId,
    author_name: user.name ?? null,
    category_id: categoryId || null,
    cover_image_url: coverImageUrl || null,
  });

  if (error) {
    throw new Error(`Impossible de publier l’article : ${error.message}`);
  }

  if (isPublished) {
    await notifyNewPost({ title, excerpt, slug, authorId });
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
    categoryId: formData.get('categoryId') || undefined,
    coverImageUrl: formData.get('coverImageUrl') || undefined,
  });

  if (!payload.success) {
    throw new Error('Les champs du formulaire sont invalides.');
  }

  const { postId, title, excerpt, content, published, categoryId, coverImageUrl } = payload.data;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('posts')
    .update({
      title,
      excerpt,
      content,
      published: published ?? false,
      category_id: categoryId || null,
      cover_image_url: coverImageUrl || null,
    })
    .eq('id', postId);

  if (error) {
    throw new Error(`Impossible de mettre à jour l’article : ${error.message}`);
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
    throw new Error(`Impossible de mettre à jour l’article : ${error.message}`);
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
    throw new Error(`Impossible de supprimer l’article : ${error.message}`);
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

export async function setUserActiveAction(userId: string, active: boolean) {
  const currentUser = await requireAdmin();

  if (userId === currentUser.id && !active) {
    throw new Error('Vous ne pouvez pas désactiver votre propre compte.');
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('users').update({ active }).eq('id', userId);

  if (error) {
    throw new Error(`Impossible de mettre à jour le compte : ${error.message}`);
  }

  revalidatePath('/admin');
}

const createCategorySchema = z.object({
  name: z.string().min(2),
});

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const payload = createCategorySchema.safeParse({ name: formData.get('name') });

  if (!payload.success) {
    throw new Error('Le nom de la catégorie est invalide.');
  }

  const { name } = payload.data;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const slug = `${slugify(name)}-${Date.now()}`;

  const { error } = await supabase.from('categories').insert({ name, slug });

  if (error) {
    throw new Error(`Impossible de créer la catégorie : ${error.message}`);
  }

  revalidatePath('/admin');
}

export async function deleteCategoryAction(categoryId: string) {
  await requireAdmin();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('categories').delete().eq('id', categoryId);

  if (error) {
    throw new Error(`Impossible de supprimer la catégorie : ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/blog');
}

export async function uploadMediaAction(formData: FormData) {
  const user = await requireAdmin();

  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Aucun fichier sélectionné.');
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const path = `${Date.now()}-${slugify(file.name)}`;

  const { error: uploadError } = await supabase.storage.from('media').upload(path, file, {
    contentType: file.type || undefined,
  });

  if (uploadError) {
    throw new Error(`Impossible d’envoyer le fichier : ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(path);

  const { error: insertError } = await supabase.from('media').insert({
    filename: file.name,
    url: publicUrlData.publicUrl,
    size_bytes: file.size,
    uploaded_by: user.id,
  });

  if (insertError) {
    throw new Error(`Impossible d’enregistrer le média : ${insertError.message}`);
  }

  revalidatePath('/admin');
}

export async function deleteMediaAction(mediaId: string, filename: string, url: string) {
  await requireAdmin();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const path = url.split('/media/').pop() ?? filename;
  await supabase.storage.from('media').remove([path]);

  const { error } = await supabase.from('media').delete().eq('id', mediaId);

  if (error) {
    throw new Error(`Impossible de supprimer le média : ${error.message}`);
  }

  revalidatePath('/admin');
}

// Upload d'une image depuis l'éditeur d'article : téléverse vers Supabase
// Storage, enregistre dans la bibliothèque média et renvoie l'URL publique
// pour l'insérer dans le contenu ou comme image de couverture.
export async function uploadImageAction(formData: FormData): Promise<{ url: string }> {
  const user = await requireAdmin();

  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Aucun fichier sélectionné.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image.');
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const path = `${Date.now()}-${slugify(file.name)}`;

  const { error: uploadError } = await supabase.storage.from('media').upload(path, file, {
    contentType: file.type || undefined,
  });

  if (uploadError) {
    throw new Error(`Impossible d’envoyer l’image : ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(path);

  await supabase.from('media').insert({
    filename: file.name,
    url: publicUrlData.publicUrl,
    size_bytes: file.size,
    uploaded_by: user.id,
  });

  revalidatePath('/admin');

  return { url: publicUrlData.publicUrl };
}

const pageSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  published: z.coerce.boolean().optional(),
});

export async function createPageAction(formData: FormData) {
  await requireAdmin();

  const payload = pageSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    published: formData.get('published') === 'on',
  });

  if (!payload.success) {
    throw new Error('Les champs du formulaire sont invalides.');
  }

  const { title, content, published } = payload.data;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const slug = `${slugify(title)}-${Date.now()}`;

  const { error } = await supabase.from('pages').insert({
    title,
    slug,
    content,
    published: published ?? true,
  });

  if (error) {
    throw new Error(`Impossible de créer la page : ${error.message}`);
  }

  revalidatePath('/admin');
}

const updatePageSchema = pageSchema.extend({
  pageId: z.string().min(1),
});

export async function updatePageAction(formData: FormData) {
  await requireAdmin();

  const payload = updatePageSchema.safeParse({
    pageId: formData.get('pageId'),
    title: formData.get('title'),
    content: formData.get('content'),
    published: formData.get('published') === 'on',
  });

  if (!payload.success) {
    throw new Error('Les champs du formulaire sont invalides.');
  }

  const { pageId, title, content, published } = payload.data;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('pages')
    .update({ title, content, published: published ?? false })
    .eq('id', pageId);

  if (error) {
    throw new Error(`Impossible de mettre à jour la page : ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/pages/[slug]');
}

export async function togglePagePublishedAction(pageId: string, published: boolean) {
  await requireAdmin();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('pages').update({ published }).eq('id', pageId);

  if (error) {
    throw new Error(`Impossible de mettre à jour la page : ${error.message}`);
  }

  revalidatePath('/admin');
}

export async function deletePageAction(pageId: string) {
  await requireAdmin();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('pages').delete().eq('id', pageId);

  if (error) {
    throw new Error(`Impossible de supprimer la page : ${error.message}`);
  }

  revalidatePath('/admin');
}