import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === 'ADMIN') {
      redirect('/admin');
    } else {
      redirect('/blog');
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6 py-16">
      <div className="w-full rounded-2xl border border-rd-line bg-rd-graphite p-8 shadow-2xl shadow-black/40">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-rd-red">Connexion</p>
        <h1 className="font-display text-3xl font-semibold">Accédez au blog Ramseys Digital</h1>
        <p className="mt-3 text-sm text-white/70">Connectez-vous pour aimer, partager et commenter les articles.</p>
        <LoginForm />
      </div>
    </main>
  );
}
