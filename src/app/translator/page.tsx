import React from 'react';
import { getSession } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TranslatorWorkspace } from '@/components/translator/TranslatorWorkspace';
import { redirect } from 'next/navigation';

export default async function TranslatorPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent)] selection:text-white transition-colors duration-150">
      <Navbar user={session} />
      <main className="flex-1 flex flex-col">
        <TranslatorWorkspace />
      </main>
      <Footer />
    </div>
  );
}
