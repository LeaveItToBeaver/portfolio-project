# Porting from SvelteKit to Next.js (Feature-first)

This project integrates logic from your old Svelte project:
- `UserStore` → `features/Users` (repo + simple view)
- `PostStore` → `features/Posts`
- `LikeStore` → `features/Reactions`

**What changed**
- Moved global Svelte writable stores into explicit **Repositories** that call Supabase in a controlled way.
- **Services** provide deterministic helpers (slug generation, excerpt, derived fields).
- UI reads data via Views/Components that call repositories on the client or your server actions.

**Next steps to complete parity**
- Add `comments` feature (table + repo + view) if desired.
- Add real profile table (`profiles`) and surface `display_name`, `avatar_url`.
- Query whether current user liked a post and show initial `liked` state in `LikeButton`.
- Gate `/admin/*` behind auth and role checks.
