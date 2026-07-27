import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/session';
import { createClient } from '@/utils/supabase/server';
import ProfileForm from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from('users')
    .select('name, email, phone, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-rd-deep px-6 pb-24 pt-28 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-rd-red">Mon compte</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Modifier mon profil</h1>
        <p className="mt-2 text-sm text-white/60">
          Mettez à jour votre photo, votre nom, votre adresse email et votre numéro de téléphone.
        </p>

        <div className="mt-8">
          <ProfileForm
            initialName={data?.name ?? user.name ?? ''}
            initialEmail={data?.email ?? user.email ?? ''}
            initialPhone={data?.phone ?? ''}
            initialAvatarUrl={data?.avatar_url ?? ''}
          />
        </div>
      </div>
    </main>
  );
}