import { supabaseBrowser } from "@/lib/supabaseClient";
import type { UserModel } from "../Models/User";

export async function getCurrentUser(): Promise<UserModel | null> {
  const supa = supabaseBrowser();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? null } as UserModel;
}

export async function signOut() {
  const supa = supabaseBrowser();
  await supa.auth.signOut();
}

export async function updateDisplayName(name: string) {
  // TODO: implement profile table upsert
  return { ok: true };
}
