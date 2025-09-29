import { Component, computed, inject, input } from "@angular/core";
import { BreakpointService } from "../breakpoints/breakpoint.service";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";

export type ButtonStyle = "flat" | "stroked" | "icon";

export interface SplitButtonAction {
  label: string;
  action: () => void;
  icon?: string;
  disabled?: boolean;
  primary?: boolean;
  buttonStyle?: ButtonStyle;
}

export type SplitButtonMode = "always" | "responsive";

@Component({
  selector: "app-split-button",
  templateUrl: "./split-button.html",
  styleUrls: ["./split-button.scss"],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule],
})
export class SplitButtonComponent {
  actions = input<SplitButtonAction[]>([]);
  mode = input<SplitButtonMode>("responsive");
  buttonColor = input<"primary" | "accent" | "warn">("primary");
  defaultButtonStyle = input<ButtonStyle>("flat");

  private breakpointService = inject(BreakpointService);
  private isSmallScreen = this.breakpointService.isSmallScreen;

  primaryAction = computed(() => {
    return this.actions().find((action) => action.primary) || this.actions()[0];
  });

  secondaryActions = computed(() => {
    const primary = this.primaryAction();
    return this.actions().filter((action) => action !== primary);
  });

  shouldShowSplitButton = computed(() => {
    return (
      this.mode() === "always" ||
      (this.isSmallScreen() && this.secondaryActions().length > 0)
    );
  });

  shouldShowIndividualButtons = computed(() => {
    return this.mode() !== "always" && !this.isSmallScreen();
  });

  executeAction(action: SplitButtonAction): void {
    if (!action.disabled) {
      action.action();
    }
  }
}
