import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export type VerifyEmailResult = 'success' | 'expired' | 'invalid';

export async function verifyEmailToken(token: string): Promise<VerifyEmailResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email_verification_expires')
    .eq('email_verification_token', token)
    .maybeSingle();

  if (error || !user) {
    return 'invalid';
  }

  if (user.email_verification_expires && new Date(user.email_verification_expires) < new Date()) {
    return 'expired';
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({
      email_verified: true,
      email_verification_token: null,
      email_verification_expires: null,
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('verifyEmailToken update error:', updateError.message);
    return 'invalid';
  }

  return 'success';
}