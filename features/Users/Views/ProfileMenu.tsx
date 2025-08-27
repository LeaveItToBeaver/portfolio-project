'use client';
import { useAuth } from "@/lib/AuthProvider";
import Link from "next/link";

export default function ProfileMenu(){
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div className="rounded-xl border px-3 py-1 text-sm opacity-50">Loading...</div>;
  }

  if(!user){
    return (
      <Link href="/auth/sign-in" className="rounded-xl border px-3 py-1 text-sm hover:bg-white/5 transition-colors">
        Sign in
      </Link>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{user.email}</span>
      <button 
        onClick={signOut} 
        className="rounded-xl border px-3 py-1 text-sm hover:bg-white/5 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
