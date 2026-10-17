# Day 43 — Performance & Measurement

This module takes the Day 42 app ("Addis Eats") and walks through a
**measure → fix → re-measure** loop on the three things that most often hurt a
Next.js App Router site: **images**, **web fonts** and **third-party scripts**.

Every number below was measured on a **production build** with **Lighthouse 13**
using the default **mobile preset** (simulated 4G + 4× CPU throttling). Each
cell is the **median of two runs** per page.

## How to reproduce

```bash
npm run build
npm run start -- -p 3100

npx lighthouse http://localhost:3100/     --output=json --only-categories=performance
npx lighthouse http://localhost:3100/menu --output=json --only-categories=performance
```

- **LCP / FCP / TBT / CLS** come straight from the Lighthouse JSON.
- **INP** is not produced by a lab run with no user interactions, so it is
  reported as *N/A*; **Total Blocking Time (TBT)** is used as the main-thread
  proxy for interactivity.

## Results at a glance

| Page    | Metric      | Before    | After     |
| ------- | ----------- | --------- | --------- |
| `/`     | Perf score  | **0.60**  | **0.93**  |
|         | FCP         | 3227 ms   | 793 ms    |
|         | LCP         | 7857 ms   | 2715 ms   |
|         | CLS         | 0.001     | 0.000     |
|         | TBT         | 360 ms    | 204 ms    |
|         | Speed Index | 3941 ms   | 793 ms    |
|         | Page weight | 1915 KB   | 422 KB    |
|         | Images      | 7 / 1547 KB | 1 / 42 KB |
| `/menu` | Perf score  | **0.64**  | **0.82**  |
|         | FCP         | 3142 ms   | 776 ms    |
|         | LCP         | 7785 ms   | 4259 ms   |
|         | CLS         | 0.000     | 0.000     |
|         | TBT         | 170 ms    | 247 ms    |
|         | Speed Index | 5505 ms   | 913 ms    |
|         | Page weight | 1926 KB   | 1008 KB   |

## The baseline ("before")

The baseline deliberately contains three classic mistakes:

1. Dish photos and the home hero are plain `<img>` tags with **no
   `width`/`height`**, no `sizes`, and no `next/image`.
2. Inter is loaded from **Google Fonts with a render-blocking `<link>`**
   (`display=swap`).
3. Google Analytics (`gtag`) is loaded with a **plain eager `<script>`** in the
   root layout.

The headline problem was **LCP (~7.8 s on both pages)**: large unoptimized
JPEGs, a render-blocking font stylesheet, and an eager 155 KB analytics script
all competed for the same slow connection. The home page was even worse than it
looked — see the image-count note below.

## What we changed, and what it bought

### 1. `next/image` everywhere, with real dimensions and `sizes`

`src/app/menu/DishCard.jsx` and `src/app/page.jsx` now use `next/image` with the
true intrinsic size (`960×720` for dishes, `1920×1080` for the hero) and an
honest `sizes` attribute that matches the CSS grid:

```
sizes="(max-width: 555px) calc(100vw - 40px),
       (max-width: 821px) calc((100vw - 56px) / 2),
       calc((min(100vw, 1080px) - 72px) / 3)"
```

Effects:

- The browser now gets correctly sized **WebP** derivatives instead of the
  full-size JPEG (hero: **614 KB → ~42 KB**).
- Explicit `width`/`height` reserve the aspect ratio up front, so photos can
  never shift the layout.
- **This also stopped a hidden bandwidth leak.** React 19 automatically
  preloads every `<img>` ("suspensey images"), including images inside the
  **prefetched `/menu` payload** — so the *home page* was quietly downloading
  all 6 dish photos: **7 images / 1547 KB before → 1 image / 42 KB after.**
  `next/image` images are `loading="lazy"` by default, so prefetched routes no
  longer pull their photos.

### 2. `priority` on the one above-the-fold image — and nothing else

The home hero is the LCP element, so it is the only image with `priority`:

```jsx
<Image src="/images/hero-berbere-table.jpg" width={1920} height={1080}
       sizes="(max-width: 1080px) calc(100vw - 40px), 1040px" priority />
```

`priority` makes the hero `eager` **and emits `<link rel="preload" as="image">`
with the full `imageSrcSet`** so the browser starts fetching the exact right
size during head parsing. Dish cards deliberately stay lazy — the menu page has
**zero** image preloads.

### 3. `next/font` instead of a Google Fonts `<link>`

`src/app/layout.jsx` now self-hosts Inter:

```jsx
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
```

- Removes the extra **DNS + TLS + CSS round-trips to `fonts.googleapis.com` /
  `fonts.gstatic.com`** from the critical path (the font CSS was render
  blocking).
- Next generates a **metric-adjusted local fallback** (`size-adjust`), so the
  `display: "swap"` swap produces no layout shift.
- This is the change that most helped **FCP** (3.2 s → 0.8 s on both pages).

### 4. `next/script` with `strategy="lazyOnload"` for gtag

```jsx
<Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
```

`gtag.js` (155 KB) no longer blocks the main thread during startup — it loads
after the page is idle. Home-page **TBT dropped 360 ms → 204 ms**.

### 5. `.env.example` + ignored `.env*.local`

`.env.example` documents every variable with dummy values:

| Variable              | Used for                                             |
| --------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_GA_ID`   | gtag measurement ID (falls back to `G-DEMO0000000`)  |
| `NEXT_PUBLIC_SITE_URL`| `metadataBase` for canonical / Open Graph URLs       |

`.gitignore` now ignores `.env*.local`, and `metadataBase` is derived from
`NEXT_PUBLIC_SITE_URL` (falling back to `http://localhost:3000`).

## Honest caveats

- **CLS was already ~0 and stayed ~0.** React 19 preloads plain `<img>`s, so
  even the "unsized" baseline images had their space reserved before paint; and
  Inter's fallback metrics are close enough to the system font that the swap
  barely moved anything. `next/image` + `next/font` still make the reservation
  and the metric matching *explicit* rather than relying on that luck.
- **`/menu` TBT went slightly up (170 → 247 ms), the home page's went down.**
  TBT is the noisiest lab metric and the two pages differ in when the main
  thread is busy; the menu LCP element is the first *lazy* dish image, so its
  decode lands inside the measurement window. The large, consistent wins on both
  pages are **FCP, LCP, Speed Index and total bytes**.
- **INP needs real interactions**, so it is not available from Lighthouse; use
  TBT (or a field/RUM tool) instead.
