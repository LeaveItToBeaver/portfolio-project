export type PostModel = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content_json: any;
  cover_url?: string | null;
  created_at: string;
  updated_at: string;
  author_id: string;
  published: boolean;
}
