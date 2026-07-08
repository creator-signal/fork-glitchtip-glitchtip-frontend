import { Component, ChangeDetectionStrategy, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";

interface Dur {
  ms: string;
  name: string;
  use: string;
}

/**
 * Motion foundation. GlitchTip is on Material 3, so it adopts M3's short
 * durations and the standard easing. Motion is used sparingly and always
 * respects prefers-reduced-motion.
 */
@Component({
  selector: "preview-foundations-motion",
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .mo-list {
        margin: 0;
        list-style: disc outside;
        padding-left: var(--gt-space-5);
        font: var(--mat-sys-body-medium);
      }
      .mo-list li {
        margin-bottom: var(--gt-space-2);
        padding-left: var(--gt-space-1);
      }
      .mo-demo {
        display: flex;
        flex-direction: column;
        gap: var(--gt-space-3);
        margin-bottom: var(--gt-space-3);
      }
      .mo-track-row {
        display: flex;
        align-items: center;
        gap: var(--gt-space-4);
      }
      .mo-track-label {
        width: 64px;
        font-family: var(--gt-font-mono, monospace);
        font-size: 0.78rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .mo-track {
        position: relative;
        height: 24px;
        width: 260px;
        max-width: 100%;
        border-radius: 12px;
        background-color: var(--mat-sys-surface-container-high);
      }
      .mo-dot {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background-color: var(--mat-sys-primary);
        // Standard Material 3 easing.
        transition: transform var(--mo-dur, 300ms) cubic-bezier(0.2, 0, 0, 1);
      }
      .mo-demo.is-on .mo-dot {
        transform: translateX(230px);
      }
      .mo-table {
        width: 100%;
        border-collapse: collapse;
        font: var(--mat-sys-body-small);
        max-width: 640px;
      }
      .mo-table th,
      .mo-table td {
        text-align: left;
        padding: var(--gt-space-2) var(--gt-space-3);
        border-bottom: 1px solid var(--mat-sys-outline-variant);
        vertical-align: top;
      }
      .mo-table th {
        font: var(--mat-sys-label-medium);
        color: var(--mat-sys-on-surface-variant);
      }
      .mo-table code {
        font-family: var(--gt-font-mono, monospace);
      }
      // The page practices what it preaches.
      @media (prefers-reduced-motion: reduce) {
        .mo-dot {
          transition: none;
        }
      }
    `,
  ],
  template: `
    <header class="preview-page-header">
      <h1 class="preview-page-title">Motion</h1>
      <p class="preview-lead">
        Motion shows a change or a relationship; it is never decoration. The app
        is on Material 3, so it uses M3's short durations and standard easing,
        and it honors reduced-motion.
      </p>
    </header>

    <div class="preview-section">
      <div class="preview-section__title">Principles</div>
      <ul class="mo-list">
        <li>Animate with a reason: show what changed, where something came from, or that two things are related.</li>
        <li>Keep it short. UI motion should feel near-instant, not cinematic.</li>
        <li>Respect prefers-reduced-motion: reduce or remove non-essential motion when it is set.</li>
        <li>Never put meaning in motion alone.</li>
      </ul>
    </div>

    <div class="preview-section">
      <div class="preview-section__title">Duration</div>
      <p class="preview-section__note">
        Same distance, four durations. Press play to feel the difference; the
        shortest reads as instant, the longest starts to feel slow for UI.
      </p>
      <div class="mo-demo" [class.is-on]="playing()">
        @for (d of durations; track d.ms) {
          <div class="mo-track-row">
            <span class="mo-track-label">{{ d.ms }}</span>
            <div class="mo-track">
              <div class="mo-dot" [style.--mo-dur]="d.ms"></div>
            </div>
          </div>
        }
      </div>
      <button mat-stroked-button (click)="toggle()">
        {{ playing() ? "Reset" : "Play" }}
      </button>
    </div>

    <div class="preview-section">
      <div class="preview-section__title">Scale</div>
      <table class="mo-table">
        <thead>
          <tr>
            <th>Duration</th>
            <th>Name</th>
            <th>Use for</th>
          </tr>
        </thead>
        <tbody>
          @for (d of durations; track d.ms) {
            <tr>
              <td><code>{{ d.ms }}</code></td>
              <td>{{ d.name }}</td>
              <td>{{ d.use }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <div class="preview-section" style="margin-bottom: 0">
      <div class="preview-section__title">Easing</div>
      <p class="preview-section__note">
        Use the Material 3 standard easing for almost everything:
        <code>cubic-bezier(0.2, 0, 0, 1)</code>. It starts quickly and settles
        gently, which reads as responsive. Reserve custom curves for a specific,
        deliberate effect.
      </p>
    </div>
  `,
})
export class FoundationsMotionPreview {
  readonly playing = signal(false);
  toggle(): void {
    this.playing.update((v) => !v);
  }

  readonly durations: Dur[] = [
    { ms: "100ms", name: "Short", use: "Hover, focus, ripple, small utility changes" },
    { ms: "200ms", name: "Short", use: "Small elements entering or leaving" },
    { ms: "300ms", name: "Medium", use: "The default for most UI transitions, expands, dialogs" },
    { ms: "500ms", name: "Long", use: "Large surfaces and full-width or full-screen changes" },
  ];
}
