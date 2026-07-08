import { Type } from "@angular/core";
import { LoadingButtonPreview } from "./previews/loading-button.preview";
import { CopyInputPreview } from "./previews/copy-input.preview";
import { ToDoItemPreview } from "./previews/to-do-item.preview";
import { TablePatternPreview } from "./previews/table-pattern.preview";
import { ChartsPreview } from "./previews/charts.preview";
import { FormsPreview } from "./previews/forms.preview";
import { ConfirmDialogPreview } from "./previews/confirm-dialog.preview";
import { ButtonsPreview } from "./previews/buttons.preview";
import { TopAppBarPreview } from "./previews/top-app-bar.preview";
import { DetailPagePreview } from "./previews/detail-page.preview";
import { PermissionGatingPreview } from "./previews/permission-gating.preview";
import { BrandTypographyPreview } from "./previews/brand-typography.preview";
import { BrandColorsPreview } from "./previews/brand-colors.preview";
import { BrandComponentsPreview } from "./previews/brand-components.preview";
import { ProjectCardPreview } from "./previews/project-card.preview";
import { BannersPreview } from "./previews/banners.preview";
import { IconsPreview } from "./previews/icons.preview";
import { SymbolsPreview } from "./previews/symbols.preview";
import { FoundationsColorsPreview } from "./previews/foundations-colors.preview";
import { FoundationsTypographyPreview } from "./previews/foundations-typography.preview";
import { FoundationsSpacingPreview } from "./previews/foundations-spacing.preview";
import { FoundationsVoicePreview } from "./previews/foundations-voice.preview";
import { FoundationsAccessibilityPreview } from "./previews/foundations-accessibility.preview";
import { FoundationsMotionPreview } from "./previews/foundations-motion.preview";
import { OverviewPreview } from "./previews/overview.preview";
import { PaginationPreview } from "./previews/pagination.preview";
import { IconUsagePreview } from "./previews/icon-usage.preview";

/**
 * Component lifecycle status, following the practice of published design
 * systems (Polaris, USWDS, Carbon):
 * - `stable`: current conventions, reviewed, safe to use.
 * - `legacy`: works and is supported, but predates current conventions and is
 *   slated for an update. Fine to use; expect changes.
 * - `deprecated`: do not use in new code; the entry's docs should name the
 *   replacement.
 * Foundations and asset pages carry no status.
 */
export type PreviewStatus = "stable" | "legacy" | "deprecated";

/**
 * Top-level audience section. "product" documents the app's design system;
 * "brand" documents the marketing site's visual language. The toolbar switch
 * flips between them; groups and deep links work the same in both.
 */
export type PreviewSection = "product" | "brand";

export interface PreviewEntry {
  id: string;
  label: string;
  group: string;
  component: Type<unknown>;
  status?: PreviewStatus;
  /** Defaults to "product" when omitted. */
  section?: PreviewSection;
}

/**
 * The set of components/styles this preview app demonstrates. This is a
 * deliberately small, curated list — add an entry here to surface a new
 * component. Each entry's `component` is a tiny standalone preview that imports
 * the real app component and renders it with sensible defaults.
 */
export const PREVIEWS: PreviewEntry[] = [
  {
    id: "overview",
    label: "Overview",
    group: "Get started",
    component: OverviewPreview,
  },
  {
    id: "foundations-colors",
    label: "Colors",
    group: "Foundations",
    component: FoundationsColorsPreview,
  },
  {
    id: "foundations-typography",
    label: "Typography",
    group: "Foundations",
    component: FoundationsTypographyPreview,
  },
  {
    id: "foundations-spacing",
    label: "Layout",
    group: "Foundations",
    component: FoundationsSpacingPreview,
  },
  {
    id: "voice-tone",
    label: "Voice and tone",
    group: "Foundations",
    component: FoundationsVoicePreview,
  },
  {
    id: "accessibility",
    label: "Accessibility",
    group: "Foundations",
    component: FoundationsAccessibilityPreview,
  },
  {
    id: "motion",
    label: "Motion",
    group: "Foundations",
    component: FoundationsMotionPreview,
  },
  {
    id: "top-app-bar",
    label: "Top app bar",
    group: "Components",
    component: TopAppBarPreview,
    status: "stable",
  },
  {
    id: "loading-button",
    label: "Loading button",
    group: "Components",
    component: LoadingButtonPreview,
    status: "stable",
  },
  {
    id: "copy-input",
    label: "Copy input",
    group: "Components",
    component: CopyInputPreview,
    status: "stable",
  },
  {
    id: "to-do-item",
    label: "To-do item",
    group: "Components",
    component: ToDoItemPreview,
    status: "stable",
  },
  {
    id: "project-card",
    label: "Project card",
    group: "Components",
    component: ProjectCardPreview,
    status: "legacy",
  },
  {
    id: "banners",
    label: "Banners",
    group: "Components",
    component: BannersPreview,
    status: "stable",
  },
  {
    id: "confirm-dialog",
    label: "Confirm dialog",
    group: "Components",
    component: ConfirmDialogPreview,
    status: "stable",
  },
  {
    id: "pagination",
    label: "Pagination buttons",
    group: "Components",
    component: PaginationPreview,
    status: "legacy",
  },
  {
    id: "buttons",
    label: "Buttons & actions",
    group: "Patterns",
    component: ButtonsPreview,
    status: "stable",
  },
  {
    id: "table-pattern",
    label: "Table",
    group: "Patterns",
    component: TablePatternPreview,
    status: "stable",
  },
  {
    id: "charts",
    label: "Charts",
    group: "Patterns",
    component: ChartsPreview,
    status: "stable",
  },
  {
    id: "forms",
    label: "Forms",
    group: "Patterns",
    component: FormsPreview,
    status: "stable",
  },
  {
    id: "detail-page",
    label: "Detail page",
    group: "Patterns",
    component: DetailPagePreview,
    status: "stable",
  },
  {
    id: "permission-gating",
    label: "Permission gating",
    group: "Patterns",
    component: PermissionGatingPreview,
    status: "stable",
  },
  {
    id: "brand-typography",
    label: "Typography",
    group: "Foundations",
    section: "brand",
    component: BrandTypographyPreview,
  },
  {
    id: "brand-colors",
    label: "Colors",
    group: "Foundations",
    section: "brand",
    component: BrandColorsPreview,
  },
  {
    id: "brand-components",
    label: "Marketing components",
    group: "Components",
    section: "brand",
    component: BrandComponentsPreview,
    status: "stable",
  },
  {
    id: "icon-usage",
    label: "Icon usage",
    group: "Assets",
    component: IconUsagePreview,
  },
  {
    id: "icons",
    label: "Icons (logos)",
    group: "Assets",
    component: IconsPreview,
  },
  {
    id: "symbols",
    label: "Material symbols",
    group: "Assets",
    component: SymbolsPreview,
  },
];

/**
 * Preview entries for one section, grouped by their `group`, preserving
 * insertion order.
 */
export function groupedPreviews(
  section: PreviewSection = "product",
): { group: string; entries: PreviewEntry[] }[] {
  const groups: { group: string; entries: PreviewEntry[] }[] = [];
  for (const entry of PREVIEWS) {
    if ((entry.section ?? "product") !== section) continue;
    let bucket = groups.find((g) => g.group === entry.group);
    if (!bucket) {
      bucket = { group: entry.group, entries: [] };
      groups.push(bucket);
    }
    bucket.entries.push(entry);
  }
  return groups;
}
