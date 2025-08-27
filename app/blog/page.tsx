import Container from "@/components/Container";
import BlogListView from "@/features/Blog/Views/BlogListView";
import { listPublishedPosts } from "@/features/Blog/Data/Repositories/postRepo";
import BlogHeader from "@/features/Blog/Components/BlogHeader";

export const dynamic = "force-dynamic";

export default async function BlogPage(){
  const posts = await listPublishedPosts();
  return (
    <Container>
      <BlogHeader />
      <BlogListView posts={posts} />
    </Container>
  )
}
