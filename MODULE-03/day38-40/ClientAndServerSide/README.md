# Addis Eats — Next.js API, server actions, and checkout

The Day 38 Addis Eats app (server/client component boundary demo) grown a
backend: a dishes API with dynamic segments, an orders endpoint that validates
with a shared Zod schema, and a server action that places an order with a
pending state and revalidation. Authorisation is enforced on the server.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (strategy table below)
npm run start    # serve the production build
npm run measure  # First Load JS for a prerendered route (see BOUNDARY.md)
```

Stack: **Next.js 16** (App Router, Turbopack) + **React 19** + **Zod 3**.

See [`STRATEGY.md`](./STRATEGY.md) for every route's rendering strategy and
[`BOUNDARY.md`](./BOUNDARY.md) for which component runs on which side.

---

## Endpoints

| Method | Path | Success | Failure |
| ------ | ---- | ------- | ------- |
| `GET` | `/api/dishes` | `200 { data: Dish[] }` | — |
| `GET` | `/api/dishes/[id]` | `200 { data: Dish }` | `404 { error: "Dish not found" }` |
| `POST` | `/api/orders` | `201 { data: Order }` | `400 { error }` malformed JSON · `422 { error, fieldErrors }` schema |
| `GET` | `/api/orders` | `200 { data: Order[] }` — caller's own orders | `401 { error: "No active session" }` |

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

## Production build output

```text
> addis-eats@1.0.0 build
> next build

▲ Next.js 16.3.8 (Turbopack)
✓ Running next.config.mjs took 41ms

  Creating an optimized production build ...
✓ Compiled successfully in 7.2s
✓ Generating static pages using 11 workers (31/31) in 2.1s

Route (app)                 Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /api/dishes
├ ƒ /api/dishes/[id]
├ ƒ /api/orders
├ ○ /cart
├ ƒ /checkout
├ ○ /menu                           1h      1y
└   /menu/[id]
  ├ ● /menu/doro-wat
  ├ ● /menu/siga-wat
  ├ ● /menu/beg-alicha-wat
  └ ● [+23 more paths]

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

This matches the strategy table in `STRATEGY.md`. The only additions since the
Day 38 build are the three `ƒ` API routes — every pre-existing page kept its
strategy.

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

---

## The six failure checks (production build)

Run against `npm run start`. "JavaScript disabled" here means `curl`, which
never executes client JS.

| # | Failure | How it was probed | Observed |
| - | ------- | ----------------- | -------- |
| 1 | Unknown dish id | `GET /api/dishes/pizza` | `404 { error: "Dish not found" }` |
| 2 | Invalid order body | `POST /api/orders` with bad fields | `422` + `fieldErrors` keyed by field |
| 3 | Malformed JSON | `POST /api/orders` with `nope` | `400 { error: "Invalid JSON body" }` |
| 4 | No session | `GET /api/orders` without a cookie | `401 { error: "No active session" }` |
| 5 | Wrong owner | session B reads orders created by session A | `200` but **0** rows — session A sees `1`, B sees `0`; `cancelOrder` refuses with `403` before any write |
| 6 | JavaScript disabled | `curl localhost:3000/menu`, `/menu/doro-wat`, `/checkout`, `/api/dishes` | `/menu` returns **20** `class="dish-item"` nodes in the HTML; `/menu/doro-wat` contains the dish text; `/checkout` renders `data-has-session="no"`; the API is unaffected by JS |

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
├── STRATEGY.md / BOUNDARY.md
├── public/menu.json
├── data/orders.json                 # created at runtime (gitignored)
└── src/
    ├── actions.js                   # "use server": placeOrder, cancelOrder
    ├── lib/
    │   ├── schema.js                # the one zod order schema
    │   ├── session.js               # addis_eats_session cookie
    │   └── orders.js                # fs-backed order store
    ├── app/
    │   ├── api/dishes/route.js
    │   ├── api/dishes/[id]/route.js
    │   ├── api/orders/route.js
    │   ├── checkout/page.jsx + CheckoutForm.jsx
    │   ├── menu/page.js + menu/[id]/page.jsx
    │   ├── cart/page.jsx
    │   └── layout.jsx, page.jsx, providers.jsx
    ├── cart/CartContext.jsx
    ├── components/                  # DishList, CartList, CartBadge, …
    └── data/dishes.js               # server-only menu loader
```
