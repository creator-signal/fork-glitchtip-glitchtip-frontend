import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
} from "@angular/core";

/**
 * Structural directive that renders its host element only when the bound
 * expression is truthy. Use it to hide controls a user lacks permission to use,
 * passing an access signal from the relevant service, e.g.
 *
 *   <button *gtRequiresAccess="accessProjectWrite()">Delete</button>
 *   <gt-loading-button *gtRequiresAccess="userTeamRole() !== 'member'" />
 *
 * The boolean stays derived from a single source of truth (the access/role
 * signals on our services) rather than re-deriving scope strings here.
 *
 * This is a UX affordance only. The backend remains the authority and rejects
 * unauthorized requests regardless of what the UI shows.
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
