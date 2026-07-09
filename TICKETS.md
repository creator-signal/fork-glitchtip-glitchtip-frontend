# Design System Tickets

The actionable backlog for the GlitchTip design system. One ticket = one MR-able
unit of work, with what it entails and a done-when. Findings and history live in
`DESIGN_AUDIT.md`; this is what to pick up next.

Two ways to read it: the **at-a-glance table** (ordered hardest to easiest, with
type and effort) to plan, and the **by type** sections below for the detail.

## Scopes

- **product** — ships in the app; its own MR off `master`, with the full
  browser-testing bar before push.
- **ci** — tooling and pipeline; stops the system drifting over time.
- **guide** — the Component Preview app / its hosting (`feat/design-system-preview`).

## Ticket types

- **Alignment (catch-up)** — the largest bucket: make the shipped product match a
  rule the guide *already documents*. No new design decisions, just bring the
  product up to the rulebook. This is the "product catches up to the design
  system" work.
- **New component** — build a new shared component and adopt it across the sites
  that hand-roll it today.
- **Modernization** — bring an existing component to current code conventions
  (signal inputs, OnPush, M3). Each one flips its lifecycle badge legacy → stable
  in the guide, making progress visible.
- **Tokens** — add or adopt design tokens so values stop being hardcoded.
- **Enforcement** — CI/tooling that makes a rule *fail the build* instead of
  living only as prose. The anti-drift layer.
- **Guide** — the preview app itself: hosting, render fixes, structure.

## At a glance (hardest to easiest)

| # | Ticket | Type | Scope | Effort |
|---|--------|------|-------|--------|
| 1 | G5 · Design-system assistant | Guide *(deferred)* | guide | open-ended |
| 2 | P15 · Promote gt-stat-card + gt-list-item | New component | product | ~8–12h |
| 3 | P1 · Standardize submit buttons | Alignment | product | 4–6h |
| 4 | C3 · Visual regression in CI | Enforcement | ci | 3–5h |
| 5 | P7 · Roll out the reload pattern | Alignment | product | 3–5h |
| 6 | C2 · API-table sync check | Enforcement | ci | 3–4h |
| 7 | P2 · Build gt-empty-state + adopt | New component | product | 3–4h |
| 8 | G2 · Render list-app-bar live | Guide | guide | 2–4h |
| 9 | C1 · Lint the rules | Enforcement | ci | 2–4h |
| 10 | P13 · Tokenize remaining hex | Tokens | product | 2–3h |
| 11 | P3 · Destructive actions follow the rule | Alignment | product | 2–3h |
| 12 | P5 · Apply the top app bar action model | Alignment | product | 2–3h |
| 13 | P17 · Align form/info dialogs | Alignment | product | 2–3h |
| 14 | G3 · Shared brand-styles partial | Guide | guide+mkt | 1–2h |
| 15 | P18 · Fix gt-to-do-item state design | Alignment | product | 1–2h |
| 16 | P14 · mat-elevation-z\* audit | Modernization | product | 1–2h |
| 17 | P4 · One icon-button size per context | Alignment | product | 1–2h |
| 18 | P6 · Tables scroll on mobile | Alignment | product | 1–2h |
| 19 | C4 · Icon-subset check | Enforcement | ci | 1h |
| 20 | P9 · Modernize gt-project-card | Modernization | product | 30–45m |
| 21 | P10 · Modernize gt-pagination-buttons | Modernization | product | 30–45m |
| 22 | P8 · Promote --gt-space-\* tokens | Tokens | product | 30m |
| 23 | P11 · Fix deprecated gt-form-error input | Alignment | product | 30m |
| 24 | P12 · Fix ConfirmDialog confirm button | Alignment | product | 30m |
| 25 | P19 · Summary cards fill height, bar on baseline | Alignment | product | 30m |
| 26 | P20 · Fix two broken product icons (not in subset) | Alignment | product | 1h |
| 25 | P16 · support-banner icon position | Alignment | product | 15m |
| 26 | G1 · Publish the guide | Guide | infra | small (gated) |

*Deferred (not difficulty-ranked): G4 (mostly done this session), G6 (research).*

Two lenses: the **Alignment** rows are the catch-up work that makes the product
honest against its own rulebook; the **Enforcement** rows (C1–C4) and **G1** punch
far above their effort because they make the system stay true and become public.

---

## Alignment — make the product match the rulebook (catch-up)

The product already has a documented rule for each of these; the work is bringing
the shipped UI up to it. Each closes a `designNotes` chip or an audit finding.

### P1 — Standardize submit buttons on gt-loading-button
- **Scope:** product · **Effort:** 4–6h
- **Entails:** 13+ places use a raw `mat-flat-button` for an async submit where the
  rest of the app uses `gt-loading-button` (spinner + double-submit guard):
  settings/organization, subscription (+ self-hosted), teams (+ new-team cancel
  path), profile/auth-tokens, multi-factor-auth (webauthn, totp deactivate),
  accept-invite, uptime/monitor-detail, new-organization, custom-timerange-form,
  logs. Swap each and bind `[loading]` to the request's in-flight state.
- **Done when:** every async submit renders `gt-loading-button` bound to in-flight state.

### P3 — Destructive actions follow the rule
- **Scope:** product · **Effort:** 2–3h
- **Entails:** Rule (Buttons page): destructive = outlined warn + confirm dialog,
  lower emphasis than the primary, because primary and warn are both red. Two
  groups, different fixes (verified in-app, corrects the earlier scoping):
  **Group A, filled red destructives (real visual fix):** `Delete Project`
  (project-detail) and `Delete Organization` (organization) use `gt-loading-button`
  with no `color`, so they default to flat + primary and render filled red. A
  `color="primary"` lint would not catch them (no explicit attribute). Make them
  `buttonStyle="stroked" color="warn"`. **Group B, icon-buttons where `color` is a
  no-op (code hygiene only):** the `project-alerts` recipient icons carry
  `color="primary"` but render neutral gray (the input does nothing on
  `mat-icon-button` in this theme); the monitor-detail and issue-detail app bar
  delete icons have no `color` at all and already render neutral. Drop the dead
  `color="primary"`; keep the icon plain per the guide's Icon buttons rule (do not
  tint it warn — if a destructive icon must read as a standalone control, the guide
  says label it, i.e. promote to an outlined warn text button). **Separate
  cleanup:** the hardcoded `[disabled]="false"` is on monitor-detail's *Settings*
  button, not its delete. See [[project-mat-color-noop-icon-button]] and issue #363.
- **Done when:** Group A is outlined warn + confirmed and not competing with the
  primary; Group B's dead `color="primary"` is gone; the Settings `[disabled]` is removed.

### P5 — Apply the top app bar action model
- **Scope:** product · **Effort:** 2–3h
- **Entails:** Rule (Top app bar page): one primary action, at most one
  secondary/destructive, extras in a `more_vert` menu, one mobile-collapse
  strategy. Fix monitor-list and subscription (hand-rolled long/short text swaps),
  profile-wrapper (user email in the action slot), and monitor-detail (full-text
  buttons at all widths). Standardize on the collapse-to-icons pattern.
- **Done when:** the 18 `gt-top-app-bar` usages follow the rule.

### P17 — Align form and info dialogs to the Dialogs pattern
- **Scope:** product · **Effort:** 2–3h
- **Entails:** The Dialogs page sets the rules for the three types. Check the form
  dialogs (`NewTeamComponent`, `NewRecipientComponent`, `PaymentComponent`,
  `custom-timerange-form`) and the info dialog (`EventInfoComponent`): one task
  each, submit via `gt-loading-button`, cancel always available, title states the
  purpose.
- **Done when:** the bespoke form/info dialogs follow the pattern's structure and action rules.

### P18 — Fix gt-to-do-item state design
- **Scope:** product · **Effort:** 1–2h
- **Entails:** The component signals state mostly by color: an icon only on "done",
  "in progress" vs "not started" differ by text color alone, and "not started" is
  red (`#e22a46`), reading as an error. Give each state its own indicator (empty
  ring → progress ring → filled + check, one accent), make not-started neutral,
  emphasize the current step, tokenize `#e22a46`/`#54a65a`. The To-do item page
  shows the target as a do/don't.
- **Done when:** every state is distinguishable without color, not-started is neutral, colors are tokens.

### P4 — One icon-button size per context
- **Scope:** product · **Effort:** 1–2h
- **Entails:** The same delete action is `small-icon-button` (24) in project-alerts
  but `medium-icon-button` (36) in monitor-detail and manage-emails. Rule: 24 in
  rows and inputs, 36 in toolbars. Reconcile usages.
- **Done when:** all icon buttons use the size their context prescribes.

### P6 — Tables scroll horizontally on narrow widths
- **Scope:** product · **Effort:** 1–2h
- **Entails:** `.table-container` sets `overflow-y` only, so on mobile columns wrap
  and rows grow tall. Give the container `overflow-x: auto` and tables a sensible
  `min-width`. Affects issues, releases, members, monitor-checks,
  transaction-groups.
- **Done when:** narrow tables scroll with columns intact (as the Table page shows).

### P11 — Fix deprecated gt-form-error input
- **Scope:** product · **Effort:** 30min
- **Entails:** `webauthn.component.html` passes `[error]` to gt-form-error; the
  input is marked "do not use". Migrate to `[errors]`.
- **Done when:** no template passes the deprecated `[error]` input.

### P12 — Fix the ConfirmDialogComponent confirm button
- **Scope:** product · **Effort:** 30min
- **Entails:** The confirm button is `mat-raised-button color="primary"` (legacy M2
  elevation + filled red destructive). Change to `mat-stroked-button color="warn"`
  so it follows the destructive rule and reads distinctly from the plain-text
  cancel. Not `mat-flat-button` (still filled red). Part of P3; C1 then bans
  mat-raised-button. The guide already demonstrates the intended treatment.
- **Done when:** the confirm is an outlined warn button, visibly distinct from cancel.

### P16 — support-banner icon position
- **Scope:** product · **Effort:** 15min
- **Entails:** Uses a trailing icon where leading is the rule (trailing is only for
  the external-link cue). Confirm intent or align.
- **Done when:** the icon leads, or the exception is documented.

### P20 — Fix two product icons that are missing from the subset
- **Scope:** product · **Effort:** 1h
- **Entails:** The app references two Material Symbols the self-hosted subset has
  no glyph for, so they render broken (as a stray letter/partial glyph) in the
  product: `add_circle_outline` in `new-project.html` and `cached` (class `xhr`)
  in `entry-breadcrumbs.component.html`. Verified against the woff2's ligature
  table (96 glyphs; neither present, and there is no clock/refresh/sync glyph at
  all). Fix either way: regenerate `material-symbols.woff2` to include the two
  names; or switch the usages to in-subset glyphs (`add_circle_outline` → `add`;
  `cached` has no refresh-type equivalent in the subset); or decide the icon is
  not needed and drop it. Pairs with C4, which would fail the build on this
  drift. The guide's Material symbols page lists only in-subset glyphs, so it
  will not surface this on its own until C4 lands.
- **Done when:** both product usages render a real glyph (or are removed), and no
  `<mat-icon>` in the app references a name outside the subset.

### P19 — Summary cards fill height and align the progress bar
- **Scope:** product · **Effort:** 30min
- **Entails:** `summary-card.component.scss` has no `height: 100%`, so in the
  subscription dashboard grid (`.summary-cards`, 3 columns) a shorter card (loading
  spinner, "Not enough data") sizes to its own content and its `mat-progress-bar`
  floats above its neighbors' bars. Make the card fill its grid cell and lay the
  content out as a column with the meter pinned to the bottom: `mat-card { height:
  100%; display: flex; flex-direction: column }`, `mat-card-content { flex: 1;
  display: flex; flex-direction: column }`, `mat-progress-bar { margin-top: auto }`.
  The Summary card page already shows this as the target.
- **Done when:** a row of summary cards is equal height with every progress bar on
  one bottom baseline, across loading, over-limit and not-enough-data states.

## New components — build and adopt

### P15 — Promote gt-stat-card and gt-list-item
- **Scope:** product · **Effort:** ~4–6h each
- **Entails:** Two shared components. `gt-stat-card` for the repeated label/value
  stat rows (transaction-group-detail, monitor-detail; subscription-charts has a
  variant). `gt-list-item` for the hand-rolled row layout (title link, subtitle,
  badge, action) in members and teams settings. Build each, then replace the
  duplicated markup, then document in the guide.
- **Done when:** both exist, the duplicated sites use them, and each has a guide page.

### P2 — Build gt-empty-state and adopt it
- **Scope:** product · **Effort:** 3–4h
- **Entails:** 8+ hand-rolled empty states — `table-empty-states` (releases,
  release-detail, transaction-groups, monitor-checks, monitor-list), `empty-state`
  (auth-tokens), `log-no-data` (logs), `chart-no-data` (daily-events-chart).
  Component inputs: `title`, `message`, optional `icon`, `actionText`/`actionUrl`.
  Ship it, convert the 8 sites, and add an Empty states pattern page (no-data /
  no-results / first-run / error).
- **Done when:** the component exists, the 8 sites use it, and the guide has the page.

## Modernization — bring code to current conventions (flips legacy → stable)

### P14 — mat-elevation-z\* audit
- **Scope:** product · **Effort:** 1–2h
- **Entails:** 15 uses across 10 files of the M2-era `mat-elevation-z*` helper.
  Replace with the theme's real system, `--mat-sys-level*`. Fold into any M3
  cleanup pass.
- **Done when:** no `mat-elevation-z*` remains; elevation uses `--mat-sys-level*`.

### P9 — Modernize gt-project-card
- **Scope:** product · **Effort:** 30–45min
- **Entails:** Convert `primaryButton`/`secondaryButton` decorator `@Input()`s to
  signal `input()`, replace the `@HostBinding` getter with `host` metadata, update
  the template to call the signals. Parents bind by property so they're unaffected;
  no spec file.
- **Done when:** merged, and the guide's status flips legacy → stable.

### P10 — Modernize gt-pagination-buttons
- **Scope:** product · **Effort:** 30–45min
- **Entails:** Convert the `paginator`/`loading` decorator `@Input()`s to signal
  `input()` and set OnPush (currently Eager).
- **Done when:** merged, and the guide's status flips legacy → stable.

## Tokens — add or adopt design tokens

### P13 — Tokenize remaining hex colors
- **Scope:** product · **Effort:** 2–3h
- **Entails:** logs.scss carries a 22-color severity palette (candidate for
  `--log-level-*` tokens); to-do-item.scss hardcodes `#e22a46`/`#54a65a` (map to
  primary/success — overlaps P18); project-card.scss `#eee`; webauthn `#e5e5e5`.
- **Done when:** those hardcoded hexes are semantic tokens.

### P8 — Promote --gt-space-\* tokens into the product
- **Scope:** product · **Effort:** 30min
- **Entails:** The guide documents the 8-step spacing scale, but master's
  `src/styles.scss` doesn't define it (the preview carries its own copy). Add the
  8 custom properties at the product `:root`. Additive and non-breaking (nothing
  references them yet). Update the preview's copy to note the product as the source.
- **Done when:** the tokens exist at the product `:root`.

## Enforcement — make rules fail the build (anti-drift)

### C1 — Lint the rules
- **Scope:** ci · **Effort:** 2–4h
- **Entails:** Rules that live only as prose will drift. Add: eslint ban on
  `mat-raised-button`; eslint ban on `[disabled]` bound to an `access*()` signal
  (hide, never disable); stylelint warn on a raw hex where a token exists. Fix or
  grandfather existing violations. Caveat: a `color="primary"` ban would be
  cosmetic-only on `mat-icon-button` (the input is a no-op there) and would miss
  components that default to primary with no attribute (e.g. `gt-loading-button`),
  so do not sell it as a destructive-button fix. See [[project-mat-color-noop-icon-button]].
- **Done when:** a violating MR fails CI.

### C2 — API-table sync check
- **Scope:** ci · **Effort:** 3–4h
- **Entails:** The guide's Properties tables are hand-written and will drift. A
  script diffs each documented component's `input()`/`output()` signatures against
  its page's `api` rows, run in CI. (Bonus: the extracted JSON is also the
  machine-readable component manifest an AI/MCP layer would consume.)
- **Done when:** a renamed input on a documented component fails CI until the page updates.

### C3 — Visual regression on the guide
- **Scope:** ci · **Effort:** 3–5h
- **Entails:** Screenshot the guide's pages in CI (Playwright) and diff on MRs, so
  token or component changes show up as reviewable image diffs.
- **Done when:** an MR that changes a token shows image diffs in review.

### C4 — Check preview icons against the icon subset
- **Scope:** ci · **Effort:** 1h
- **Entails:** The preview self-hosts a Material Symbols subset; a `<mat-icon>` name
  outside it renders as broken ligature text (recurred: `radio_button_*`,
  `schedule`). Grep every `<mat-icon>name</mat-icon>` in `projects/component-preview`
  against the subset and fail on a miss.
- **Done when:** a preview example using an out-of-subset icon fails CI.

## Guide — the preview app and hosting

### G1 — Publish the guide
- **Scope:** infra · **Effort:** small, but gated
- **Entails:** The GitLab Pages job (marketing at root, guide at `/style-guide/`)
  is drafted in `.gitlab-ci.yml`; it was pulled out of MR !729 with the product
  changes and needs to land via its own MR, then master merged into `marketing`.
- **Done when:** the guide is browsable at the public `/style-guide/` URL.

### G2 — Document list-app-bar with a live render (or not at all)
- **Scope:** guide · **Effort:** 2–4h
- **Entails:** The page was removed because its hand-drawn schematic invented the
  look of `gt-project-multiselect`/`gt-time-range-select` and misrepresented the
  real component. To bring it back it must render the REAL component, which needs a
  mock `OrganizationsService` (activeOrganization\* signals, accessProjectWrite)
  plus stubs for the projected sub-components.
- **Done when:** the page renders the real `gt-list-app-bar`, or it stays absent. No schematic.

### G3 — Shared brand-styles partial
- **Scope:** guide+marketing · **Effort:** 1–2h
- **Entails:** The marketing typography classes, `.fancy`, and `--mkt-accent-*` are
  mirrored into the preview with a keep-in-sync comment. Extract one SCSS partial
  that both `projects/marketing` and `projects/component-preview` import.
- **Done when:** one partial is the source; the mirrored copy is gone.

## Deferred — do when the need is real

- **G4 — More marketing components.** *Mostly done:* `mkt-question-and-answer` and
  `mkt-simple-table` were added this session. `mkt-feature-section` and
  `mkt-responsive-image` remain deferred, both need real marketing image assets to
  render, so document them only when that's worth wiring up.
- **G5 — Design-system assistant.** Per `ASSISTANT.md`, a chat assistant over the
  guide's structured files (registry, tokens, docs). The AI-native end state; pairs
  naturally with C2's component manifest.
- **G6 — Storybook evaluation.** Revisit only if the guide passes ~25 components or
  a designer joins who needs an interactive controls panel.
