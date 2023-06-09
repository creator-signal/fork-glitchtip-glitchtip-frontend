import {
  ResolveFn,
  ActivatedRouteSnapshot,
} from "@angular/router";
import { inject } from "@angular/core";
import { IssuesService } from "../issues.service";
import { lastValueFrom } from "rxjs";

export const IssuesResolver: ResolveFn<void> = (
  route: ActivatedRouteSnapshot,
) => {
  console.log("resolving");
  let orgSlug = route.paramMap.get("org-slug");
  if (orgSlug) {
    lastValueFrom(
      inject(IssuesService).getIssues(
        orgSlug,
        route.queryParamMap.get("cursor") || undefined,
        route.queryParamMap.get("query") || undefined,
        [],
        route.queryParamMap.get("start") || undefined,
        route.queryParamMap.get("end") || undefined,
        route.queryParamMap.get("sort") || undefined,
        route.queryParamMap.get("environment") || undefined
      )
    );
  }
};
