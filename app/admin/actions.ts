"use server";

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/session';
import { createClient } from '@/utils/supabase/server';
import { parseYoutubeId } from '@/lib/youtube';
import {
  sendEmail,
  buildNewPostEmail,
  buildPostApprovedEmail,
  buildPostRejectedEmail,
  getSiteUrl,
} from '@/lib/email';

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

// ADMIN ou EDITOR : peut rediger des articles.
async function requireEditor() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
    redirect('/login');
  }

  return user;
}

type SupabaseServerClient = ReturnType<typeof createClient>;

// Un EDITOR ne peut agir que sur ses propres articles ; un ADMIN sur tous.
async function assertCanManagePost(
  supabase: SupabaseServerClient,
  postId: string,
  user: { id: string; role: string },
) {
  if (user.role === 'ADMIN') return;

  const { data } = await supabase.from('posts').select('author_id').eq('id', postId).single();

  if (!data || data.author_id !== user.id) {
    throw new Error('Vous ne pouvez modifier que vos propres articles.');
  }
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

  const postUrl = `${await getSiteUrl()}${link}`;
  const { subject, html } = buildNewPostEmail(post.title, post.excerpt, postUrl);

  await Promise.all(
    recipients
      .filter((recipient) => recipient.email_verified && recipient.email)
      .map((recipient) => sendEmail({ to: recipient.email as string, subject, html })),
  );
}

export async function createPostAction(formData: FormData) {
  const user = await requireEditor();

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

  const isAdmin = user.role === 'ADMIN';
  // Un ADMIN publie directement ; un EDITOR soumet a validation.
  const status = isAdmin ? 'APPROVED' : 'PENDING';
  const isPublished = isAdmin ? published ?? true : false;

  const { error } = await supabase.from('posts').insert({
    title,
    slug,
    excerpt,
    content,
    published: isPublished,
    status,
    author_id: authorId,
    author_name: user.name ?? null,
    category_id: categoryId || null,
    cover_image_url: coverImageUrl || null,
  });

  if (error) {
    throw new Error(`Impossible d’enregistrer l’article : ${error.message}`);
  }

  if (isAdmin && isPublished) {
    await notifyNewPost({ title, excerpt, slug, authorId });
  }

  revalidatePath('/admin');
  revalidatePath('/blog');
}

export async function updatePostAction(formData: FormData) {
  const user = await requireEditor();

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

  await assertCanManagePost(supabase, postId, user);

  const isAdmin = user.role === 'ADMIN';

  // Un EDITOR qui modifie son article le repasse en validation (invisible
  // jusqu'a nouvelle approbation). Un ADMIN garde le controle direct.
  const moderation = isAdmin
    ? { published: published ?? false }
    : { published: false, status: 'PENDING', review_note: null };

  const { error } = await supabase
    .from('posts')
    .update({
      title,
      excerpt,
      content,
      category_id: categoryId || null,
      cover_image_url: coverImageUrl || null,
      ...moderation,
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

  const { error } = await supabase
    .from('posts')
    .update({ published, status: published ? 'APPROVED' : 'PENDING' })
    .eq('id', postId);

  if (error) {
    throw new Error(`Impossible de mettre à jour l’article : ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/blog');
}

// Notifie l'auteur (in-app + email) d'une decision de moderation.
async function notifyAuthorDecision(
  supabase: ReturnType<typeof createClient>,
  postId: string,
  decision: 'APPROVED' | 'REJECTED',
  note: string,
) {
  const { data: post } = await supabase
    .from('posts')
    .select('title, slug, author_id')
    .eq('id', postId)
    .single();

  if (!post || !post.author_id) return;

  const { data: author } = await supabase
    .from('users')
    .select('email, email_verified')
    .eq('id', post.author_id)
    .single();

  const link = `/blog/${post.slug}`;

  await supabase.from('notifications').insert({
    user_id: post.author_id,
    type: decision === 'APPROVED' ? 'POST_APPROVED' : 'POST_REJECTED',
    title: decision === 'APPROVED' ? 'Article validé' : 'Article à revoir',
    message:
      decision === 'APPROVED'
        ? `Votre article "${post.title}" a été validé et publié.`
        : `Votre article "${post.title}" n'a pas été validé.${note ? ' Motif : ' + note : ''}`,
    link: decision === 'APPROVED' ? link : null,
  });

  if (author?.email && author.email_verified) {
    const email =
      decision === 'APPROVED'
        ? buildPostApprovedEmail(post.title, `${await getSiteUrl()}${link}`)
        : buildPostRejectedEmail(post.title, note);
    await sendEmail({ to: author.email as string, subject: email.subject, html: email.html });
  }
}

export async function approvePostAction(postId: string) {
  await requireAdmin();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('title, excerpt, slug, author_id')
    .eq('id', postId)
    .single();

  if (fetchError || !post) {
    throw new Error("Article introuvable.");
  }

  const { error } = await supabase
    .from('posts')
    .update({ status: 'APPROVED', published: true, review_note: null })
    .eq('id', postId);

  if (error) {
    throw new Error(`Impossible de valider l’article : ${error.message}`);
  }

  await notifyAuthorDecision(supabase, postId, 'APPROVED', '');
  // Notifie aussi les abonnes du nouvel article
  if (post.author_id) {
    await notifyNewPost({
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
      authorId: post.author_id,
    });
  }

  revalidatePath('/admin');
  revalidatePath('/blog');
}

export async function rejectPostAction(postId: string, note: string) {
  await requireAdmin();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('posts')
    .update({ status: 'REJECTED', published: false, review_note: note || null })
    .eq('id', postId);

  if (error) {
    throw new Error(`Impossible de rejeter l’article : ${error.message}`);
  }

  await notifyAuthorDecision(supabase, postId, 'REJECTED', note || '');

  revalidatePath('/admin');
  revalidatePath('/blog');
}

export async function deletePostAction(postId: string) {
  const user = await requireEditor();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  await assertCanManagePost(supabase, postId, user);

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
  const user = await requireAdmin();

  const payload = createCategorySchema.safeParse({ name: formData.get('name') });

  if (!payload.success) {
    throw new Error('Le nom de la catégorie est invalide.');
  }

  const { name } = payload.data;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const slug = `${slugify(name)}-${Date.now()}`;

  const { error } = await supabase.from('categories').insert({ name, slug, created_by: user.id });

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

// Un EDITOR demande la creation d'une categorie ; l'admin tranchera.
export async function requestCategoryAction(formData: FormData) {
  const user = await requireEditor();

  const payload = createCategorySchema.safeParse({ name: formData.get('name') });

  if (!payload.success) {
    throw new Error('Le nom de la catégorie est invalide.');
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('category_requests').insert({
    name: payload.data.name,
    requested_by: user.id,
    requested_by_name: user.name ?? null,
  });

  if (error) {
    throw new Error(`Impossible d’envoyer la demande : ${error.message}`);
  }

  revalidatePath('/admin');
}

export async function approveCategoryRequestAction(requestId: string) {
  const user = await requireAdmin();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: request, error: fetchError } = await supabase
    .from('category_requests')
    .select('name, status')
    .eq('id', requestId)
    .single();

  if (fetchError || !request) {
    throw new Error('Demande introuvable.');
  }

  const slug = `${slugify(request.name)}-${Date.now()}`;
  const { error: insertError } = await supabase
    .from('categories')
    .insert({ name: request.name, slug, created_by: user.id });

  if (insertError) {
    throw new Error(`Impossible de créer la catégorie : ${insertError.message}`);
  }

  await supabase.from('category_requests').update({ status: 'APPROVED' }).eq('id', requestId);

  revalidatePath('/admin');
  revalidatePath('/blog');
}

export async function rejectCategoryRequestAction(requestId: string) {
  await requireAdmin();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('category_requests')
    .update({ status: 'REJECTED' })
    .eq('id', requestId);

  if (error) {
    throw new Error(`Impossible de rejeter la demande : ${error.message}`);
  }

  revalidatePath('/admin');
}

export async function uploadMediaAction(formData: FormData) {
  const user = await requireEditor();

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
  const user = await requireEditor();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (user.role !== 'ADMIN') {
    const { data } = await supabase.from('media').select('uploaded_by').eq('id', mediaId).single();
    if (!data || data.uploaded_by !== user.id) {
      throw new Error('Vous ne pouvez supprimer que vos propres médias.');
    }
  }

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
  const user = await requireEditor();

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

// Videos mises en avant sur la page d'accueil (gerees par l'admin).
export async function addFeaturedVideoAction(formData: FormData) {
  const user = await requireAdmin();

  const rawUrl = String(formData.get('url') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();

  const youtubeId = parseYoutubeId(rawUrl);
  if (!youtubeId) {
    throw new Error('Lien YouTube invalide. Collez l’URL complète de la vidéo.');
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('featured_videos').insert({
    youtube_id: youtubeId,
    title: title || null,
    created_by: user.id,
  });

  if (error) {
    throw new Error(`Impossible d’ajouter la vidéo : ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deleteFeaturedVideoAction(videoId: string) {
  await requireAdmin();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('featured_videos').delete().eq('id', videoId);

  if (error) {
    throw new Error(`Impossible de supprimer la vidéo : ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/');
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