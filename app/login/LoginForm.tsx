"use client";

import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { signUpAction } from './auth-actions';

export default function LoginForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isLogin) {
      // LOGIN
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setLoading(false);
        setError('Identifiants invalides. Vérifiez votre email et votre mot de passe.');
        return;
      }

      // Check role to redirect
      const session = await getSession();
      setLoading(false);

      if (session?.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/blog');
      }
      router.refresh();
    } else {
      // SIGN UP
      if (password !== confirmPassword) {
        setLoading(false);
        setError('Les mots de passe ne correspondent pas.');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);

        await signUpAction(formData);
        setSuccess('Compte créé avec succès ! Connexion automatique...');

        // Auto login after sign up
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        setLoading(false);

        if (result?.error) {
          setError('Compte créé mais connexion automatique échouée. Veuillez vous connecter manuellement.');
          setIsLogin(true);
          return;
        }

        router.push('/blog');
        router.refresh();
      } catch (err) {
        setLoading(false);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      }
    }
  }

  return (
    <div className="mt-6">
      {/* Tabs */}
      <div className="mb-6 flex border-b border-rd-line">
        <button
          type="button"
          onClick={() => {
            setIsLogin(true);
            setError('');
          }}
          className={`flex-1 py-3 text-center text-sm font-semibold transition-colors ${
            isLogin
              ? 'border-b-2 border-rd-red text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Se connecter
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(false);
            setError('');
          }}
          className={`flex-1 py-3 text-center text-sm font-semibold transition-colors ${
            !isLogin
              ? 'border-b-2 border-rd-red text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Créer un compte
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name (Registration Only) */}
        {!isLogin ? (
          <label className="block text-sm text-white/80">
            <span className="mb-2 block font-medium">Nom complet</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-rd-line bg-rd-deep px-4 py-3 text-white outline-none ring-0 focus:border-rd-red/60 transition-colors"
              placeholder="Ex: Jean Dupont"
              required
            />
          </label>
        ) : null}

        {/* Email */}
        <label className="block text-sm text-white/80">
          <span className="mb-2 block font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-rd-line bg-rd-deep px-4 py-3 text-white outline-none ring-0 focus:border-rd-red/60 transition-colors"
            placeholder="Ex: jean@exemple.com"
            required
          />
        </label>

        {/* Password */}
        <label className="block text-sm text-white/80">
          <span className="mb-2 block font-medium">Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-rd-line bg-rd-deep px-4 py-3 text-white outline-none ring-0 focus:border-rd-red/60 transition-colors"
            placeholder="••••••••"
            required
          />
        </label>

        {/* Confirm Password (Registration Only) */}
        {!isLogin ? (
          <label className="block text-sm text-white/80">
            <span className="mb-2 block font-medium">Confirmer le mot de passe</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-rd-line bg-rd-deep px-4 py-3 text-white outline-none ring-0 focus:border-rd-red/60 transition-colors"
              placeholder="••••••••"
              required
            />
          </label>
        ) : null}

        {/* Status Messages */}
        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        ) : null}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-rd-red px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading 
            ? (isLogin ? 'Connexion…' : 'Inscription…') 
            : (isLogin ? 'Se connecter' : 'S’inscrire')
          }
        </button>
      </form>
    </div>
  );
}