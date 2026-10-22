import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getSession } from '@/lib/auth';

export default async function PrivacyPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent)] selection:text-white transition-colors duration-150">
      <Navbar user={session} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Privacy Policy</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
            Last updated: September 2026
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          <section>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2.5">1. Information We Collect</h2>
            <p className="mb-3">
              We collect information to provide and improve the translation workspace:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[var(--text-secondary)]">
              <li><strong className="text-[var(--text-primary)]">Account Data:</strong> Name, email address, and encrypted password provided during registration.</li>
              <li><strong className="text-[var(--text-primary)]">Input Data:</strong> Text input and audio recordings submitted for translation or speech-to-text processing.</li>
              <li><strong className="text-[var(--text-primary)]">Usage Data:</strong> Basic logs necessary for authentication and service reliability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2.5">2. How We Use Your Information</h2>
            <p>
              Your text and audio inputs are processed solely to perform language identification, speech-to-text transcription, and translation requested by you. Account data is used to manage your session and access to the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2.5">3. Data Handling &amp; Processing</h2>
            <p>
              Text and audio inputs are sent securely to backend translation and speech processing services to fulfill your translation requests. We do not sell or monetize your personal data or input contents to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2.5">4. Account Security</h2>
            <p>
              We implement standard password hashing and HTTP-only session cookies to protect your account. While we strive to protect your personal information, no method of electronic transmission or storage is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2.5">5. Cookies</h2>
            <p>
              The Service uses essential session cookies required for authentication and keeping you logged into your workspace.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2.5">6. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Any modifications will be posted on this page with an updated revision date.
            </p>
          </section>

          <div className="pt-6 border-t border-[var(--border)]">
            <Link
              href="/translator"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              &larr; Back to Workspace
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
