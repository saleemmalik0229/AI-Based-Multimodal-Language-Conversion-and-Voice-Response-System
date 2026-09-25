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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar user={session} />
      <main className="flex-1 flex flex-col">
        <TranslatorWorkspace />
      </main>
      <Footer />
    </div>
  );
}

