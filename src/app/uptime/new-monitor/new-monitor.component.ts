import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormGroup,
  UntypedFormControl,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { filter, lastValueFrom, map, take, tap } from "rxjs";
import { OrganizationsService } from "src/app/api/organizations/organizations.service";
import { UptimeService } from "../uptime.service";
import { SubscriptionsService } from "src/app/api/subscriptions/subscriptions.service";
import { LessAnnoyingErrorStateMatcher } from "src/app/shared/less-annoying-error-state-matcher";
import { numberValidator, urlRegex } from "src/app/shared/validators";
import { EventInfoComponent } from "src/app/shared/event-info/event-info.component";
import { MonitorType } from "../uptime.interfaces";
import { OrganizationProject } from "src/app/api/organizations/organizations.interface";

const defaultUrlValidators = [
  Validators.pattern(urlRegex),
  Validators.required,
  Validators.maxLength(2000),
];

function orgProjectValidator(
  validOptions: Array<OrganizationProject>
): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value === null || control.value === "") {
      return null;
    }
    if (validOptions.indexOf(control.value) !== -1) {
      return null;
    }
    return { invalidAutocompleteString: { value: control.value } };
  };
}

@Component({
  selector: "gt-new-monitor",
  templateUrl: "./new-monitor.component.html",
  styleUrls: ["./new-monitor.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewMonitorComponent implements OnInit {
  error$ = this.uptimeService.error$;
  orgProjects$ = this.organizationsService.activeOrganizationProjects$;
  loading$ = this.uptimeService.createLoading$;
  totalEventsAllowed$ = this.subscriptionsService.subscription$.pipe(
    map((subscription) =>
      subscription && subscription.plan?.product.metadata
        ? parseInt(subscription.plan?.product.metadata.events, 10)
        : null
    )
  );

  typeChoices: MonitorType[] = ["Ping", "GET", "POST", "Heartbeat"];

  newMonitorForm = new UntypedFormGroup({
    monitorType: new UntypedFormControl("Ping", [Validators.required]),
    name: new UntypedFormControl("", [
      Validators.required,
      Validators.maxLength(200),
    ]),
    url: new UntypedFormControl("https://", defaultUrlValidators),
    expectedStatus: new UntypedFormControl(200, [
      Validators.required,
      Validators.min(100),
      numberValidator,
    ]),
    interval: new UntypedFormControl("60", [
      Validators.required,
      Validators.min(60),
      Validators.max(86399),
    ]),
    project: new UntypedFormControl(null),
  });

  formName = this.newMonitorForm.get("name") as UntypedFormControl;
  formMonitorType = this.newMonitorForm.get(
    "monitorType"
  ) as UntypedFormControl;
  formUrl = this.newMonitorForm.get("url") as UntypedFormControl;
  formExpectedStatus = this.newMonitorForm.get(
    "expectedStatus"
  ) as UntypedFormControl;
  formInterval = this.newMonitorForm.get("interval") as UntypedFormControl;
  formProject = this.newMonitorForm.get("project") as UntypedFormControl;

  intervalPerMonth = 2592000 / this.formInterval.value;

  matcher = new LessAnnoyingErrorStateMatcher();

  constructor(
    private organizationsService: OrganizationsService,
    private subscriptionsService: SubscriptionsService,
    private uptimeService: UptimeService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.uptimeService.callSubscriptionDetails();
    this.orgProjects$
      .pipe(
        filter((orgProjects) => !!orgProjects),
        take(1)
      )
      .subscribe((orgProjects) => {
        if (orgProjects) {
          this.formProject.addValidators(orgProjectValidator(orgProjects));
          if (!orgProjects.length) {
            this.formProject.disable();
          }
        } 
      });
    // Handle typed input for projects
    this.formProject.valueChanges.subscribe((value) => {
      if (typeof value === "string" && value !== "") {
        lastValueFrom(
          this.orgProjects$.pipe(
            filter((orgProjects) => !!orgProjects),
            take(1),
            map((orgProjects) =>
              orgProjects?.find((project) => project.name === value)
            ),
            tap((result) => {
              if (result) {
                this.formProject.setValue(result);
              }
            })
          )
        );
      }
    });
    this.formInterval.valueChanges.subscribe((interval) => {
      this.intervalPerMonth = Math.floor(2592000 / interval);
    });
  }

  getProjectName(project: OrganizationProject) {
    return project ? project.name : "";
  }

  clearAssociatedProject() {
    this.formProject.setValue("");
  }

  updateRequiredFields() {
    if (this.formMonitorType.value === "Heartbeat") {
      this.formUrl.clearValidators();
      this.formUrl.setValue("");
    } else {
      this.formUrl.setValidators(defaultUrlValidators);
      if (this.formUrl.value === "") {
        this.formUrl.setValue("https://");
      }
    }
  }

  openEventInfoDialog() {
    this.dialog.open(EventInfoComponent, {
      maxWidth: "300px",
    });
  }

  onSubmit() {
    if (this.newMonitorForm.valid) {
      this.uptimeService.createMonitor({
        ...this.newMonitorForm.value,
        project: this.formProject.value ? this.formProject.value.id : null,
      });
    }
  }
}
