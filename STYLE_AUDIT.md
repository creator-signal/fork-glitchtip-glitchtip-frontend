# Style Audit Process

How to audit the product against the design system and turn the findings into
tickets. The design system (the component-preview style guide) is the north
star: it defines how a pattern should look and behave. A style audit measures
where the shipped product diverges, and each divergence becomes a ticket in
`DESIGN_AUDIT.md`.

This is standard design-system governance: define the pattern, audit usage,
drive migration. Run it per pattern, not all at once.

## When to run

- After a pattern's rule is documented in the style guide (so there is a north
  star to measure against).
- Periodically (for example quarterly) to catch drift.
- Before adopting a pattern more widely, to size the migration.

## The audit prompt (reusable)

Run this against the product with a read-only exploration agent (the Explore
subagent), filling in the pattern. It is the same prompt used for the button
audit; generalize the specifics.

> Audit how **{PATTERN}** is used across the GlitchTip frontend product code
> (`src/app`, excluding `projects/`). Be thorough and quantitative.
>
> 1. **Usage counts.** For each variant/treatment of {PATTERN}, count usages
>    across all templates (`*.html` and inline templates in `*.ts`) and list
>    ~5-10 representative file paths.
> 2. **Consistency check.** Find the same intent rendered different ways (the
>    core inconsistency evidence): the same action/element styled or sized
>    differently in different places. List each with file paths.
> 3. **Against the rule.** Compare usage to the documented rule for {PATTERN}
>    in the style guide; list where the product diverges.
> 4. **Tokens/helpers.** Note any ad-hoc classes or hardcoded values used as
>    workarounds where a shared treatment should exist.
> 5. **Ranked findings.** Return the top inconsistencies as a prioritized list
>    with concrete file paths; these become tickets.
>
> Read-only. Do not modify anything. Do not read under `projects/`.

## Turning findings into tickets

- Add a section to `DESIGN_AUDIT.md` named for the pattern (for example
  "Button & action consistency").
- One bullet per finding: a short title, a severity (High / Medium / Low), the
  concrete file paths, and the rule it should follow.
- Link back to the style guide page that defines the rule.

## Patterns worth auditing next

Buttons & actions is done. Good candidates: form controls and validation,
spacing/rhythm, empty and loading states, icon usage, and elevation
(`mat-elevation-z*` vs the `--mat-sys-level*` tokens).
