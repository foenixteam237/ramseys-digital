"use server";

import { randomBytes } from 'crypto';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { sendEmail, buildVerificationEmail, getSiteUrl } from '@/lib/email';

const signUpSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  email: z.string().email('Format d’email invalide.'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
});

export async function signUpAction(formData: FormData) {
  const payload = signUpSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!payload.success) {
    const errors = payload.error.issues.map((issue) => issue.message).join(' ');
    throw new Error(errors);
  }

  const { name, email, password } = payload.data;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check if user already exists
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Erreur lors de la vérification de l’email : ${checkError.message}`);
  }

  if (existingUser) {
    throw new Error('Un utilisateur avec cet email existe déjà.');
  }

  // Hash password
  const passwordHash = await hash(password, 10);

  // Generate an email verification token (valid 24h)
  const verificationToken = randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Insert user
  const { error: insertError } = await supabase
    .from('users')
    .insert({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: 'VISITOR',
      email_verified: false,
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires,
    });

  if (insertError) {
    throw new Error(`Erreur lors de la création du compte : ${insertError.message}`);
  }

  const verifyUrl = `${getSiteUrl()}/verify-email?token=${verificationToken}`;
  const { subject, html } = buildVerificationEmail(verifyUrl);
  await sendEmail({ to: email, subject, html });

  return { success: true };
}