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
  protected supportUrl = signal<string | null>(null);

  // Called from the menu trigger (main-nav) when the menu opens, so the link
  // is a ready-to-click anchor (a server-built URL embedding the license key);
  // avoids window.open after an await, which popup blockers reject.
  async loadSupportLink() {
    if (this.supportUrl()) return;
    const { data } = await client.GET("/api/0/instance-license/support-link/");
    if (data?.url) {
      this.supportUrl.set(data.url);
    }
  }
}
