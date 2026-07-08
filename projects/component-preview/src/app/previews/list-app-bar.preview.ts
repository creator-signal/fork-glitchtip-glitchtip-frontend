import { Component, ChangeDetectionStrategy } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { ApiRow, PreviewDocComponent } from "../docs/preview-doc.component";

/**
 * gt-list-app-bar: the list-page header. Documented as a static schematic
 * because the real component injects OrganizationsService and only renders
 * with an active organization loaded.
 */
@Component({
  selector: "preview-list-app-bar",
  imports: [MatIconModule, PreviewDocComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .lab-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--gt-space-3);
        padding: var(--gt-space-3) var(--gt-space-4);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 8px;
        background-color: var(--mat-sys-surface-container-low);
        max-width: 640px;
      }
      .lab-title {
        font: var(--mat-sys-title-large);
      }
      .lab-right {
        display: flex;
        align-items: center;
        gap: var(--gt-space-2);
      }
      .lab-chip {
        display: inline-flex;
        align-items: center;
        gap: var(--gt-space-1);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 20px;
        padding: 4px 12px;
        font: var(--mat-sys-label-large);
        background-color: var(--mat-sys-surface);
        color: var(--mat-sys-on-surface);
      }
      .lab-chip mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .lab-filter {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid var(--mat-sys-outline-variant);
        background-color: var(--mat-sys-surface);
        color: var(--mat-sys-on-surface);
      }
      .lab-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 8px;
        background-color: var(--mat-sys-primary);
        color: var(--mat-sys-on-primary);
        font: var(--mat-sys-label-small);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .lab-caption {
        font: var(--mat-sys-body-small);
        color: var(--mat-sys-on-surface-variant);
        margin: var(--gt-space-2) 0 var(--gt-space-5);
      }
      .lab-caption:last-child {
        margin-bottom: 0;
      }
    `,
  ],
  template: `
    <preview-doc
      title="List app bar"
      status="stable"
      description="The header for list pages (issues, transaction groups, logs). It is the list-page sibling of the top app bar: a title on the left, and project and time-range filters on the right. On small screens the filters collapse behind a single filter button with a count badge, so the title always keeps its room."
      [whenToUse]="whenToUse"
      [dos]="dos"
      [donts]="donts"
      a11y="The filter button names itself and its active count so a screen reader announces how many filters are applied. The title is the page heading."
      [anatomy]="anatomy"
      [composition]="composition"
      [api]="api"
      [importCode]="importCode"
      [code]="code"
      [designNotes]="['shown as a static schematic; renders live only with an active organization']"
    >
      <div class="preview-section">
        <div class="preview-section__title">Wide screen</div>
        <div class="lab-bar">
          <span class="lab-title">Issues</span>
          <div class="lab-right">
            <span class="lab-chip">Projects <mat-icon>arrow_drop_down</mat-icon></span>
            <span class="lab-chip">Last 14 days <mat-icon>arrow_drop_down</mat-icon></span>
          </div>
        </div>
        <p class="lab-caption">Filters sit inline next to the title.</p>
      </div>

      <div class="preview-section" style="margin-bottom: 0">
        <div class="preview-section__title">Small screen</div>
        <div class="lab-bar" style="max-width: 360px">
          <span class="lab-title">Issues</span>
          <div class="lab-right">
            <span class="lab-filter">
              <mat-icon>filter_list</mat-icon>
              <span class="lab-badge">2</span>
            </span>
          </div>
        </div>
        <p class="lab-caption">
          Filters collapse into one button; the badge shows how many are
          applied. Tapping it expands the filters below the bar.
        </p>
      </div>
    </preview-doc>
  `,
})
export class ListAppBarPreview {
  readonly whenToUse = [
    "The header of a list page that filters by project or time range",
    "Anywhere a list needs a title plus filters that must survive on mobile",
  ];
  readonly dos = [
    "Use it for list pages; use the plain Top app bar for detail pages",
    "Collapse filters to one button with a count badge on small screens",
    "Show the add-project button instead of the project filter when the org has no projects",
  ];
  readonly donts = [
    "Let filter controls wrap or push the title off-screen on mobile",
    "Duplicate it with an extra bar inside the page body",
  ];
  readonly anatomy = `<gt-list-app-bar [listTitle]="..." [queriedProjects]="..."
  [includeTimeRangeSelect]="true" />`;
  readonly composition = {
    within: ["Detail page"],
    contains: ["Top app bar", "Buttons & actions"],
  };
  readonly api: ApiRow[] = [
    { name: "listTitle", type: "string", default: `""`, description: "The page heading shown on the left" },
    { name: "queriedProjects", type: "string[]", default: "", description: "Selected project ids; drives the project filter (hidden if not provided)" },
    { name: "includeTimeRangeSelect", type: "boolean", default: "false", description: "Adds the time-range filter" },
    { name: "queriedTimeRangeStart/End", type: "string", default: "", description: "The active time range, echoed in the filter" },
    { name: "displayAddProject", type: "boolean", default: "false", description: "Show an add-project button when the org has no projects" },
    { name: "searchHits", type: "string", default: "", description: "Optional result count shown by the title" },
  ];
  readonly importCode = `import { ListAppBar } from "src/app/list-elements/list-app-bar/list-app-bar";`;
  readonly code = `<gt-list-app-bar
  listTitle="Issues"
  [queriedProjects]="selectedProjectIds()"
  [includeTimeRangeSelect]="true"
  [queriedTimeRangeStart]="start()"
  [queriedTimeRangeEnd]="end()"
/>`;
}
