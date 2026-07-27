"use server";

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/session';
import { createClient } from '@/utils/supabase/server';

// Bloque les caracteres de controle et les chevrons (anti-injection HTML).
const CONTROL_OR_ANGLE = new RegExp("[" + String.fromCharCode(0x00) + "-" + String.fromCharCode(0x1f) + "<>]");

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères.')
    .max(80)
    .refine((value) => !CONTROL_OR_ANGLE.test(value), 'Le nom contient des caractères non autorisés.'),
  email: z.string().trim().toLowerCase().email('Adresse email invalide.').max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((value) => value === '' || /^[+()\d\s.-]{6,30}$/.test(value), 'Numéro de téléphone invalide.')
    .optional(),
  avatarUrl: z.string().trim().max(500).optional(),
});

const combiningMarksPattern = new RegExp(
  '[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']',
  'g',
);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(combiningMarksPattern, '')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 120);

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();

  const payload = profileSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') ?? '',
    avatarUrl: formData.get('avatarUrl') ?? '',
  });

  if (!payload.success) {
    throw new Error(payload.error.issues[0]?.message ?? 'Formulaire invalide.');
  }

  const { name, email, phone, avatarUrl } = payload.data;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Empeche d'utiliser une adresse deja prise par un autre compte.
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .neq('id', user.id)
    .maybeSingle();

  if (existing) {
    throw new Error('Cette adresse email est déjà utilisée par un autre compte.');
  }

  const { error } = await supabase
    .from('users')
    .update({
      name,
      email,
      phone: phone || null,
      avatar_url: avatarUrl || null,
    })
    .eq('id', user.id);

  if (error) {
    throw new Error(`Impossible de mettre à jour le profil : ${error.message}`);
  }

  revalidatePath('/profile');
}

// Upload de la photo de profil : accessible a tout utilisateur connecte
// (contrairement a uploadImageAction reserve aux redacteurs).
export async function uploadAvatarAction(formData: FormData): Promise<{ url: string }> {
  const user = await requireUser();

  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Aucun fichier sélectionné.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('L’image ne doit pas dépasser 5 Mo.');
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const path = `avatars/${user.id}-${Date.now()}-${slugify(file.name)}`;

  const { error: uploadError } = await supabase.storage.from('media').upload(path, file, {
    contentType: file.type || undefined,
    upsert: true,
  });

  if (uploadError) {
    throw new Error(`Impossible d’envoyer l’image : ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(path);

  return { url: publicUrlData.publicUrl };
}