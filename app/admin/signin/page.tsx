'use client';

import { useId, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { hashPasswordForTransport } from '@/lib/auth/hash';

export default function AdminSignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/';

  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Enter your editorial credentials.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn('internal-credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password: hashPasswordForTransport(password),
      });

      if (result?.error) {
        setError(
          result.error === 'CredentialsSignin'
            ? 'Incorrect editorial credentials.'
            : result.error,
        );
        return;
      }

      if (result?.ok) {
        router.replace(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fcf9f8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-serif text-[32px] tracking-tight uppercase text-primary">
            FORM &amp; FIELD
          </h1>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary mt-2">
            Editorial CMS &amp; Architecture Dispatch
          </p>
        </div>

        <div className="bg-white border border-border-subtle p-8 shadow-sm">
          <h2 className="font-serif text-[22px] text-primary mb-1">
            Editorial Desk Sign In
          </h2>
          <p className="font-sans text-[13px] text-secondary mb-6">
            Restricted to editorial, curatorial, and operations staff.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 text-red-700 text-[13px]"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor={emailId}
                className="block font-sans text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5"
              >
                Editorial Email
              </label>
              <input
                id={emailId}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                placeholder="name@formandfield.com"
                className="w-full px-3 py-2.5 bg-[#fcf9f8] border border-border-subtle font-sans text-[14px] focus:outline-none focus:border-[#0b1f3a] disabled:opacity-60"
              />
            </div>
            <div>
              <label
                htmlFor={passwordId}
                className="block font-sans text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5"
              >
                Password
              </label>
              <input
                id={passwordId}
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-[#fcf9f8] border border-border-subtle font-sans text-[14px] focus:outline-none focus:border-[#0b1f3a] disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0b1f3a] hover:bg-[#000615] text-white font-sans text-[12px] uppercase tracking-[0.16em] font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating…' : 'Access Editorial Desk'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}