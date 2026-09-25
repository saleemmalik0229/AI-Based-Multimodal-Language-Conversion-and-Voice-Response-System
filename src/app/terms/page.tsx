import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getSession } from '@/lib/auth';

export default async function TermsPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar user={session} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 pb-6 border-b border-slate-800">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms of Service</h1>
          <p className="text-sm text-slate-400 mt-2">
            Last updated: September 2026
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using AI Voice & Text Translator (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Description of Service</h2>
            <p>
              AI Voice & Text Translator provides real-time text translation and voice transcription capabilities across supported languages including English, Telugu, Hindi, Tamil, and Malayalam. The Service is provided &quot;as is&quot; for communication and translation purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. User Accounts & Responsibilities</h2>
            <p className="mb-3">
              To use certain features of the Service, you may be required to register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            <p>
              You agree not to use the Service for any unlawful activities, to transmit harmful content, or to attempt to reverse engineer or interfere with the operation of the application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Intellectual Property & Translations</h2>
            <p>
              You retain ownership of the original text and audio input submitted to the Service. The Service grants you a non-exclusive license to use the generated translations for personal or professional use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Disclaimer of Warranties</h2>
            <p>
              Automated machine translations and speech recognition may not always be 100% accurate. The Service is provided without warranties of any kind, whether express or implied, regarding accuracy, reliability, or availability.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Limitation of Liability</h2>
            <p>
              In no event shall the operators of AI Voice & Text Translator be liable for any indirect, incidental, or consequential damages arising out of your use or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Modifications to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Continued use of the Service following any changes constitutes acceptance of the revised Terms of Service.
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
