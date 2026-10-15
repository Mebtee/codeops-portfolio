# BOUNDARY.md — which side runs where, and why

Mesob House is a **client-heavy** application: the entire capstone was a
single-page app whose screens own state, stores, and event handlers. The
migration keeps that reality instead of pretending otherwise, but it draws the
server/client line on purpose so the document shell, routing, and static copy
stay on the server.

Two rules drive every decision:

1. **A page file is a server component by default; it renders exactly one
   client island.** Three behaviours force a component to the client: React
   state/effects, an event handler, or a Zustand store (`localStorage`
   subscription).
2. **The directive belongs on the smallest interactive leaf** — never on a
   layout or a purely presentational component.

## The directive inventory

`grep -rn '"use client"' src/` returns **12** files:

```
src/app/providers.jsx                     store rehydration after mount
src/app/error.jsx                         client error boundary
src/Component/Header/Header.jsx           mobile-nav open state
src/Component/Header/CartForm/CartForm.jsx  cart totals + auth store
src/Component/FullMenu/FullMenu.jsx       search/filter state + cart
src/Component/RoyalDish/RoyalDish.jsx     customiser state + useParams
src/Component/CurrentOrderCart/...        basket store + useRouter
src/Component/CheckoutDelivery/...        form + confirmation state
src/Component/Login/Login.jsx             form + auth store
src/Component/Signup/Signup.jsx           form + auth store
src/Component/NotFound404/...             favourites + cart + useRouter
src/Component/TodaySpecial/Container/Section4/Section4.jsx  add-to-cart
```

Everything else — the layouts, the page wrappers, `Footer` and its children,
`ImgBox`, the icon set, `data/*`, and `api.js`'s helper functions — is server
code or a module imported only by client leaves.

## Component table

| Component          | File                              | Runs on                | `"use client"` | Why                                                                                          |
| ------------------ | --------------------------------- | ---------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `RootLayout`       | `src/app/layout.jsx`              | Server                 | no             | Document shell + all global CSS. Renders `<Header>`, `{children}`, `<Footer>`, `<Providers>`. |
| `Providers`        | `src/app/providers.jsx`           | **Client**             | **yes**        | Calls `persist.rehydrate()` once after mount so SSR/first render never reads `localStorage`.  |
| `Header`           | `Component/Header/Header.jsx`     | **Client**             | **yes**        | Owns the mobile-nav `open` state and a resize listener.                                       |
| `Nav`              | `Component/Header/Navigation/Nav.jsx` | Client by inheritance | no          | Only renders `next/link`s and calls handler props; imported from client `Header`.             |
| `CartForm`         | `Component/Header/CartForm/CartForm.jsx` | **Client**       | **yes**        | Reads cart count/subtotal and the auth store.                                                 |
| `Footer`           | `Component/Footer/Footer.jsx`     | Server                 | no             | Static composition of two child blocks.                                                       |
| `FooterUpper` / `FooterBrand` / `FooterColumn` / `FooterLower` | `Component/Footer/**` | Server | no | Pure markup + `next/link`; no state.                                                          |
| `ImgBox`           | `Component/UI/ImgBox.jsx`         | Server                 | no             | One presentational `<img>`; legal in server and client trees.                                 |
| `icons.jsx`        | `Component/UI/icons.jsx`          | Server                 | no             | Inline SVG constants.                                                                         |
| `FullMenu`         | `Component/FullMenu/FullMenu.jsx` | **Client**             | **yes**        | Search text, active category, add-to-cart.                                                    |
| `RoyalDish`        | `Component/RoyalDish/RoyalDish.jsx` | **Client**           | **yes**        | Option state + `useParams()` for the slug.                                                    |
| `CurrentOrderCart` | `Component/CurrentOrderCart/CurrentOrderCart.jsx` | **Client** | **yes** | Basket store, coupon/note state, `useRouter().push`.                                          |
| `CheckoutDelivery` | `Component/CheckoutDelivery/CheckoutDelivery.jsx` | **Client** | **yes** | React Hook Form, Telebirr verify, confirmation.                                               |
| `Login`            | `Component/Login/Login.jsx`       | **Client**             | **yes**        | Form + auth store + `useRouter().push`.                                                       |
| `Signup`           | `Component/Signup/Signup.jsx`     | **Client**             | **yes**        | Form + auth store.                                                                            |
| `NotFound404`      | `Component/NotFound404/NotFound404.jsx` | **Client**       | **yes**        | Reads menu + cart, `useRouter().push`.                                                        |
| `TodaySpecial`     | `Component/TodaySpecial/TodaySpecial.jsx` | Server        | no             | Static composition of three sections.                                                         |
| `Section4`         | `TodaySpecial/.../Section4.jsx`   | **Client**             | **yes**        | "Add Extra Injera" writes to the cart store.                                                  |
| `Section5` `Section6` | `TodaySpecial/.../Section5/6.jsx` | Server              | no             | Static copy + `next/link`.                                                                     |
| `useMenuData` / `findDish` | `src/api.js`              | Client (called by client leaves) | no | Kept as the capstone's runtime fetch hook.                                                   |
| `dishes-server.js` | `src/lib/dishes-server.js`        | Server only            | no             | `node:fs` read of `public/menu.json` for `generateStaticParams`.                              |

## The boundary techniques

### 1. Server page wrapper → one client island

Every route is a server `page.jsx` that exports `metadata` and renders a single
client component, e.g.:

```jsx
// src/app/menu/page.jsx (server)
import FullMenu from "@/Component/FullMenu/FullMenu";

export const metadata = { title: "Menu — Mesob House" };

export default function MenuPage() {
  return <FullMenu />;   // client island
}
```

The shell, route matching, and metadata stay on the server; only the island
ships to the browser.

### 2. `generateStaticParams` for the dynamic segment

`src/app/menu/[id]/page.jsx` is a server file. It reads the same
`public/menu.json` the client hook fetches and enumerates the 20 slugs, so the
dish route is **statically generated** (`●`) instead of server-rendered on
demand.

### 3. Persisted Zustand without a hydration mismatch

`zustand/persist` reads `localStorage`, which does not exist on the server. The
stores are created with `skipHydration: true`; the client-only `Providers`
component calls `rehydrate()` in a `useEffect`. The server HTML and the first
client render are therefore identical, and the saved cart only appears after
mount.

### 4. Global CSS from the app directory

Vite allowed `import './X.css'` inside every component. The App Router only
allows global CSS to enter through the `app/` directory, so the per-component
imports were removed and the stylesheets are imported once, in cascade order,
from `src/app/layout.jsx`.

## JavaScript-disabled behaviour

Because each page is server-rendered, fetching a route with JS disabled returns
the full document shell and static copy (header, footer, forms, menu pushed
onto the page by the client fetch is the one exception). Interactive state
(search, cart, login) needs hydration — see the failure checks in `README.md`.
