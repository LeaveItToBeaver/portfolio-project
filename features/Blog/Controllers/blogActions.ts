'use server';

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function uploadImage(formData: FormData){
  const file = formData.get('file') as File | null;
  if(!file) return { error: 'No file' };
  const bucket = process.env.SUPABASE_BUCKET || 'blog-media';

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );

  const filePath = `uploads/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) return { error: error.message };

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return { url: publicUrl.publicUrl };
}
