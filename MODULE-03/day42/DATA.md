# DATA.md — every query this app makes, its key, its refresh rule, and why

The app runs exactly **four SWR queries** (one of them is `null` by design)
plus a handful of server-side reads that are not queries at all. This file
records each key, each refresh rule, and the reasoning — nothing is configured
by habit.

---

## The fetcher: `src/lib/fetcher.js`

Every `useSWR` call in the app takes the same second argument:

```js
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json();
};
```

**Why one fetcher:** one place decides what an error is (a thrown `Error` with
the status), one place to add auth headers or a base URL later, and every
query below fails the same way — `error` is set, `data` keeps whatever was
last shown. The client never calls bare `fetch` for server data anywhere
else; the checkout form submits a server action, not a fetch.

---

## Query 1 — order status poll

**Where:** `src/app/orders/[id]/OrderStatus.jsx`
**Key:** `` `/api/orders/${initialOrder.id}` `` — one string key per order id.

| Option | Value | Why |
| --- | --- | --- |
| `refreshInterval` | `5000` | The requirement itself: poll every five seconds. |
| `staleTime` | `5000` | One full poll window. Implicit triggers (network reconnect, SWR dedupe expiry) inside that window are skipped, so no matter how triggers pile up, the ceiling is **one request per 5 s**. `refreshInterval` still ticks on its own schedule. |
| `revalidateOnFocus` | `false` | Redundant: the interval already guarantees the copy is ≤ 5 s old. Focus revalidation would add a request every time you switch tabs and learn nothing new. |
| `refreshWhenHidden` | `false` | A background tab must not poll. You are not looking at the screen; there is nothing to update. When you return, the next tick (≤ 5 s) catches up. |
| `fallbackData` | the server-rendered order | **Why no spinner on first paint:** `/orders/[id]` is a server component that renders the full order into the HTML, then hands it to the client as `fallbackData`. The very first client render therefore already has `data` — SWR has nothing to load, it can only *update*. The poll refines what the page already shows; it never gates it. |
| `keepPreviousData` | not set | The key never changes for a given screen, so data is replaced in place. There is no between-keys frame to protect. |

**Race safety:** a single constant key for the life of the screen. Every
response applies to that key, so two responses can only replace each other in
time order — there is no key A response that could land on top of key B's.

**What you should see in the network tab:** one request shortly after mount
(freshness check against the seed), then one every 5 seconds. The
"Last synced" line only starts ticking after the first response actually
lands (it is guarded by a `wasValidating` ref, not set optimistically), and
the badge carries `aria-live="polite"` so a status change — say a cancel from
another tab — is announced once, instead of announcing every tick.

---

## Query 2 — the null key (default menu view)

**Where:** `src/app/menu/SearchBox.jsx`
**Key:** `null` — while `q === ""` **and** `page === 1`.

**Why a null key:** the server already rendered that exact view into the
HTML. `/menu` is a server component with `revalidate = 3600` that seeds page 1
(`queryDishes({ page: 1 })`) and passes it down as `children` of the client
`SearchBox`. A key here would request data the page is already holding, and
the brief's rule applies literally: **an empty search term means no query at
all.** With `key = null`, SWR is paused — zero requests, zero `isValidating`,
zero chance of a flash — and React renders the server children as-is.

The default view is therefore: HTML from the server, no client request, no
key. SWR only wakes up when the view *differs* from what the server seeded.

---

## Query 3 — live menu: search and paging

**Where:** `src/app/menu/SearchBox.jsx`
**Key:** built with `URLSearchParams`, so the key is exactly the request URL:

```
null                                      when q === "" && page === 1   (Query 2)
/api/dishes?page=2&pageSize=6             when q === "" && page > 1
/api/dishes?q=shiro&page=1&pageSize=6     when q !== ""
```

The key **is** the cache identity: one entry per `(term, page)` pair.

| Option | Value | Why |
| --- | --- | --- |
| debounce | `400 ms` (`DEBOUNCE_MS`) | The term enters the key only after typing pauses. One request per *settled* term — never one per keystroke. 400 ms is longer than a human keystroke gap (so it settles) and short enough that the list feels immediate. |
| `keepPreviousData` | `true` | **This is the anti-flash option.** When the key changes (next letter, next page), SWR keeps returning the previous key's data until the new response arrives, instead of resetting to `undefined` — which is what renders as the grid collapsing to "No dishes…" and refilling between searches. There is no frame in which the list is empty. |
| `staleTime` | `30000` | Menu data is revalidated hourly **server-side** (`revalidate = 3600`). Thirty seconds of client-side freshness means: re-typing a term you searched within the last 30 s resolves from cache with **no request and no flash**, while still picking up menu changes 120× faster than the server's own refresh cadence. Long enough to make backspacing cheap, short enough to stay honest about "live". |
| `revalidateOnFocus` | `false` | A browse list does not need a freshness check every time the tab gains focus; each one would be a request nobody asked for. |
| `fallbackData` | `initial` (the server page's result) | Guarantees the very first key transition starts from real data — `data ?? initial` in the render means the transition from the server view into the first search still shows dishes, never `undefined`. |

**Race safety, two layers:**

1. **Keying** — out-of-order responses cannot clobber each other, because a
   response for `?q=shi` belongs to the `?q=shi` key and cannot be written
   into `?q=shiro`'s slot. The classic race (slow request for "sh"
   resolving after the fast one for "shiro" and overwriting it) is
   structurally impossible.
2. **Debounce** — most interleavings never happen at all, because slow
   keystrokes never become keys.

**The page number lives in the query string** (`?page=2`) via
`window.history.replaceState` — a shallow URL update: no RSC request, no
server round trip, `/menu` stays ISR. On load, `?page=` is read back *after
hydration* (the server deliberately always seeds page 1, so first paint and
hydration agree — no mismatch — and a deep link resolves one effect later).

**Why `page` resets to 1 when a term becomes non-empty:** search results must
start at their own first page. Without the reset, searching while on page 4
of the full menu would query page 4 *of the matches* — often empty — and the
list would claim "no results" for a term that has three hits on page 1.

**Why paging is client-side (and what that buys):** reading `searchParams` in
the server component would opt `/menu` out of static generation and cost a
server render *plus* a duplicate fetch per page click (server renders page N,
SWR fetches page N). Keeping the page in client state means exactly **one**
request per page, an instant pager, and the ISR/`loading.js` behaviour from
days 38–40 unchanged. The trade-off, stated plainly: without JavaScript you
get page 1 only (a `<noscript>` note on the page says so), and a shared
`?page=2` link resolves after hydration rather than in the HTML.

---

## Query 4 — who is signed in

**Where:** `src/components/AccountMenu.jsx` (the header's client leaf)
**Key:** `/api/session` — one constant key for the whole app.

| Option | Value | Why |
| --- | --- | --- |
| `refreshInterval` | not set | The header does not need to *discover* a sign-out that happens in another tab; there is no cross-tab session story yet. It revalidates when it needs to (see below). |
| `revalidateOnFocus` | default (`true`) | Cheap and correct here: this is the one query where "did something change while I was away?" is a real question — you sign in in another tab, come back, and the header should catch up. One request on focus of a tiny JSON body. |
| `staleTime` | not set (0) | The answer is a boundary between signed-in and signed-out; it should not be served stale. |
| `fallbackData` | none | Unlike the order and menu queries, there is **no server-rendered value to seed** — and that is the whole point (see below). The first render shows neither name nor "Sign in" link until the answer lands. |

**Why this query exists at all — the constraint that shaped it.** The obvious
way to render "Sign in" vs. the user's name is to read the session in the root
layout or `Header`. But `cookies()` is a dynamic API: reading it in the layout
would make **every** route in the app dynamic and silently drop `/` and
`/menu` out of static/ISR. That cost is measured in `STRATEGY.md`'s route
table, which Day 42 leaves untouched on purpose.

So the header reads nothing. It mounts a client leaf that asks a small
endpoint instead. The price is that the header's session state is resolved
*after* hydration, one request later — the server never bakes a name into the
static HTML. In exchange, `/`, `/cart` and `/menu` keep their strategies. The
trade-off is stated plainly rather than hidden: the name appears a beat after
first paint, and never at the cost of the static shell everyone else pays for.

The endpoint never returns the token or the password hash — only
`{ id, name, email, role }`, exactly what the header renders (and `role`,
which decides the staff-only "Kitchen" link).

---

## Server-side reads that are *not* queries

| Read | Where | Rule | Why it is not SWR |
| --- | --- | --- | --- |
| `queryDishes({ page: 1 })` | `src/app/menu/page.js` | ISR, `revalidate = 3600` | The seed for Query 2/3. Fetching it client-side would reintroduce the round trip the server render already paid for. |
| `getSession()` | `src/app/checkout/page.jsx`, `orders/page.jsx`, `orders/[id]/page.js`, `kitchen/page.jsx`, and every private route handler | `force-dynamic`, every request | The identity the page guards and the ownership check are built on. It must be true at request time — a cached answer would be a security bug, not a stale number. |
| `getOrder(id)` | `src/app/orders/[id]/page.js` | `force-dynamic`, every request | Order status must be true at request time; the *updates* after that are Query 1's job. The page also checks `order.sessionId === user.id` and `notFound()`s a stranger — so the server render only ever holds *your* order. |
| `listOrders()` | `src/app/orders/page.jsx`, `src/app/kitchen/page.jsx` | `force-dynamic` | `/orders` filters it to `sessionId === user.id` before rendering; `/kitchen` (staff) renders all of them. A read-list, not a client cache: the pages are dynamic and re-run per request. |
| `getOrder(id)` | `GET /api/orders/[id]` | `force-dynamic` | The poll's source. Requires a session, and answers `404` for an unknown id **and** for someone else's id alike — the receipt link is no longer a bearer capability the way it was on Day 41; the cookie is. |
| `getDishes()` / `DISHES` | `GET /api/dishes[...]` | `force-dynamic` | Query 3's source; also serves the bare `GET /api/dishes` (`{ data: [...] }`, all 20) which keeps the days 38–40 contract. It is not an SWR key — nothing in the app calls it. |

---

## Quick reference — every key

| # | Key | Refresh rule | staleTime | First paint |
| --- | --- | --- | --- | --- |
| 1 | `/api/orders/<uuid>` | every 5 s (`refreshInterval`), hidden tabs paused | 5 s | server HTML via `fallbackData` — no spinner |
| 2 | `null` (empty term, page 1) | never — SWR is paused | n/a | server children in the HTML |
| 3 | `/api/dishes?q=…&page=…&pageSize=6` | on key change only (no interval, no focus) | 30 s, `keepPreviousData` | server children until the first key activates |
| 4 | `/api/session` | on mount and on focus (defaults) | 0 (default) | **nothing** — no server seed, the header resolves after hydration |

**How to verify in the network tab (seconds, not minutes):**

1. Type into the search box → requests appear **only after** you stop typing
   for 400 ms. A request per keystroke would mean the debounce is not wired.
2. Keep typing → the list **never flashes empty** between terms. An empty
   frame would mean `keepPreviousData` is missing.
3. Clear the box → key goes `null` → **no request at all**; the grid is the
   server's copy again.
4. Click **Next** → exactly one `GET /api/dishes?page=2&pageSize=6`, and the
   address bar reads `?page=2`.
5. Open `/orders/<id>` → content is in the HTML before any JS runs, then one
   request, then a steady 5 s cadence; "Last synced" ticks each time.
6. Sign in → the header's name appears a beat after the page paints
   (`/api/session` resolves); sign out → it reverts to "Sign in". The static
   pages themselves never re-rendered on the server — the change is one client
   query, not a dynamic route.
