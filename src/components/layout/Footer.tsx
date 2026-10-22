import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[var(--surface)] border-t border-[var(--border)] py-5 mt-auto transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p className="text-[var(--text-secondary)]">
          © {new Date().getFullYear()} AI Voice &amp; Text Translator. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-[var(--text-secondary)]">
          <Link
            href="/terms"
            className="hover:text-[var(--text-primary)] transition-colors focus:outline-none focus-visible:underline"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hover:text-[var(--text-primary)] transition-colors focus:outline-none focus-visible:underline"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};
