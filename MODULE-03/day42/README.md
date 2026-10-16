# Addis Eats — Next.js API, server actions, checkout, and live data

The Day 38 Addis Eats app (server/client component boundary demo) grown a
backend: a dishes API with dynamic segments, an orders endpoint that validates
with a shared Zod schema, and a server action that places an order with a
pending state and revalidation. Authorisation is enforced on the server.

Day 41 adds **live data with SWR**: a polling order-status screen seeded from
the server render, a debounced menu search whose empty term means *no query at
all*, paging with the page number in the query string, and
[`DATA.md`](./DATA.md) justifying every key and `staleTime` in writing.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (strategy table below)
npm run start    # serve the production build
npm run measure  # First Load JS for a prerendered route (see BOUNDARY.md)
```

Stack: **Next.js 16** (App Router, Turbopack) + **React 19** + **Zod 3** +
**SWR 2**.

See [`STRATEGY.md`](./STRATEGY.md) for every route's rendering strategy,
[`DATA.md`](./DATA.md) for every client query, and
[`BOUNDARY.md`](./BOUNDARY.md) for which component runs on which side.

---

## Endpoints

| Method | Path | Success | Failure |
| ------ | ---- | ------- | ------- |
| `GET` | `/api/dishes` | `200 { data: Dish[] }` (all 20) | — |
| `GET` | `/api/dishes?q=&page=&pageSize=` | `200 { data, page, pageSize, total, totalPages }` | page clamps into range |
| `GET` | `/api/dishes/[id]` | `200 { data: Dish }` | `404 { error: "Dish not found" }` |
| `POST` | `/api/orders` | `201 { data: Order }` | `400 { error }` malformed JSON · `422 { error, fieldErrors }` schema |
| `GET` | `/api/orders` | `200 { data: Order[] }` — caller's own orders | `401 { error: "No active session" }` |
| `GET` | `/api/orders/[id]` | `200 { data: Order }` — the status poll source | `404 { error: "Order not found" }` |

`[id]` matches a dish by **slug** (`doro-wat`) or id. The order body is
validated by `src/lib/schema.js` — the *same* schema the checkout form and the
`placeOrder` action use.

### Server actions — `src/actions.js` (`"use server"`)

| Action | Checks | Result |
| ------ | ------ | ------ |
| `placeOrder(prevState, formData)` | `orderSchema.safeParse` | returns `{ ok, fieldErrors }` or `{ ok, order }`; sets the session cookie; `revalidatePath("/checkout")` + `/cart` |
| `cancelOrder(orderId)` | session **and** record owner | `401` no session · `404` no record · `403` not the owner · `200` cancelled |

### Status codes

`200` ok · `201` created · `400` bad JSON · `401` no session · `403` not the
owner · `404` unknown dish/order · `422` validation failed (body carries
`fieldErrors`).

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

This matches the strategy table in `STRATEGY.md`. Across Day 38 → Day 41 the
additions are the API routes and `/orders/[id]` (all `ƒ`); every pre-existing
page kept its strategy — notably `/menu` is **still ISR with a 1 h revalidate**,
because Day 41's search and paging deliberately run on the client (see
`STRATEGY.md`, "Why category pages use path segments").

---

## Curl proof

Endpoints were proven from the terminal against the production build
(`npm run build && npm run start`). A `▶` marks the checked status code.

```console
$ curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/api/dishes
200
$ curl -s localhost:3000/api/dishes/doro-wat
{"data":{"id":"menu-1","slug":"doro-wat","name":"Classic Doro Wat", ...}}
$ curl -s -w '\n%{http_code}\n' localhost:3000/api/dishes/pizza
{"error":"Dish not found"}
404

# invalid order -> 422 with per-field messages
$ curl -s -X POST localhost:3000/api/orders -H 'Content-Type: application/json' \
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

# valid order -> 201
$ curl -s -X POST localhost:3000/api/orders -H 'Content-Type: application/json' \
    -d '{"name":"TAMENE BEHAILU","phone":"0929843572","email":"tamenebehailu@gmail.com","subcity":"Bole","street":"Behind Edna Mall","landmark":"Boston Day Spa","timing":"immediate","payment":"cash","items":[{"slug":"doro-wat","name":"Classic Doro Wat","price":650,"quantity":2}]}'
201   AE-207530  pending  items=1

# malformed JSON -> 400
$ curl -s -X POST localhost:3000/api/orders -H 'Content-Type: application/json' -d 'nope'
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

# create an order, then poll it by id (the status screen's key)
$ ID=$(curl -s -X POST localhost:3000/api/orders -H 'Content-Type: application/json' \
       -d '{"name":"Marta Bekele", ...}' | python -c "import sys,json;print(json.load(sys.stdin)['data']['id'])")
$ curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/api/orders/$ID
200
$ curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/api/orders/nope
404

# the status page prints the order into the HTML before any JS runs
$ curl -s localhost:3000/orders/$ID | grep -o 'AE-[0-9]*\|Classic Doro Wat\|Seeded from the page render[^<]*' | sort -u
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
| 5 | Wrong owner | session B reads orders created by session A | `200` but **0** rows — session A sees `1`, B sees `0`; `cancelOrder` refuses with `403` before any write |
| 6 | JavaScript disabled | `curl localhost:3000/menu`, `/menu/doro-wat`, `/checkout`, `/api/dishes` | `/menu` returns page 1 — **6** `class="dish-item"` nodes, the search input, the meta line and a `<noscript>` note ("without JavaScript you get page 1 only"); `/menu/doro-wat` contains the dish text; `/checkout` renders `data-has-session="no"`; the API is unaffected by JS |
| 7 | Unknown order id | `GET /api/orders/nope` and `curl localhost:3000/orders/nope` | both `404` — the API says `{ error: "Order not found" }`, the page renders Next's not-found |
| 8 | Out-of-range page | `GET /api/dishes?page=99` | clamps to the last page (`page: 4`, 2 items) instead of an empty list, so a stale page number can't blank the grid |

Check 6 changed meaning on Day 41 and that is deliberate: the server still
renders the dishes (page 1) — it no longer renders all 20, because the list is
now paged. Search and paging are client-side by design, and the `<noscript>`
note says so instead of pretending otherwise.

### Attacking the action from the console

`cancelOrder` is a server action; the browser only ever holds a reference to it,
never its body. From DevTools you can `await cancelOrder("some-id")`, but:

- with no `addis_eats_session` cookie the server returns `401`, and
- with a session that does **not** own the record the server returns `403`
  (`order.sessionId !== sessionId`) **before** calling `updateOrder`.

The ownership check reads the cookie server-side, so editing client state or
passing another order's id cannot cancel someone else's order. The
session-scoping curl above is the observable proof that records are partitioned
by session.

---

## Layout

```text
ClientAndServerSide/
├── STRATEGY.md / BOUNDARY.md / DATA.md
├── public/menu.json
├── data/orders.json                 # created at runtime (gitignored)
└── src/
    ├── actions.js                   # "use server": placeOrder, cancelOrder
    ├── lib/
    │   ├── fetcher.js               # the one SWR fetcher
    │   ├── format.js                # client-safe fmt (data/dishes re-exports)
    │   ├── schema.js                # the one zod order schema
    │   ├── session.js               # addis_eats_session cookie
    │   └── orders.js                # fs-backed order store
    ├── app/
    │   ├── api/dishes/route.js      # ?q= &page= &pageSize=
    │   ├── api/dishes/[id]/route.js
    │   ├── api/orders/route.js
    │   ├── api/orders/[id]/route.js # the status poll source
    │   ├── orders/[id]/             # page.js (seed) + OrderStatus.jsx (poll)
    │   ├── checkout/page.jsx + CheckoutForm.jsx
    │   ├── menu/page.js + SearchBox.jsx + menu/[id]/page.jsx
    │   ├── cart/page.jsx
    │   └── layout.jsx, page.jsx, providers.jsx
    ├── cart/CartContext.jsx
    ├── components/                  # DishList, CartList, CartBadge, …
    └── data/dishes.js               # server-only menu loader + queryDishes
```
