# STRATEGY.md — Mesob House on Next.js

Every route, the strategy Next.js uses for it, and one line of reasoning.
This is the **capstone (Mesob House)** migrated from Vite + React Router to the
Next.js App Router.

```bash
npm run dev      # http://localhost:3000
npm run build    # production build (prints the strategy table below)
npm run start    # serve the production build
```

Stack: **Next.js 16.3.8** (App Router, Turbopack) + React 19 + Zustand 5 +
React Hook Form + Zod.

## How the migration mapped

| Vite / React Router                        | Next.js App Router                                  |
| ------------------------------------------ | --------------------------------------------------- |
| `App.jsx` `<Routes>`                       | one `app/**/page.jsx` file per URL                  |
| `Layout.jsx` `<Outlet />`                  | `app/layout.jsx` `{children}`                       |
| `index.html` mount + `instrance.jsx`       | `app/layout.jsx` document shell                     |
| `React.lazy` + `<Suspense>`                | automatic per-route code splitting                  |
| `<Route path="*" element={<NotFound/>}>`   | `app/not-found.jsx`                                 |
| `<Navigate to="/delivery" replace />`      | `next.config.mjs` `redirects()`                     |
| `<Link to>`                                | `next/link` `href`                                  |
| `useNavigate()`                            | `useRouter().push()` (`next/navigation`)            |
| `useParams()`                              | `useParams()` (`next/navigation`)                   |
| `ErrorBoundary` class                      | `app/error.jsx` client error boundary               |
| `import './X.css'` per component           | CSS imported once from `app/layout.jsx` (App Router rule: global CSS comes from the app directory) |

The component tree, stores, menu data, ledger maths, and every screen were
carried over unchanged; only the routing seam and the styling entry point moved.

## Data layer

The menu still comes from `public/menu.json` (20 dishes) and
`public/specials.json`. `src/api.js` keeps the original `useMenuData()` fetch
hook, its module-level cache, its three-file normaliser (`normalize`,
`CAT_MAP`), and its offline fallback to `src/data/dishes.js`.

For the dynamic dish route, `src/lib/dishes-server.js` reads the same
`public/menu.json` with `node:fs` at build time so `generateStaticParams()` can
enumerate every slug.

## Route table

| Route           | File                          | Strategy                              | Config that produces it                              | Why                                                                                                                       |
| --------------- | ----------------------------- | ------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/`             | `src/app/page.jsx`            | Static shell + client island          | client `Signup` child                                | The join form owns hooks and the auth store; the page itself is a static server wrapper.                                  |
| `/signup`       | `src/app/signup/page.jsx`     | Static shell + client island          | client `Signup` child                                | Alias of `/` so the header CTA and footer links keep working.                                                             |
| `/login`        | `src/app/login/page.jsx`      | Static shell + client island          | client `Login` child                                 | Phone/password form is interactive.                                                                                       |
| `/menu`         | `src/app/menu/page.jsx`       | Static shell, client-fetched data     | client `FullMenu` child                              | Search + category chips + cart are client state; dish data arrives from `/menu.json` at runtime exactly as before.        |
| `/menu/[id]`    | `src/app/menu/[id]/page.jsx`  | **SSG** — 20 dish pages at build      | `generateStaticParams()` from `public/menu.json`     | Each slug is known at build, so the shell is prerendered and only the customiser hydrates.                                |
| `/future`       | `src/app/future/page.jsx`     | Static + one client island            | client `Section4` (add-to-cart) inside server page   | The landing copy is static; only the Extra-Injera add-on button needs the cart store.                                     |
| `/orderCart`    | `src/app/orderCart/page.jsx`  | Static shell + client island          | client `CurrentOrderCart` child                      | Basket and ledger read persisted Zustand state.                                                                           |
| `/delivery`     | `src/app/delivery/page.jsx`   | Static shell + client island          | client `CheckoutDelivery` child                      | Address/payment form and confirmation are client-only.                                                                    |
| `/Delibery`     | `next.config.mjs`             | 307 redirect → `/delivery`            | `redirects()`                                        | Keeps the capstone's misspelled link working.                                                                             |
| everything else | `src/app/not-found.jsx`       | Static                                | App Router not-found convention                      | Catch-all recovery screen with house favourites.                                                                          |

Expected build output:

```
Route (app)                 Revalidate  Expire
┌ ○ /                                   (Static shell + client island)
├ ○ /_not-found
├ ○ /delivery
├ ○ /future
├ ○ /login
├ ○ /menu
├   /menu/[id]
  ├ ● /menu/doro-wat
  └ ● [+19 more paths]
├ ○ /orderCart
└ ○ /signup
```

`○` static, `●` SSG via `generateStaticParams`.

## Rendering vs. the original

In the Vite build every page was a client bundle with a Suspense fallback. In
Next the same interactive components are client components, but the **document
shell for every route is still server-rendered and prerendered at build time**,
so with JavaScript disabled every route returns real HTML (see the
JavaScript-disabled check in `README.md`). Only the interactive behaviour
(search, add-to-cart, forms, the persisted cart) requires hydration.

## How to re-verify

```bash
npm run build                                   # strategy table above
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/menu        # 200
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/menu/doro-wat # 200
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/Delibery    # 307 -> /delivery
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/does-not-exist # 404
```
