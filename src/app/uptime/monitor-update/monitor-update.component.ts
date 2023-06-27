import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { tap, filter, take } from "rxjs/operators";
import { lastValueFrom } from "rxjs";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MonitorFormComponent } from "../monitor-form/monitor-form.component";
import { MonitorInput } from "../uptime.interfaces";
import { MonitorService, MonitorState } from "../monitor.service";
import { LoadingButtonComponent } from "src/app/shared/buttons/loading-button.component";
import { StatefulBaseComponent } from "src/app/shared/stateful-service/stateful-base.component";
import { DetailHeaderComponent } from "src/app/shared/detail/header/header.component";
import { DeleteIconComponent } from "src/app/shared/buttons/delete-icon/delete-icon.component";

@Component({
  standalone: true,
  selector: "gt-monitor-update",
  templateUrl: "./monitor-update.component.html",
  styleUrls: ["./monitor-update.component.scss"],
  imports: [
    CommonModule,
    RouterModule,
    LoadingButtonComponent,
    MatCardModule,
    MatDividerModule,
    MonitorFormComponent,
    DetailHeaderComponent,
    DeleteIconComponent,
  ],
})
export class MonitorUpdateComponent
  extends StatefulBaseComponent<MonitorState, MonitorService>
  implements OnInit
{
  monitor$ = this.service.activeMonitor$;
  loading$ = this.service.editLoading$;
  error$ = this.service.error$;
  deleteLoading$ = this.service.deleteLoading$;

  constructor(
    protected service: MonitorService,
    protected route: ActivatedRoute
  ) {
    super(service);
  }

  ngOnInit() {
    lastValueFrom(
      this.route.params.pipe(
        filter((params) => !!params),
        take(1),
        tap((params) => {
          const orgSlug = params["org-slug"];
          const monitorId = params["monitor-id"];
          if (orgSlug && monitorId) {
            this.service.retrieveMonitorDetails(orgSlug, monitorId);
          }
        })
      )
    );
  }

  submit(formValues: MonitorInput) {
    this.service.editMonitor(formValues);
  }

  delete() {
    this.service.deleteMonitor();
  }
}
