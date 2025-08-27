import Container from "@/components/Container";
import { getPostBySlug } from "@/features/Blog/Data/Repositories/postRepo";
import BlogDetailView from "@/features/Blog/Views/BlogDetailView";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }:{ params:{ slug: string } }){
  const post = await getPostBySlug(params.slug);
  if(!post) return <Container><p>Post not found.</p></Container>;
  return (
    <Container>
      <h1 className="text-3xl font-semibold mb-4">{post.title}</h1>
      <BlogDetailView content={post.content_json} />
    </Container>
  )
}
