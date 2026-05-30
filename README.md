# Curl Cleaner

Strip browser noise from curl commands copied out of Chrome DevTools. Keeps the URL, auth, content type, body, and any non-browser headers — drops `Accept`, `Sec-Fetch-*`, `User-Agent`, `Origin`, and the rest.

Built with SvelteKit as a **fully static** site for [Cloudflare Pages](https://developers.cloudflare.com/pages/).

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output is in `build/`.

## Deploy to Cloudflare Pages

| Setting | Value |
|--------|--------|
| Framework preset | None (or SvelteKit if offered) |
| Build command | `npm run build` |
| Build output directory | `build` |

No Workers or server adapter required — this is static HTML/JS only.

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
