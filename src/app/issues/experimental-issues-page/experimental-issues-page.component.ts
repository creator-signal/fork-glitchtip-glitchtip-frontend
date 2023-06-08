import { CommonModule } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ProjectFilterBarComponent } from "src/app/list-elements/project-filter-bar/project-filter-bar.component";
import { IssuesService, IssuesState } from "../issues.service";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { lastValueFrom } from "rxjs";
import { PaginationBaseComponent } from "src/app/shared/stateful-service/pagination-base.component";

@Component({
  selector: "gt-experimental-issues-page",
  templateUrl: "./experimental-issues-page.component.html",
  styleUrls: ["./experimental-issues-page.component.scss"],
  standalone: true,
  imports: [CommonModule, ProjectFilterBarComponent, RouterModule],
})
export class ExperimentalIssuesPageComponent
  extends PaginationBaseComponent<IssuesState, IssuesService>
  implements OnChanges
{
  @Input("org-slug") orgSlug?: string;
  @Input("cursor") cursor?: string;
  @Input() project?: number[];
  @Input() query?: string;
  @Input() start?: string;
  @Input() end?: string;
  @Input() sort?: string;
  @Input() environment?: string;
  issues$ = this.service.issues$;

  constructor(
    protected service: IssuesService,
    protected router: Router,
    protected route: ActivatedRoute
  ) {
    super(service, router, route);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    console.log(this.orgSlug);

    if (this.orgSlug) {
      lastValueFrom(
        this.service.getIssues(
          this.orgSlug,
          this.cursor,
          this.query,
          this.project,
          this.start,
          this.end,
          this.sort,
          this.environment
        )
      );
    }
  }

  queryForIgnored() {
    this.router.navigate([], {
      queryParams: {
        query: "is:ignored",
        cursor: null,
      },
      queryParamsHandling: "merge",
    });
  }

  queryForUnresolved() {
    this.router.navigate([], {
      queryParams: {
        query: "is:unresolved",
        cursor: null,
      },
      queryParamsHandling: "merge",
    });
  }

  sortNewestFirst() {
    this.router.navigate([], {
      queryParams: {
        sort: "-created",
        cursor: null,
      },
      queryParamsHandling: "merge",
    });
  }

  sortOldestFirst() {
    this.router.navigate([], {
      queryParams: {
        sort: "created",
        cursor: null,
      },
      queryParamsHandling: "merge",
    });
  }
}
