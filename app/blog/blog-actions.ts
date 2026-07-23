"use server";

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/session';
import { createClient } from '@/utils/supabase/server';

// 1. Toggle Like
export async function toggleLikeAction(postId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Vous devez être connecté pour aimer un article.');
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check if like exists
  const { data: existingLike, error: checkError } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Erreur lors de la vérification du like : ${checkError.message}`);
  }

  if (existingLike) {
    // Unlike
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id);

    if (deleteError) {
      throw new Error(`Erreur lors de la suppression du like : ${deleteError.message}`);
    }
  } else {
    // Like
    const { error: insertError } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        post_id: postId,
      });

    if (insertError) {
      throw new Error(`Erreur lors de l'enregistrement du like : ${insertError.message}`);
    }

    // Notify author if necessary
    // Get post author id
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('title, slug, author_id')
      .eq('id', postId)
      .single();

    if (!postError && post && post.author_id !== user.id) {
      // Check author notification preferences
      const { data: author } = await supabase
        .from('users')
        .select('notify_likes')
        .eq('id', post.author_id)
        .single();

      if (author?.notify_likes) {
        await supabase.from('notifications').insert({
          user_id: post.author_id,
          type: 'LIKE',
          title: 'Nouveau like',
          message: `${user.name} a aimé votre article "${post.title}"`,
          link: `/blog/${post.slug}`,
        });
      }
    }
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/[slug]`);
}

// 2. Add Comment
export async function addCommentAction(postId: string, content: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Vous devez être connecté pour commenter.');
  }

  if (!content || content.trim().length < 2) {
    throw new Error('Le commentaire doit contenir au moins 2 caractères.');
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error: insertError } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,
      post_id: postId,
      content: content.trim(),
    });

  if (insertError) {
    throw new Error(`Erreur lors de l'enregistrement du commentaire : ${insertError.message}`);
  }

  // Notify author if necessary
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('title, slug, author_id')
    .eq('id', postId)
    .single();

  if (!postError && post && post.author_id !== user.id) {
    // Check author notification preferences
    const { data: author } = await supabase
      .from('users')
      .select('notify_comments')
      .eq('id', post.author_id)
      .single();

    if (author?.notify_comments) {
      await supabase.from('notifications').insert({
        user_id: post.author_id,
        type: 'COMMENT',
        title: 'Nouveau commentaire',
        message: `${user.name} a commenté votre article "${post.title}"`,
        link: `/blog/${post.slug}`,
      });
    }
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/[slug]`);
}

// 3. Get Notifications
export async function getNotificationsAction() {
  const user = await getCurrentUser();
  if (!user) return [];

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('getNotificationsAction error:', error.message);
    return [];
  }

  return data ?? [];
}

// 4. Mark all as read
export async function markNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) return;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('markNotificationsReadAction error:', error.message);
  }

  revalidatePath('/blog');
}

// 5. Toggle settings
export async function toggleNotificationPreferenceAction(
  type: 'new_posts' | 'likes' | 'comments',
  value: boolean
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Non autorisé');
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const columnName = 
    type === 'new_posts' ? 'notify_new_posts' :
    type === 'likes' ? 'notify_likes' :
    'notify_comments';

  const { error } = await supabase
    .from('users')
    .update({ [columnName]: value })
    .eq('id', user.id);

  if (error) {
    throw new Error(`Impossible de mettre à jour les préférences : ${error.message}`);
  }

  // Also query user data again to see current settings
  const { data: updatedUser } = await supabase
    .from('users')
    .select('notify_new_posts, notify_likes, notify_comments')
    .eq('id', user.id)
    .single();

  return updatedUser;
}

// 6. Get User Notification settings
export async function getUserNotificationPreferencesAction() {
  const user = await getCurrentUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('users')
    .select('notify_new_posts, notify_likes, notify_comments')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('getUserNotificationPreferencesAction error:', error.message);
    return null;
  }

  return data;
}
