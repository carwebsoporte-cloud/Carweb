# CARWEB SEO Phase 2 — Quality Classification and Indexation Control

## Objective

Classify the existing published OBD code pages by deterministic content quality and control indexation without creating new content families, mass URLs, or AI-generated text.

## Authorized scope

- Backend Prisma inventory and reusable SEO quality scoring.
- Local JSON/CSV reports under `scanner-car-backend/reports/`.
- Public code metadata robots policy and sitemap inclusion.
- Deterministic duplicate-risk and OEM-vs-generic comparison.
- Internal-link/orphan analysis based on source-generated URL relationships.
- No page deletion, content generation, real-time AI, new route families, or public score display.

## Constraints

- Preserve Spanish `/` and English `/en` behavior from Phase 1.
- Preserve access to every existing page; low-quality pages become `noindex,follow`, not 404.
- Do not index English content without complete translation.
- Do not alter administrative behavior.
- Use reproducible rules and document thresholds.
- Keep generated reports local and free of secrets.

## Tasks

- [x] Q1 — Add reusable deterministic SEO quality scoring and classification.
- [x] Q2 — Add duplicate-risk, OEM-generic, translation, and priority calculations.
- [x] Q3 — Generate content-priority, orphan-page, and enriched inventory reports.
- [x] Q4 — Apply conservative robots metadata and sitemap inclusion from classification.
- [ ] Q5 — Validate indexable/noindex access, links, search, admin, backend, and all required commands.

## Acceptance criteria

- Every published code has a deterministic score, level, missing-field list, and indexation policy.
- `STRONG` and qualifying `IMPROVABLE` pages are indexable; `THIN`, `DUPLICATE_RISK`, and `OEM_GENERIC` are `noindex,follow`.
- Sitemap contains only pages whose metadata policy is indexable and whose English content is complete when English is emitted.
- OEM comparisons use normalized real content and do not delete or rewrite pages.
- Duplicate candidates use normalized deterministic similarity, with threshold and evidence in reports.
- Reports include dashboard totals, percentages, top 100 priority queue, English missing fields, and orphan candidates.
- No AI provider is used for scoring or content generation.
- `npm run lint`, frontend/backend builds, backend tests, and `npm run seo:audit` pass.

## Applicable checks

- `npm run lint` in `scanner-car-frontend`
- `npm run build` in `scanner-car-frontend` and `scanner-car-backend`
- `npm test` in `scanner-car-backend`
- `npm run seo:audit` in `scanner-car-backend`
- Static/source verification of metadata, sitemap, canonical, hreflang, search, and admin behavior

## Route declaration

Delegated direct implementation. Phase 1 mapping and infrastructure are already present; this phase touches multiple backend reporting and frontend metadata/sitemap files, so implementation proceeds through bounded writer units with independent verification.

## Progress

- Branch: `seo/phase-2-quality-indexation`
- Phase 1 changes remain uncommitted in the worktree and are intentionally preserved.
- Engram mirror: unavailable in the current tool runtime; this local document is the recovery source.
- Current state: scoring, reporting, runtime policy, metadata, and sitemap integration are implemented. Local validation is complete; live HTTP/database revalidation remains pending because the configured audit connection may be remote and is not authorized by this session.

## Current classification snapshot

- Published codes: 18,974
- STRONG: 320
- IMPROVABLE: 6,194
- THIN: 6,519
- DUPLICATE_RISK: 5,881
- OEM_GENERIC: 60
- Indexable: 6,514
- Noindex: 12,460

## Reports

- `scanner-car-backend/reports/seo-inventory.json`
- `scanner-car-backend/reports/seo-inventory.csv`
- `scanner-car-backend/reports/content-priority.csv`
- `scanner-car-backend/reports/orphan-pages.csv`

Reports are generated locally and ignored by Git. Orphan counts are source-derived estimates, not runtime crawler measurements.

## Q4 bounded runtime policy unit

- Public code responses now expose only `seoIndexable`; score, level, flags, and report evidence remain backend-internal.
- Live policy uses the same deterministic quality calculator as the inventory report. It builds a bounded in-memory index of published code editorial fields (limit 25,000, currently above the 18,974-code inventory) with a 15-minute TTL and coalesced cold loads, so requests do not repeatedly load the full inventory.
- The cache is required because duplicate-risk exact signatures and same-code generic/OEM comparisons cannot be decided safely from one detail row. If the index cannot be built or exceeds its safety limit, the public signal fails closed to `seoIndexable: false` while pages remain accessible.
- OEM comparison reads stored content before any runtime fallback description is added. Sitemap code URLs require `seoIndexable`; English URLs additionally require complete persisted English content. Spanish URLs remain emitted when indexable even if English is incomplete.
