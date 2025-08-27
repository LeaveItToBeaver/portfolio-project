import { supabaseBrowser } from "@/lib/supabaseClient";
import type { PostModel } from "../Models/Post";

export async function listPostsByAuthor(authorId: string): Promise<PostModel[]> {
  const supa = supabaseBrowser();
  const { data, error } = await supa.from('posts').select('*').eq('author_id', authorId).order('created_at', { ascending: false });
  if(error) throw error;
  return data as PostModel[];
}

export async function createPost(input: Partial<PostModel>): Promise<PostModel> {
  const supa = supabaseBrowser();
  const { data, error } = await supa.from('posts').insert(input).select().single();
  if(error) throw error;
  return data as PostModel;
}

export async function togglePublish(id: string, published: boolean){
  const supa = supabaseBrowser();
  const { error } = await supa.from('posts').update({ published }).eq('id', id);
  if(error) throw error;
}
