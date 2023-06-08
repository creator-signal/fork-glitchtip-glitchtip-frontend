import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { map, withLatestFrom } from "rxjs/operators";
import { ListTitleComponent } from "src/app/list-elements/list-title/list-title.component";
import { PaginationBaseComponent } from "src/app/shared/stateful-service/pagination-base.component";
import { MonitorListService, MonitorListState } from "./monitor-list.service";
import { checkForOverflow } from "src/app/shared/shared.utils";
import { ListFooterComponent } from "src/app/list-elements/list-footer/list-footer.component";
import { TimeForPipe } from "src/app/shared/days-ago.pipe";
import { MonitorChartComponent } from "../monitor-chart/monitor-chart.component";

@Component({
  standalone: true,
  selector: "gt-monitor-list",
  templateUrl: "./monitor-list.component.html",
  styleUrls: ["./monitor-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ListFooterComponent,
    TimeForPipe,
    MonitorChartComponent,
    MatButtonModule,
    MatTooltipModule,
    MatTableModule,
    MatIconModule,
    ListTitleComponent,
  ],
})
export class MonitorListComponent
  extends PaginationBaseComponent<MonitorListState, MonitorListService>
  implements OnChanges
{
  @Input("org-slug") orgSlug?: string;
  @Input("cursor") cursor?: string;
  tooltipDisabled = false;

  monitors$ = this.service.monitors$;
  displayedColumns: string[] = [
    "statusColor",
    "name-and-url",
    "check-chart",
    "status",
  ];
  navigationEnd$ = this.cursorNavigationEnd$.pipe(
    withLatestFrom(this.route.params, this.route.queryParams),
    map(([_, params, queryParams]) => {
      const orgSlug: string | undefined = params["org-slug"];
      const cursor: string | undefined = queryParams.cursor;
      return { orgSlug, cursor };
    })
  );

  constructor(
    protected service: MonitorListService,
    protected router: Router,
    protected route: ActivatedRoute
  ) {
    super(service, router, route);

    //previous code for calling getMonitors on route changes

    // this.activeCombinedParams$.subscribe(([params, queryParams]) => {
    //   if (params["org-slug"]) {
    //     this.service.getMonitors(params["org-slug"], queryParams.cursor);
    //   }
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Assuming there were other inputs, we could wrap this in an if statement to check for relevant currentvalues
    if (this.orgSlug) {
      this.service.getMonitors(this.orgSlug, changes.cursor?.currentValue);
    }
  }

  checkIfTooltipIsNecessary($event: Event) {
    this.tooltipDisabled = checkForOverflow($event);
  }
}
