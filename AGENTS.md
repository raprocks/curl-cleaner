# Agent guide

Steps to follow on every change in this repo.

## Every change

1. Use **pnpm** (not npm/yarn). Run commands from the repo root.
2. After editing code, run:
   ```bash
   pnpm run check
   pnpm run build
   ```
3. Keep diffs small. Prefer stdlib and existing patterns over new dependencies.
4. Core curl logic lives in `src/lib/curl-cleaner.ts`. UI is SvelteKit under `src/routes/`.
5. Do not commit secrets (`.env` with real keys). Production defaults live in `.env.production`.
6. Only create git commits or PRs when the user explicitly asks.

## Every release

When shipping user-visible fixes or features, update version and changelog **in the same PR/commit** as the code change.

1. **Bump `package.json`** — increment semver (`patch` for fixes, `minor` for features).
2. **Add a release block** at the top of `src/lib/changelog.ts`:
   - `version` must match `package.json`
   - `date` is the release date (`YYYY-MM-DD`)
   - `changes` is a short bullet list of what shipped (fixes, features, infra)
3. **Verify** the header badge picks up the new version (it reads from `package.json` via `src/lib/changelog.ts`).
4. Run `pnpm run check` and `pnpm run build`.
5. Merge to `main` — Cloudflare Pages deploys automatically from Git.

Example changelog entry:

```ts
{
  version: '0.1.1',
  date: '2026-06-27',
  changes: [
    'Fix something specific',
    'Add something user-visible'
  ]
}
```

## New routes

If you add a prerendered page (like `/changelog`):

1. Create `src/routes/<path>/+page.svelte`.
2. Add the URL to `src/routes/sitemap.xml/+server.ts`.
3. Use `SeoHead` with the correct `path` prop when the page needs its own canonical URL.

## Deploy

- **Automatic:** push to `main` → Cloudflare Pages builds with `pnpm install --frozen-lockfile && pnpm run build`, output `build/`.
- **Manual:** `pnpm run cf:deploy` (requires `wrangler login`).
- Build env vars: `PUBLIC_SITE_URL`, `PUBLIC_GA_MEASUREMENT_ID` (see README).
