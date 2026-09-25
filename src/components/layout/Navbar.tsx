'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Languages, LogOut, User, ChevronDown } from 'lucide-react';
import { UserSession } from '@/types';

interface NavbarProps {
  user?: UserSession | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/auth/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Product Brand */}
        <Link href="/translator" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:bg-blue-500 transition-colors">
            <Languages className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-slate-100 tracking-tight">
              AI Voice & Text Translator
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Five Languages Supported
            </span>
          </div>
        </Link>

        {/* User Account Controls */}
        {user ? (
          <div className="relative flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all text-sm font-medium"
              aria-label="User Account Menu"
              aria-expanded={isMenuOpen}
            >
              <div className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <span className="max-w-[140px] truncate text-slate-200 text-xs">
                {user.name || user.email}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-xl p-2 z-20 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                    <p className="text-[11px] font-medium text-slate-400">Signed in as</p>
                    <p className="text-xs font-semibold text-slate-200 truncate">{user.email}</p>
                  </div>

                  <div className="px-3 py-1.5 text-xs text-slate-400 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Account Active</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {isLoggingOut ? 'Logging out...' : 'Log out'}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
