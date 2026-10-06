# STRATEGY.md — Addis Eats rendering strategies

Every route in this app picks a rendering strategy on purpose. This file lists
each route, the strategy Next.js uses for it, the config that produces that
strategy, and the reason.

Stack: **Next.js 16.3.8** (App Router, Turbopack build) + React 19.

```bash
npm run dev       # local dev
npm run build     # production build (prints the strategy table below)
npm run start     # serve the build
npm run measure   # First Load JS of a prerendered route (see BOUNDARY.md)
```

## Data layer

The menu is the capstone menu: `public/menu.json` — 20 dishes, Ethiopian
restaurant, prices in ETB, Amharic names, spice levels, fasting flags,
ingredients. No images are used anywhere in the menu (the capstone's
`ImgBox` photo placeholders were dropped).

`src/data/dishes.js` is a **server-only** module: it reads that file with
`fs` and normalises it (raw `category` string → app category key, exactly the
`CAT_MAP` logic from the capstone's `src/api.js`). It exports:

- `DISHES` — 20 normalised dishes
- `CATEGORIES` — the capstone's 7 filter categories (`all`, `wat`, `tibs`,
  `fasting`, `bites`, `drinks`, `extras`) with labels
- `getDishes()` — async, artificial **800 ms** delay (simulated API)
- `getDishesByCategory()`, `getDishBySlug()`, `getCategoryBySlug()`,
  `getCategoryCounts()`, `slugify()`, `fmt()`

Because only server components import it, `node:fs` never reaches a client
bundle — verify with:

```bash
grep -rl "Classic Doro Wat" .next/static/chunks/    # → none
```

## Route table

| Route              | File                          | Strategy                    | Config that produces it                    | Why                                                                                                                                          |
| ------------------ | ----------------------------- | --------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                | `src/app/page.jsx`            | Static (prerendered)        | none — static is the default                | Welcome copy only. No data, no cookies, no search params.                                                                                    |
| `/menu`            | `src/app/menu/page.js`        | **ISR** — static + hourly refresh | `export const revalidate = 3600`       | An `async` server component that `await`s `getDishes()` (800 ms). Prerender once at build, regenerate every hour instead of per request.       |
| `/menu/loading.js` | `src/app/menu/loading.js`     | Streaming Suspense fallback | `loading.js` file convention                | While the segment streams (dev, on-demand render), the visitor sees dish skeletons. Applies to `/menu` **and** every route below it.         |
| `/menu/CategoryBar.jsx` | client leaf              | —                           | `"use client"`                             | The brief's FilterShell: renders only server `children`, so it is a client seam with no markup of its own. Everything else in the segment stays server. |
| `/menu/[id]`       | `src/app/menu/[id]/page.jsx`  | **SSG** — 26 pages at build | `generateStaticParams()` + `dynamicParams = false` | 20 dish slugs + 6 category slugs = 26 static pages. Unknown slugs never reach the server: Next serves 404 (`/menu/pizza` → 404). No `revalidate`, so they are frozen at build time. |
| `/menu` layout     | `src/app/menu/layout.jsx`     | Static                      | no dynamic APIs                            | Only segment metadata now — the old category sidebar was removed by request, so `children` render full-width.                                 |
| `/cart`            | `src/app/cart/page.jsx`       | Static shell + client subtree | none                                       | The page holds no copy at all; cart contents live in browser memory (`CartContext`) and the client `CartList` renders only when the cart has items. |
| `/checkout`        | `src/app/checkout/page.jsx`   | **Forced dynamic**          | `export const dynamic = "force-dynamic"` + `await cookies()` | Reads `addis_eats_session` per request. `cookies()` is a dynamic API and `force-dynamic` makes the intent explicit.                           |

Build output confirms the strategies:

```
Route (app)                 Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ○ /cart
├ ƒ /checkout
├ ○ /menu                           1h      1y
└   /menu/[id]
  ├ ● /menu/doro-wat
  ├ ● /menu/siga-wat
  └ ● [+23 more paths]

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic) server-rendered on demand
```

## Why category pages use path segments, not query params

`/menu/[id]` serves each category as its own static page (`/menu/wat`,
`/menu/tibs`, `/menu/fasting` …) instead of `/menu?cat=wat`.

- Reading `searchParams` is a dynamic API: it opts the route out of static
  generation and ISR. `?cat=` on `/menu` would silently kill
  `revalidate = 3600`.
- Category keys can be listed in `generateStaticParams()`, so each category is
  its own prerendered page that inherits `dynamicParams = false` — bad slugs
  404 for free.
- Static URLs are cacheable, shareable, and work with JS disabled.

The category key **is** the URL segment, so route params and `data-category`
attributes come from one source (`CATEGORIES`).

## The 800 ms delay

`getDishes()` sleeps 800 ms on purpose, to show what each strategy does with
latency:

- `/menu` (ISR): the delay runs **once at build** and once per hourly
  revalidation — visitors never wait for it.
- `/menu/loading.js`: in `next dev` the delay is what makes the skeleton
  visible in the streamed HTML.
- `/menu/[id]`: the delay runs **once per page at build**, in parallel across
  the static generation workers.

Measured in `next dev`:

```
GET /menu 200 in 1405ms (next.js: 305ms, application-code: 1100ms)
GET /menu/doro-wat 200 in 883ms (generate-params: 761ms, application-code: 81ms)
GET /menu/pizza 404 in 122ms
```

## How to re-verify any of this

```bash
npm run build                      # strategy table above
curl -s -o /dev/null -w '%{http_code}' localhost:3000/menu/pizza   # 404
curl -s localhost:3000/menu | grep -o 'class="dish-item"' | wc -l  # 20
npm run measure -- menu after      # First Load JS for /menu
npm run measure -- checkout        # "no prerendered HTML" — it is dynamic
```
