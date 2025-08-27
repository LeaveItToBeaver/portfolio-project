'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';
import Container from '@/components/Container';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = supabaseBrowser();
        
        // Get the auth code from URL parameters
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus('error');
          setMessage(error.message);
          return;
        }

        if (data.session) {
          setStatus('success');
          setMessage('Successfully signed in! Redirecting...');
          
          // Redirect after a brief delay
          setTimeout(() => {
            router.push('/blog');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('No session found. Please try signing in again.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    handleAuthCallback();
  }, [router]);

  if (status === 'loading') {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
            <h1 className="text-2xl font-semibold mb-2">Confirming your email...</h1>
            <p className="text-muted-foreground">Please wait while we sign you in.</p>
          </div>
        </div>
      </Container>
    );
  }

  if (status === 'success') {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-4xl">✅</div>
            <h1 className="text-2xl font-semibold mb-2">Welcome back!</h1>
            <p className="text-muted-foreground">{message}</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">❌</div>
          <h1 className="text-2xl font-semibold mb-2">Authentication Error</h1>
          <p className="text-muted-foreground mb-4">{message}</p>
          <button
            onClick={() => router.push('/auth/sign-in')}
            className="rounded-xl border px-4 py-2 hover:bg-white/5 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </Container>
  );
}