'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';

export default function BlogHeader() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-semibold">Dev Blog</h1>
        <p className="text-muted-foreground mt-1">Thoughts on software, technology, and building things.</p>
      </div>
      
      {user && (
        <Link
          href="/admin/new-post"
          className="flex items-center gap-2 rounded-xl bg-orange-400 text-black px-4 py-2 hover:bg-orange-500 transition-colors font-medium"
        >
          <span>✏️</span>
          <span>Write New Post</span>
        </Link>
      )}
    </div>
  );
}