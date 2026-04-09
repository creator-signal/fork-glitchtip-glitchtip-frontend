import { Component, inject } from "@angular/core";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { RouterModule } from "@angular/router";
import { OrganizationsService } from "src/app/api/organizations.service";

@Component({
  selector: "gt-create-project-dialog",
  imports: [MatDialogModule, MatButtonModule, MatDividerModule, MatListModule, RouterModule],
  templateUrl: "./create-project-dialog.html",
})
export class CreateProjectDialog {
  private dialogRef = inject(MatDialogRef<CreateProjectDialog>);
  private organizationsService = inject(OrganizationsService);

  organizations = this.organizationsService.organizations;

  close() {
    this.dialogRef.close();
  }
}
