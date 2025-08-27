import { supabaseBrowser } from "@/lib/supabaseClient";
import type { LikeModel } from "../Models/Like";

export async function likePost(postId: string){
  const supa = supabaseBrowser();
  const { data: { user } } = await supa.auth.getUser();
  if(!user) throw new Error('Not signed in');
  const { error } = await supa.from('likes').insert({ post_id: postId, user_id: user.id });
  if(error) throw error;
}

export async function unlikePost(postId: string){
  const supa = supabaseBrowser();
  const { data: { user } } = await supa.auth.getUser();
  if(!user) throw new Error('Not signed in');
  const { error } = await supa.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
  if(error) throw error;
}

export async function countLikes(postId: string){
  const supa = supabaseBrowser();
  const { count, error } = await supa.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
  if(error) throw error;
  return count || 0;
}
