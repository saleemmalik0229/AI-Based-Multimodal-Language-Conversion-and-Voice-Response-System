'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Languages, Mail, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[var(--accent)] selection:text-white relative transition-colors duration-150">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <Link
            href="/translator"
            className="w-11 h-11 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-sm text-white"
          >
            <Languages className="w-6 h-6" />
          </Link>
        </div>

        <h2 className="mt-5 text-center text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Reset password
        </h2>
        <p className="mt-1 text-center text-xs text-[var(--text-secondary)]">
          Enter your email to receive password recovery instructions
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-[var(--surface)] border border-[var(--border)] py-8 px-5 shadow-sm rounded-xl sm:px-10 transition-colors duration-150">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-11 h-11 rounded-full bg-[var(--success-subtle)] border border-[var(--success)]/20 text-[var(--success)] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Recovery Instructions Sent</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
                If an account exists for <span className="text-[var(--accent)] font-medium">{email}</span>, password reset instructions have been sent.
              </p>
              <div className="pt-3">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-lg bg-[var(--error-subtle)] border border-[var(--error)]/20 text-[var(--error)] flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                  Registered Email Address
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

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending instructions...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
