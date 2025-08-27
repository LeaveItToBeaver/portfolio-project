# My Portfolio (Next.js + Supabase + TipTap)

## Quickstart

1. **Install deps**
   ```bash
   pnpm i   # or npm i / yarn
   ```

2. **Env**
   Copy `.env.example` to `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional, not used by app runtime)
   - `SUPABASE_BUCKET` (default `blog-media`)

3. **Tailwind**
   Already configured. Dark mode is default via `next-themes`.

4. **Supabase**
   - Create a project
   - Run `supabase.sql` in SQL editor
   - Create a public Storage bucket named `blog-media` with public read, authenticated write.
   - In Auth > Providers, enable Magic Link (Email).

5. **Run**
   ```bash
   npm run dev
   ```

6. **Create a post**
   Visit `/admin/new-post` (no auth gate yet in this starter), write with TipTap:
   - Add GIFs/images via the toolbar (uploads to Supabase Storage)
   - Add code blocks (JS/TS/Dart/JSON preloaded)

7. **Architecture (Feature-First)**
   ```
   features/
     Blog/
       Data/
         Models/
         Repositories/
       Services/
       Controllers/
       Components/
       Views/
   ```
   App routes import Views from each feature.

## Notes
- Gradients are used **sparingly** for select text (see `components/GradientText.tsx`) and some borders/shadows.
- Add auth gating for `/admin/*` via server components or middleware as a next step.
- Extend TipTap with more languages by registering them in the editor component.
