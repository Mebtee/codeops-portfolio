# Addis Eats — Next.js API, server actions, checkout, and live data

The Day 38 Addis Eats app (server/client component boundary demo) grown a
backend: a dishes API with dynamic segments, an orders endpoint that validates
with a shared Zod schema, and a server action that places an order with a
pending state and revalidation.

Day 41 adds **live data with SWR**: a polling order-status screen seeded from
the server render, a debounced menu search whose empty term means *no query at
all*, paging with the page number in the query string, and
[`DATA.md`](./DATA.md) justifying every key and `staleTime` in writing.

Day 42 adds **real authentication**: password sign-in and sign-out, a session
cookie that the server can revoke, middleware that turns anonymous visitors
away from private routes, ownership checks on every write, and a staff-only
kitchen board. The credential model, the cookie flags, and the ownership
policy are in [`AUTH.md`](./AUTH.md).

Day 43 adds **performance & measurement**: every photo moves to `next/image`
with real dimensions and an honest `sizes`, the home hero is the only image
with `priority`, Inter is self-hosted with `next/font` instead of a Google
Fonts `<link>`, and `gtag` loads through `next/script` with a lazy strategy.
The before/after Lighthouse numbers and what caused each change are in
[`PERF.md`](./PERF.md).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (strategy table below)
npm run start    # serve the production build
npm run measure  # First Load JS for a prerendered route (see BOUNDARY.md)
npm run photos   # regenerate the placeholder dish/hero photos (sharp)
```

Stack: **Next.js 16** (App Router, Turbopack) + **React 19** + **Zod 3** +
**SWR 2**.

See [`STRATEGY.md`](./STRATEGY.md) for every route's rendering strategy,
[`DATA.md`](./DATA.md) for every client query,
[`BOUNDARY.md`](./BOUNDARY.md) for which component runs on which side, and
[`AUTH.md`](./AUTH.md) for how identity and ownership are enforced.

---

## Endpoints

| Method | Path | Success | Failure |
| ------ | ---- | ------- | ------- |
| `GET` | `/api/dishes` | `200 { data: Dish[] }` (all 20) | — |
| `GET` | `/api/dishes?q=&page=&pageSize=` | `200 { data, page, pageSize, total, totalPages }` | page clamps into range |
| `GET` | `/api/dishes/[id]` | `200 { data: Dish }` | `404 { error: "Dish not found" }` |
| `GET` | `/api/session` | `200 { data: User \| null }` — who is signed in | — |
| `POST` | `/api/orders` | `201 { data: Order }` — owner is the session user | `401 { error: "No active session" }` · `400` malformed JSON · `422 { error, fieldErrors }` schema |
| `GET` | `/api/orders` | `200 { data: Order[] }` — **only the caller's** orders | `401 { error: "No active session" }` |
| `GET` | `/api/orders/[id]` | `200 { data: Order }` — the status poll source, owner only | `401` no session · `404 { error: "Order not found" }` unknown **or someone else's** id |

`[id]` matches a dish by **slug** (`doro-wat`) or id. The order body is
validated by `src/lib/schema.js` — the *same* schema the checkout form and the
`placeOrder` action use. The order routes all require the
`addis_eats_session` cookie; the session model is in [`AUTH.md`](./AUTH.md).

### Server actions — `src/actions.js` (`"use server"`)

| Action | Checks | Result |
| ------ | ------ | ------ |
| `signIn(prevState, formData)` | `findUserByEmail` + `verifyPassword` (scrypt) | `303` + `Set-Cookie` on success; `{ ok: false, error: "Wrong email or password." }` otherwise (same message for an unknown email) |
| `signOut()` | — | deletes the session record, clears the cookie, redirects `/` |
| `placeOrder(prevState, formData)` | session **and** `orderSchema.safeParse` | `401` when signed out · `{ ok, fieldErrors }` on bad input · `{ ok, order }` on success; `revalidatePath("/checkout")` + `/cart` |
| `cancelOrder(orderId)` | session **and** record owner | `401` no session · `404` no record · `403` not the owner · `200` cancelled |
| `advanceOrder(orderId, _formData)` | session **and** `role === "staff"` | `401` no session · `403` not staff · `404` no record · `409` cancelled · `200` advanced one step |

### Status codes

`200` ok · `201` created · `400` bad JSON · `401` no session · `403` not the
owner, not staff · `404` unknown dish/order, someone else's order, `/kitchen`
for a non-staff account · `409` advancing a cancelled order · `422` validation
failed (body carries `fieldErrors`).

---

## Day 41 — live data (SWR)

Three client interactions, each with one query and one job. `DATA.md` is the
long-form justification; this is the short version.

| Piece | Key | Refresh rule | Why |
| ----- | --- | ------------ | --- |
| Order status poll — `src/app/orders/[id]/` | `/api/orders/<uuid>` | `refreshInterval: 5000`, hidden tabs paused, `staleTime: 5000` | The server renders the order into the HTML and passes it as `fallbackData`, so **first paint has no spinner**; SWR only updates what is already on screen, every five seconds. |
| Menu search — `src/app/menu/SearchBox.jsx` | `null` while the box is empty and page 1; otherwise `/api/dishes?q=…&page=…&pageSize=6` | on key change only, `keepPreviousData: true`, `staleTime: 30000`, 400 ms debounce | An empty term means **no query at all** (the server already rendered the default view). The debounce means one request per settled term, not per keystroke; `keepPreviousData` means the grid never flashes empty between terms. |
| Menu paging — `src/app/menu/SearchBox.jsx` | the same key, with `?page=` | one request per page click, same `staleTime` | The page number lives in the query string (`replaceState`) and in the SWR key, so `/menu?page=2` is shareable and each page is its own cache entry. |

One `useSWR` fetcher for everything — `src/lib/fetcher.js` — so every query
fails the same way. **How to watch it work in seconds:** open the network tab,
type into the search box — requests appear only after you pause typing; keep
typing and the list never blanks; clear the box and *no request fires at all*;
open an order link after checkout and watch one request per five seconds with
"Last synced" ticking.

---

## Day 42 — authentication

Sign-in, sign-out, and a session the server can revoke, enforced in three
layers. The long version is [`AUTH.md`](./AUTH.md); this is the summary.

| Piece | File | What it does |
| ----- | ---- | ------------ |
| Passwords | `src/lib/auth.js`, `data/users.json` | Stored as `scrypt(password, salt, 64)` joined `salt$hash`; verified with `crypto.timingSafeEqual`. Seeded accounts are listed on `/signin`. |
| Session | `src/lib/auth.js` (`sessions.json`), `src/lib/session.js` | Sign-in mints a random 32-byte token, stores `{ token, userId, expiresAt }` server-side, and sends **only the token** in `addis_eats_session`. Sign-out deletes the record, so the token dies at once. |
| Cookie | `src/lib/session-cookie.js` | `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800` (7 days). Set in exactly one place. |
| Middleware | `src/middleware.js` | Edge guard on `/checkout`, `/orders/:path*`, `/kitchen`: a missing/malformed cookie → `307` to `/signin?next=…`. Cheap shape check only. |
| The real guard | every private page/route ⇒ `getSession()` | Cookie → session record → user. Missing anywhere → `401` (API) or redirect (page). |
| Ownership | `src/actions.js`, `src/app/api/orders/*` | Orders key on `sessionId = user.id`. A stranger's **read** → `404` (no existence oracle); a stranger's **cancel** → `403`. |
| Roles | `src/app/kitchen/page.jsx`, `advanceOrder` | `/kitchen` `notFound()`s unless `role === "staff"`; `advanceOrder` re-checks the role before writing. |

Two design notes worth stating outright:

- **The header does not read the session.** Reading `cookies()` in `Header`
  would make *every* route dynamic and drop `/` and `/menu` out of static/ISR.
  Instead the header mounts a small client leaf, `AccountMenu`, that asks
  `GET /api/session`. The strategy table is unchanged by authentication (see
  `STRATEGY.md`).
- **A guest session is gone.** Days 38–41 minted a session on first write and
  used it as the owner key (`ensureSessionId`/`getSessionId`). Both are
  deleted: writing an order now **requires** signing in first.

---

## Day 43 — performance & measurement

A **measure → fix → re-measure** loop on images, fonts and third-party
scripts. The full before/after tables and honest caveats live in
[`PERF.md`](./PERF.md); this is the summary. Numbers are Lighthouse 13, mobile
preset, production build, median of two runs per page.

| Page    | Metric      | Before   | After    |
| ------- | ----------- | -------- | -------- |
| `/`     | Perf score  | 0.60     | **0.93** |
|         | LCP         | 7857 ms  | 2715 ms  |
|         | Page weight | 1915 KB  | 422 KB   |
| `/menu` | Perf score  | 0.64     | **0.82** |
|         | LCP         | 7785 ms  | 4259 ms  |
|         | Page weight | 1926 KB  | 1008 KB  |

The four changes, each its own commit:

| # | Change | File | Why it helps |
| - | ------ | ---- | ------------ |
| 1 | `<img>` → **`next/image`** with true `width`/`height` and a CSS-matched `sizes` | `src/app/menu/DishCard.jsx`, `src/app/page.jsx` | Serves correctly sized WebP (hero 614 KB → 42 KB), reserves the aspect ratio, and stops React 19's automatic `<img>` preload from pulling all 6 dish photos into the home page through the prefetched `/menu` payload. |
| 2 | **`priority`** on the home hero only | `src/app/page.jsx` | Makes the LCP element `eager` and emits `<link rel="preload" as="image">` with the full `imageSrcSet`; dish cards stay lazy (the menu page has **zero** image preloads). |
| 3 | Google Fonts `<link>` → **`next/font`** | `src/app/layout.jsx`, `src/app/globals.css` | Drops the external `fonts.googleapis.com`/`fonts.gstatic.com` round-trips from the critical path and self-hosts Inter with a metric-adjusted fallback. Biggest FCP win (3.2 s → 0.8 s). |
| 4 | Eager `gtag` `<script>` → **`next/script strategy="lazyOnload"`** | `src/app/layout.jsx` | Keeps the 155 KB analytics script off the startup main thread; home TBT 360 ms → 204 ms. |
| 5 | `.env.example` + `.env*.local` gitignored | `.env.example`, `.gitignore` | Documents `NEXT_PUBLIC_GA_ID` (gtag) and `NEXT_PUBLIC_SITE_URL` (`metadataBase`). |

Two things worth stating plainly, because a naive summary would get them
wrong:

- **CLS was already ~0 and stayed ~0.** React 19 preloads plain `<img>`s, so
  even the "unsized" baseline reserved space before paint. `next/image` makes
  that explicit instead of lucky; the real wins are **LCP, FCP, Speed Index and
  bytes**.
- **The home page was downloading the menu's photos.** In the baseline, React
  19's automatic image preload applied to the `<img>`s inside Next's prefetched
  `/menu` payload, so `/` fetched 7 images / 1547 KB. After moving to lazy
  `next/image`, `/` fetches one image / 42 KB.

The placeholder photos are generated with `sharp` (`npm run photos`,
`scripts/generate-photos.mjs`) so the repo is self-contained.

---

## Production build output

```text
> addis-eats@1.0.0 build
> next build

▲ Next.js 16.3.8 (Turbopack)
✓ Running next.config.mjs took 43ms

  Creating an optimized production build ...
✓ Compiled successfully in 654ms
  Running TypeScript ...
  Finished TypeScript in 6ms ...
  Collecting page data using 13 workers ...
  Generating static pages using 13 workers (0/31) ...
  Generating static pages using 13 workers (7/31) 
  Generating static pages using 13 workers (15/31) 
  Generating static pages using 13 workers (23/31) 
✓ Generating static pages using 13 workers (31/31) in 2.1s
  Finalizing page optimization ...

Route (app)                 Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /api/dishes
├ ƒ /api/dishes/[id]
├ ƒ /api/orders
├ ƒ /api/orders/[id]
├ ƒ /api/session
├ ○ /cart
├ ƒ /checkout
├ ƒ /kitchen
├ ○ /menu                           1h      1y
├   /menu/[id]
├ ƒ /orders
├ ƒ /orders/[id]
└ ƒ /signin

ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

This matches the strategy table in `STRATEGY.md`. Across Day 38 → Day 42 the
additions are the API routes, the authenticated pages (`/orders`, `/orders/[id]`,
`/kitchen`, `/signin`) and the `ƒ Proxy (Middleware)` guard. Every pre-existing
page kept its strategy — notably `/menu` is **still ISR with a 1 h revalidate**
and `/` and `/cart` are **still static**, because the session is read on the
private routes only, never in the shared header (see `STRATEGY.md`).

---

## Curl proof

Endpoints were proven from the terminal against the production build
(`npm run build && npm run start`). **From Day 42 the order endpoints require a
signed-in session**, so the transcripts that touch them carry a cookie:

```console
$ TOKEN=$(curl -s -D - -o /dev/null -X POST localhost:3000/signin \
    -F 'email=marta@addiseats.et' -F 'password=AddisMarta1!' \
    | sed -n 's/.*addis_eats_session=\([^;]*\).*/\1/p')
```

(The `Secure` flag means curl cannot resend the cookie automatically over
plain http; every authenticated request below passes `-H "Cookie:
addis_eats_session=$TOKEN"` by hand. The full auth transcript — redirects,
`401`s, the forged cookie, the staff board — is [`AUTH.md`](./AUTH.md) §10.)

```console
$ curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/api/dishes
200
$ curl -s localhost:3000/api/dishes/doro-wat
{"data":{"id":"menu-1","slug":"doro-wat","name":"Classic Doro Wat", ...}}
$ curl -s -w '\n%{http_code}\n' localhost:3000/api/dishes/pizza
{"error":"Dish not found"}
404

# invalid order -> 422 with per-field messages
$ curl -s -X POST localhost:3000/api/orders -H "Cookie: addis_eats_session=$TOKEN" \
    -H 'Content-Type: application/json' \
    -d '{"name":"M","phone":"abc","email":"nope","subcity":"","street":"x","landmark":"x","timing":"schedule","payment":"telebirr","items":[]}'
422
  phone            Enter a valid 9–10 digit mobile number
  email            Enter a valid email for the digital receipt
  subcity          Choose a sub-city
  street           Enter your street, building and flat number
  landmark         Add a landmark or gate instruction
  items            Your mesob is empty — add a dish
  scheduleTime     Choose a dispatch time
  telebirrPhone    Enter a valid 9–10 digit Telebirr number

# valid order -> 201 (owner = the session user)
$ curl -s -X POST localhost:3000/api/orders -H "Cookie: addis_eats_session=$TOKEN" \
    -H 'Content-Type: application/json' \
    -d '{"name":"TAMENE BEHAILU","phone":"0929843572","email":"tamenebehailu@gmail.com","subcity":"Bole","street":"Behind Edna Mall","landmark":"Boston Day Spa","timing":"immediate","payment":"cash","items":[{"slug":"doro-wat","name":"Classic Doro Wat","price":650,"quantity":2}]}'
201   AE-207530  pending  sessionId=usr_marta  items=1

# same request with no cookie -> 401, before the body is even parsed
$ curl -s -w '\n%{http_code}\n' -X POST localhost:3000/api/orders -H 'Content-Type: application/json' -d 'nope'
{"error":"No active session"}
401

# malformed JSON *with* a session -> 400
$ curl -s -X POST localhost:3000/api/orders -H "Cookie: addis_eats_session=$TOKEN" \
    -H 'Content-Type: application/json' -d 'nope'
{"error":"Invalid JSON body"}   400
```

### Day 41 — live data, proven

```console
# search: one query per settled term, filtered server-side
$ curl -s 'localhost:3000/api/dishes?q=shiro'
{"data":[{"slug":"shiro-tegamino","name":"Clay-Pot Shiro Tegamino", ...}], ...,
 "page":1,"pageSize":6,"total":2,"totalPages":1}

# paging: page 2 of 4, six dishes
$ curl -s 'localhost:3000/api/dishes?page=2&pageSize=6'
  page 2  items 6  totalPages 4  (Awaze Lamb Tibs … Addis Style Dulet)

# an out-of-range page clamps instead of returning an empty list
$ curl -s 'localhost:3000/api/dishes?page=99'
  page 4  items 2

# create an order, then poll it by id (the status screen's key) — both need the session
$ ID=$(curl -s -X POST localhost:3000/api/orders -H "Cookie: addis_eats_session=$TOKEN" \
       -H 'Content-Type: application/json' \
       -d '{"name":"Marta Bekele", ...}' | python -c "import sys,json;print(json.load(sys.stdin)['data']['id'])")
$ curl -s -o /dev/null -w '%{http_code}\n' -H "Cookie: addis_eats_session=$TOKEN" localhost:3000/api/orders/$ID
200
$ curl -s -o /dev/null -w '%{http_code}\n' -H "Cookie: addis_eats_session=$TOKEN" localhost:3000/api/orders/nope
404

# the status page prints the order into the HTML before any JS runs
$ curl -s -H "Cookie: addis_eats_session=$TOKEN" localhost:3000/orders/$ID | grep -o 'AE-[0-9]*\|Classic Doro Wat\|Seeded from the page render[^<]*' | sort -u
AE-727379
Classic Doro Wat
Seeded from the page render — polling every 5s

# the menu's default view is the server render: page 1, six cards, meta line
$ curl -s localhost:3000/menu | grep -o 'class="dish-item"' | wc -l
6
$ curl -s localhost:3000/menu | grep -o '20 dishes · page 1 of 4'
20 dishes · page 1 of 4
```

What `curl` **cannot** show is the part Day 41 is really about — the client
behaviour (`curl` is the JS-disabled probe). That is verified in the browser's
network tab: requests only after the 400 ms pause, no empty flash between
terms (`keepPreviousData`), **no request at all** when the box is cleared
(`null` key), one request per page, and one poll every five seconds on the
status screen. Every option behind those behaviours is justified in
[`DATA.md`](./DATA.md).

---

## The eight failure checks (production build)

Run against `npm run start`. "JavaScript disabled" here means `curl`, which
never executes client JS.

| # | Failure | How it was probed | Observed |
| - | ------- | ----------------- | -------- |
| 1 | Unknown dish id | `GET /api/dishes/pizza` | `404 { error: "Dish not found" }` |
| 2 | Invalid order body | `POST /api/orders` with bad fields | `422` + `fieldErrors` keyed by field |
| 3 | Malformed JSON | `POST /api/orders` with `nope` | `400 { error: "Invalid JSON body" }` |
| 4 | No session | `GET /api/orders` without a cookie | `401 { error: "No active session" }` |
| 5 | Wrong owner | session B reads and cancels an order created by session A | list: A sees `1` row, B sees `0` (`200`); detail read `GET /api/orders/<A's id>` → **`404`** for B, `200` for A; `cancelOrder` as B → **`403` before any write** |
| 6 | JavaScript disabled | `curl localhost:3000/menu`, `/menu/doro-wat`, `/api/dishes` | `/menu` returns page 1 — **6** `class="dish-item"` nodes, the search input, the meta line and a `<noscript>` note ("without JavaScript you get page 1 only"); `/menu/doro-wat` contains the dish text; the **public** API is unaffected by JS. (`/checkout` is no longer a curl-without-cookie probe — it redirects; see the Day 42 checks below.) |
| 7 | Unknown order id | `GET /api/orders/nope` and `curl localhost:3000/orders/nope` | both `404` — the API says `{ error: "Order not found" }`, the page renders Next's not-found |
| 8 | Out-of-range page | `GET /api/dishes?page=99` | clamps to the last page (`page: 4`, 2 items) instead of an empty list, so a stale page number can't blank the grid |

Check 6 changed meaning on Day 41 and that is deliberate: the server still
renders the dishes (page 1) — it no longer renders all 20, because the list is
now paged. Search and paging are client-side by design, and the `<noscript>`
note says so instead of pretending otherwise.

### Day 42 — the authentication checks

Same build, same `curl`, now with the session in play. Full transcript in
[`AUTH.md`](./AUTH.md) §10.

| # | Failure | How it was probed | Observed |
| - | ------- | ----------------- | -------- |
| A1 | Private route, anonymous | `GET /checkout`, `/orders/…`, `/kitchen` with no cookie | `307` to `/signin?next=…` (middleware) |
| A2 | Write, anonymous | `POST /api/orders` with no cookie | `401 { error: "No active session" }` — rejected **before** the body is parsed, nothing written |
| A3 | Sign-in with a wrong password / unknown email | `POST /signin` action | same message ("Wrong email or password.") and no cookie in either case |
| A4 | Forged cookie of the right *shape* | 64 hex `a`s in `addis_eats_session` | middleware waves it through; `getSession()` finds no record → `/checkout` renders `data-has-session="no"`, `GET /api/orders` → `401` |
| A5 | Cross-account read | B's cookie vs. A's order id | list scoped (A `1`, B `0`); detail `404` (not `403`) — no existence oracle |
| A6 | Cross-account write | `cancelOrder` as B on A's order | `403 "You do not own this order."` before `updateOrder` |
| A7 | Token after sign-out | sign out, replay the old cookie | `401` — `deleteSession` ran; the token is dead, not just the browser's copy |
| A8 | Staff-only route | `/kitchen` as anon / customer / staff | `307` / `404` / `200`; a customer cannot even render the Advance form |
| A9 | Role-gated write | `advanceOrder` as a customer | not reachable (the `/kitchen` page `404`s first); the action also returns `403` if called directly |

### Attacking the action from the console

`cancelOrder` and `advanceOrder` are server actions; the browser only ever
holds a reference to them, never their bodies. From DevTools you can
`await cancelOrder("some-id")` or `await advanceOrder("some-id")`, but:

- with no `addis_eats_session` cookie the server returns `401`;
- with a session that does **not** own the record, `cancelOrder` returns `403`
  (`order.sessionId !== session.user.id`) **before** calling `updateOrder`; and
- `advanceOrder` returns `403` unless the session's `role` is `"staff"`.

The checks read the cookie and the record server-side, so editing client state
or passing another order's id cannot cancel someone else's order or move it
along the kitchen board. The session-scoping curl above is the observable
proof that records are partitioned by account.

---

## Day 45 — the ops dashboard

`/dashboard` aggregates every order on the server and passes only summary
arrays across the boundary — no order objects, no customer details, nothing
that would need the client to know what a single order is.

| Piece | File | Notes |
| --- | --- | --- |
| Aggregation + page | `src/app/dashboard/page.js` | reads `data/orders.json` via `@/lib/orders`, builds `byArea` / `byDay` / totals |
| Bar + line charts | `src/app/dashboard/RevenueChart.jsx` | the only client code on the page; fixed-height SVG containers, ETB ticks |
| Order table | `src/app/orders/OrderTable.jsx` | real `<table>` markup, `aria-sort` headers, sorting and paging from the URL |
| Skeletons | `src/app/dashboard/loading.js`, `src/app/orders/loading.js` | five table rows shaped like the real thing |
| Error boundary | `src/app/dashboard/error.js` | safety net for unexpected render failures |

### The four states, forced

The page reads a `state` query parameter so every state is one link away:

| URL | What renders |
| --- | --- |
| `/dashboard` | data — stats, both charts, the paged table |
| `/dashboard?state=loading` | skeleton — the server waits 3s so `loading.js` stays visible |
| `/dashboard?state=empty` | empty — what a fresh install with no orders shows |
| `/dashboard?state=error` | error — the server throws and the error panel is rendered |

The same four links sit at the top of the dashboard itself (`state-links`), so
the states are demonstrable by clicking, not just by typing URLs.

### Chart accessibility

- The line chart's full data set is repeated as a `<table>` directly beneath
  the SVG — nobody has to see the chart to read the numbers.
- Both SVGs carry `role="img"` and `aria-labelledby` pointing at their
  headings; the daily heading names the range and the unit
  ("Orders per day, 21 Sep – 20 Oct 2026 (orders)").
- Table headers are real `<th scope>` cells whose sort links rewrite the URL
  (`?sort=total&dir=asc&page=2`) and set `aria-sort`.

### Demo data

`data/orders.json` is gitignored, so a fresh clone starts in the empty state
(the tip in the brief: build that state first). To fill it:

```bash
node scripts/seed-orders.mjs   # 160 deterministic orders over 30 days
```

The script keeps any real orders already in the file, replaces older demo
rows, and uses a fixed PRNG seed so the charts are stable between runs.

---

## Layout

```text
ClientAndServerSide/
├── AUTH.md / STRATEGY.md / BOUNDARY.md / DATA.md / PERF.md
├── .env.example
├── scripts/generate-photos.mjs      # sharp placeholder generator (npm run photos)
├── public/
│   ├── menu.json
│   └── images/                      # hero + per-dish placeholder photos
├── data/
│   ├── users.json                   # seed accounts (tracked)
│   ├── orders.json                  # created at runtime (gitignored)
│   └── sessions.json                # created at runtime (gitignored)
└── src/
    ├── middleware.js                # edge guard: /checkout, /orders/*, /kitchen
    ├── actions.js                   # "use server": signIn, signOut, placeOrder, cancelOrder, advanceOrder
    ├── lib/
    │   ├── fetcher.js               # the one SWR fetcher
    │   ├── format.js                # client-safe fmt (data/dishes re-exports)
    │   ├── schema.js                # the one zod order schema
    │   ├── auth.js                  # users + sessions stores, scrypt, timingSafeEqual
    │   ├── session-cookie.js        # edge-safe cookie name/pattern/options (no node:)
    │   ├── session.js               # getSession / startSession / endSession / safeNextPath
    │   └── orders.js                # fs-backed order store
    ├── app/
    │   ├── api/dishes/route.js      # ?q= &page= &pageSize=
    │   ├── api/dishes/[id]/route.js
    │   ├── api/orders/route.js      # session required; list is owner-scoped
    │   ├── api/orders/[id]/route.js # the status poll source; owner-only
    │   ├── api/session/route.js     # { data: user | null } for the header
    │   ├── signin/                  # page.js + SignInForm.jsx
    │   ├── orders/page.jsx          # the account's own receipts
    │   ├── orders/[id]/             # page.js (seed) + OrderStatus.jsx (poll + cancel)
    │   ├── kitchen/page.jsx         # staff-only board + Advance forms
    │   ├── checkout/page.jsx + CheckoutForm.jsx
    │   ├── menu/page.js + SearchBox.jsx + DishCard.jsx + menu/[id]/page.jsx
    │   ├── cart/page.jsx
    │   └── layout.jsx, page.jsx, providers.jsx
    ├── cart/CartContext.jsx
    ├── components/                  # DishList, CartList, CartBadge, AccountMenu, …
    └── data/dishes.js               # server-only menu loader + queryDishes
```
