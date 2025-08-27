import PostCard from "../Components/PostCard";
import type { PostModel } from "../Data/Models/Post";

export default function BlogListView({ posts }:{ posts: PostModel[] }){
  return (
    <div className="grid gap-4">
      {posts.map(p => <PostCard key={p.id} post={p} />)}
    </div>
  );
}
