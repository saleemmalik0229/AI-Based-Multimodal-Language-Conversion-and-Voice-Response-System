import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Voice & Text Translator',
  description: 'Translate text or voice naturally across five supported languages: English, Telugu, Hindi, Tamil, and Malayalam.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var t = localStorage.getItem('theme-preference') || 'system';
                var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (dark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] antialiased transition-colors duration-150">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
