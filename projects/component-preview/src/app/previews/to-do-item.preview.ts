import { Component, ChangeDetectionStrategy } from "@angular/core";
import { ToDoItemComponent } from "src/app/shared/to-do-item/to-do-item.component";
import { ApiRow, PreviewDocComponent } from "../docs/preview-doc.component";

@Component({
  selector: "preview-to-do-item",
  imports: [ToDoItemComponent, PreviewDocComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <preview-doc
      title="To-do item"
      status="stable"
      description="A single step in a multi-step (wizard) checklist, showing whether a step is done, in progress, or not started. Use several together to guide a user through setup."
      [whenToUse]="whenToUse"
      [dos]="dos"
      [donts]="donts"
      a11y="State is shown with a distinct icon per status, not color alone, so it reads without relying on color perception."
      [anatomy]="anatomy"
      [api]="api"
      [importCode]="importCode"
      [code]="code"
    >
      <div class="preview-section preview-narrow">
        <div class="preview-section__title">Wizard steps</div>
        <gt-to-do-item title="Create your account" isDone="true" />
        <gt-to-do-item title="Set up a project" isDone="doing" />
        <gt-to-do-item title="Send your first event" isDone="false" />
      </div>
    </preview-doc>
  `,
})
export class ToDoItemPreview {
  readonly whenToUse = [
    "Onboarding or setup flows with sequential steps",
    "Any checklist where each item has a clear completion state",
  ];
  readonly dos = [
    "Drive isDone from the real completion state of each step",
    "Keep titles short and action-oriented",
  ];
  readonly donts = [
    "Use it for a flat list with no notion of progress",
    'Pass a boolean; isDone is a string union ("false" | "doing" | "true")',
  ];
  readonly anatomy = `<gt-to-do-item [title]="..." [isDone]="..." />`;
  readonly api: ApiRow[] = [
    { name: "title", type: "string", default: `""`, description: "The step label" },
    {
      name: "isDone",
      type: `"false" | "doing" | "true"`,
      default: `"false"`,
      description: "Step status: not started, in progress, or complete",
    },
  ];
  readonly importCode = `import { ToDoItemComponent } from "src/app/shared/to-do-item/to-do-item.component";`;
  readonly code = `<gt-to-do-item
  title="Set up a project"
  isDone="doing"
/>`;
}
