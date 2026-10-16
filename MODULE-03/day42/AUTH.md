# AUTH.md — how Addis Eats knows who you are, and what stops you doing anything else

Days 38–41 gave the app a backend: an orders API, a server action, and a
half-built idea of a "session" — an opaque cookie that was minted on first
write and used as the *owner key* on an order. There was no sign-in. Anyone
who loaded the site was handed a session; the "owner" of an order was
whoever's browser created it, and the only thing protecting a record was that
its UUID was hard to guess.

Day 42 replaces that with real authentication. A visitor is anonymous until
they sign in with a password. Signing in mints a session, signing out destroys
it, and from that point on **every read and every write is scoped to the
signed-in account** — the pages, the API routes and the server actions all ask
the same helper the same question and all get the same answer.

This file is the write-up: the credential model, the cookie, the session
store, the three layers that enforce it, the ownership policy, and — honestly
— what this is *not*.

---

## 1. The credential model

Users live in **`data/users.json`**, a tracked file (unlike `orders.json` and
`sessions.json`, which are created at runtime and gitignored). Each record:

```json
{
  "id": "usr_marta",
  "name": "Marta Bekele",
  "email": "marta@addiseats.et",
  "role": "customer",
  "password": "<salt-hex>$<hash-hex>"
}
```

Passwords are stored as **`scrypt(password, salt, 64)`**, hex-encoded, with a
per-user random salt, joined as `salt$hash`. Verification
(`verifyPassword` in `src/lib/auth.js`) re-derives the hash with the stored
salt and compares with **`crypto.timingSafeEqual`** — a constant-time compare,
so a wrong password cannot be recovered by measuring how long the comparison
took. The plaintext password is never stored, never logged, and never leaves
the process that verifies it.

**Why scrypt and not a bare SHA**: scrypt is deliberately memory- and
CPU-expensive, so a stolen `users.json` cannot be brute-forced at hash-rate
speed the way a plain digest can. The cost parameters are Node's defaults
(N=16384, r=8, p=1), which is the right ballpark for a demo and a real
starting point for one.

**Why `timingSafeEqual`**: `===` on strings exits at the first differing
byte, which turns hashes into a timing oracle. The compare above also checks
length first, because `timingSafeEqual` throws on mismatched buffers.

The three seeded accounts (also listed on `/signin` so the flow can be
exercised without a signup screen):

| Email | Password | Role |
| ----- | -------- | ---- |
| `marta@addiseats.et` | `AddisMarta1!` | customer |
| `dawit@addiseats.et` | `AddisDawit1!` | customer |
| `kitchen@addiseats.et` | `KitchenStaff1!` | staff |

---

## 2. The session: an opaque token, not a signed cookie

Signing in does **not** put the user's identity into a cookie. It creates a
random 32-byte token server-side and stores a **record** in
`data/sessions.json`:

```json
{ "token": "<64 hex chars>", "userId": "usr_marta",
  "createdAt": "…", "expiresAt": "…" }
```

…and sends only the token to the browser in the cookie
**`addis_eats_session`**. The cookie carries no user id, no name, no role — it
is a claim ticket, not a passport. The identity is looked up server-side on
every request by matching the token against the store.

This is the choice that makes **sign-out actually mean something**: deleting
the record revokes the token instantly, for every browser holding it. A
self-contained signed cookie (or a JWT) would still verify after sign-out
until it expired — the server would have no way to take it back. With a
server-side store, revocation is a list membership test.

**Why the token shape is checked before any file read**
(`src/lib/session-cookie.js` → `SESSION_TOKEN_PATTERN = /^[0-9a-f]{64}$/`):
the token is attacker-supplied input. Rejecting anything that isn't 64 hex
characters means the store lookup only ever runs on well-formed tokens, and
the same test can run cheaply at the edge (see §4).

### The cookie flags

| Flag | Value | Why |
| ---- | ----- | --- |
| `HttpOnly` | `true` | JavaScript cannot read it. `document.cookie` comes back empty; XSS cannot exfiltrate the session. The cookie is set by the server and read by the server only. |
| `Secure` | `true` | Only sent over HTTPS. (Over plain http on localhost the browser still stores it, which is why the curl proofs below pass the header manually — see §10.) |
| `SameSite` | `Lax` | Not sent on cross-site `POST`/fetch, so a third-party page cannot ride the cookie to forge a write. Top-level navigations to the app still carry it, so links and the sign-in redirect work. |
| `Path` | `/` | The whole app. |
| `Max-Age` | `604800` (7 days) | Matches `SESSION_TTL_MS`; after a week the cookie is dropped by the browser *and* the server-side record is treated as expired (`readSession` deletes it on sight). |

The flags live in one place — `SESSION_COOKIE_OPTIONS` in
`src/lib/session-cookie.js` — and are applied by exactly one call
(`store.set(...)` inside `startSession`). Nothing else in the app writes this
cookie.

---

## 3. Sign-in and sign-out

Both are server actions (`src/actions.js`), so the password travels in a
`POST` body over the same connection as everything else, and the response is a
redirect — never a JSON body echoed back into the page.

**Sign in** (`signIn`, `/signin`):

1. `findUserByEmail(formData.get("email"))` — lowercased lookup; no user and
   a bad password produce the *same* error ("Wrong email or password."), so
   the form is not an account-existence oracle.
2. `verifyPassword(user, formData.get("password"))` — scrypt + constant-time
   compare (§1).
3. On success: `startSession(user.id)` → `createSession` writes the record
   and `store.set(cookie, token, SESSION_COOKIE_OPTIONS)`.
4. `redirect(safeNextPath(formData.get("next")))` — back to where the visitor
   was headed, or `/`.

The `next` value comes from the URL, so it is a redirect target an attacker
controls — a classic open-redirect. `safeNextPath` (in `src/lib/session.js`)
accepts only strings that start with a **single** `/` and rejects `//host`,
`/\host`, and control characters, so `?next=https://evil.com` and
`?next=//evil.com` both fall back to `/`. The page and the action both run it:
the page decides whether to even render the hidden field, the action decides
where to actually send the browser. See §9.

**Sign out** (`signOut`, the button in `AccountMenu`):

1. `endSession()` reads the token, calls `deleteSession(token)` — the record
   is gone from `sessions.json` — and `store.delete(cookie)`.
2. `redirect("/")`.

After step 1 the old token is dead even if a copy of the cookie is still lying
around in a request header: `readSession` finds no record. This is proven
below by re-using a signed-out token against a write and getting `401`.

---

## 4. The three enforcement layers

No single check is trusted. The same question — *who is this?* — is asked at
three depths, each cheaper or stricter than the last:

| Layer | Where | What it can see | What it does |
| ----- | ----- | --------------- | ------------ |
| **Middleware** (edge) | `src/middleware.js` | the cookie string, nothing else | If a **private route** has no well-formed session cookie, redirect to `/signin?next=<path>`. A cheap shape test: it does not (and cannot) read the session store from the edge runtime. |
| **Page / route guard** | every page and API route that touches an order | `getSession()` — cookie → store → user | Missing session on a private surface → `401` (API) or a redirect (page); unknown record → same. This is the authoritative check. |
| **Ownership** | `placeOrder`, `cancelOrder`, `advanceOrder`, the orders pages | the resolved session **and** the record | An order carries `sessionId` = the **user id** of its creator. A read of someone else's order → `404`; a cancel by someone else → `403`. |

**Why middleware can't be the real check.** `src/middleware.js` runs on the
edge runtime. It cannot `node:fs` its way to `sessions.json`, so all it can
honestly do is reject a request whose cookie is missing or the wrong shape. It
is a convenience — signed-out visitors get bounced to `/signin` before a page
ever runs — not a security boundary. A **forged** cookie of the right shape
(e.g. 64 hex characters) sails straight through middleware and is stopped one
layer down, by `getSession` finding no matching record. The proofs in §10
exercise exactly that forged cookie through middleware.

**Why the page/route guard is the real check.** `getSession()` does the whole
chain — is there a cookie, is it well-formed, is there a live record, does the
user still exist — and returns `null` the moment any link breaks. Every
private surface calls it and refuses to proceed on `null`.

The private surfaces:

- **`/checkout`**, **`/orders`**, **`/orders/[id]`**, **`/kitchen`** — pages.
- **`POST /api/orders`**, **`GET /api/orders`**, **`GET /api/orders/[id]`** —
  API routes.
- **`placeOrder`**, **`cancelOrder`**, **`advanceOrder`** — actions.

The middleware matcher is the *page* list only:
`matcher: ["/checkout", "/orders/:path*", "/kitchen"]`. API routes are not
matched, because a redirect is the wrong answer for an API caller — they
return `401` instead, from their own guard.

> **Why the route is dynamic, and where the session is *not* read.** Reading
> `cookies()` in the root layout or header would make **every** route dynamic
> and drop `/` and `/menu` out of static/ISR — a real cost, measured in
> `STRATEGY.md`. So the header does not read the session at all. It mounts one
> client leaf, `AccountMenu`, which asks a small endpoint — `GET /api/session`
> — for the current user and renders a "Sign in" link or the name + sign-out
> button from the answer. The static/ISR strategy table is unchanged by
> authentication; only the private routes are dynamic, and they were already.

---

## 5. The ownership policy (read vs write)

The owner key on an order is `order.sessionId`, and it now holds the
**authenticated user id** (`usr_marta`, …) rather than a throwaway browser
token. (The field keeps its old name for continuity with days 38–41; the
value's meaning is the change. The task's wording was "session id", and the
user id *is* the stable session identity now.)

Two rules, applied consistently:

- **Reads** by a non-owner answer **`404`**, not `403`. A `403` on a read
  would confirm that the id exists and belongs to someone else — an existence
  oracle. `404` says "there is no such order *for you*", which is also what a
  genuinely unknown id says. A page renders Next's not-found; an API returns
  `404 { error: "Order not found" }`.
- **The cancel write** by a non-owner answers **`403`**, and this is
  deliberate: it is the documented Day 40 behaviour, it is the check the
  README's failure table (#5) pins, and it is the honest answer to an
  authenticated user who aimed at the wrong record. The trade-off — a
  determined attacker can distinguish 403 from 404 through `cancelOrder` and
  so learn that a *given* id exists — is accepted here because the ids are
  unguessable UUIDs, and the read path does not leak at all.

The full matrix:

| Surface | No session | Unknown id | Someone else's id | Your own id |
| ------- | ---------- | ---------- | ----------------- | ----------- |
| `GET /api/orders` (list) | `401` | — | — | `200`, **only your rows** |
| `GET /api/orders/[id]` (poll) | `401` | `404` | `404` | `200` |
| `/orders` (page) | redirect to `/signin?next=/orders` | — | — | your rows |
| `/orders/[id]` (page) | redirect to `/signin?next=…` | `404` | `404` | `200` |
| `POST /api/orders` | `401` | — | — | `201`, `sessionId = user.id` |
| `placeOrder` (action) | `401` "Please sign in to place an order." | — | — | `201`, `sessionId = user.id` |
| `cancelOrder` (action) | `401` | `404` | **`403`** | `200`, status → `cancelled` |
| `/kitchen` (page) | redirect to `/signin?next=/kitchen` | — | customer `404`, staff `200` | — |
| `advanceOrder` (action, staff) | `401` | `404` | — non-staff `403` (staff act on every order) | staff `200`, next status |

`advanceOrder` is gated by **role**, not ownership: staff advance anyone's
order. Its own `403` for a non-staff caller is defence in depth — a customer
cannot reach the action anyway, because `/kitchen` returns `404` before the
form (and hence the action reference) is ever rendered.

A subtlety worth stating: `placeOrder` no longer *creates* a session. Days
38–41's `ensureSessionId` minted a guest session on first write; `getSessionId`
was then used as the owner key. Both are deleted. Writing an order now
**requires** an existing session — if you are not signed in, the action
returns `401` and nothing is written. There are no guest orders anymore.

---

## 6. Roles

`users.role` is `"customer"` or `"staff"`. It is copied into
`session.user.role` by `getSession`, so it is available anywhere a session is.

The only role-gated surface is the **kitchen board** — `src/app/kitchen/page.jsx`,
a staff-only view of *every* account's orders (newest first), each with an
**Advance** button that moves an order one step along
`pending → preparing → on the way → delivered` via the `advanceOrder` action.

- Not signed in → middleware redirects to `/signin?next=/kitchen`.
- Signed in as a **customer** → the page calls `notFound()`, so `/kitchen`
  is a `404`. The board is not merely hidden in the nav; it does not exist for
  a non-staff account.
- Signed in as **staff** → the board renders, and `advanceOrder` re-checks
  `session.user.role === "staff"` before writing (defence in depth: the page
  guard already blocked everyone else).

`AccountMenu` shows the "Kitchen" link **only** when `/api/session` reports
`role === "staff"`. That is a convenience, not a control — the control is the
page guard. Anyone with the URL gets `404`, link or no link.

---

## 7. What this is *not*

An honest account of the gaps, so nothing here is mistaken for production auth:

- **No signup, no email verification, no password reset.** Accounts are seeded
  in `data/users.json`.
- **No rate limiting or lockout** on sign-in attempts. A real deployment needs
  both, plus a slower hash cost under load and a timing-equalised "user not
  found" path (the current code short-circuits when the email is unknown, so
  *response time* could still hint at existence even though the message does
  not).
- **A flat JSON file, single process.** `sessions.json`/`orders.json` are
  `readFileSync`/`writeFileSync` with no locking; concurrent writes from
  multiple processes could lose updates. Fine for one server, wrong for a
  cluster — that is a database's job.
- **No CSRF token of our own.** We lean on `SameSite=Lax` plus the Origin
  check Next.js performs for server-action POSTs ("the request is missing its
  `origin` header" is a rejection, not a warning). That is a reasonable
  default, not a bespoke defence.
- **No token rotation**; a session lives its full 7 days (or until sign-out).
- **`Secure` cookies over http.** During local testing the browser won't send
  a `Secure` cookie back on plain `http://localhost` in some setups; the curl
  proofs below set the `Cookie` header by hand for exactly this reason.

None of these are oversights dressed up as decisions — they are the boundary
of the exercise, listed so the boundary is visible.

---

## 8. Where the code lives

| File | Responsibility |
| ---- | -------------- |
| `src/lib/auth.js` | The user store (read `users.json`, `findUserByEmail`, `getUserById`), `verifyPassword` (scrypt + constant-time), the session store (`createSession` / `readSession` / `deleteSession`), `SESSION_TTL_MS`. |
| `src/lib/session-cookie.js` | Edge-safe constants with **no `node:` imports**: `SESSION_COOKIE`, `SESSION_TOKEN_PATTERN`, `SESSION_COOKIE_OPTIONS`, `isSessionToken`. Imported by both the middleware (edge) and `session.js`. |
| `src/lib/session.js` | The one helper the rest of the app uses: `getSession()` (cookie → store → `{ token, user }`), `startSession(userId)`, `endSession()`, and `safeNextPath`. Re-exports `SESSION_COOKIE`. |
| `src/middleware.js` | Private-route guard: shape-check the cookie, redirect to `/signin?next=…` when it is missing. `matcher: ["/checkout", "/orders/:path*", "/kitchen"]`. |
| `src/actions.js` | `signIn`, `signOut`, `placeOrder`, `cancelOrder`, `advanceOrder` — each re-derives the session on the server and enforces session + ownership (+ role). |
| `src/app/api/session/route.js` | `GET` → `{ data: user \| null }`; the query `AccountMenu` reads. |
| `src/components/AccountMenu.jsx` | Client leaf in the header: SWR over `/api/session`, "Sign in" link, or name + sign-out, plus the staff-only Kitchen link. |
| `src/app/signin/` | `page.js` (guards `next`, lists the seeded accounts) + `SignInForm.jsx` (`useActionState`). |
| `data/users.json` | Tracked seed users. |
| `data/sessions.json` | Runtime session store (**gitignored**). |

The split between `session-cookie.js` and `session.js` is the one that keeps
the middleware legal: middleware is bundled for the edge runtime, where
`node:fs`/`node:crypto` don't exist, so anything it imports must be free of
them. `session-cookie.js` is that safe subset; `session.js` pulls in the
`node:`-backed stores and is only imported by server components, route
handlers and actions.

---

## 9. `safeNextPath`, in full

The only place the app redirects to a URL it did not choose itself:

```js
export function safeNextPath(value, fallback = "/") {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(value)) return fallback;
  return value;
}
```

Allowed: `/orders`, `/checkout?step=2`. Rejected → `/`:
`https://evil.com` (not a path), `//evil.com` (protocol-relative — the browser
would treat it as `https://evil.com`), `/\evil.com` (same trick via
backslash), and anything with control characters. The sign-in page runs it to
decide whether to render the "you'll return to X" note; `signIn` runs it again
to decide where the browser actually goes. A caller cannot smuggle an
off-site redirect through a crafted `?next=`.

---

## 10. How to re-verify any of this

Against the production build (`npm run build && npm run start`, port 3000).
Because the test cookie is `Secure`, curl cannot *send* it automatically over
http — grab the token from `Set-Cookie` and pass it with `-H "Cookie: …"`.

```console
# 1. A private route bounces an anonymous visitor
$ curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' localhost:3000/checkout
307 -> http://localhost:3000/signin?next=%2Fcheckout

# 2. A write with no session writes nothing
$ curl -s -w '\n%{http_code}\n' -X POST localhost:3000/api/orders \
    -H 'Content-Type: application/json' -d '{ ...a valid order... }'
{"error":"No active session"}
401

# 3. Sign in and read the cookie's flags off the wire
$ curl -s -D - -o /dev/null -X POST localhost:3000/signin \
    -F 'email=marta@addiseats.et' -F 'password=AddisMarta1!' ...
set-cookie: addis_eats_session=<token>; Path=/; Max-Age=604800; Secure; HttpOnly; SameSite=lax
# 303 -> Location: /

# 4. The same write, now carrying the token
$ curl -s -X POST localhost:3000/api/orders \
    -H "Cookie: addis_eats_session=$MARTA" -H 'Content-Type: application/json' \
    -d '{ ...a valid order... }'
{"data":{"id":"…","reference":"AE-…","sessionId":"usr_marta","status":"pending", …}}   201

# 5. Two accounts, one record: the list is scoped, the detail 404s for the stranger
$ curl -s -H "Cookie: addis_eats_session=$MARTA" localhost:3000/api/orders   # 1 row
$ curl -s -H "Cookie: addis_eats_session=$DAWIT" localhost:3000/api/orders   # 0 rows
$ curl -s -o /dev/null -w '%{http_code}\n' -H "Cookie: addis_eats_session=$DAWIT" \
    localhost:3000/api/orders/$ID     # 404  (marta → 200)

# 6. A forged cookie of the right *shape* clears middleware, then fails the guard
$ FORGE=$(printf 'a%.0s' {1..64})
$ curl -s -H "Cookie: addis_eats_session=$FORGE" localhost:3000/checkout \
    | grep -o 'data-has-session="[a-z]*"'
data-has-session="no"          # middleware passed it; the page guard did not
$ curl -s -w '\n%{http_code}\n' -H "Cookie: addis_eats_session=$FORGE" localhost:3000/api/orders
{"error":"No active session"}
401

# 7. Sign out revokes the token; re-use is dead
$ curl ... /signin (sign in as marta) → sign-out action with $MARTA → then:
$ curl -s -o /dev/null -w '%{http_code}\n' -H "Cookie: addis_eats_session=$MARTA" \
    localhost:3000/api/orders
401

# 8. The staff board: anonymous → redirect, customer → 404, staff → 200
$ curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' localhost:3000/kitchen
307 -> http://localhost:3000/signin?next=%2Fkitchen
$ curl -s -o /dev/null -w '%{http_code}\n' -H "Cookie: addis_eats_session=$MARTA" localhost:3000/kitchen
404
$ curl -s -o /dev/null -w '%{http_code}\n' -H "Cookie: addis_eats_session=$KITCHEN" localhost:3000/kitchen
200
```

The two checks curl **cannot** show — that the cookie is invisible to
`document.cookie`, and that a cross-site page cannot ride it — are the
`HttpOnly` and `SameSite` flags, which the `Set-Cookie` line above states
directly. The behaviour those flags buy is verified in the browser: type
`document.cookie` in the console after signing in and the session token is not
there.
