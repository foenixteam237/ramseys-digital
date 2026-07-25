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
  const [showPassword, setShowPassword] = useState(false);

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
        if (result.error.includes('EMAIL_NOT_VERIFIED')) {
          setError('Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception.');
        } else if (result.error.includes('ACCOUNT_DISABLED')) {
          setError('Votre compte a été désactivé. Contactez un administrateur.');
        } else {
          setError('Identifiants invalides. Vérifiez votre email et votre mot de passe.');
        }
        return;
      }

      // Check role to redirect
      const session = await getSession();
      setLoading(false);

      if (session?.user?.role === 'ADMIN' || session?.user?.role === 'EDITOR') {
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
        setLoading(false);
        setSuccess('Compte créé ! Consultez votre boîte mail pour confirmer votre adresse avant de vous connecter.');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
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
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-rd-line bg-rd-deep px-4 py-3 pr-12 text-white outline-none ring-0 focus:border-rd-red/60 transition-colors"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/50 hover:text-white"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                  <path d="M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4 10 7a12 12 0 0 1-2.4 3.4M6.1 6.1A12 12 0 0 0 2 12c1 3 5 7 10 7a9.7 9.7 0 0 0 4-.9" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </label>

        {/* Confirm Password (Registration Only) */}
        {!isLogin ? (
          <label className="block text-sm text-white/80">
            <span className="mb-2 block font-medium">Confirmer le mot de passe</span>
            <input
              type={showPassword ? 'text' : 'password'}
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