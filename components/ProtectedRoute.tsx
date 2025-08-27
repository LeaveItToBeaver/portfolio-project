'use client';
import { useAuth } from '@/lib/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingText?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/sign-in',
  loadingText = 'Checking authentication...'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">{loadingText}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need to be signed in to access this page.</p>
          <a 
            href={redirectTo}
            className="rounded-xl border px-4 py-2 hover:bg-white/5 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}