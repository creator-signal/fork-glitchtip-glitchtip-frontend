import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
} from "@angular/core";

/**
 * Renders its host element only when the bound expression is truthy.
 * Use to hide controls a user lacks permission for, e.g.
 *   <button *gtRequiresAccess="accessProjectWrite()">Delete</button>
 */
@Directive({
  selector: "[gtRequiresAccess]",
  standalone: true,
})
export class RequiresAccessDirective {
  #templateRef = inject(TemplateRef);
  #viewContainer = inject(ViewContainerRef);

  readonly access = input.required<boolean>({ alias: "gtRequiresAccess" });

  #rendered = false;

  constructor() {
    effect(() => {
      const granted = this.access();
      if (granted && !this.#rendered) {
        this.#viewContainer.createEmbeddedView(this.#templateRef);
        this.#rendered = true;
      } else if (!granted && this.#rendered) {
        this.#viewContainer.clear();
        this.#rendered = false;
      }
    });
  }
}
