import Link from "next/link";
import type { PostModel } from "../Data/Models/Post";
import { computePostPath } from "../Services/blogService";

export default function PostCard({ post }: { post: PostModel }) {
  return (
    <Link href={computePostPath(post)} className="block rounded-2xl border p-6 hover:bg-white/5 transition-colors group">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold group-hover:text-foreground/80 transition-colors">{post.title}</h3>
          {post.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{post.excerpt}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
        <time dateTime={post.created_at}>
          {new Date(post.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </time>
        <span>•</span>
        <span>Read more →</span>
      </div>
    </Link>
  );
}
