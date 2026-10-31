# CARWEB SEO Phase 1 — Technical Foundation

## Objective

Stabilize crawlability, canonical URLs, localization signals, structured data, sitemap behavior, and basic measurement/performance without creating new content pages.

## Problem

The current implementation has soft-404 and generic-to-OEM fallback paths, incomplete publication filtering, URL normalization gaps, an English search-schema mismatch, incomplete search metadata, sitemap failure opacity, lint failures, and a few contained performance/analytics issues.

## Authorized scope

- Frontend: `scanner-car-frontend`
- Backend: public OBD/blog/manufacturer queries only
- SEO inventory tooling and generated local reports
- No new SEO content families, mass code creation, design redesign, or administrative behavior changes

## Constraints

- Preserve Spanish at `/` and English at `/en`.
- Preserve existing valid URL families unless a permanent normalization redirect is required.
- Do not expose DRAFT, ARCHIVED, or INACTIVE records publicly.
- Do not generate hreflang for an English URL without real English content.
- Do not emit FAQPage data unless the FAQ is visible on the page.
- Keep Adsterra behavior intact and never automate ad interactions.

## Tasks

- [x] SEO1 — Enforce real 404 responses for invalid categories, codes, manufacturers, blogs, and unsupported OEM combinations.
- [x] SEO2 — Remove OEM-to-generic fallback and filter public code/blog/catalog queries to published records.
- [x] SEO3 — Normalize code and manufacturer URLs with permanent redirects while preserving canonical targets.
- [x] SEO4 — Correct English route references, locale links, hreflang, search metadata, pagination, and robots coverage.
- [x] SEO5 — Harden sitemap generation, retain valid sections on partial failure, and prepare a future sitemap-index boundary.
- [x] SEO6 — Align JSON-LD with visible content and correct the English SearchAction.
- [x] SEO7 — Fix lint errors and apply contained image/ad/cache performance quick wins.
- [x] SEO8 — Track App Router page views without duplicate GA4 events.
- [x] SEO9 — Add the database-backed SEO inventory script and local JSON/CSV reports.

## Acceptance criteria

- Invalid entities and unsupported OEM combinations return real HTTP 404 responses.
- Lowercase/trailing-slash code variants redirect permanently to one official URL.
- Manufacturer aliases resolve only to an official slug or return 404.
- Public code, manufacturer, blog, and sitemap data excludes unpublished records.
- English JSON-LD and internal links use English routes; hreflang never points to untranslated English content.
- Search query variants are `noindex,follow`; search is not in the sitemap.
- Sitemap failures are logged with section context and do not silently pass.
- FAQPage is emitted only when visible FAQs exist.
- `npm run lint` exits 0; `npm run build` exits 0.
- SEO inventory reports contain no secrets and are generated locally.

## Applicable checks

- `npm run lint` in `scanner-car-frontend`
- `npm run build` in `scanner-car-frontend`
- `npm test` only if a frontend test script exists
- Manual route/status checks against a running local stack where available
- Static inspection of generated metadata, sitemap, robots, and JSON-LD

## Route declaration

Delegated direct implementation. Mapping was completed during the prior Phase 0 audit; implementation touches multiple non-trivial frontend/backend files, so one bounded writer will implement the phase in work units.

## Progress

- Branch: `seo/phase-1-technical-foundation`
- Feature document created before source changes.
- Engram mirror: unavailable in the current tool runtime; local document is the source of recovery truth.
- Current state: implementation and validation completed; no Phase 2 content expansion was started.

## SEO7/SEO8 bounded work unit

- Backend English completeness now checks trimmed content for title, description, symptoms, causes, and solutions; published-only and Spanish behavior remain unchanged.
- Frontend lint is clean without disabling rules. Safe image optimization and existing ad-container space reservations were retained without changing ad scripts or click behavior.
- GA4 sends one explicit `page_view` event for the initial URL and each distinct App Router pathname/search change. Automatic config page views are disabled to avoid duplicates.

## SEO9 inventory

- `scanner-car-backend/scripts/seo-audit.ts` queries Prisma and writes ignored local JSON/CSV reports.
- The latest available database inventory found 18,974 codes, all marked `PUBLISHED`, with 9,580 generic and 9,394 OEM records.
- Failed runs invalidate stale generated reports and never emit credential-bearing diagnostics.

### Middleware decision

Next 16.1.6 reports that the `middleware.ts` convention is deprecated in favor of `proxy.ts`. Migration is intentionally deferred: the current middleware owns English rewrites, legacy English-slug redirects, locale detection, canonical code redirects, and the `x-locale` header. Renaming it in this unit would risk changing locale redirects, canonical code redirects, or auth-adjacent route handling.
