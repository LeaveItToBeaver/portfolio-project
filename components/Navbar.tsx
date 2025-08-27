'use client';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import ProfileMenu from '@/features/Users/Views/ProfileMenu';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">jasonbeaver<span className="text-sm text-muted-foreground">.dev</span></Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/blog">Blog</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/about">Work History</Link>
          {user && (
            <Link 
              href="/admin/new-post"
              className="rounded-xl bg-orange-400 text-black px-3 py-1 hover:bg-orange-500 transition-colors font-medium"
            >
              ✏️ New Post
            </Link>
          )}
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme((theme === 'dark' ? 'light' : 'dark'))}
            className="rounded-xl border px-3 py-1 hover:bg-white/5"
          >
            {mounted ? (theme === 'dark' ? 'Light' : 'Dark') : '…'}
          </button>
          <ProfileMenu />
        </nav>
      </div>
    </header>
  );
}
