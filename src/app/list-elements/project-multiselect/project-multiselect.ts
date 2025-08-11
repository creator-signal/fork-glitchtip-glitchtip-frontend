import {
  Component,
  computed,
  ChangeDetectionStrategy,
  effect,
  inject,
  input,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormControl } from "@angular/forms";
import { MatBadge } from "@angular/material/badge";
import { MatSelectModule } from "@angular/material/select";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { OrganizationsService } from "src/app/api/organizations.service";

@Component({
  selector: "gt-project-multiselect",
  imports: [
    ReactiveFormsModule,
    MatBadge,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: "./project-multiselect.html",
  styleUrl: "./project-multiselect.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectMultiselect {
  private organizationsService = inject(OrganizationsService);
  private router = inject(Router);
  queriedProjects = input<string[]>([]);
  activeOrgProjects = this.organizationsService.activeOrganizationProjects;
  projectsForm = new FormControl<string[]>([]);
  projectSearchForm = new FormControl("");
  projectFormFieldChanges = toSignal(this.projectsForm.valueChanges);
  projectSearchChanges = toSignal(this.projectSearchForm.valueChanges);

  // All active org projects, with currently queried projects at beginning
  sortedProjects = computed(() => {
    let query = this.queriedProjects();
    let selectedProjects = this.activeOrgProjects().filter((project) =>
      query.includes(project.id),
    );
    let unselectedProjects = this.activeOrgProjects().filter(
      (project) => !selectedProjects.includes(project),
    );
    return selectedProjects.concat(unselectedProjects);
  });

  //  Projects filtered by name for multiselect search
  filteredProjects = computed(() => {
    this.projectSearchChanges();
    if (!this.sortedProjects()) {
      return;
    }
    let search = this.projectSearchForm.value;
    if (!search) {
      return this.sortedProjects();
    } else {
      search = search.toLowerCase();
    }
    return this.sortedProjects().filter(
      (project) => project.name.toLowerCase().indexOf(search) > -1,
    );
  });
  allFilteredProjectsSelected = computed(() => {
    this.projectSearchChanges();
    this.projectFormFieldChanges();
    return this.sortedProjects().every((project) =>
      this.projectsForm.value?.includes(project.id),
    );
  });
  someFilteredProjectsSelected = computed(() => {
    this.projectSearchChanges();
    this.projectFormFieldChanges();
    return (
      this.sortedProjects().some((project) =>
        this.projectsForm.value?.includes(project.id),
      ) && this.projectsForm.value?.length! < this.sortedProjects().length
    );
  });
  selectedProjectDisplay = computed(() => {
    this.queriedProjects();
    this.projectFormFieldChanges();
    if (this.projectsForm.value?.length) {
      const numProjectsSelected = this.projectsForm.value.length;
      if (
        numProjectsSelected > 1 &&
        numProjectsSelected === this.activeOrgProjects().length
      ) {
        return undefined;
      }
      const firstProjectName = this.activeOrgProjects().find(
        (project) => project.id === this.projectsForm.value![0],
      )?.name;
      const additionalProjects = numProjectsSelected - 1;
      return { firstProjectName, additionalProjects };
    }
    return undefined;
  });

  constructor() {
    effect(() => {
      this.projectsForm.setValue(this.queriedProjects());
    });
  }

  toggleSelectAll(selectAll: boolean) {
    let filteredProjects = this.filteredProjects();
    if (selectAll) {
      if (filteredProjects) {
        this.projectsForm.setValue(
          filteredProjects.map((project) => project.id),
        );
      }
    } else {
      this.projectsForm.setValue([]);
    }
  }

  onSubmit() {
    let projects = this.projectsForm.value;
    this.router.navigate([], {
      queryParams: { project: projects ? projects : null },
      queryParamsHandling: "merge",
    });
  }
}
