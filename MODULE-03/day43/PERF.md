# Day 43 — Performance & Measurement

This module takes the Day 42 app ("Addis Eats") and walks through a
**measure → fix → re-measure** loop on the things that usually hurt a Next.js
App Router site: images, web fonts and third-party scripts.

Everything below was measured on a **production build** with **Lighthouse 13**
using the default **mobile preset (simulated 4G + 4× CPU throttling)**.

## How to reproduce

```bash
# 1. build and serve the production app
npm run build
npm run start -- -p 3100

# 2. measure (Lighthouse default = mobile, simulated throttling)
npx lighthouse http://localhost:3100/      --output=json --only-categories=performance
npx lighthouse http://localhost:3100/menu  --output=json --only-categories=performance
```

Notes on the numbers:

- **LCP / FCP / TBT / CLS** are read straight from the Lighthouse JSON.
- **INP** is not produced by a lab run with no user interactions, so it is
  reported as *N/A*; **Total Blocking Time (TBT)** is used as the main-thread
  proxy for interactivity.

## Baseline ("before")

The baseline deliberately contains the three classic mistakes:

1. Every dish photo and the home hero are plain `<img>` tags with **no
   `width`/`height`**, no `sizes`, and no `next/image`.
2. Inter is loaded from **Google Fonts with a render-blocking `<link>`**
   (`display=swap`).
3. Google Analytics (`gtag`) is loaded with a **plain eager `<script>`** in the
   root layout.

| Page    | Perf | FCP   | LCP   | CLS  | TBT    | SI    | INP |
| ------- | ---- | ----- | ----- | ---- | ------ | ----- | --- |
| `/`     | 0.60 | 3.14s | 7.78s | 0.00 | 365ms  | 3.91s | N/A |
| `/menu` | 0.64 | 3.23s | 7.20s | 0.00 | 142ms  | 5.54s | N/A |

What the baseline tells us:

- **LCP is the problem.** Both pages paint their largest element around ~7.5s.
  The hero (home) and the first dish photo (menu) are large unoptimized JPEGs,
  and the render-blocking font stylesheet plus the eager `gtag` script compete
  for the same slow connection.
- **CLS is already ~0.** Two things keep it there: React 19 (used by Next 16)
  automatically injects `<link rel="preload" as="image">` for every `<img>`
  ("suspensey images"), so the photos are fetched early and the browser can
  reserve their space; and Inter's fallback metrics are close enough to the
  system font that the `display=swap` swap barely moves anything. We keep this
  in mind when reading the "after" numbers — the win here is LCP and TBT, not
  CLS.
- **TBT is meaningful on the home page (365ms)** because `gtag.js` (~155 KB)
  runs on the main thread before the page is interactive.
