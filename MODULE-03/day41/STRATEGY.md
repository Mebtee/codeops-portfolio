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
- `queryDishes({ q, page, pageSize })` — async; filters by a non-empty,
  case-insensitive `q` over name, Amharic name, description and category
  label, then slices one page. Returns
  `{ data, page, pageSize, total, totalPages }` and clamps out-of-range pages
  into range so `/api/dishes?page=99` answers with the last page instead of an
  empty array. `PAGE_SIZE = 6`.
- `getDishesByCategory()`, `getDishBySlug()`, `getCategoryBySlug()`,
  `getCategoryCounts()`, `slugify()`

`fmt()` moved to **`src/lib/format.js`** on Day 41. The menu's `DishList` is
now also rendered inside the client `SearchBox`, and `@/data/dishes` runs
`fs.readFileSync` at module load — so the price formatter had to move to a
client-safe module. `data/dishes.js` re-exports it, so server callers are
unchanged.

Because only server components import `data/dishes.js`, `node:fs` never reaches
a client bundle — verify with:

```bash
grep -rl "Classic Doro Wat" .next/static/chunks/    # → none
```

## Route table

| Route              | File                          | Strategy                    | Config that produces it                    | Why                                                                                                                                          |
| ------------------ | ----------------------------- | --------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                | `src/app/page.jsx`            | Static (prerendered)        | none — static is the default                | Welcome copy only. No data, no cookies, no search params.                                                                                    |
| `/menu`            | `src/app/menu/page.js`        | **ISR** — static + hourly refresh | `export const revalidate = 3600`       | An `async` server component that `await`s `queryDishes({ page: 1 })` (800 ms) and seeds the client `SearchBox` twice over: as `fallbackData` for its SWR query and as a server-rendered `DishList` (the default `children` view). Search and paging then run in the browser, so the route stays static. |
| `/menu/loading.js` | `src/app/menu/loading.js`     | Streaming Suspense fallback | `loading.js` file convention                | While the segment streams (dev, on-demand render), the visitor sees dish skeletons. Applies to `/menu` **and** every route below it.         |
| `/menu/SearchBox.jsx` | client shell + leaf        | —                           | `"use client"` + SWR                       | The Day 41 live-data seam (the old `CategoryBar` FilterShell is gone). Debounces the term 400 ms, keeps the page number in `?page=` via shallow `replaceState`, and leaves its SWR key `null` while the box is empty and page is 1 — so the default view is the server `children`, with no request at all. |
| `/menu/[id]`       | `src/app/menu/[id]/page.jsx`  | **SSG** — 26 pages at build | `generateStaticParams()` + `dynamicParams = false` | 20 dish slugs + 6 category slugs = 26 static pages. Unknown slugs never reach the server: Next serves 404 (`/menu/pizza` → 404). No `revalidate`, so they are frozen at build time. |
| `/menu` layout     | `src/app/menu/layout.jsx`     | Static                      | no dynamic APIs                            | Only segment metadata now — the old category sidebar was removed by request, so `children` render full-width.                                 |
| `/cart`            | `src/app/cart/page.jsx`       | Static shell + client subtree | none                                       | The page holds no copy at all; cart contents live in browser memory (`CartContext`) and the client `CartList` renders only when the cart has items. |
| `/checkout`        | `src/app/checkout/page.jsx`   | **Forced dynamic**          | `export const dynamic = "force-dynamic"` + `await cookies()` | Reads `addis_eats_session` per request. `cookies()` is a dynamic API and `force-dynamic` makes the intent explicit.                           |
| `/orders/[id]`     | `src/app/orders/[id]/page.js` | **Forced dynamic**          | `export const dynamic = "force-dynamic"` | `await params`, `getOrder(id)`, `notFound()` when the id is unknown. Renders the whole order into the HTML, then hands it to the client `OrderStatus` as `fallbackData` — no spinner on first paint, then a 5 s poll against `GET /api/orders/[id]`. |

Build output confirms the strategies:

```
Route (app)                 Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /api/dishes
├ ƒ /api/dishes/[id]
├ ƒ /api/orders
├ ƒ /api/orders/[id]
├ ○ /cart
├ ƒ /checkout
├ ○ /menu                           1h      1y
├   /menu/[id]
│ ├ ● /menu/doro-wat
│ ├ ● /menu/siga-wat
│ ├ ● /menu/beg-alicha-wat
│ └ ● [+23 more paths]
└ ƒ /orders/[id]

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

## API routes and server actions

Addis Eats now ships its own backend. The routes below all read the same
`src/data/dishes.js` module and the same `src/lib/schema.js` zod schema the form
uses, so a request that is valid in the browser is valid at the edge of the
server, and vice versa.

| Endpoint / action | File | Strategy | Behaviour |
| ----------------- | ---- | -------- | --------- |
| `GET /api/dishes` | `app/api/dishes/route.js` | Dynamic (ƒ) | Bare request: awaits `getDishes()` (the 800 ms simulated API) and returns `{ data: dishes }` — all 20, the days 38–40 contract. With `?q=`, `?page=` or `?pageSize=`: runs `queryDishes()` and returns `{ data, page, pageSize, total, totalPages }`. `pageSize` is capped at 50. |
| `GET /api/dishes/[id]` | `app/api/dishes/[id]/route.js` | Dynamic (ƒ) | Looks up by slug **or** id; unknown id → `404 { error: "Dish not found" }`. |
| `GET /api/orders/[id]` | `app/api/orders/[id]/route.js` | Dynamic (ƒ) | The status screen's poll source. Returns `{ data: order }`, `404 { error: "Order not found" }` for an unknown id. Reads are keyed by the UUID — the receipt link **is** the capability; the session-scoped list and ownership-checked cancel below are unchanged. |
| `POST /api/orders` | `app/api/orders/route.js` | Dynamic (ƒ) | `orderSchema.safeParse(body)`; failure → `422 { error, fieldErrors }`; success → `201 { data: order }`; malformed JSON → `400`. Also `GET /api/orders` returns only the caller's orders (`401` without a session). |
| `placeOrder` | `src/actions.js` (`"use server"`) | Server action | Same schema + same store as the route; sets the session cookie, writes the order, then `revalidatePath("/checkout")` and `revalidatePath("/cart")`. |
| `cancelOrder` | `src/actions.js` (`"use server"`) | Server action | Reads the session, loads the record, and **checks ownership before writing** — `401` no session, `404` no record, `403` not the owner. |

`/checkout` is the one page that submits through the action rather than the
route: the task was to build the endpoint, prove it with `curl`, then rewrite the
same submission as a server action and delete the client `fetch` — which is what
shipped. The endpoint stays as the documented, curl-testable contract, and the
action is the path the UI actually takes.

### Status codes used

| Code | When |
| ---- | ---- |
| 200 | `GET` routes succeed |
| 201 | an order is created |
| 400 | request body is not valid JSON |
| 401 | `GET /api/orders` or `cancelOrder` with no session cookie |
| 403 | `cancelOrder` on an order owned by a different session |
| 404 | unknown dish id, unknown order id, or `cancelOrder` on a missing order |
| 422 | zod validation failed — body carries `fieldErrors` keyed by field |

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

The Day 41 page number follows the same rule from the other side: `?page=` is
written and read **on the client** (`window.history.replaceState` /
`window.location.search`), never via `searchParams`. Reading `searchParams` in
`MenuPage` would make `/menu` dynamic and re-render the server on every pager
click — a server render plus a duplicate SWR fetch for the same six dishes.

## The 800 ms delay

`getDishes()` sleeps 800 ms on purpose, to show what each strategy does with
latency:

- `/menu` (ISR): the delay runs **once at build** and once per hourly
  revalidation — visitors never wait for it.
- `/menu/loading.js`: in `next dev` the delay is what makes the skeleton
  visible in the streamed HTML.
- `/menu/[id]`: the delay runs **once per page at build**, in parallel across
  the static generation workers.
- API queries (`GET /api/dishes?q=…&page=…`, `GET /api/dishes/[id]`,
  `GET /api/orders/[id]`): every request pays the delay, which is exactly what
  the Day 41 client side has to tolerate — the debounce limits how often you
  pay it, `keepPreviousData` hides it, and `staleTime` skips it entirely for
  repeated terms.

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
curl -s localhost:3000/menu | grep -o 'class="dish-item"' | wc -l  # 6 (page 1)
curl -s 'localhost:3000/api/dishes?q=shiro' | python -m json.tool  # total: 2
curl -s 'localhost:3000/api/dishes?page=2' | python -m json.tool   # page 2 of 4
curl -s -o /dev/null -w '%{http_code}' localhost:3000/api/orders/00000000-0000-0000-0000-000000000000  # 404
npm run measure -- menu day41      # First Load JS for /menu
npm run measure -- checkout        # "no prerendered HTML" — it is dynamic
```
