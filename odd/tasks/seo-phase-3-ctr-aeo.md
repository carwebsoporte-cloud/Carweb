# CARWEB SEO Phase 3 — Sitemap, CTR, and AEO (Phase A)

## Objective

Raise organic traffic by fixing sitemap delivery, improving click-through rate of code pages, and making code pages easier to quote by answer engines (AEO/GEO), and remove Adsterra ads that served adult creatives.

## Problem

- Search Console (3 months to 2026-11-01): 7.38k impressions, 64 clicks, CTR 0.9 %, average position 10, while the sitemap lists 13,058 URLs.
- `/sitemap.xml` is a single 5.7 MB document that took 35–38 s to respond in production (2026-11-02); crawlers may abandon it.
- Code page titles are descriptive (`P0300 — <title> | CARWEB`) but do not state the search intent (causes, symptoms, fix).
- Code pages have no short answer-first summary or FAQ block for answer engines.
- Adsterra kept serving adult creatives after the user disabled the adult category; it caused the Monetag rejection and earns ~$0 at current traffic.

## Authorized scope

- Frontend only (`scanner-car-frontend`): remove Adsterra components and scripts; keep `public/sw.js` (Monetag).
- Split the sitemap into a sitemap index plus cacheable chunks; keep the Phase 2 indexability filter and `robots.txt` `Sitemap:` line valid.
- Rewrite code page `<title>`/description templates (es and en) for CTR.
- Add an answer-first summary and an FAQ section with `FAQPage` JSON-LD to code pages, built only from existing code data.
- Deploy to Cloudflare Workers after verification.

## Constraints

- Preserve Phase 1/2 behavior: `/` es and `/en` en, canonical, hreflang, `noindex,follow` for low-quality pages, English completeness gate.
- No new route families, no mass URLs, no AI-generated text: summaries and FAQs are deterministic templates over existing fields.
- Keep title length about 60 characters and description about 155 characters where possible.
- Deploy with `.env.local` moved aside during the build; verify `localhost:3001` count is 0 in `.open-next/server-functions/default/handler.mjs`.

## Tasks

- [x] S1 — Remove Adsterra (global social bar, banners, native) and its config; keep Monetag `sw.js`.
- [x] S2 — Sitemap index with chunked, cached sitemaps; same URL set as today.
- [x] S3 — CTR-oriented title and description templates for code pages (es/en).
- [x] S4 — Answer-first summary and FAQ section with `FAQPage` JSON-LD on code pages.
- [ ] S5 — Deploy and production smoke test (sitemap response time, code pages, schema).

## Acceptance criteria

- No Adsterra domain is referenced in the built client or server bundle.
- `/sitemap.xml` responds quickly as an index; every chunk is valid XML; total URL count matches the pre-change sitemap (13,058 on 2026-11-02, subject to data changes).
- Code page titles state the code plus intent (causes/symptoms/fix) and keep the brand.
- Code pages render a short summary and an FAQ, and the page JSON-LD contains a valid `FAQPage`.
- `npm run build`, `npm run lint`, `npm run test:seo-policy`, and new tests pass.

## Applicable checks

- `npm run test:seo-policy`, new `node --test` tests, `npm run lint`, `npm run build` in `scanner-car-frontend`.
- Production: curl `/sitemap.xml`, chunks, `/code/P0300`, `/en/code/P0300`; JSON-LD types.

## TDD

- Mode: enabled (strict). Source: user global `CLAUDE.md`.
- Runner: Node built-in test runner (`node --test`) for pure helpers, plus `npm run test:seo-policy`.

## Delivery

- Branch: `feat/seo-phase-3-ctr-aeo` from `main` (`53ebd0f`).
- Forecast: ~400–600 authored lines. Strategy: `ask-on-risk`; one work-unit commit per task.
- RDD: off (global) → review not run, recorded as `disabled`.

## Route declaration

- S1–S4: delegated writer (2+ non-trivial files; reading prepares writes).
- S5: inline (deploy and curl checks).

## Progress

- 2026-11-02: live audit done (sitemap 35 s / 5.7 MB / 13,058 URLs; Cloudflare managed robots.txt blocks AI training bots before the site rules — Phase B, user dashboard). Feature document created.
- 2026-11-02 S1 `23e3bfe`: removed Adsterra components, usages and `lib/ads.ts`; `rg -i "adsterra|highrevenueformat|profitableratecpmnetwork" app components lib`: 0 matches; `.next` build output: 0 matches; `public/sw.js` kept; `npx tsc --noEmit`: OK.
- 2026-11-02 S2 `c3547e2`: `/sitemap.xml` is now an index (route handler) pointing to `/sitemaps/core.xml`, `/sitemaps/codes-1..10.xml`, `/sitemaps/brands.xml` (12 chunks), prerendered at build with `generateStaticParams` (on-demand fallback if API is down at build). RED: `node --test tests/sitemap.test.ts` -> ERR_MODULE_NOT_FOUND; GREEN: 6/6. Build against prod API: chunks total 13,058 unique URLs (= pre-change figure), all chunks well-formed XML, largest 878 KB; the live `/sitemap.xml` fetched at audit time had only 9,445 URLs (old single-document sitemap was serving partial data), all of which are contained in the new set.
- 2026-11-02 S3 `c1d6fe3`: `lib/code-seo.ts` title/description templates wired into generic and OEM `generateMetadata`; RED: ERR_MODULE_NOT_FOUND; GREEN: 6/6. Rendered P0300: es `P0300: Causas, Síntomas y Solución | CARWEB`, en `P0300: Causes, Symptoms & How to Fix | CARWEB`; canonical/robots unchanged.
- 2026-11-02 S4 `0565e11`: `lib/code-aeo.ts` + summary card + `FaqSection` + `FaqJsonLd` on `CodeDetailView`; RED: ERR_MODULE_NOT_FOUND; GREEN: 8/8. `next start` check on `/code/P0300` and `/en/code/P0300`: JSON-LD types WebSite, Organization, TechArticle, BreadcrumbList, HowTo, FAQPage (5 questions each); summary and 5 `<details>` rendered; no Adsterra references in HTML.
- Checks at S4: `npm test`: 20/20 pass; `npm run test:seo-policy`: passed (now reads `lib/sitemap-data.ts`); `npx tsc --noEmit`: OK; `npm run build` (with `NEXT_PUBLIC_API_URL` pointing to prod API): OK; `npm run lint`: not meaningful (22k problems from untracked `.open-next` output, not ignored by eslint config); `eslint app components lib tests scripts middleware.ts`: 3 errors, all pre-existing in `app/admin` and `components/admin` (same count without the S1–S4 changes).

- 2026-11-02 Verifier fixes (one commit): (1) sitemap builders moved to `lib/sitemap-builders.ts` with injected deps and made all-or-nothing: blog, generic-code, per-brand and extra-page failures now reject, so the routes answer 503 `no-store`; a brand with no published codes is still skipped (not a failure). (2) Sitemap index and chunks are `force-dynamic` (no prerender, no `generateStaticParams`), success responses use `Cache-Control: public, s-maxage=86400, stale-while-revalidate=3600`; `codes-N` makes exactly one API call. (3) `lib/json-ld.ts` `serializeJsonLd` escapes `<` and U+2028/2029; used in `JsonLd.tsx`, `CodeStructuredData.tsx` and the blog page. RED: new `json-ld` and `sitemap-builders` tests failed with ERR_MODULE_NOT_FOUND (2 failing files); GREEN: `npm test` 29/29. `npm run test:seo-policy` passed (now reads `lib/sitemap-builders.ts`); `npx tsc --noEmit` OK; `npm run build` (prod API) OK with `/sitemap.xml` and `/sitemaps/[chunk]` dynamic; `next start` check: index 12 chunks, codes-1 1990 URLs, core 29, brands 66, codes-99 404, all 200 with the new Cache-Control.

## Next step

S5: deploy to Cloudflare Workers (move `.env.local` aside, build against the prod API, verify `localhost:3001` count is 0 in the handler), then smoke test `/sitemap.xml` index, chunks, `/code/P0300`, `/en/code/P0300` and JSON-LD types.
