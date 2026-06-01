import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialog } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { OrganizationsService } from "src/app/api/organizations.service";
import { TopAppBar } from "src/app/shared/top-app-bar/top-app-bar";
import { environment } from "../../../../environments/environment";
import { LicenseCertificateComponent } from "../license-certificate/license-certificate.component";
import { SubscriptionChartsComponent } from "../subscription-charts/subscription-charts.component";

// TEMP: local marketing dev server. Revert to "https://glitchtip.com/support" before merging.
const FIND_LICENSE_KEY_URL = "http://localhost:4300/support";

@Component({
  selector: "gt-self-hosted-subscription",
  templateUrl: "./self-hosted-subscription.component.html",
  styleUrls: ["./self-hosted-subscription.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TopAppBar,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RouterLink,
    SubscriptionChartsComponent,
  ],
})
export class SelfHostedSubscriptionComponent {
  private organizationsService = inject(OrganizationsService);
  private dialog = inject(MatDialog);

  billingEmail = environment.billingEmail;
  protected orgSlug = this.organizationsService.activeOrganizationSlug;
  protected licenseKey = computed(
    () => this.organizationsService.activeOrganization()?.licenseKey ?? "",
  );

  openLicenseAction() {
    if (this.licenseKey()) {
      this.dialog.open(LicenseCertificateComponent, {
        width: "560px",
        maxWidth: "95vw",
      });
    } else {
      window.open(FIND_LICENSE_KEY_URL, "_blank", "noopener,noreferrer");
    }
  }
}
