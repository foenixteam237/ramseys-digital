import Link from 'next/link';
import { verifyEmailToken } from '@/lib/email-verification';

export const dynamic = 'force-dynamic';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await verifyEmailToken(token) : 'invalid';

  const content = {
    success: {
      title: 'Email confirmé !',
      message: 'Votre adresse email a été validée avec succès. Vous pouvez maintenant vous connecter.',
    },
    expired: {
      title: 'Lien expiré',
      message: 'Ce lien de confirmation a expiré. Créez un nouveau compte ou contactez-nous pour renvoyer un lien.',
    },
    invalid: {
      title: 'Lien invalide',
      message: 'Ce lien de confirmation est invalide ou a déjà été utilisé.',
    },
  }[result];

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6 py-16">
      <div className="w-full rounded-2xl border border-rd-line bg-rd-graphite p-8 text-center shadow-2xl shadow-black/40">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-rd-red">Vérification</p>
        <h1 className="font-display text-2xl font-semibold text-white">{content.title}</h1>
        <p className="mt-3 text-sm text-white/70">{content.message}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-xl bg-rd-red px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Aller à la connexion
        </Link>
      </div>
    </main>
  );
}