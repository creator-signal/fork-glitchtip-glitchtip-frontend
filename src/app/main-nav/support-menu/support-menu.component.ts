import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ViewChild,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatMenu, MatMenuModule } from "@angular/material/menu";
import { RouterLink } from "@angular/router";
import { OrganizationsService } from "src/app/api/organizations.service";

// TEMP: local marketing dev server. Revert to "https://glitchtip.com/support#" before merging.
const SUPPORT_URL_BASE = "http://localhost:4300/support#";

@Component({
  selector: "gt-support-menu",
  templateUrl: "./support-menu.component.html",
  styleUrls: ["./support-menu.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    RouterLink,
  ],
})
export class SupportMenuComponent {
  @ViewChild("supportMenu") menu!: MatMenu;

  private organizationsService = inject(OrganizationsService);

  protected licenseKey = computed(
    () => this.organizationsService.activeOrganization()?.licenseKey ?? "",
  );
  protected supportUrl = computed(() => SUPPORT_URL_BASE + this.licenseKey());
  protected orgSettingsLink = computed(() => {
    const slug = this.organizationsService.activeOrganizationSlug();
    return slug ? ["/", slug, "settings"] : ["/"];
  });
}
