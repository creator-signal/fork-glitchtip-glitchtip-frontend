import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewChild,
} from "@angular/core";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatMenu, MatMenuModule } from "@angular/material/menu";
import { SettingsService } from "src/app/api/settings.service";
import { client } from "src/app/shared/api/api";

const PRICING_URL = "https://glitchtip.com/pricing";

@Component({
  selector: "gt-support-menu",
  templateUrl: "./support-menu.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDividerModule, MatIconModule, MatMenuModule],
})
export class SupportMenuComponent {
  @ViewChild("supportMenu") menu!: MatMenu;

  private settings = inject(SettingsService);

  protected paidForGlitchTip = this.settings.paidForGlitchTip;
  protected pricingUrl = PRICING_URL;
  protected supportLinkLoading = signal(false);

  async openSupportChat() {
    if (this.supportLinkLoading()) return;
    this.supportLinkLoading.set(true);
    try {
      const { data } = await client.GET(
        "/api/0/instance-license/support-link/",
      );
      if (data?.url) {
        window.open(data.url, "_blank", "noopener");
      }
    } finally {
      this.supportLinkLoading.set(false);
    }
  }
}
