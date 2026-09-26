# Keyfolk — design & build brief

Portfolio e-commerce **frontend** (no backend). It must look and feel like a real, premium, modern shop:
extremely beautiful, 3D, featured products, best practices, optimized. Language **pt-BR**, currency **BRL**
(`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`).

## Stack (already scaffolded in this folder)

- Next.js **16.3.6** App Router, React 19.2, TypeScript strict, Tailwind v4 (CSS-first `@theme`), React Compiler on.
  **This Next version has breaking changes. Read `node_modules/next/dist/docs/` before writing code**
  (at least `02-guides/upgrading/version-16.md`, `02-guides/lazy-loading.md`, `03-api-reference/02-components/font.md`,
  `03-api-reference/02-components/image.md`, `01-getting-started/14-metadata-and-og-images.md`,
  `03-api-reference/04-functions/generate-static-params.md`). `params` is a Promise. `next lint` no longer exists (use `npx eslint`).
  `images.qualities` defaults to `[75]`.
- Installed: `three`, `@react-three/fiber@9`, `@react-three/drei@10`, `zustand@5`, `motion@13` (import from `motion/react`), `@playwright/test`.
  Add small deps only when clearly worth it.
- Headless Chromium has a real GPU on this machine when launched with `args: ['--enable-gpu', '--use-angle=d3d11']`.

## Brand

**Keyfolk** — loja brasileira de teclados mecânicos custom: teclados, keycaps, switches, deskmats, cabos.
Audience: devs, creators and gamers, 18–35. Voice: warm, playful, knowledgeable, never cringe. Plain PT-BR,
sentence case, active verbs. CTAs say exactly what happens ("Adicionar ao carrinho" → toast "Adicionado ao carrinho").
Errors explain what went wrong and how to fix it. Empty states invite action.

## The one bold idea (spend boldness here, keep everything else disciplined)

1. **Hero = a 3D 75% keyboard that answers the visitor's real keyboard.** Every physical keypress (`KeyboardEvent.code`)
   depresses the matching 3D key (spring down ~3.5mm, back up on keyup) with legends on the caps. Ignore events
   whose target is an input/textarea/select/contenteditable. Never `preventDefault`. A subtle hint under the
   keyboard: "Digite qualquer coisa — o teclado responde." On touch devices the hint becomes "Toque nas teclas" and
   pointer-down on a 3D key presses it.
2. **Optional sound**: synthesized "thock" with WebAudio (no audio files). Short filtered noise burst + low sine body;
   variation per switch type (linear = deeper/rounder, tactile = mid, clicky = extra bright transient). **Off by default**,
   toggled by a clearly labeled button ("Som: desligado/ligado", `aria-pressed`). Modest volume. Lazily create the AudioContext on first enable.
3. **Colorways retint the whole site.** 5 colorways. Choosing one updates the 3D keycaps AND the page theme via CSS custom
   properties on `<html data-colorway="...">` (transition background/color ~600ms; respect reduced motion). Persist choice
   (localStorage, via zustand persist) so the site keeps the visitor's colorway across pages. Avoid a flash of the
   wrong theme: set `data-colorway` from localStorage with a tiny inline script in `<head>` before paint.
   The colorway picker looks like small physical keycaps (CSS), each showing its colors; accessible as a radiogroup.

### Colorways (tokens)

| id | name | bg | surface | ink | muted | alpha keys | alpha legend | mod keys | mod legend | accent key | accent legend | case |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| mochi | Mochi | #F6E4E7 | #FFF4F5 | #3A1E2A | #8A6572 | #FFF8F5 | #3A1E2A | #E48CA6 | #FFF8F5 | #7DB47E | #FFFFFF | #F1D3DA |
| laguna | Laguna | #D8ECEA | #F0FAF8 | #0F3440 | #4F7078 | #F5FBFA | #0F3440 | #1F6F78 | #E7F6F3 | #FFB703 | #0F3440 | #BCDAD8 |
| sinal | Sinal | #E8E7E2 | #F5F4F0 | #1D1E21 | #66686D | #F3F2EE | #1D1E21 | #45484E | #F3F2EE | #FF5B22 | #FFFFFF | #CFCEC8 |
| matcha | Matcha | #E3E9D4 | #F4F6EC | #243018 | #5D6B4B | #FAF7EC | #243018 | #6A8D4C | #FAF7EC | #E7B94C | #243018 | #CDD6B8 |
| noturno | Noturno | #16132A | #221E3D | #ECE8FF | #A59FCB | #2B2650 | #D9D2FF | #3D3573 | #D9D2FF | #8BE0FF | #16132A | #0F0D1E |

Default colorway: **laguna**. Use these for `--bg`, `--surface`, `--ink`, `--muted`, `--accent`, etc. Derive borders with
`color-mix()`. All text must meet WCAG AA against its background in every colorway (check `--muted` on `--bg`; adjust if needed).

## Typography

- One family: **Archivo** variable with the width axis:
  `Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' })`.
- Display: `font-stretch: 125%` (expanded), weight 800–900, letter-spacing -0.02em, line-height 0.92–1.
  Headlines can be big (clamp up to ~7.5rem) and the type itself is a design element.
- Body: `font-stretch: 100%`, weight 400/500, 16–18px, line-height 1.55, max 70ch.
- UI/labels/buttons: weight 600, `font-stretch: 112%`.
- Prices: `font-variant-numeric: tabular-nums`.
- **Avoid**: all-caps labels, tracked-out eyebrow labels above every heading, monospace data labels, accenting a
  single word of a headline in another color/italic, "→" appended to every link, meta strings joined with " · ".
- Scale: 12 / 14 / 16 / 18 / 22 / 28 / 40 / 56 / 80 / 120.
- For 3D legends (troika `<Text>` from drei) self-host a font file in `/public/fonts/` (e.g. Archivo SemiBold TTF/WOFF
  downloaded once from Google Fonts). No runtime CDN requests.

## Layout

Left-aligned, generous whitespace, modular grid (12 cols desktop, 4 mobile, 16px gutter mobile). Shapes: keycap-like
radii (buttons 10–14px radius with a subtle bottom "keycap" inset shadow that compresses on `:active` — this tactile
press is the site's interaction language). Do **not** make everything identical rounded cards with the same shadow.
Vary hierarchy: the featured product gets a huge tile, others smaller; category tiles differ in size.

```
HOME (desktop)
┌──────────────────────────────────────────────────────────────┐
│ Keyfolk   Loja  Teclados  Keycaps  Switches  Deskmats   🔍 ♡ 🛒(2)│
├──────────────────────────────────────────────────────────────┤
│ Teclados que dá vontade        [colorway keycaps ● ● ● ● ●]   │
│ de digitar.                                                    │
│            ┌──────────────── 3D 75% keyboard ───────────────┐ │
│            │   (tilted, soft shadow, reacts to typing)       │ │
│            └─────────────────────────────────────────────────┘ │
│ Digite qualquer coisa — o teclado responde.   [Som: desligado] │
│ [Montar o meu]  [Ver a loja]                                   │
├──────────────────────────────────────────────────────────────┤
│ Em destaque                                                   │
│ ┌──────────── big: Folk 75 ─────────┐ ┌─ Noturno ─┐           │
│ │ render, price, status, CTA         │ ├─ Degrau ──┤ ┌─ Cabo ─┐│
│ └────────────────────────────────────┘ └───────────┘ └────────┘│
├──────────────────────────────────────────────────────────────┤
│ Escolha pelo som: [Linear] [Tátil] [Clicky] → big 3D switch    │
│ press a large keycap to hear/feel the difference (uses synth)  │
├──────────────────────────────────────────────────────────────┤
│ Categorias: Teclados (large) | Keycaps | Switches | Deskmats   │
├──────────────────────────────────────────────────────────────┤
│ Como montamos: 1 Case → 2 Placa & gasket → 3 Switches → 4 Caps │  (real sequence → numbering ok)
├──────────────────────────────────────────────────────────────┤
│ Reviews (3 short quotes with names/cities) · Newsletter        │
│ Footer                                                          │
└──────────────────────────────────────────────────────────────┘
```

## Pages & features (all statically generated)

- `/` Home (above).
- `/loja` Catalog: category filter (Todos, Teclados, Keycaps, Switches, Deskmats, Acessórios), filters (layout for
  keyboards, tipo de switch, faixa de preço, só em estoque), sort (Destaques, Menor preço, Maior preço, Novidades),
  text search. State lives in the URL query (`useSearchParams` in a client component wrapped in `<Suspense>`),
  so filtered views are shareable. Empty result state with a "Limpar filtros" action. Product grid uses the
  pre-rendered WebP images via `next/image` with proper `sizes`.
- `/produto/[slug]` Product page (`generateStaticParams`, `generateMetadata`, JSON-LD `Product` with `offers`):
  interactive 3D viewer (OrbitControls: rotate, limited zoom, no pan; drag hint; auto-rotate slowly unless reduced
  motion or user interacted), poster image shown until the 3D is ready (no layout shift). Variant selectors
  (keyboards: cor do case + switch; keycaps: none; switches: quantidade 70/90/110), quantity stepper, stock status,
  "Adicionar ao carrinho", "Comprar agora" (adds + goes to checkout), specs in accessible disclosure (`<details>`),
  delivery estimate by CEP (simple frontend rule), "Combina com" related products, favorite toggle.
- Cart: zustand + persist (localStorage), items keyed by product+variant. Slide-over drawer built on native
  `<dialog>` (`showModal`, focus handling, Esc to close, return focus to trigger). Free-shipping progress bar
  (frete grátis acima de R$ 999). Coupon field: `FOLK10` = 10% off; invalid code shows a helpful error. `aria-live`
  announcement when items are added. `/carrinho` full page too.
- `/checkout`: contact, address (CEP input with mask; on 8 digits fetch `https://viacep.com.br/ws/{cep}/json/` to
  fill street/bairro/cidade/UF, graceful failure message if offline/invalid), shipping option (PAC/SEDEX with
  prices), payment (Pix default; Cartão; Boleto — it's a demo: show a small note that no data leaves the browser,
  never store card data), order summary. Client-side validation with clear inline errors, `aria-invalid`,
  `aria-describedby`. Submit → `/checkout/sucesso` showing order number (random, stored in sessionStorage) and a
  Pix-style QR placeholder (generated SVG pattern, not a real code). Clear the cart on success.
- `/favoritos` (wishlist from localStorage), `not-found.tsx` with personality (a single 3D keycap "404"? or type-driven),
  `sitemap.ts`, `robots.ts`, `opengraph-image` (via `ImageResponse`) for home and products, `icon.svg` favicon (keycap mark),
  `manifest.ts`.

## Product catalog (src/data/products.ts, typed)

Keyboards: **Folk 75** (75%, alumínio, gasket, knob, hot-swap, R$ 1.890, featured), **Folk 65** (65%, R$ 1.290),
**Folk TKL** (R$ 2.190), **Folk 40 Orto** (40% ortolinear, R$ 990, status "Pré-venda — envio em novembro").
Keycaps (PBT dye-sub, 150+ teclas): **Mochi**, **Laguna**, **Sinal**, **Matcha** (R$ 459 each), **Noturno** (R$ 489, featured).
Switches (pack com 70): **Creme** linear 45g (R$ 249), **Degrau** tátil 62g (R$ 269, featured), **Estalo** clicky 60g (R$ 229, status "Esgotado" → button "Avise-me quando chegar" that toggles a local reminder).
Deskmats 900×400: **Topografia** (R$ 179), **Grade** (R$ 179). Acessórios: **Cabo espiralado USB-C** (R$ 219, featured, aviator connector).
Each product: id, slug, name, category, price, compareAtPrice?, short tagline (1 line), description (2–3 short paragraphs,
specific and credible — real keyboard vocabulary: gasket mount, PBT, dye-sub, hot-swap, QMK/VIA, FR4 plate, poron, lubed,
spring weight), specs (key/value), status, featured flag, rating + review count, variants, `render` image path(s).

## 3D (the craft)

- Build everything procedurally with R3F (no downloaded models): keycaps (shared geometry per key width: a slightly
  tapered rounded box with a subtle dished top — e.g. `RoundedBoxGeometry` from `three-stdlib`/examples then taper the
  top vertices in a small helper), case (rounded box with chamfer + a visible bottom lip, anodized-metal
  `MeshPhysicalMaterial` with light clearcoat), knob (knurled cylinder), switch model (transparent/tinted housing with
  `MeshPhysicalMaterial` transmission or simple opacity, colored stem, metal leaves, spring), deskmat (plane with a
  canvas-generated pattern texture), coiled cable (`TubeGeometry` along a helix curve + aviator connector).
- Legends: drei `<Text>` with the self-hosted font. Share materials per role (alpha / mod / accent / legend).
- Lighting: drei `<Environment resolution={256}>` built with `<Lightformer>`s (NO preset HDR downloads), soft
  `<ContactShadows>`, gentle rim light. Tone mapping ACES/AgX, sRGB output. Keep materials physically plausible
  (PBT keycaps = rough ~0.55, no metalness).
- Performance: `dpr={[1, 1.75]}`, `<PerformanceMonitor>` to drop dpr on weak devices, `frameloop="demand"` whenever
  nothing animates (invalidate on input/animation), pause rendering when the canvas is off-screen
  (IntersectionObserver), lazy-load the Canvas component with `next/dynamic` `{ ssr: false }` only after the hero
  poster has painted. `prefers-reduced-motion`: no auto-rotation, key presses still work (they're user-triggered).
  Show the pre-rendered poster image as the LCP element and fade the canvas in over it when ready.
- Keep total JS for the first load lean: don't import drei barrel-wide in server components; client-only.

## Product images: render pipeline (important for performance and consistency)

All product imagery is rendered from our own 3D models — no stock photos.
1. A route `src/app/render/[slug]/page.tsx` that renders one product's 3D model alone, framed, transparent background,
   and sets `window.__RENDER_READY__ = true` after the first frames finish. In production it must `notFound()`
   (e.g. check `process.env.NODE_ENV === 'production'` in the page or exclude via config) and be disallowed in robots.
2. `scripts/render-products.mjs`: launches Playwright Chromium with `args: ['--enable-gpu','--use-angle=d3d11']`,
   visits each `/render/<slug>` on a running dev server (port from env, default 3200), waits for the flag,
   screenshots with `omitBackground: true` at 1600×1600 (deviceScaleFactor 1), converts to WebP (quality ~82) with
   `sharp` (already present as a Next dependency; import it from the script), writes `public/renders/<slug>.webp`
   (+ variant images if useful, e.g. keyboards per case color). Add `"render": "node scripts/render-products.mjs"` to package.json.
3. Commit-ready outputs live in `public/renders/`. Use them for cards, posters, OG images.

## Quality floor (non-negotiable)

- Responsive from 360px to 1920px. No horizontal scroll. Mobile nav in a `<dialog>` sheet.
- Accessibility: skip link, landmarks, visible focus ring (2px accent + offset), all controls keyboard reachable,
  labels on inputs, `alt` text on images, `aria-live` for cart, reduced motion respected, color contrast AA.
- SEO: metadata per page, canonical, OG/Twitter, JSON-LD (`Organization` on home, `Product` on product pages),
  sitemap/robots. `lang="pt-BR"`.
- Performance: everything statically generated; images WebP via `next/image` with `sizes`; 3D lazily loaded;
  fonts via `next/font`; no layout shift; no console errors or hydration warnings.
- Code: small focused files, typed data, no `any`, ESLint clean (`npx eslint .`), `npm run build` passes.
- Motion: one orchestrated page-load moment in the hero (keyboard settling in + headline), UI transitions for drawer/
  toasts/variant changes. No fade-up-on-every-section, no hover-lift on every card.

## Testing (the owner's rule: E2E only, no unit tests)

Playwright E2E in `e2e/` with `playwright.config.ts` (webServer: `npm run build && npm run start -- -p 3210` or
reuse existing server; projects: desktop Chromium 1440×900 and mobile Pixel 7). Cover:
home renders featured products and a WebGL canvas; typing a key on the home page presses the 3D key (expose a
`data-last-key` attribute on the hero wrapper for assertion); switching colorway changes `html[data-colorway]` and
persists after reload; catalog filters + search + URL state + empty state; product page variant selection + add to
cart updates the cart badge; cart persists after reload; coupon FOLK10 works and invalid coupon errors; checkout
validation errors then successful submission (mock the ViaCEP request with `page.route`) → success page; 404 page;
basic a11y smoke (every page has one h1, images have alt). At the end, produce a verifiable, repeatable artifact:
the Playwright HTML report (`e2e/report`, gitignored) plus full-page screenshots of every main page on desktop and
mobile saved to `e2e/screenshots/` (commit-worthy, used in the README).

## Definition of done

- `npm run build` and `npx eslint .` pass with zero errors; `npx playwright test` all green.
- Renders generated and used. Screenshots reviewed by you (open them with the Read tool) and polished until the site
  is genuinely beautiful at desktop and mobile — iterate on spacing, hierarchy and details; critique like a design lead.
- `README.md` in pt-BR (project pitch, features, stack, how to run, scripts, screenshots from `e2e/screenshots/`,
  architecture notes on the 3D + render pipeline + performance decisions).
- `.gitignore` covers `node_modules`, `.next`, `e2e/report`, `test-results`, `.vercel`, `.env*`.

## Do NOT

- Do not `git init`, commit, push, or deploy (the orchestrator does that).
- Do not write unit tests.
- Do not fetch runtime assets from third-party CDNs (fonts self-hosted; no HDR presets). ViaCEP is the only external call.
- Do not use stock/remote images.
- Do not touch anything outside `E:\pgm\Loja\.dist\keyfolk`.
