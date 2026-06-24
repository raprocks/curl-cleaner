# Curl Cleaner

Strip browser noise from curl commands copied out of Chrome DevTools. Keeps the URL, auth, content type, body, and any non-browser headers — drops `Accept`, `Sec-Fetch-*`, `User-Agent`, `Origin`, and the rest.

Built with SvelteKit as a **fully static** site for [Cloudflare Pages](https://developers.cloudflare.com/pages/).

## Develop

```bash
pnpm install
pnpm run dev
```

## Build

```bash
pnpm run build
```

Output is in `build/`.

## Deploy to Cloudflare Pages

This project uses **adapter-static** (output in `build/`), not the SvelteKit Cloudflare Workers adapter.

**Live site:** https://curl-cleaner.rohitpatil.me

### Git integration (automatic)

Connected to **raprocks/curl-cleaner** on Cloudflare Pages. Pushes to `main` trigger production deploys; PRs get preview deployments.

Build settings (also in `wrangler.jsonc` as source of truth for output dir):

| Setting | Value |
|--------|--------|
| Build command | `pnpm install --frozen-lockfile && pnpm run build` |
| Build output directory | `build` |
| `NODE_VERSION` | `22` |

Do **not** use the SvelteKit framework preset — it points at `.svelte-kit/cloudflare` and will fail.

### Environment variables

Set these in Cloudflare Pages (Settings → Environment variables) and locally in `.env` (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `PUBLIC_SITE_URL` | Canonical URL for SEO, sitemap, and Open Graph (default: `https://curl-cleaner.rohitpatil.me`) |
| `PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID (e.g. `G-XXXXXXXXXX`) |

After deploy, submit `https://curl-cleaner.rohitpatil.me/sitemap.xml` in [Google Search Console](https://search.google.com/search-console).

### Wrangler CLI

```bash
pnpm install
pnpm exec wrangler login    # once
pnpm run cf:deploy          # manual build + deploy (direct upload)
pnpm run cf:preview         # local preview of the built site
```

`wrangler.jsonc` sets `pages_build_output_dir` to `build`.

> **Note:** Projects created with `wrangler pages deploy` only cannot add Git later. This repo uses a Git-connected Pages project created via the API.

## Settings

Open the gear icon to configure rules (saved in `localStorage`):

- **Keep Cookie** — retain `Cookie` header and `-b` / `--cookie` flags (on by default)
- **Strip X-\*** — remove custom `X-*` headers (on by default); use “Always keep” for exceptions like `x-api-key`
- **Compress output** — single-line curl with no `\` continuations or extra whitespace
- **Always strip / Always keep** — per-header allow and deny lists (keep wins)

## What gets removed (defaults)

- Browser headers: `Accept`, `Accept-Language`, `Origin`, `Referer`, `User-Agent`, `Sec-Fetch-*`, `sec-ch-ua*`, etc.
- `X-*` headers (unless listed under “Always keep”)
- Browser flags: `--compressed`, `-A`, `-e`, verbose/redirect flags

## What is kept (defaults)

- URL and non-GET method (`-X`)
- `Authorization`, `Cookie`, `Content-Type`, and other non-browser headers
- Request body (`--data-raw`, `--data`, `-d`)
- Basic auth (`-u`) and form uploads (`-F`) if present
