import type { PostModel } from "../Data/Models/Post";

export function ensureSlug(s: string){
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

export function excerptFromContent(doc: any, maxLen=200){
  try { 
    const text = JSON.stringify(doc).replace(/\W+/g,' ').trim();
    return text.slice(0,maxLen) + (text.length>maxLen?'…':''); 
  } catch { return ''; }
}
