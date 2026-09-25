import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} AI Voice & Text Translator. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <Link href="/terms" className="hover:text-slate-200 transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/privacy" className="hover:text-slate-200 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};
