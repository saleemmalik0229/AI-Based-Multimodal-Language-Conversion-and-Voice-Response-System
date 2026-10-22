'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Languages, LogOut, User, ChevronDown, Check } from 'lucide-react';
import { UserSession } from '@/types';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface NavbarProps {
  user?: UserSession | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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
    <header className="sticky top-0 z-50 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/translator"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg p-1 -ml-1 transition-all"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white shadow-sm group-hover:bg-[var(--accent-hover)] transition-colors">
            <Languages className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm sm:text-base text-[var(--text-primary)] tracking-tight leading-tight">
              AI Voice &amp; Text Translator
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] font-normal leading-tight">
              Five Languages Supported
            </span>
          </div>
        </Link>

        {/* Right side controls: Theme Toggle & Account */}
        <div className="flex items-center gap-3">
          {/* Theme Selector */}
          <ThemeToggle />

          {/* User Account Controls */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] transition-all text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label="User account menu"
                aria-expanded={isMenuOpen}
              >
                <div className="w-5 h-5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold text-[11px]">
                  {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <span className="max-w-[120px] sm:max-w-[160px] truncate text-[var(--text-primary)] hidden sm:inline">
                  {user.name || user.email}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200 ${
                    isMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Account Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                    <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Signed in as
                    </p>
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate mt-0.5">
                      {user.email}
                    </p>
                    {user.name && (
                      <p className="text-[11px] text-[var(--text-secondary)] truncate">
                        {user.name}
                      </p>
                    )}
                  </div>

                  <div className="px-3 py-1.5 text-xs text-[var(--text-secondary)] flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Account Active</span>
                    </span>
                    <Check className="w-3 h-3 text-[var(--success)]" />
                  </div>

                  <div className="pt-1 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--error)] hover:bg-[var(--error-subtle)] rounded-lg transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
