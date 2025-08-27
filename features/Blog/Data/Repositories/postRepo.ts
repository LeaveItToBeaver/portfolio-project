import { supabaseBrowser } from "@/lib/supabaseClient";
import type { PostModel } from "../Models/Post";

export async function listPublishedPosts(): Promise<PostModel[]> {
  const client = supabaseBrowser();
  const { data, error } = await client
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as PostModel[];
}

export async function getPostBySlug(slug: string): Promise<PostModel | null> {
  const client = supabaseBrowser();
  const { data, error } = await client
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return null;
  return data as PostModel | null;
}
