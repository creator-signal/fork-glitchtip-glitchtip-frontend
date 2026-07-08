# Design System Audit (July 2026)

Usage audit of shared components across `src/app`, done while isolating components into the style guide (`projects/component-preview`). Each finding is intended to become a ticket. Lifecycle statuses (stable/legacy/deprecated) live in the style guide itself; this file tracks the codebase-side findings.

## Component usage counts

| Selector | Uses | Spread |
| --- | --- | --- |
| gt-loading-button | 57 | 19+ files, app-wide |
| gt-top-app-bar | 34 | 15 files |
| gt-entry-data | 20 | 4 files (event detail) |
| gt-form-error | 8 | 9 files (auth + profile) |
| gt-back-link | 8 | 8 files (detail pages) |
| gt-auth-svg | 8 | 3 files |
| gt-copy-input | 8 | 3 files |
| gt-detail-header | 7 | 7 files (detail pages) |
| gt-to-do-item | 6 | 2 files |
| gt-pagination-buttons | 3 | 3 files |
| gt-project-card | 2 | via gt-project-list |
| gt-empty-projects | 2 | 1 file |
| gt-upgrade-banner | 2 | 2 files |
| gt-support-banner | 1 | 1 file |
| gt-verify-email-banner | 1 | 1 file |
| gt-event-info | 1 | 1 file |

Health notes: gt-loading-button adoption is strong; ConfirmDialogComponent is used consistently for confirmations (no hand-rolled confirm dialogs found); only ~29 hardcoded hex colors exist across the whole app; spacing broadly follows the 8px grid already.

## Ticket backlog (prioritized)

### High priority

1. **Standardize submit buttons on gt-loading-button.** 13+ locations use a raw `mat-flat-button` for submit/async actions where the rest of the app uses gt-loading-button. Candidates include: settings/organization, settings/subscription (+ self-hosted), settings/teams (+ new-team cancel path), profile/auth-tokens, profile/multi-factor-auth (webauthn, totp deactivate), accept-invite, uptime/monitor-detail, new-organization, custom-timerange-form, logs. Effort ~4-6h, high UX consistency impact.
2. **Create gt-empty-state component.** 8+ hand-rolled empty-state variants: `table-empty-states` (releases, release-detail, transaction-groups, monitor-checks, monitor-list), `empty-state` (auth-tokens), `log-no-data` (logs), `chart-no-data` (daily-events-chart). Proposed inputs: `title`, `message`, optional `icon`, `actionText`/`actionUrl`. Effort ~3-4h, kills CSS duplication in 8 places.

### Medium priority

0. **Standardize table reload loading state (from MR !728).** The issues page now shows a top `mat-progress-bar` during reload, keeps the previous rows via a reusable `keepPreviousValue()` util (`signal.utils.ts`, backed by `linkedSignal`), dims stale rows, and sets `aria-busy`, instead of disabling pagination. This is the intended default. Adopt it as the standard reload pattern: document it on the guide's Table page (progress bar + `keepPreviousValue`, replacing the dim-only note) and roll it out to the other data tables (releases, members, monitor-checks, transaction-groups, logs). Effort ~3-5h.


3. **Fix deprecated input usage:** `webauthn.component.html` passes `[error]` to gt-form-error; the input is marked "Do not use". Migrate to `[errors]`. ~30 min.
3b. **Modernize gt-project-card (flips its badge legacy → stable).** Small, self-contained: convert the two remaining decorator `@Input()`s (`primaryButton`, `secondaryButton`) to signal `input()`, replace the `@HostBinding("class.sample-card")` getter with `host: { "[class.sample-card]": "sampleCard()" }`, and update the component template to call the signals. No spec file exists; parents bind via `[primaryButton]`/`[secondaryButton]`, so they are unaffected. Ship as its own product MR (not on the design-system branch); on merge, flip the style guide status from `legacy` to `stable`. Effort ~30-45 min.
4. **Promote gt-stat-card.** Repeated label/value stat rows in transaction-group-detail and monitor-detail (subscription-charts has a variant). Effort ~4-6h.
5. **Promote gt-list-item.** Members and teams settings pages hand-roll the same row layout (title link, subtitle, badge, action button). Effort ~4-5h.

### Low priority

6. **Tokenize remaining hex colors.** logs.scss carries a 22-color custom severity palette (candidate for `--log-level-*` tokens); to-do-item.scss hardcodes #e22a46/#54a65a (map to primary/success roles); project-card.scss #eee placeholders; webauthn #e5e5e5.
7. **mat-elevation-z\* audit.** 15 uses in 10 files of the M2-era elevation helper; still works, but the theme's real system is `--mat-sys-level*`. Fold into any M3 cleanup pass.

### Explicitly not worth doing now

- Detail-page wrapper component (top-app-bar + back-link + detail-header repeats, but it is 3 lines; promote only if shared behavior appears).
- Global px-to-token spacing rewrite (existing values already follow the 8px grid; migrate opportunistically).
- Dialog consolidation (PaymentComponent and NewTeamComponent are real forms, not confirmations; EventInfoComponent is fine).

## Visual audit (manual, pending)

Luis will pass through the style guide and mark less-polished components with `designNotes` chips (mechanism already in preview-doc). Starter candidates from building the guide, to confirm or reject:

- Banners: RESOLVED by the marketing exploration. The bold italic headline is the brand's `.fancy` accent (defined in `projects/marketing/src/styles.scss`), so the banners are on-brand by design, not off-system. Candidate designNote: "off-system by design: brand accent".
- Tables: use `mat-elevation-z2` while the documented system is `--mat-sys-level*` (see ticket 7).

### Button & action consistency (from the button audit)

The design system's Buttons & actions page is the rulebook; these are where the product diverges from it. Counts from the July 2026 audit (45 filled, 26 outlined, 23 icon-only, 4 text, 1 legacy raised).

- **Destructive actions inconsistent (High).** Rule: destructive actions are an **outlined warn button** (`mat-stroked-button color="warn"`) plus a confirm dialog, kept lower emphasis than the primary. This matters because primary and warn are both red, so a filled warn delete is indistinguishable from a normal primary button; the outline and dialog are the real safeguards. Two places already do this right (account delete, bulk-delete issues). Fix: the 8 alert-recipient delete icon-buttons in `src/app/settings/projects/project-detail/project-alerts/project-alerts.component.html` use `color="primary"`; the filled/primary deletes elsewhere should become outlined warn.
- **Icon-button sizing is inconsistent (High).** The same delete action is `small-icon-button` (24px) in `project-alerts`, `medium-icon-button` (36px) in `monitor-detail.component.html` and `manage-emails.html`. Rule: two sizes only (small 24 for rows/inputs, medium 36 for toolbars). Reconcile usages.
- **No shared outlined icon-button (Medium).** Angular Material 22 has no native outlined icon-button, and the product has none; secondary standalone icon actions are styled ad hoc. Add a shared `.icon-button--outlined` treatment (the preview defines one to demonstrate) and use it for standalone secondary icon actions.
- **Legacy `mat-raised-button` (Low, quick).** One M2 elevated button remains in `src/app/shared/confirm-dialog/confirm-dialog.component.html`; migrate to `mat-flat-button`.
- **Icon position (Low).** `support-banner.component.html` uses a trailing icon; leading is the rule (trailing only for the external-link cue). Confirm intent or align.
- **Document gt-loading-button default (Low).** It is ~40% of all buttons and defaults to `flat`; the rulebook documents it, ensure new usages follow the default.

### Responsive gaps (surfaced by the style guide)

- **Tables have no narrow-width story.** The shared `.table-container` (`src/styles.scss`) sets `overflow-y: auto` only, so on mobile columns wrap and rows grow tall. Recommended pattern (documented in the guide's Table page): give the container `overflow-x: auto` and the table a sensible `min-width` so it scrolls horizontally with columns intact. Apply to `.table-container` globally, or per data table. Affects issues, releases, members, monitor-checks, transaction-groups.
- **App-bar action overflow is inconsistent.** `gt-list-app-bar` collapses actions to icons + a `mat-menu` on mobile, but ad-hoc `gt-top-app-bar` usages (e.g. monitor-detail) keep text buttons that can overflow at narrow widths. Standardize on the collapse-to-icons pattern the guide's Top app bar page demonstrates.
- **Top app bar action model not followed (Medium).** The guide's Top app bar page now sets a positive rule for the right slot: one primary action plus at most one secondary or destructive action, destructive styled per Buttons & actions (outlined warn + confirm dialog, not a plain red icon), any extras in a `more_vert` menu, and a single mobile-collapse strategy. Product divergences found in the July audit: `monitor-detail` and `issue-detail` use a plain `mat-icon-button` delete with no warn treatment (and monitor-detail's is not permission-gated, `[disabled]="false"` hardcoded); `monitor-list` and `subscription` each hand-roll a long/short text swap instead of collapsing to an icon; `profile-wrapper` puts the user's email in the action slot (non-action content). Reconcile these usages against the page's rule.

### Product architecture candidate

- **Container queries for component responsiveness.** Components adapt via viewport media queries (`$small`, `$tablet` in `_variables.scss`) and `BreakpointObserver` signals like `isMobile()`. Migrating component-level behavior to CSS container queries would make components respond to the space they are given rather than the window, which composes better (a table in a half-width panel would adapt) and would make the style guide's example-width toggle reflect true breakpoint behavior. Evaluate per component; not a blanket rewrite.

### Brand follow-up ticket

- Extract the brand styles (marketing typography classes, `.fancy`, `--mkt-accent-*`) into a shared SCSS partial imported by both `projects/marketing` and `projects/component-preview`; the guide currently mirrors them with a keep-in-sync comment.

## Design-system coverage roadmap (benchmark, July 2026)

Gaps found by benchmarking the guide against public systems (PostHog, IBM Carbon, Shopify Polaris, Atlassian, GitLab Pajamas, Material 3, USWDS) plus an internal component sweep. Clean-room: no Sentry sources were consulted. Ranked by impact vs effort.

### Tier 1 — high value, low effort (guidance pages)

- **Voice & tone page.** Central UX-writing rulebook: sentence case, plain human voice, no em/en dashes, terminology (issue / event / transaction), an error-message formula. Consolidates the per-component Writing notes. Peers: Polaris Content, Atlassian Content. **(built)**
- **Accessibility standards page.** Promote the scattered a11y bullets to a Foundations page: declare WCAG 2.1 AA, contrast, keyboard baseline, reduced-motion, testing approach. Peer: Carbon Accessibility. **(built)**
- **Getting-started landing + status-chip legend.** A front door (what this is, the north-star stance, how to read a page, how to add one) and a one-screen legend for the stable/legacy/deprecated chips. Peers: Material Get started, Atlassian/USWDS status. **(built)**

### Tier 2 — high value, more effort (flagships)

- **Data-viz / charts guidelines.** Highest-leverage gap for a chart-heavy app: a color-by-category palette, chart-type-by-purpose guidance, and no-data/empty states; document the real chart components (daily-events-chart, monitor charts, subscription charts) against it. Peer: Carbon data-viz.
- **Empty states pattern + `gt-empty-state`.** Ship the pattern page (no-data / no-results / first-run / error) alongside building the component. Expands ticket #2. Peers: Pajamas, Polaris.

### Tier 3 — component coverage

- **List app bar (`gt-list-app-bar`).** Document the responsive collapse pattern the ad-hoc `gt-top-app-bar` usages should adopt (ties to the app-bar action-model ticket above).
- **Pagination buttons (`gt-pagination-buttons`), entry-data (`gt-entry-data`, 20 uses), summary/stat card (`gt-summary-card`).**
- Iconography usage rules (sizing/alignment/labeling) alongside the icon asset pages; toasts-vs-banners; a near-free Motion page (Material 3 tokens).

### Tier 4 — breadth / opportunistic

- More marketing components (driven by real marketing-site needs, not speculatively), a browsable design-tokens catalog, tabs, density and dark-mode notes.
