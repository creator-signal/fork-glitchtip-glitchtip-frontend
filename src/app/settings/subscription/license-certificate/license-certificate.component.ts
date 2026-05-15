import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { OrganizationsService } from "src/app/api/organizations.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "gt-license-certificate",
  templateUrl: "./license-certificate.component.html",
  styleUrls: ["./license-certificate.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, MatDividerModule, MatIconModule],
})
export class LicenseCertificateComponent {
  private organizationsService = inject(OrganizationsService);
  readonly dialogRef = inject(MatDialogRef<LicenseCertificateComponent>);

  protected activeOrganization = this.organizationsService.activeOrganization;
  protected invoiceUrl = computed(() => {
    const key = this.activeOrganization()?.licenseKey ?? "";
    return `${environment.licenseInvoiceUrl}?customer_id=${encodeURIComponent(key)}`;
  });

  close() {
    this.dialogRef.close();
  }

  print() {
    window.print();
  }
}
