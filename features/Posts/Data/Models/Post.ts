export type PostModel = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content_json: any;
  cover_url?: string | null;
  author_id?: string | null;
  published: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};
