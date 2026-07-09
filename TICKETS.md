# Design System Tickets

The actionable backlog. One ticket, one MR-able unit of work, with a done-when.
Findings and history stay in `DESIGN_AUDIT.md`; this file is what to pick up next.
Scopes: **product** (ships in the app, own MR), **ci** (tooling), **guide** (the
preview app, `feat/design-system-preview`).

## High priority

### P1 — Standardize submit buttons on gt-loading-button
- **Scope:** product. **Effort:** 4-6h.
- 13+ places use a raw `mat-flat-button` for async submit: settings/organization, subscription (+ self-hosted), teams (+ new-team cancel path), auth-tokens, multi-factor-auth (webauthn, totp deactivate), accept-invite, monitor-detail, new-organization, custom-timerange-form, logs.
- **Done when:** every async submit renders gt-loading-button bound to the request's in-flight state.

### P2 — Build gt-empty-state and adopt it
- **Scope:** product. **Effort:** 3-4h.
- 8+ hand-rolled empty states: `table-empty-states` (releases, release-detail, transaction-groups, monitor-checks, monitor-list), `empty-state` (auth-tokens), `log-no-data` (logs), `chart-no-data` (daily-events-chart). Inputs: `title`, `message`, optional `icon`, `actionText`/`actionUrl`.
- **Done when:** the component exists, the 8 sites use it, and the guide gains an Empty states pattern page (no-data / no-results / first-run / error).

### P3 — Destructive actions follow the rule
- **Scope:** product. **Effort:** 2-3h.
- Rule: outlined warn + confirm dialog, lower emphasis than the primary. Violations: 8 alert-recipient delete icon-buttons in `project-alerts` use `color="primary"`; filled warn deletes elsewhere; bare primary-colored delete icons in monitor-detail and issue-detail app bars (monitor-detail's delete also has a hardcoded `[disabled]="false"`).
- **Done when:** every destructive control is outlined warn + confirmed, none compete with the primary.

### P4 — One icon-button size per context
- **Scope:** product. **Effort:** 1-2h.
- Same delete action is `small-icon-button` (24) in project-alerts but `medium-icon-button` (36) in monitor-detail and manage-emails. Rule: 24 in rows and inputs, 36 in toolbars.
- **Done when:** all icon buttons use the size their context prescribes.

### C1 — Lint the rules
- **Scope:** ci. **Effort:** 2-4h.
- Rules that exist only as prose will drift. Add: eslint ban on `mat-raised-button`; eslint ban on `[disabled]` bound to an `access*()` signal (hide, never disable); stylelint warn on raw hex where a token exists.
- **Done when:** a violating MR fails CI, and existing violations are fixed or explicitly grandfathered.

### G1 — Publish the guide
- **Scope:** guide/infra. **Effort:** staged, needs a merge.
- The GitLab Pages job (marketing site at root, guide at `/style-guide/`) is drafted in `.gitlab-ci.yml` on the old branch; it was pulled out of MR !729 with the product changes and needs to land via its own MR, then master merged into `marketing`.
- **Done when:** the guide is browsable at the public `/style-guide/` URL.

## Medium priority

### P5 — Apply the top app bar action model
- **Scope:** product. **Effort:** 2-3h.
- The guide's rule: one primary action, at most one secondary/destructive, extras in a `more_vert` menu, one mobile-collapse strategy. Violations: monitor-list and subscription hand-roll long/short text swaps; profile-wrapper puts the user's email in the action slot; monitor-detail keeps full-text buttons at all widths.
- **Done when:** the 18 `gt-top-app-bar` usages follow the rule.

### P6 — Tables scroll horizontally on narrow widths
- **Scope:** product. **Effort:** 1-2h.
- `.table-container` sets `overflow-y` only, so mobile columns wrap and rows grow tall. Give the container `overflow-x: auto` and tables a sensible `min-width`. Affects issues, releases, members, monitor-checks, transaction-groups.
- **Done when:** narrow tables scroll with columns intact (as the guide's Table page shows).

### P7 — Roll out the reload pattern from MR !728
- **Scope:** product. **Effort:** 3-5h.
- Issues page has it: top progress bar, rows kept via `keepPreviousValue()` (signal.utils.ts), dimmed, `aria-busy`. Apply to releases, members, monitor-checks, transaction-groups, logs.
- **Done when:** every data table reloads with the progress bar and kept rows.

### P8 — Promote --gt-space-* tokens into the product
- **Scope:** product. **Effort:** 30min.
- The guide documents the 8-step scale but master's `src/styles.scss` does not define it; the preview carries its own copy. Additive and non-breaking.
- **Done when:** tokens exist at the product `:root` and the preview's copy notes the product as the source.

### C2 — API-table sync check
- **Scope:** ci. **Effort:** 3-4h.
- The guide's Properties tables are hand-written and will drift. Script diffs each documented component's `input()`/`output()` signatures against its page's `api` rows; run in CI.
- **Done when:** a renamed input on a documented component fails CI until the page is updated.

### P9 — Modernize gt-project-card, flip badge to stable
- **Scope:** product. **Effort:** 30-45min.
- Convert `primaryButton`/`secondaryButton` decorator `@Input()`s to signal `input()`, replace the `@HostBinding` getter with `host` metadata, update the template to call the signals. Parents bind by property, so they are unaffected. No spec file exists.
- **Done when:** merged, and the guide's status flips legacy to stable.

### P10 — Modernize gt-pagination-buttons, flip badge to stable
- **Scope:** product. **Effort:** 30-45min.
- Convert the `paginator`/`loading` decorator `@Input()`s to signal `input()` and set OnPush (currently Eager).
- **Done when:** merged, and the guide's status flips legacy to stable.

### C3 — Visual regression on the guide
- **Scope:** ci. **Effort:** 3-5h.
- Screenshot the guide's pages in CI (Playwright) and diff on MRs, so token and component changes show as reviewable image diffs.
- **Done when:** an MR that changes a token shows image diffs in review.

## Low priority

### P11 — Fix deprecated gt-form-error input
- **Scope:** product. **Effort:** 30min.
- `webauthn.component.html` passes `[error]`; migrate to `[errors]`.

### P12 — Replace the last mat-raised-button
- **Scope:** product. **Effort:** 15min.
- `confirm-dialog.component.html`; migrate to `mat-flat-button`. (C1 then bans it.)

### P13 — Tokenize remaining hex colors
- **Scope:** product. **Effort:** 2-3h.
- logs.scss 22-color severity palette (candidate `--log-level-*` tokens); to-do-item.scss #e22a46/#54a65a (map to primary/success); project-card.scss #eee; webauthn #e5e5e5.

### P14 — mat-elevation-z* audit
- **Scope:** product. **Effort:** 1-2h.
- 15 uses in 10 files of the M2 helper; fold into an M3 cleanup, use `--mat-sys-level*`.

### P15 — Promote gt-stat-card and gt-list-item
- **Scope:** product. **Effort:** 4-6h each.
- Repeated stat rows (transaction-group-detail, monitor-detail) and hand-rolled member/team rows (settings) into shared components.

### P16 — support-banner icon position
- **Scope:** product. **Effort:** 15min.
- Trailing icon where leading is the rule; confirm intent or align.

### G2 — Document list-app-bar with a live render (or not at all)
- **Scope:** guide. **Effort:** 2-4h.
- The page was removed: its hand-drawn schematic invented the look of `gt-project-multiselect` / `gt-time-range-select` and misrepresented the real component, which violates the guide's core promise. To bring it back it must render the REAL component, which needs a mock `OrganizationsService` (activeOrganization* signals, accessProjectWrite) plus stubs for the projected sub-components.
- **Done when:** the page renders the real `gt-list-app-bar`, or it stays absent. No schematic.

### G3 — Shared brand-styles partial
- **Scope:** guide+marketing. **Effort:** 1-2h.
- Marketing typography classes, `.fancy`, and `--mkt-accent-*` are mirrored into the preview with a keep-in-sync comment; extract one partial both import.

## Deferred (do when the need is real)

- **G4 — More marketing components.** `mkt-feature-section`, `mkt-question-and-answer`, `mkt-simple-table`, `mkt-responsive-image` render via content projection or need real assets; document each when the marketing site needs it.
- **G5 — Design-system assistant.** Per `ASSISTANT.md`, a chat assistant over the guide's structured files.
- **G6 — Storybook evaluation.** Revisit if the guide passes ~25 components or a designer joins.
