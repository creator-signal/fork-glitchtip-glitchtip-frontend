import { Component, ChangeDetectionStrategy } from "@angular/core";
import { PricingAddonCardComponent } from "projects/marketing/src/app/shared/pricing-addon-card/pricing-addon-card.component";
import { ApiRow, PreviewDocComponent } from "../docs/preview-doc.component";

/**
 * Marketing's reusable components. Rendered from the real marketing source;
 * marketing and product share the same Material theme, so these display
 * faithfully inside the product-themed canvas.
 */
@Component({
  selector: "preview-brand-components",
  imports: [PricingAddonCardComponent, PreviewDocComponent],
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
    `,
  ],
  template: `
    <preview-doc
      title="Marketing components"
      status="stable"
      description="The marketing site's reusable pieces. No forks of product components exist; marketing composes its own presentational components on the same theme. Shown here: the pricing add-on card. The feature section (icon, heading, responsive image, left/right direction) is documented below; it needs marketing's image assets to render, so see it live on the marketing site."
      [whenToUse]="whenToUse"
      [dos]="dos"
      [donts]="donts"
      a11y="Cards keep their action as a real link (router or external) so it is focusable and announces its destination; external links are detected and get proper hrefs."
      [api]="api"
      [code]="code"
    >
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
    </preview-doc>
  `,
})
export class BrandComponentsPreview {
  readonly whenToUse = [
    "Pricing and feature marketing pages",
    "Any brand surface composed of icon + heading + copy + CTA blocks",
  ];
  readonly dos = [
    "Keep CTA labels as verbs",
  ];
  readonly donts = [
    "Fork a product component for a marketing variant instead of composing on the shared theme",
  ];
  readonly api: ApiRow[] = [
    { name: "mkt-pricing-addon-card icon", type: "string", default: "", description: "Material symbol name" },
    { name: "mkt-pricing-addon-card title", type: "string", default: "", description: "Card heading" },
    { name: "mkt-pricing-addon-card subtitle", type: "string", default: "", description: "Supporting copy" },
    { name: "mkt-pricing-addon-card buttonText", type: "string", default: "", description: "CTA label" },
    { name: "mkt-pricing-addon-card buttonUrl", type: "string", default: "", description: "Router path, #fragment, mailto: or https:; external detected automatically" },
    { name: "mkt-feature-section icon / heading", type: "string", default: "", description: "Block icon and heading" },
    { name: "mkt-feature-section imageSrc / imageAlt", type: "string (required)", default: "", description: "Responsive illustration" },
    { name: "mkt-feature-section direction", type: `"left" | "right"`, default: "", description: "Which side the image sits on" },
    { name: "mkt-feature-section promo", type: "boolean", default: "false", description: "Promotional variant" },
  ];
  readonly code = `<mkt-pricing-addon-card
  icon="avg_pace"
  title="Custom data retention"
  subtitle="Keep events beyond the default 90 days."
  buttonText="Contact us"
  buttonUrl="mailto:sales@glitchtip.com"
/>`;
}
