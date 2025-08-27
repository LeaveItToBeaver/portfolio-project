'use client';

import Container from "@/components/Container";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SignInPage(){
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/blog');
    }
  }, [user, router]);

  async function sendMagic(){
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const supa = supabaseBrowser();
      const { error } = await supa.auth.signInWithOtp({ 
        email, 
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` } 
      });
      
      if(error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      sendMagic();
    }
  };

  return (
    <Container>
      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-3xl font-semibold mb-2">Sign in</h1>
        <p className="text-muted-foreground mb-8">Get a magic link sent to your email to sign in to your account.</p>
        
        {sent ? (
          <div className="rounded-2xl border p-6 text-center">
            <div className="mb-4 text-4xl">📧</div>
            <h2 className="text-xl font-semibold mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-4">We've sent a magic link to <strong>{email}</strong></p>
            <button 
              onClick={() => {setSent(false); setEmail(''); setError('');}}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            <div>
              <input 
                type="email"
                value={email} 
                onChange={e => {setEmail(e.target.value); setError('');}}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com" 
                className="w-full rounded-xl border px-4 py-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20" 
                disabled={loading}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            
            <button 
              onClick={sendMagic} 
              disabled={loading || !email.trim()}
              className="rounded-xl border px-4 py-3 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
            
            <p className="text-xs text-muted-foreground text-center">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        )}
      </div>
    </Container>
  )
}
