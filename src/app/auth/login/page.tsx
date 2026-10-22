'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Languages, KeyRound, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials. Please try again.');
      }

      router.push('/translator');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[var(--accent)] selection:text-white relative transition-colors duration-150">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* App Logo */}
        <div className="flex justify-center">
          <Link
            href="/translator"
            className="w-11 h-11 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-sm text-white"
          >
            <Languages className="w-6 h-6" />
          </Link>
        </div>

        <h2 className="mt-5 text-center text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1 text-center text-xs text-[var(--text-secondary)]">
          Sign in to your AI Voice &amp; Text Translator workspace
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-[var(--surface)] border border-[var(--border)] py-8 px-5 shadow-sm rounded-xl sm:px-10 transition-colors duration-150">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[var(--error-subtle)] border border-[var(--error)]/20 text-[var(--error)] flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-[var(--accent)] hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="font-semibold text-[var(--accent)] hover:underline transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
