import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { TopAppBar } from "src/app/shared/top-app-bar/top-app-bar";
import { MatButton } from "@angular/material/button";
import { ProjectMultiselect } from "../project-multiselect/project-multiselect";
import { ListTitleComponent } from "../list-title/list-title.component";
import { OrganizationsService } from "src/app/api/organizations.service";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "gt-list-app-bar",
  imports: [
    MatButton,
    MatIcon,
    ListTitleComponent,
    ProjectMultiselect,
    RouterLink,
    TopAppBar,
  ],
  templateUrl: "./list-app-bar.html",
  styleUrl: "./list-app-bar.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListAppBar {
  private organizationsService = inject(OrganizationsService);
  listTitle = input("");
  searchHits = input<string>();
  // Project-multiselect will not be shown if not provided
  queriedProjects = input<string[]>();
  // Determines whether or not to show "add project" button
  // instead of project-multiselect, for when org has no projects
  displayAddProject = input(false);

  activeOrgLoaded = this.organizationsService.activeOrganizationLoaded
  activeOrgHasNoProjects = computed(() =>
    this.organizationsService.activeOrganizationProjects().length === 0
  );
  activeOrgSlug = this.organizationsService.activeOrganizationSlug;
  accessProjectWrite = this.organizationsService.accessProjectWrite
}
