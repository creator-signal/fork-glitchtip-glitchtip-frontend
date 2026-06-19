# Staging Bug Investigation — 2026-05-15

Documents the bugs being investigated and fixed during a focused debugging session, including reproduction steps and resolutions so they can be re-tested or referenced later.

## Bugs

### #1 — Stripe checkout cancel redirects to home instead of subscription page
**Status:** ✅ Fixed + verified (merged to backend `origin/master`, 2026-05-16)

**Reporter:** Luis Armendariz

**Symptom:** Clicking "Cancel" or back-button on the Stripe Checkout page redirects users to the GlitchTip home page instead of returning them to the subscription settings page they came from.

**Root cause:** In `glitchtip-backend` `apps/stripe/client.py`, the Stripe checkout session was built with `"cancel_url": domain + ""` — i.e. just the site root — while `success_url` correctly pointed at the subscription page.

**Fix (backend commit `3914caf8d` — "fix(stripe): redirect cancel_url to subscription page instead of home"):**
```python
- "cancel_url": domain + "",
+ "cancel_url": domain + "/" + organization_slug + "/settings/subscription",
```
Now mirrors `success_url` (minus the `?session_id=` query param).

**Verification (done 2026-05-16):** Confirmed the commit is present on `origin/master` and the diff is correct. Note the locally-running backend container was on a pre-merge `master` and still showed the old `cancel_url` until rebuilt — `git fetch` revealed `origin/master` had advanced (`4b01379dc → 21cddbb36`) with the fix included.

**Manual end-to-end re-test (optional, needs a hosted-mode backend with Stripe test keys):**
1. Log into a billing-enabled instance, navigate to subscription settings, click a paid plan to start Stripe checkout.
2. On the Stripe page, click Back / Cancel.
3. Expected: land back at `/<org>/settings/subscription`, not at site root.

---

### #2 — Archived Stripe product appearing in comparison table
**Status:** Root cause identified — backend data-freshness issue. No frontend fix possible or appropriate.

**Reporter:** Luis Armendariz

**Symptom:** A Stripe product that's been archived/inactive still shows up in the subscription plan comparison table on some instances. Suspected stale database record. Doesn't repro locally with live Stripe data.

**Investigation findings:**

*Frontend side — nothing to filter on:*
- The `/api/0/stripe/products/` payload **does not include an `active`/`archived` field** on products. Confirmed against the API schema:
  - `StripeProductExpandedPriceSchema` — [src/app/api/api-schema.d.ts:4668-4683](src/app/api/api-schema.d.ts#L4668-L4683): only `stripeID`, `defaultPrice`, `prices`, `marketingFeatures`, `name`, `description`, `events`.
  - `StripeNestedPriceSchema` — [src/app/api/api-schema.d.ts:4651-4667](src/app/api/api-schema.d.ts#L4651-L4667): only `stripeID`, `price`, `interval`, `isPublic`.
- The frontend product list — [src/app/settings/subscription/payment/payment.service.ts:46-71](src/app/settings/subscription/payment/payment.service.ts#L46-L71) — only `.map(...).sort(...)`, with no filtering.

*Backend side — the real cause (in `glitchtip-backend`, inspected on `origin/master`):*
- `/api/0/stripe/products/` (`apps/stripe/api.py:160`) serves rows straight from the **`StripeProduct` DB table**, filtered only by `is_public=True, events__gt=0`. It is a cache, not a live Stripe call.
- `StripeProduct` (`apps/stripe/models.py:53`) has fields `stripe_id, name, description, default_price, events, is_public, marketing_features` — **no `active` field at all**.
- `StripeProduct.sync_from_stripe()` fetches active-only products from Stripe (`list_products()` passes `{"active": "true"}`), upserts them, then **does** clean up stale rows at the end:
  `StripeProduct.objects.exclude(stripe_id__in=stripe_ids).adelete()`.
- **So a *successful* sync already removes archived products.** An archived product lingering means the sync has not completed successfully on that instance → stale DB cache. This matches Luis's "stale database record" guess and the "only on some instances" symptom.

**Robustness gap noticed:** the cleanup-delete runs *after* the `async for products_page in list_products()` loop. If `list_products()` raises partway (Stripe API is known to be flaky — see backend commit `74869719b` "retry transient API errors"), the delete line is never reached → partial sync, stale rows persist. Also, if `list_products()` yields nothing, `stripe_ids` is empty and `exclude(stripe_id__in=set())` would delete **all** products — a separate latent bug.

**Required fix (backend only — frontend has no role here):**
1. **Immediate remedy for affected instances:** run `StripeProduct.sync_from_stripe()` (or manually delete the stale `StripeProduct` row).
2. **Robustness:** make `sync_from_stripe()` resilient — guard against an empty `stripe_ids` set before the bulk delete, and ensure the cleanup runs even if a Stripe page fetch fails (or make the whole sync atomic).

**Action item:** Raise a backend MR for the robustness fix. No frontend change — adding an `active` field just to filter would paper over a backend cache-coherency bug.

**Verification steps (once backend change lands):**
1. Archive a product in Stripe (test mode).
2. Run `sync_from_stripe()`.
3. Confirm the archived product is gone from `/api/0/stripe/products/` and from the comparison table at `/<org>/settings/subscription`.

---

### #3 — Staging ingest hangs for 60s then silently fails
**Status:** Backend-fixed by David Burke (per Slack). Frontend smoke-test pending.

**Reporter:** Luis Armendariz

**Symptom:** On staging, when an app tried to send an error/log/performance trace to GlitchTip, the request hung for 60 seconds then failed silently. Reads (browsing issues, settings) worked fine; only writes broke.

**Suspected backend cause (Luis's note):** Related to May 6 backend change "switch hot-path bulk writes from VALUES to UNNEST". The new async DB pool defaulted to 20 connections, each ingest batch made 15+ sequential pool acquisitions per event → exhausted pool under load.

**Backend config to inspect on staging when this recurs:** `VTASKS_CONCURRENCY`, `DATABASE_POOL_MAX_SIZE`, `GLITCHTIP_EMBED_WORKER`.

**Status update:** David Burke reports staging is working now.

**Local smoke test (done 2026-05-16) — PASS:**
1. Retrieved the project DSN public key via `GET /api/0/projects/org/project/keys/`.
2. Sent a minimal error event: `POST http://localhost:8000/api/1/store/?sentry_key=<key>` with an `IngestSmokeTestError` payload.
3. Result: **HTTP 200 in 0.016s** — no 60s hang.
4. After ~4s the event had been processed into issue `PROJECT-1` (visible via `GET /api/0/projects/org/project/issues/`).
5. Confirmed the issue renders in the frontend UI at `/org/issues` ("Issues (1)", row `IngestSmokeTestError …`).

Write path works end-to-end against the local backend. Note: this verifies the ingest code path locally, not staging specifically — staging confirmation relies on David's report. To smoke-test staging directly, repeat steps 1–5 against the staging URL with a staging project DSN.

---

### #4 — Browser tab crash after subscription purchase (PRIORITY per David Burke)
**Status:** ✅ REPRODUCED + FIXED + VERIFIED in browser (2026-05-16)

**Reporter:** David Burke

**Symptom:** Buy a subscription with the Stripe test card `4111 1111 1111 1111`, get a redirect, the browser tab crashes (suggesting an infinite loop).

**Root cause (confirmed by bisecting):**
The `effect()` in [src/app/settings/subscription/subscription.component.ts:149-158](src/app/settings/subscription/subscription.component.ts#L149-L158) calls `refreshUntilSubscriptionOrTimeout()` when `?session_id=…` is present. That method synchronously writes signals via `setState({ subscriptionRefreshing: true, fromStripe: true })`, which Angular's effect scheduler then treats as a re-fire trigger. Each re-fire calls `refreshUntilSubscriptionOrTimeout()` again, stacking `setInterval` timers (only the newest is held in `refreshTimerRef`, so older timers leak forever). Within ~24 seconds the loop hits ~62,698 iterations before the tab crashes.

**Reproduction steps (using Playwright + local backend):**
1. Backend: `docker compose up -d` in the glitchtip-backend repo (provides `http://localhost:8000`).
2. Frontend: `npm start` (dev server at `http://localhost:4200`).
3. Retrieve seeded admin password: `docker compose logs web | grep "User:"` in the backend repo → email `test@example.com`, password `admin_pass`.
4. Log in via the UI.
5. Local doesn't have `BILLING_ENABLED=true`, so stub it client-side via Playwright `page.route()`:
   - Rewrite `/api/settings/` response to add `billingEnabled: true` and `stripePublicKey: "pk_test_fake_xxx"`.
   - Stub `/api/0/stripe/products/` to return at least one product.
   - Stub `/api/0/stripe/subscriptions/<slug>/` to return 404 (simulates the post-checkout window before the Stripe webhook creates the subscription on our side).
6. Navigate to `http://localhost:4200/<org-slug>/settings/subscription?session_id=cs_test_fake_xxx`.
7. Tab crashes within ~30 seconds. Console shows `Page crashed and was reset to about:blank.`

**Fix (applied to two files):**

*[src/app/api/subscriptions/subscription.service.ts](src/app/api/subscriptions/subscription.service.ts)* — `refreshUntilSubscriptionOrTimeout()`:
- Added re-entry guard `if (this.refreshTimerRef !== undefined) return;` at the top so a duplicate caller is a no-op.
- Reset `refreshTimerRef = undefined` after each `clearInterval(...)` so the guard releases correctly.
- Reset `refreshTimerRef = undefined` in `clearState()` for the same reason.

*[src/app/settings/subscription/subscription.component.ts](src/app/settings/subscription/subscription.component.ts)* — the post-Stripe `effect()`:
- Wrapped the side-effect calls in `untracked(() => { ... })` so signal writes inside `refreshUntilSubscriptionOrTimeout()` don't feed back into the effect's dependency graph.
- Added `let didKickoff = false;` one-shot guard so even if the effect re-runs (e.g. settings reload), the post-checkout kickoff only fires once per component lifetime.
- Imported `untracked` from `@angular/core`.

**Why both layers:** Either fix alone closes the immediate loop, but together they're defense-in-depth: the service-level guard catches any future caller, and the component-level `untracked` + one-shot guard prevents the effect from re-firing in the first place.

**Verification (done 2026-05-16, via Playwright + local backend):**
1. Repro setup as above (stub settings → billing enabled, stub products, stub subscription endpoint → 404).
2. Navigated to `/org/settings/subscription?session_id=cs_test_fake_xxx`.
3. **Result — PASS:**
   - Page rendered the "Redirected from Stripe" banner, a loading spinner, then after ~6s the "GlitchTip was unable to find a subscription for your account…" timeout message.
   - Tab stayed alive for the full 10s observation window; URL stayed on the subscription page (no reset to `about:blank`).
   - Console: 10 errors total, all benign — 3× stubbed `404` + 7× `ResourceValueError` (Angular's resource wrapper rethrowing those 404s). No "Page crashed", no stack overflow, no runaway effect.
4. **Before the fix:** same steps produced ~62,698 `refreshUntilSubscriptionOrTimeout()` calls in ~24s, then `Page crashed and was reset to about:blank.`

---

### #5 — Release a new version
**Status:** Blocked — cannot cut this session

**Context:** David Burke asked to test and release a new version now that the backend ingest issue (#3) is fixed.

**Current version state:** Frontend releases are git tags `vMAJOR.MINOR.PATCH`; latest tag is `v6.1.6`. Next would be `v6.1.7`. `package.json` version is `0.0.0` (not used for release versioning).

**Blockers — all must clear before a release can be cut:**
1. **No push access this session.** Cutting a release = create a tag and push it (CI builds/publishes on tag). Push is disabled, so no tag can be created.
2. **Crash fix (#4) is not on `master`.** It is committed to local branch `fix/subscription-checkout-crash` (commit `e3c7a413`), unpushed. It must be pushed → reviewed → merged to `master` before it can be included in a release.
3. **#2 (archived products)** still needs a backend MR; decide whether the release waits on it or ships without it.

**Pre-release checklist (for whoever cuts it):**
- [ ] Push `fix/subscription-checkout-crash`, open MR, get review, merge to `master`.
- [ ] Confirm backend #1 (`cancel_url`, commit `3914caf8d`) is deployed to the environment the release targets.
- [ ] Decide on #2: backend MR merged, or release notes acknowledge it as known-issue.
- [ ] Tag `v6.1.7` on `master`, push tag, confirm CI build/publish succeeds.
- [ ] Smoke-test the released build: subscription page no longer crashes post-checkout; ingest works.

---

### #6 — Test `curl … install.sh | sh` on Mac/Windows
**Status:** ✅ Tested on macOS (Apple Silicon) — PASS

**What `install.sh` actually does (inspected before running):** It installs the **GlitchTip CLI** — a single Rust binary (`glitchtip-cli`), NOT a server stack. It detects OS/arch, downloads the prebuilt binary from GitLab CI artifacts (tag `v0.1.0`), `chmod +x`, and moves it to `/usr/local/bin` (or `~/.local/bin` if that's not writable). No Docker, no port conflicts with a running backend. Reversible by deleting the binary.

**Test results (macOS arm64, 2026-05-16):**
- `curl -fsSL https://glitchtip.com/install.sh | sh` → installed `glitchtip-cli` to `/usr/local/bin` ✓
- `glitchtip-cli --version` → `glitchtip-cli 0.1.0` ✓
- `glitchtip-cli --help` → full command list (login, releases, sourcemaps, send-event, issues, projects, …) ✓
- `glitchtip-cli info` (with `SENTRY_URL` + `SENTRY_AUTH_TOKEN`) → authenticated against local backend, showed user `test@example.com` and token scopes ✓
- `glitchtip-cli send-event` (with `SENTRY_DSN` set) → returned an event id; event landed as the issue "test event from glitchtip-cli" ✓

**Notes / minor edge cases observed in the script:**
- macOS x86_64 (Intel) and Windows ARM64 have **no prebuilt binary** — the script exits early and tells the user to `cargo install glitchtip-cli`. Worth knowing if testing on an Intel Mac.
- `send-event` requires a DSN — it errors clearly (`No DSN configured. Set SENTRY_DSN or add dsn= under [auth] in .sentryclirc`) rather than hanging.
- If the install dir isn't on `PATH`, the script prints a clear note with the `export PATH=…` line to add.

---

## ⚠️ Staging verification — STILL TO DO

Everything verified so far was done **against the local stack** (local backend on `:8000`, local dev server, or Playwright network stubs). Several fixes were either *made* on staging's backend or are about *staging-specific* behavior, so they must be re-confirmed on **https://staging.glitchtip.com/** itself before this work is considered closed.

**How to test against staging:** Playwright (used for the local verification above) drives a throwaway local Chromium and would need a fresh staging login + the billing/Stripe environment that only staging has. For interacting with the real staging site under a real logged-in session, use the **Claude Chrome extension** against `https://staging.glitchtip.com/` rather than the local Playwright browser.

### Staging checklist

- [ ] **#3 — ingest fix (HIGH).** David's backend pool-exhaustion fix was applied to *staging*. The local smoke test confirmed the ingest *code path* works, but NOT staging's actual deployment. On staging: send an error, a log, and a performance/transaction event from an SDK (or `glitchtip-cli send-event` pointed at a staging project DSN) and confirm each one (a) returns fast — no 60s hang — and (b) appears in the staging UI within a few seconds.
- [ ] **#3 — staging backend config.** Confirm the actual values of `VTASKS_CONCURRENCY`, `DATABASE_POOL_MAX_SIZE`, and `GLITCHTIP_EMBED_WORKER` on staging are sane for the new async DB pool (the May 6 "VALUES → UNNEST" change). Document them so a regression is easy to spot.
- [ ] **#4 — crash fix on staging.** Once `fix/subscription-checkout-crash` is merged and deployed to staging, run David's exact repro: buy a subscription with test card `4111 1111 1111 1111`, complete checkout, get redirected back. Confirm the tab does NOT crash and the subscription page settles normally. This is the real end-to-end test the local Playwright stub-based verification stands in for.
- [ ] **#1 — cancel_url on staging.** On staging, start a Stripe checkout from the subscription page, then cancel/back out. Confirm you land back on `/<org>/settings/subscription`, not the home page. (Backend commit `3914caf8d` is merged; confirm staging has it deployed.)
- [ ] **#2 — archived product on staging.** The archived-product bug was reported as appearing "on some instances" — check whether **staging's** subscription comparison table currently shows a stale/archived product. If so, that instance has a stale `StripeProduct` DB row; running `sync_from_stripe()` should clear it. Re-verify after the backend robustness fix lands.
- [ ] **Regression sweep.** After the crash fix deploys, click through the whole hosted subscription flow on staging (view plans, upgrade, manage subscription / billing portal, free plan) to make sure the `untracked()` + one-shot-guard change didn't suppress a legitimate refresh.

---

## Useful commands / environment notes

- Backend admin login: `test@example.com` / `admin_pass` (seeded by bootstrap on first run).
- Backend API token for seeding data without going through the UI: `docker compose exec web python manage.py shell -c "from apps.api_tokens.models import APIToken; print(APIToken.objects.first().token)"` — use `Authorization: Bearer <token>` against `http://localhost:8000/api/0/...`.
- Local backend has `BILLING_ENABLED=false` and no Stripe keys by default. The repo has `compose.e2e-license.yml` for a dual-stack setup with a hosted-mode backend on :8001 — needs `STRIPE_PUBLIC_KEY`/`STRIPE_SECRET_KEY` test-mode keys in `.env`.
- Clean-room rule: Sentry server code/docs are off-limits (BSL/FSL). MIT SDKs are allowed.
