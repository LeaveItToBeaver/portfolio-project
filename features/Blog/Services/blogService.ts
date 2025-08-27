import type { PostModel } from "../Data/Models/Post";

export function toExcerpt(contentJson: any, maxLen = 180): string {
  try {
    const text = JSON.stringify(contentJson)
      .replace(/\{[^{}]*\}/g,'')
      .replace(/[^\w\s.,:;!?-]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
    return text.slice(0, maxLen) + (text.length > maxLen ? "…" : "");
  } catch {
    return "";
  }
}

export function computePostPath(post: PostModel){
  return `/blog/${post.slug}`;
}
