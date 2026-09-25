import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getSession } from '@/lib/auth';

export default async function PrivacyPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar user={session} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 pb-6 border-b border-slate-800">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-slate-400 mt-2">
            Last updated: September 2026
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              We collect information to provide and improve the translation workspace:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong className="text-slate-200">Account Data:</strong> Name, email address, and encrypted password provided during registration.</li>
              <li><strong className="text-slate-200">Input Data:</strong> Text input and audio recordings submitted for translation or speech-to-text processing.</li>
              <li><strong className="text-slate-200">Usage Data:</strong> Basic logs necessary for authentication and service reliability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p>
              Your text and audio inputs are processed solely to perform language identification, speech-to-text transcription, and translation requested by you. Account data is used to manage your session and access to the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Data Handling & Third-Party Processing</h2>
            <p>
              Text and audio inputs are sent securely to backend translation and speech processing services to fulfill your translation requests. We do not sell or monetize your personal data or input contents to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Account Security</h2>
            <p>
              We implement standard password hashing and HTTP-only session cookies to protect your account. While we strive to protect your personal information, no method of electronic transmission or storage is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Cookies</h2>
            <p>
              The Service uses essential session cookies required for authentication and keeping you logged into your workspace.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Any modifications will be posted on this page with an updated revision date.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-800">
            <Link
              href="/translator"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
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
