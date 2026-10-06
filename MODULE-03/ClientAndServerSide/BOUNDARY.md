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

`grep -rn '"use client"' src/` returns **5** files:

```
src/app/menu/CategoryBar.jsx     client shell — renders server children
src/app/providers.jsx            the cart provider
src/components/AddToCartButton   the "+ Add" button
src/components/CartBadge         the header cart counter
src/components/CartList          the cart table
```

Every one of them is a leaf that owns a click handler or a piece of state.
Nothing above a leaf is marked: no page, no layout, no `DishList`, no data
module.

> The brief's tip: *"on a well-sorted application of this size you should find
> three or four"* — this one lands on **5**, because the cart has three
> genuinely independent interactive leaves (badge, add button, cart table) on
> top of the two the brief names (provider, category bar). Merging them into a
> single file would only hide the boundary, not move it.

`app/menu/CategoryBar.jsx` is the **only client component in the menu
segment** — the error boundary was removed from that segment for exactly this
reason (`/menu` is prerendered and fails loudly at build time; Next's default
global error page covers runtime faults).

## Component table

| Component         | File                        | Runs on                    | `"use client"` | Why it is on that side                                                                                                                     |
| ----------------- | --------------------------- | -------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `RootLayout`      | `src/app/layout.jsx`        | Server                     | no             | Markup + composition only. It wraps everything in `<Providers>` and renders `<Header>`/`<Footer>`.                                          |
| `HomePage`        | `src/app/page.jsx`          | Server                     | no             | Static copy.                                                                                                                               |
| `Providers`       | `src/app/providers.jsx`     | **Client**                 | **yes**        | The single client entry at the root. Mounts `CartProvider` so every consumer below can be a client leaf without importing the store itself.  |
| `CartContext`     | `src/cart/CartContext.jsx`  | Client by inheritance      | **no**         | Only imported from `providers.jsx` (a client entry), so it already compiles as client code. Marking it would be redundant; importing it from a server file would be the actual bug. |
| `Header`          | `src/components/Header.jsx` | Server                     | no             | Brand + nav links are pure markup; it renders one client leaf (`CartBadge`).                                                               |
| `Footer`          | `src/components/Footer.jsx` | Server                     | no             | Static text.                                                                                                                               |
| `CartBadge`       | `src/components/CartBadge.jsx` | **Client**              | **yes**        | Reads `count` from context — state can only be read in the browser. The smallest leaf the header needs.                                     |
| `MenuLayout`      | `src/app/menu/layout.jsx`   | Server                     | no             | Just segment metadata — renders `children` bare. The old category sidebar was removed by request, so the list is now full-width.               |
| `MenuPage`        | `src/app/menu/page.js`      | **Server, async**          | no             | `await getDishes()` + `revalidate = 3600`. No hooks, no `loading`/`error` state, no fetch in the component — this is the whole point.         |
| `DishList`        | `src/components/DishList.jsx` | **Server**               | **no**         | Pure markup from data — 20 minimal cards (dish name, price, add button) carrying `data-category`/`data-name` attributes. `grep -rl "Classic Doro Wat" .next/static/chunks/` finds **nothing** in the client bundle. |
| `CategoryBar`     | `src/app/menu/CategoryBar.jsx` | **Client**             | **yes**        | The brief's FilterShell. After the UI-stripping pass it renders only `children` — a client seam with no markup of its own; it never imports `DishList`. |
| `AddToCartButton` | `src/components/AddToCartButton.jsx` | **Client**         | **yes**        | Click handler + transient "Added" state. Rendered *inside* server `DishList` — legal, and the seam the App Router expects.                   |
| `MenuLoading`     | `src/app/menu/loading.js`   | Server                     | no             | A streaming fallback is markup only.                                                                                                       |
| `MenuSlugPage`    | `src/app/menu/[id]/page.jsx`| **Server, async**          | no             | `await params`, `generateStaticParams()`, `notFound()`. Category pages reuse server `DishList`.                                             |
| `CartPage`        | `src/app/cart/page.jsx`     | Server                     | no             | Server done intentionally: it holds no copy — the client `CartList` is the only child, and it renders nothing until the cart has items.          |
| `CartList`        | `src/components/CartList.jsx` | **Client**               | **yes**        | Reads and mutates cart state (quantity, remove, clear). An empty cart renders `null` — no placeholder text on screen.                           |
| `CheckoutPage`    | `src/app/checkout/page.jsx` | **Server, dynamic**        | no             | `await cookies()` — a request-time API, not a client fetch. Kept `force-dynamic` even though the page renders no visible text (blank by request). |
| `dishes.js`       | `src/data/dishes.js`        | **Server only**            | no             | Uses `node:fs` to read `public/menu.json`. Never imported by a client component, so it stays out of the bundle entirely.                     |

## The boundary techniques

### 1. Server children passed into a client shell

```jsx
// src/app/menu/page.js  (server)
<CategoryBar>
  <DishList dishes={dishes} />   {/* server element, serialized as a slot */}
</CategoryBar>
```

`CategoryBar` is the client **FilterShell** described in the brief. After the
UI-stripping pass (no heading, no chips, no search — per request) it renders
only its `children`, which is the minimal job a client shell should have:
mark the seam, own nothing. It never imports `DishList`. The dish markup is
still produced on the server and handed over inside the RSC payload as a
slot; the client bundle holds the shell and the leaf buttons — nothing about
how a dish is drawn.

### 2. Client context crossing server components

```
<Providers>            client
  <Header>             server   ← context passes straight through
    <CartBadge />      client   ← reads count here
```

`Providers` (client) sits at the root of the layout tree. `Header` (server)
is rendered *between* the provider and the consumer, which does not break the
context — only the client leaf calls `useCart()`.

## Before / after: First Load JS on `/menu`

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

### Per-route First Load JS (after, shipped build)

| Route               | Scripts | Raw     | Gzip   | Inline RSC | HTML shell  |
| ------------------- | ------: | ------: | -----: | ---------: | ----------- |
| `/`                 |       7 | 562.7 KB | 173.0 KB |     5.4 KB | prerendered |
| `/menu`             |       8 | 563.3 KB | 173.4 KB |    29.0 KB | 37,893 B    |
| `/menu/doro-wat`    |       8 | 563.2 KB | 173.3 KB |     9.4 KB | prerendered |
| `/menu/wat`         |       8 | 563.2 KB | 173.3 KB |    14.0 KB | prerendered |
| `/cart`             |       8 | 564.3 KB | 173.6 KB |     5.6 KB | prerendered |
| `/checkout`         |       — |       — |       — |          — | **dynamic: no HTML shell (by design)** |

```bash
npm run measure                 # /menu, label "after"
npm run measure -- cart         # any prerendered route
npm run measure -- checkout     # exits: dynamic routes are not prerendered
```
