'use client';

import Container from "@/components/Container";
import ProtectedRoute from "@/components/ProtectedRoute";
import Editor from "@/features/Blog/Components/Editor";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function NewPostPage(){
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [doc, setDoc] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function save(){
    setSaving(true);
    try{
      const supa = supabaseBrowser();
      const { data, error } = await supa.from('posts').insert({
        title, slug, content_json: doc, published: true
      }).select().single();
      if(error) throw error;
      alert('Saved!');
      window.location.href = `/blog/${data.slug}`;
    }catch(e:any){
      alert(e.message);
    }finally{
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-2">Create New Post</h1>
          <p className="text-muted-foreground mb-8">Write and publish a new blog post.</p>
          
          <div className="grid gap-6">
            <div className="grid gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
                <input 
                  id="title"
                  type="text"
                  value={title} 
                  onChange={e=>setTitle(e.target.value)} 
                  placeholder="Enter post title" 
                  className="w-full rounded-xl border px-4 py-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20" 
                />
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-sm font-medium mb-2">URL Slug</label>
                <input 
                  id="slug"
                  type="text"
                  value={slug} 
                  onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))} 
                  placeholder="url-friendly-slug" 
                  className="w-full rounded-xl border px-4 py-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20" 
                />
                <p className="text-xs text-muted-foreground mt-1">This will be the URL for your post: /blog/{slug || 'your-slug'}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <Editor onChange={setDoc} />
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => window.history.back()} 
                className="rounded-xl border px-6 py-3 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={save} 
                disabled={saving || !title.trim() || !slug.trim()} 
                className="rounded-xl bg-foreground text-background px-6 py-3 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </ProtectedRoute>
  )
}
