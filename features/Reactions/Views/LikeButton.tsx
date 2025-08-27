'use client';
import { useEffect, useState } from "react";
import { likePost, unlikePost, countLikes } from "../Data/Repositories/likeRepo";

export default function LikeButton({ postId }:{ postId: string }){
  const [count, setCount] = useState<number>(0);
  const [liked, setLiked] = useState(false); // TODO: query whether current user liked

  useEffect(()=>{ countLikes(postId).then(setCount).catch(()=>{}); },[postId]);

  async function toggle(){
    try {
      if(liked){ await unlikePost(postId); setLiked(false); setCount(c=>Math.max(0,c-1)); }
      else { await likePost(postId); setLiked(true); setCount(c=>c+1); }
    } catch(e:any){
      alert(e.message || 'Failed');
    }
  }

  return (
    <button onClick={toggle} className={"rounded-xl border px-3 py-1 text-sm " + (liked?'bg-white/5':'')}>
      ♥ {count}
    </button>
  );
}
