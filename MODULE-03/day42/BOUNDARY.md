# BOUNDARY.md — which component runs where, and what it costs

This app is a deliberate exercise in the server/client component boundary.
Three rules drive everything:

1. **A component is a server component unless something forces it to the
   client.** Fetching data, reading `cookies()`, and rendering markup from a
   data file never force you to the client.
2. **`"use client"` marks an entry point into the client bundle, not a
   per-file label.** Modules imported *from* a client entry are client code
   too — even with no directive of their own.
3. **The directive belongs on the smallest interactive leaf**, never on a page,
   layout or wrapper that could render on the server.

## The directive inventory

`grep -rn '"use client"' src/` returns **9** files:

```
src/app/checkout/CheckoutForm.jsx the checkout form + server action call
src/app/menu/SearchBox.jsx       live menu shell (Day 41): debounced SWR list + pager
src/app/orders/[id]/OrderStatus.jsx  the 5 s poll (Day 41) + the cancel write (Day 42)
src/app/providers.jsx            the cart provider
src/app/signin/SignInForm.jsx    the sign-in form + server action call (Day 42)
src/components/AccountMenu.jsx   who is signed in (Day 42): SWR over /api/session + sign-out
src/components/AddToCartButton   the "+ Add" button
src/components/CartBadge         the header cart counter
src/components/CartList          the cart table
```

Every one of them is a leaf that owns a click handler, a piece of state, or a
query. Nothing above a leaf is marked: no page (including `/orders/[id]`,
`/orders`, `/kitchen` and `/signin`, which all stay server components), no
layout, no `DishList`, no data module.

> Day 38's `CategoryBar` (the brief's FilterShell) is gone: Day 41's `SearchBox`
> replaced a shell that rendered server `children` and owned nothing with a
> shell that renders server `children` **and** owns the live query. The seam is
> the same idea; it now has a job, so it is one file instead of two.
>
> The brief's tip: *"on a well-sorted application of this size you should find
> three or four"* — this one lands on **9**, because the cart has three
> genuinely independent interactive leaves (badge, add button, cart table), the
> checkout form is a fourth, Day 41 adds two more (the menu list and the order
> poll), and Day 42 adds two: the account menu and the sign-in form. Merging
> them into a single file would only hide the boundary, not move it.

The account menu is the Day 42 case worth naming: authentication *looks* like
something the header should know, but reading `cookies()` in `Header` (a
server component) would make every route dynamic. So `Header` stays server
markup and mounts one client leaf — `AccountMenu` — that asks `/api/session`
who the visitor is. The boundary rule held: the directive went on the smallest
leaf that owns the query, not on the header that could have avoided it (see
`DATA.md`, Query 4).

### The server action boundary

`src/actions.js` opens with `"use server"`, so **every** export in it is a
server-only function, even though a client component imports and calls
`placeOrder`. The client bundle never contains the schema, the session helper,
or the file-backed order store — it only contains a reference the browser POSTs
back to the server.

- `CheckoutForm` (client) imports `placeOrder` and calls it through
  `useActionState`, which is where the pending flag and the returned
  `fieldErrors` come from.
- `signIn`, `signOut`, `placeOrder`, `cancelOrder` and `advanceOrder` are the
  only code that touches `lib/session.js` (`cookies()`), `lib/auth.js`
  (`node:crypto`, the user and session stores) and `lib/orders.js`
  (`node:fs`). Because they run on the server, none of that — not the cookie
  jar, not the password hashes, not the file I/O — reaches the browser:
  `grep -rl "orders.json" .next/static/chunks/` finds nothing, and neither does
  a search for `users.json` or `scrypt`.
- Each action re-derives the session **and** re-checks authority on the server
  before writing: `cancelOrder` loads the record and refuses unless
  `order.sessionId === session.user.id` (`403` otherwise), and `advanceOrder`
  refuses unless `session.user.role === "staff"`. Neither check can be bypassed
  from the console, because the client never sees another account's id or
  another account's role — it only holds a reference the server resolves.

`app/menu/SearchBox.jsx` is the **only client component in the menu
segment** — the error boundary was removed from that segment for exactly this
reason (`/menu` is prerendered and fails loudly at build time; Next's default
global error page covers runtime faults). `app/orders/[id]/OrderStatus.jsx` is
likewise the only client component in the order segment; both pages above them
stay server components.

## Component table

| Component         | File                        | Runs on                    | `"use client"` | Why it is on that side                                                                                                                     |
| ----------------- | --------------------------- | -------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `RootLayout`      | `src/app/layout.jsx`        | Server                     | no             | Markup + composition only. It wraps everything in `<Providers>` and renders `<Header>`/`<Footer>`.                                          |
| `HomePage`        | `src/app/page.jsx`          | Server                     | no             | Static copy.                                                                                                                               |
| `Providers`       | `src/app/providers.jsx`     | **Client**                 | **yes**        | The single client entry at the root. Mounts `CartProvider` so every consumer below can be a client leaf without importing the store itself.  |
| `CartContext`     | `src/cart/CartContext.jsx`  | Client by inheritance      | **no**         | Only imported from `providers.jsx` (a client entry), so it already compiles as client code. Marking it would be redundant; importing it from a server file would be the actual bug. |
| `Header`          | `src/components/Header.jsx` | Server                     | no             | Brand + nav links are pure markup — and it deliberately does **not** read the session (that would make every route dynamic). It renders two client leaves: `AccountMenu` and `CartBadge`. |
| `Footer`          | `src/components/Footer.jsx` | Server                     | no             | Static text.                                                                                                                               |
| `AccountMenu`     | `src/components/AccountMenu.jsx` | **Client**            | **yes**        | Day 42's leaf: `useSWR("/api/session")` → "Sign in" link, or the name + a sign-out form, plus the staff-only Kitchen link. The header learns who you are from this one query, not from `cookies()`. |
| `CartBadge`       | `src/components/CartBadge.jsx` | **Client**              | **yes**        | Reads `count` from context — state can only be read in the browser. The smallest leaf the header needs.                                     |
| `MenuLayout`      | `src/app/menu/layout.jsx`   | Server                     | no             | Just segment metadata — renders `children` bare. The old category sidebar was removed by request, so the list is now full-width.               |
| `MenuPage`        | `src/app/menu/page.js`      | **Server, async**          | no             | `await queryDishes({ page: 1 })` + `revalidate = 3600`. Passes the first page to `SearchBox` as `fallbackData` **and** as a server `DishList` slot. Still no hooks, no `loading`/`error` state, no fetch of its own.         |
| `DishList`        | `src/components/DishList.jsx` | **Server, and client-by-inheritance** | **no**         | Pure markup from a `dishes` prop — one card each (name, price, add button) with `data-category`/`data-name`. Rendered by the server as `SearchBox`'s default slot **and** imported by the client `SearchBox` for query results; it never carries the directive, so the seed stays server markup and only the search path ships it. |
| `SearchBox`       | `src/app/menu/SearchBox.jsx` | **Client**             | **yes**        | Day 41's live seam (replaces the old `CategoryBar`). Debounces the term (400 ms), pages via `?page=` (`replaceState`), and switches **one** SWR key between `null` (empty term → render the server `children`) and `/api/dishes?q=…&page=…`. Owns the field, the pager and the result list. |
| `AddToCartButton` | `src/components/AddToCartButton.jsx` | **Client**         | **yes**        | Click handler + transient "Added" state. Rendered *inside* server `DishList` — legal, and the seam the App Router expects.                   |
| `MenuLoading`     | `src/app/menu/loading.js`   | Server                     | no             | A streaming fallback is markup only.                                                                                                       |
| `MenuSlugPage`    | `src/app/menu/[id]/page.jsx`| **Server, async**          | no             | `await params`, `generateStaticParams()`, `notFound()`. Category pages reuse server `DishList`.                                             |
| `CartPage`        | `src/app/cart/page.jsx`     | Server                     | no             | Server done intentionally: it holds no copy — the client `CartList` is the only child, and it renders nothing until the cart has items.          |
| `CartList`        | `src/components/CartList.jsx` | **Client**               | **yes**        | Reads and mutates cart state (quantity, remove, clear). An empty cart renders `null` — no placeholder text on screen.                           |
| `CheckoutPage`    | `src/app/checkout/page.jsx` | **Server, dynamic**        | no             | `await getSession()` — a request-time API, not a client fetch. Kept `force-dynamic` even though the page renders no visible text (blank by request). |
| `CheckoutForm`    | `src/app/checkout/CheckoutForm.jsx` | **Client**         | **yes**        | Calls the `placeOrder` server action via `useActionState`; owns the pending flag and renders the returned `fieldErrors`. The submission has no `fetch`. |
| `OrdersPage`      | `src/app/orders/page.jsx`   | **Server, dynamic**        | no             | `await getSession()`, then `listOrders().filter((o) => o.sessionId === user.id)` — the account's own receipts. |
| `KitchenPage`     | `src/app/kitchen/page.jsx`  | **Server, dynamic**        | no             | `await getSession()`; `notFound()` unless `role === "staff"`. Renders every account's orders with a bound-action **Advance** form. |
| `SignInPage`      | `src/app/signin/page.js`    | **Server, dynamic**        | no             | Reads `?next=`, runs `safeNextPath`, and renders server markup around the client form + the seeded-accounts panel. |
| `SignInForm`      | `src/app/signin/SignInForm.jsx` | **Client**             | **yes**        | The `signIn` action via `useActionState`; carries `next` as a hidden field. |
| `OrderStatusPage` | `src/app/orders/[id]/page.js` | **Server, async**        | no             | `await params`, `await getSession()`, `await getOrder(id)`, ownership check, `notFound()`. Renders the order into the HTML, then hands it to the client `OrderStatus` as `fallbackData` — the seed the poll updates. |
| `OrderStatus`     | `src/app/orders/[id]/OrderStatus.jsx` | **Client**       | **yes**        | The only client component in the order segment. One `useSWR(url, fetcher, { fallbackData, refreshInterval: 5000, … })` — no manual `setInterval`, no `useEffect`, no spinner on first paint — plus the Day 42 cancel button (`cancelOrder`). |
| `fetcher`         | `src/lib/fetcher.js`        | **Client** (shared)        | no             | The one `useSWR` fetcher: `res.ok` or throw. Imported by the two client queries; carries no directive because it is only ever reached from client entries. |
| `format.js`       | `src/lib/format.js`         | **Shared**                 | no             | `fmt` for prices. Extracted from `data/dishes.js` on Day 41 so the client `SearchBox`→`DishList` path formats prices without pulling in `node:fs`. |
| `schema.js`       | `src/lib/schema.js`         | **Shared**                 | no             | The one zod schema. Imported by the client form-adjacent code, the `POST /api/orders` route, and `placeOrder` — a single source of truth for what a valid order is. |
| `actions.js`      | `src/actions.js`            | **Server only** (`"use server"`) | no      | `signIn`, `signOut`, `placeOrder`, `cancelOrder`, `advanceOrder`. Verifies passwords, sets/clears the session, writes orders, revalidates, and enforces ownership + role. |
| `orders.js`       | `src/lib/orders.js`         | **Server only**            | no             | `node:fs`-backed order store (`data/orders.json`). Never imported by a client component. |
| `session.js`      | `src/lib/session.js`        | **Server only**            | no             | `getSession` / `startSession` / `endSession` / `safeNextPath`. Pulls in `node:`-backed `auth.js`, so it is only reachable from server components, route handlers and actions — never the middleware. |
| `session-cookie.js` | `src/lib/session-cookie.js` | **Edge-safe, shared**    | no             | The only auth module with **no `node:` imports**: `SESSION_COOKIE`, `SESSION_TOKEN_PATTERN`, `SESSION_COOKIE_OPTIONS`, `isSessionToken`. This is what makes the middleware legal on the edge runtime. |
| `auth.js`         | `src/lib/auth.js`           | **Server only**            | no             | `node:fs` + `node:crypto`: the user store (`users.json`), `verifyPassword` (scrypt + `timingSafeEqual`), and the session store (`sessions.json`). |
| `dishes.js`       | `src/data/dishes.js`        | **Server only**            | no             | Uses `node:fs` to read `public/menu.json`; exports `queryDishes`/`PAGE_SIZE` and re-exports `fmt`. Never imported by a client component, so it stays out of the bundle entirely — the client formatting path goes through `lib/format.js` instead.                     |

## The boundary techniques

### 1. Server children passed into a client shell

```jsx
// src/app/menu/page.js  (server)
<SearchBox initial={initial}>
  <DishList dishes={initial.data} />   {/* server element, serialized as a slot */}
</SearchBox>
```

`SearchBox` is the client shell at the menu seam. On Day 41 it grew a job — it
owns the debounced query and the pager — but it still does **not** import
`DishList` for its default view: while the search box is empty the SWR key is
`null`, so React renders the `children` it was handed, and the dish markup
stays server-produced inside the RSC payload. Only when a term is committed
does `SearchBox` render `DishList` itself (now as a client-by-inheritance
component) to draw query results. So the bundle holds the shell, the field and
the leaf buttons for the *search* path; the *default* grid is still pure server
markup with no client cost.

### 2. Server data as the query's `fallbackData`

```jsx
// src/app/orders/[id]/page.js  (server)  →  OrderStatus.jsx  (client)
const order = await getOrder(id);
notFound() if (!order);
<OrderStatus initialOrder={order} />   // client: useSWR(url, fetcher, { fallbackData: initialOrder })
```

The order status screen is the cleanest boundary example in the app: the server
renders the **complete** order (reference, items, total, status badge) into the
HTML, and the client component receives that same object as `fallbackData`.
SWR therefore has data on the very first client render — no request, no
spinner — and its first job is only to *refresh* what is already on screen every
5 seconds. The client owns the poll; the server owned the first paint.

### 3. Client context crossing server components

```
<Providers>            client
  <Header>             server   ← context passes straight through
    <CartBadge />      client   ← reads count here
```

`Providers` (client) sits at the root of the layout tree. `Header` (server)
is rendered *between* the provider and the consumer, which does not break the
context — only the client leaf calls `useCart()`.

## Before / after: First Load JS on `/menu`

> This is the **Day 38** boundary experiment, kept because it is the clearest
> proof that the server/client split itself moves the number. It predates Day
> 41, so the `CategoryBar` shell it mentions no longer exists (replaced by
> `SearchBox`) and its `/menu` "after" is not the current build — the Day 41
> delta is in its own subsection below.

**Method.** The "before" variant is the capstone's own approach applied to
this app: `menu/page.js` became a `"use client"` component that `fetch`es
`/menu.json` in a `useEffect` **with `loading` and `error` state** (the code
the brief says to delete), and `DishList` was marked `"use client"`. Both
variants render the **same** markup — a no-text `/menu` that goes straight to
the 20-card grid — and both keep `CategoryBar` as a client shell, so the only
variable is the boundary. Three files were swapped, then:

```bash
npm run build && npm run measure -- menu before   # variant
# restore the three files, then
npm run build && npm run measure -- menu after    # shipped version
```

`npm run measure` (`scripts/first-load-js.mjs`) reads
`.next/server/app/menu.html`, resolves every `<script src>` against
`.next/static`, and sums raw + gzip sizes.

### Summary

| Metric                             | Before (client menu) | After (server menu) | Delta |
| ---------------------------------- | --------------------: | -------------------: | ----: |
| External scripts on `/menu`        |      8 · **565.0 KB** |     8 · **563.3 KB** | **−1.7 KB** |
| … same, gzipped                    |           174.0 KB |          173.4 KB | −0.6 KB |
| Menu page chunk (page-specific)    | 2.4 KB `3-d9fm7bh-y8w.js` | 683 B `2-t9rq8s9cewu.js` | **−72 %** |
| `"use client"` directives          |                  7 |                    **5** | −2 |
| Dishes server-rendered in HTML     |            **0 / 20** |               **20 / 20** | +20 |
| `menu.html` document               |    10,010 B (2,419 gz) | 37,893 B (6,889 gz) | +27,883 B |
| Inline RSC payload                 |             8.2 KB |             29.0 KB | +20.8 KB |
| Menu data arrives via…             | a second request to `/menu.json` after hydration | the HTML itself | **−1 round trip** |
| Steps before the menu is visible   | download JS → hydrate → fetch → render | HTML already contains it | 4 → 1 |

### How to read the numbers honestly

- **Executable JS goes down** (−1.7 KB raw / −0.6 KB gzip total, −72 % on the
  page's own chunk). The 7 shared chunks — Next.js + React runtime, 562.7 KB
  raw — are byte-identical in both builds; that floor is not affected by any
  boundary decision, which is why the headline delta looks small.
- **The before build hides a fourth step**: its dish data is fetched at
  runtime from `/menu.json` (13,097 B raw / 3,270 B gzip) *after* hydration.
  That request is not part of First Load JS, so it never shows up in the
  table above.
- **Total network bytes to a usable menu** (First Load JS + HTML + the data
  fetch), gzipped: before **≈ 179.7 KB**, after **≈ 180.3 KB**. You pay under
  **1 KB more** to ship a fully painted menu instead of a spinner.
- The **inline RSC payload grows** because 20 dishes now travel as data +
  markup instead of as JS modules. That payload is not executed — it is what
  React would have had to render anyway, and in the before build the same
  content never arrives until step four.

### Day 41 delta — what the live-data seam cost on `/menu`

The before/after above is the Day 38 boundary experiment and still holds: the
menu is a server component. Day 41 added a client query *to that server page*,
so the honest question is what SWR cost. Measured the same way (`npm run
measure -- menu day41`):

| Metric                          | Day 38 (server menu) | Day 41 (+ SWR search/pager) | Delta |
| ------------------------------- | -------------------: | --------------------------: | ----: |
| External scripts on `/menu`     |      8 · **563.3 KB** |            9 · **578.6 KB** | **+1 script · +15.3 KB** |
| … same, gzipped                 |            173.4 KB |                  179.9 KB | +6.5 KB |
| Inline RSC payload              |             29.0 KB |                     15.0 KB | **−14.0 KB** |
| `menu.html` document            | 37,893 B (6,889 gz) |       19,720 B (4,355 gz) | −18,173 B |
| Dishes shipped in the HTML      |             20 / 20 |            6 / 20 (page 1) | paged |
| Requests on the **default** view |                   0 |                           0 | **0** |

Read it this way: the +15.3 KB is the SWR runtime chunk, paid **once** on the
menu route — the per-route table below shows every other page is byte-identical,
so SWR is not in their bundles. In exchange, the page pays **less** on the wire
(−14 KB of inline RSC, a document less than half the size) because page 1 (6
dishes) ships instead of all 20, and the default view still issues **zero**
requests: the empty search box means a `null` SWR key, so the server seed is
shown untouched until the visitor actually types or pages (see `DATA.md`).

### Per-route First Load JS (Day 41 shipped build)

| Route               | Scripts | Raw     | Gzip   | Inline RSC | HTML shell  |
| ------------------- | ------: | ------: | -----: | ---------: | ----------- |
| `/`                 |       7 | 562.7 KB | 173.0 KB |     5.4 KB | prerendered |
| `/menu`             |       9 | 578.6 KB | 179.9 KB |    15.0 KB | 19,720 B    |
| `/menu/doro-wat`    |       8 | 563.2 KB | 173.3 KB |     9.4 KB | prerendered |
| `/menu/wat`         |       8 | 563.2 KB | 173.3 KB |    14.0 KB | prerendered |
| `/cart`             |       8 | 564.3 KB | 173.6 KB |     5.6 KB | prerendered |
| `/checkout`         |       — |       — |       — |          — | **dynamic: no HTML shell (by design)** |
| `/orders/[id]`      |       — |       — |       — |          — | **dynamic: no HTML shell (seeded server-side at request time)** |

```bash
npm run measure                  # /menu, label "after"
npm run measure -- menu day41    # the Day 41 build
npm run measure -- cart          # any prerendered route
npm run measure -- checkout      # exits: dynamic routes are not prerendered
```
