import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  effect,
  inject,
  signal,
} from "@angular/core";
import { ELEVATION_TOKENS, resolveCssVar, SPACE_TOKENS } from "../foundations/tokens";
import { ThemeStore } from "../theme-store";

interface ResolvedSpace {
  name: string;
  value: string;
}

interface ResolvedElevation {
  name: string;
  label?: string;
  value: string;
}

/**
 * Spacing, radius and elevation reference. The spacing scale is the additive
 * `--gt-space-*` token set (8px base grid). Elevation tokens are probed and
 * any that resolve empty are hidden, so the page stays honest about what the
 * theme actually defines.
 */
@Component({
  selector: "preview-foundations-spacing",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .fs-space-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 10px;
      }
      .fs-space-bar {
        height: 16px;
        background-color: var(--mat-sys-primary);
        border-radius: 2px;
      }
      .fs-space-name {
        font-family: var(--gt-font-mono, monospace);
        font-size: 0.78rem;
        min-width: 120px;
      }
      .fs-space-value {
        font-size: 0.75rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .fs-radius {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 96px;
        height: 64px;
        background-color: var(--mat-sys-surface-container-high);
        border: 1px solid var(--mat-sys-outline-variant);
        font-family: var(--gt-font-mono, monospace);
        font-size: 0.78rem;
      }
      .fs-bp-table {
        border-collapse: collapse;
        font: var(--mat-sys-body-small);
        min-width: 480px;
      }
      .fs-bp-table th,
      .fs-bp-table td {
        text-align: left;
        padding: var(--gt-space-2) var(--gt-space-3);
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }
      .fs-bp-table th {
        font: var(--mat-sys-label-medium);
        color: var(--mat-sys-on-surface-variant);
      }
      .fs-bp-table code {
        font-family: var(--gt-font-mono, monospace);
        font-size: 0.85em;
      }
      .fs-elevations {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        // A stage below surface level so the boxes have something to sit on
        // and cast onto in both schemes.
        padding: var(--gt-space-4);
        border-radius: 8px;
        background-color: var(--mat-sys-surface-container-lowest, var(--mat-sys-background));
      }
      .fs-elevation {
        width: 120px;
        height: 72px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--gt-font-mono, monospace);
        font-size: 0.72rem;
      }
    `,
  ],
  template: `
    <header class="preview-page-header">
      <h1 class="preview-page-title">Layout</h1>
      <p class="preview-lead">
        The spacing scale, breakpoints, corner radius, and elevation levels
        the system is built on.
      </p>
    </header>

    <div class="preview-section">
      <div class="preview-section__title">Spacing scale</div>
      <p class="preview-section__note">
        8px base grid, exposed as <code>--gt-space-*</code> tokens. Prefer these
        over ad-hoc pixel values in new code.
      </p>
      @for (s of spaces(); track s.name) {
        <div class="fs-space-row">
          <span class="fs-space-name">{{ s.name }}</span>
          <span class="fs-space-bar" [style.width]="s.value || '0px'"></span>
          <span class="fs-space-value">{{ s.value || "0" }}</span>
        </div>
      }
    </div>

    <div class="preview-section">
      <div class="preview-section__title">Density</div>
      <p class="preview-section__note">
        Control density with the same scale. Use the smaller steps
        (<code>--gt-space-1</code> to <code>--gt-space-3</code>) for dense,
        data-heavy views like tables and lists, and the larger steps
        (<code>--gt-space-5</code> to <code>--gt-space-7</code>) to separate
        sections and give a page room. Keep one view consistent; do not mix a
        tight row gap with a roomy one. When a whole view needs to be more
        compact, tune Material's component density in the theme rather than
        shrinking values by hand.
      </p>
    </div>

    <div class="preview-section">
      <div class="preview-section__title">Breakpoints</div>
      <p class="preview-section__note">
        Min-width breakpoints aligned with the Angular CDK (defined in
        <code>_variables.scss</code>). These are window media queries:
        components adapt to the browser width, mostly by pages swapping content
        via a <code>BreakpointObserver</code> signal like
        <code>isMobile()</code>. To see it, resize the browser (this guide is
        itself responsive). The per-example width toggle, where shown, is a
        narrower thing: how a component reflows inside a smaller container.
      </p>
      <table class="fs-bp-table">
        <thead>
          <tr>
            <th>Variable</th>
            <th>Min width</th>
            <th>Typical use</th>
          </tr>
        </thead>
        <tbody>
          @for (bp of breakpoints; track bp.name) {
            <tr>
              <td><code>{{ bp.name }}</code></td>
              <td><code>{{ bp.value }}</code></td>
              <td>{{ bp.usage }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <div class="preview-section">
      <div class="preview-section__title">Radius</div>
      <p class="preview-section__note">
        Corner radius used across surfaces (<code>$shape-radius</code>).
      </p>
      <div class="fs-radius" [style.border-radius]="radius()">
        {{ radius() }}
      </div>
    </div>

    @if (elevations().length) {
      <div class="preview-section">
        <div class="preview-section__title">Elevation</div>
        <p class="preview-section__note">
          Material 3 elevation levels defined by the theme. Each box pairs the
          level's shadow with its surface-container tint, because that is how
          elevation reads in practice: in light mode the shadow does most of
          the work, in dark mode shadows are intentionally subtle and the
          lighter surface tint carries the level. Toggle the scheme to compare.
        </p>
        <div class="fs-elevations">
          @for (e of elevations(); track e.name) {
            <div
              class="fs-elevation"
              [style.box-shadow]="'var(' + e.name + ')'"
              [style.background-color]="'var(' + tintFor(e.name) + ')'"
            >
              {{ e.label }}
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class FoundationsSpacingPreview {
  private readonly host = inject(ElementRef);
  private readonly themeStore = inject(ThemeStore);

  readonly spaces = signal<ResolvedSpace[]>([]);
  readonly radius = signal<string>("4px");
  readonly elevations = signal<ResolvedElevation[]>([]);

  /**
   * The surface-container tint that corresponds to each elevation level,
   * per Material 3's tone-based elevation. Shadows alone are nearly
   * invisible in dark mode; the tint is what makes a level readable there.
   */
  tintFor(levelToken: string): string {
    const map: Record<string, string> = {
      "--mat-sys-level0": "--mat-sys-surface",
      "--mat-sys-level1": "--mat-sys-surface-container-low",
      "--mat-sys-level2": "--mat-sys-surface-container",
      "--mat-sys-level3": "--mat-sys-surface-container-high",
      "--mat-sys-level4": "--mat-sys-surface-container-highest",
      "--mat-sys-level5": "--mat-sys-surface-container-highest",
    };
    return map[levelToken] ?? "--mat-sys-surface";
  }

  // SCSS variables cannot be read live; keep in sync with
  // src/assets/styles/_variables.scss.
  readonly breakpoints = [
    { name: "$Xsmall", value: "0px", usage: "Phones" },
    { name: "$small", value: "600px", usage: "Mobile nav collapses above this" },
    { name: "$tablet", value: "768px", usage: "Detail headers stack below this" },
    { name: "$medium", value: "960px", usage: "Side-by-side layouts" },
    { name: "$large", value: "1280px", usage: "Wide desktop layouts" },
    { name: "$Xlarge", value: "1920px", usage: "Very wide screens" },
  ];

  constructor() {
    effect(() => {
      this.themeStore.theme();
      const el = this.host.nativeElement as Element;

      this.spaces.set(
        SPACE_TOKENS.map((t) => ({
          name: t.name,
          value: resolveCssVar(t.name, el),
        })),
      );

      // No CSS custom property for radius today; surface the known value.
      this.radius.set("4px");

      this.elevations.set(
        ELEVATION_TOKENS.map((t) => ({
          name: t.name,
          label: t.label,
          value: resolveCssVar(t.name, el),
        })).filter((e) => e.value.length > 0),
      );
    });
  }
}
