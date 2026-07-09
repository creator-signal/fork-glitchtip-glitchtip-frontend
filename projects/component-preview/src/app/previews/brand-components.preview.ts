import { Component, ChangeDetectionStrategy } from "@angular/core";
import { PricingAddonCardComponent } from "projects/marketing/src/app/shared/pricing-addon-card/pricing-addon-card.component";
import { QuestionAndAnswerComponent } from "projects/marketing/src/app/shared/payment/question-and-answer/question-and-answer.component";
import { SimpleTableComponent } from "projects/marketing/src/app/shared/simple-table/simple-table.component";
import { ApiRow, PreviewDocComponent } from "../docs/preview-doc.component";

/**
 * Marketing's reusable components, rendered from the real marketing source.
 * Marketing shares the product's Material theme, so these display faithfully
 * inside the product-themed canvas; the page makes the shared-vs-brand split
 * explicit.
 */
@Component({
  selector: "preview-brand-components",
  imports: [
    PricingAddonCardComponent,
    QuestionAndAnswerComponent,
    SimpleTableComponent,
    PreviewDocComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      // The card lays out as a wide horizontal row (icon, text, CTA), so give
      // each one the full column width it gets on the pricing page.
      .bcmp-row {
        display: flex;
        flex-direction: column;
        max-width: 560px;
      }
      .bcmp-shared {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: var(--gt-space-4);
        max-width: 720px;
      }
      .bcmp-shared__col {
        padding: var(--gt-space-4);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 8px;
        background-color: var(--mat-sys-surface-container-low);
      }
      .bcmp-shared__label {
        font: var(--mat-sys-label-large);
        margin: 0 0 var(--gt-space-2);
      }
      .bcmp-shared ul {
        margin: 0;
        padding-left: var(--gt-space-4);
        font: var(--mat-sys-body-medium);
      }
      .bcmp-shared li {
        margin-bottom: var(--gt-space-1);
      }
      dl {
        max-width: 560px;
        margin: 0;
      }
    `,
  ],
  template: `
    <preview-doc
      title="Marketing components"
      status="stable"
      description="The marketing site's reusable components, rendered from the real marketing source. Marketing does not fork product components; it composes its own presentational pieces on the shared theme, so they render faithfully here."
      [whenToUse]="whenToUse"
      [dos]="dos"
      [donts]="donts"
      a11y="Cards keep their action as a real link so it is focusable and announces its destination. The question/answer pair uses dt/dd so a reader announces the term then its definition; the table uses real th headers."
      [api]="api"
      [code]="code"
    >
      <div class="preview-section">
        <div class="preview-section__title">What comes from the product</div>
        <p class="preview-section__note">
          The marketing site is built on the product's Material 3 theme. It
          inherits most of the system and adds a thin brand layer on top; every
          component below is composed from these.
        </p>
        <div class="bcmp-shared">
          <div class="bcmp-shared__col">
            <p class="bcmp-shared__label">Inherited from the product</p>
            <ul>
              <li>Material 3 color roles (--mat-sys-*)</li>
              <li>Spacing scale (--gt-space-*)</li>
              <li>Base body and label type</li>
            </ul>
          </div>
          <div class="bcmp-shared__col">
            <p class="bcmp-shared__label">Added by the brand</p>
            <ul>
              <li>Display type scale (.marketing-heading)</li>
              <li>The .fancy italic accent</li>
              <li>--mkt-accent-blue / --mkt-accent-yellow</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="preview-section">
        <div class="preview-section__title">Pricing add-on card</div>
        <div class="bcmp-row">
          <mkt-pricing-addon-card
            icon="avg_pace"
            title="Custom data retention"
            subtitle="Keep events beyond the default 90 days."
            buttonText="Contact us"
            buttonUrl="mailto:sales@glitchtip.com"
          />
          <mkt-pricing-addon-card
            icon="check_circle"
            title="Priority support"
            subtitle="Direct line to the engineers who build GlitchTip."
            buttonText="See plans"
            buttonUrl="/pricing#support"
          />
        </div>
      </div>

      <div class="preview-section">
        <div class="preview-section__title">Question and answer</div>
        <dl>
          <mkt-question-and-answer
            question="Do you offer a free plan?"
            answer="Yes. The free plan covers 1,000 events a month, no card required."
          />
          <mkt-question-and-answer
            question="Can I self-host GlitchTip?"
            answer="Yes. GlitchTip is open source and runs on your own infrastructure."
          />
        </dl>
      </div>

      <div class="preview-section" style="margin-bottom: 0">
        <div class="preview-section__title">Simple table</div>
        <mkt-simple-table [columns]="tableColumns" [rows]="tableRows" />
      </div>
    </preview-doc>
  `,
})
export class BrandComponentsPreview {
  readonly tableColumns = ["Plan", "Events / mo", "Price"];
  readonly tableRows = [
    ["Free", "1,000", "$0"],
    ["Team", "100,000", "$29"],
    ["Business", "1M", "$99"],
  ];

  readonly whenToUse = [
    "Pricing and feature marketing pages",
    "FAQs and comparison tables on brand surfaces",
  ];
  readonly dos = [
    "Compose brand pages from these on the shared theme",
    "Keep CTA labels as verbs",
  ];
  readonly donts = [
    "Fork a product component for a marketing variant instead of composing on the shared theme",
  ];
  readonly api: ApiRow[] = [
    { name: "mkt-pricing-addon-card", type: "icon, title, subtitle, buttonText, buttonUrl", default: "", description: "Icon + heading + copy + CTA; buttonUrl detects external, #fragment, and mailto:" },
    { name: "mkt-question-and-answer", type: "question, answer", default: "", description: "An FAQ dt/dd pair; omit answer and project HTML for a rich answer" },
    { name: "mkt-simple-table", type: "columns: string[], rows: string[][]", default: "", description: "A plain comparison table with real th headers" },
    { name: "mkt-feature-section", type: "icon, heading, imageSrc, imageAlt, direction, promo", default: "", description: "Image + copy block; not rendered here because it needs marketing image assets" },
  ];
  readonly code = `<mkt-question-and-answer
  question="Do you offer a free plan?"
  answer="Yes. The free plan covers 1,000 events a month."
/>

<mkt-simple-table [columns]="columns" [rows]="rows" />`;
}
