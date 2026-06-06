import { I18nPluralPipe } from "@angular/common";
import {
  Component,
  OnInit,
  input,
  output,
  ChangeDetectionStrategy,
} from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { LessAnnoyingErrorStateMatcher } from "src/app/shared/less-annoying-error-state-matcher";
import { intRegex } from "src/app/shared/validators";
import { LoadingButtonComponent } from "../../../../../shared/loading-button/loading-button.component";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatCheckboxModule } from "@angular/material/checkbox";

export class NewAlertErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    return !!(control && control.invalid && form?.touched);
  }
}

export const selectionRequiredValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const errorAlert = control.get("errorAlert");
  const uptime = control.get("uptime");

  return errorAlert?.value || uptime?.value
    ? null
    : { selectionRequired: true };
};

@Component({
  selector: "gt-alert-form",
  templateUrl: "./alert-form.component.html",
  styleUrls: ["./alert-form.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    I18nPluralPipe,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    LoadingButtonComponent,
  ],
})
export class AlertFormComponent implements OnInit {
  readonly loading = input<boolean | null>(false);
  readonly timespan = input<number | null>(1);
  readonly quantity = input<number | null>(1);
  readonly uptime = input<boolean | null>(false);
  readonly uptimeQuantity = input<number | null>(1);
  readonly uptimeTimespanMinutes = input<number | null>(1);
  readonly errorAlert = input<boolean>(true);
  readonly alertSubmit = output<{
    timespanMinutes: number | null;
    quantity: number | null;
    uptime: boolean;
    uptimeQuantity: number | null;
    uptimeTimespanMinutes: number | null;
  }>();
  readonly newAlert = input<boolean | undefined>(false);

  timesI18nMapping = {
    "=1": $localize`time`,
    other: $localize`times`,
  };

  minutesI18nMapping = {
    "=1": $localize`minute`,
    other: $localize`minutes`,
  };

  intervalValidators = [
    Validators.min(0),
    Validators.pattern(intRegex),
    Validators.required,
  ];

  projectAlertForm = new FormGroup({
    optionsGroup: new FormGroup(
      {
        uptime: new FormControl(""),
        errorAlert: new FormControl(""),
      },
      selectionRequiredValidator,
    ),
    timespanMinutes: new FormControl(""),
    quantity: new FormControl(""),
    uptimeTimespanMinutes: new FormControl(""),
    uptimeQuantity: new FormControl(""),
  });

  projectFormTimespan = this.projectAlertForm.get(
    "timespanMinutes",
  ) as FormControl;
  projectFormQuantity = this.projectAlertForm.get("quantity") as FormControl;
  projectFormUptimeTimespan = this.projectAlertForm.get(
    "uptimeTimespanMinutes",
  ) as FormControl;
  projectFormUptimeQuantity = this.projectAlertForm.get(
    "uptimeQuantity",
  ) as FormControl;
  projectFormUptime = this.projectAlertForm.get(
    "optionsGroup.uptime",
  ) as FormControl;
  projectFormErrorAlert = this.projectAlertForm.get(
    "optionsGroup.errorAlert",
  ) as FormControl;
  projectFormOptionsGroup = this.projectAlertForm.get(
    "optionsGroup",
  ) as FormGroup;

  matcher = new LessAnnoyingErrorStateMatcher();
  newFormMatcher = new NewAlertErrorStateMatcher();

  constructor() {}

  ngOnInit(): void {
    const timespan = this.timespan();
    const quantity = this.quantity();
    // The uptime quantity/timespan inputs are required when the uptime trigger
    // is enabled. Default any missing value to 1 so an existing uptime alert
    // saved without a threshold (null) stays editable, instead of loading an
    // invalid, silently un-submittable form.
    const uptimeTimespan =
      this.uptimeTimespanMinutes() ?? (this.uptime() ? 1 : null);
    const uptimeQuantity = this.uptimeQuantity() ?? (this.uptime() ? 1 : null);
    this.projectAlertForm.setValue({
      timespanMinutes: timespan ? timespan.toString() : null,
      quantity: quantity ? quantity.toString() : null,
      uptimeTimespanMinutes: uptimeTimespan ? uptimeTimespan.toString() : null,
      uptimeQuantity: uptimeQuantity ? uptimeQuantity.toString() : null,
      optionsGroup: {
        uptime: this.uptime() as any,
        errorAlert: this.errorAlert() as any,
      },
    });

    if (this.errorAlert()) {
      this.initializeIntervalValidation();
    }
    if (this.uptime()) {
      this.initializeUptimeIntervalValidation();
    }
  }

  toggleErrorAlerts(): void {
    this.projectFormErrorAlert.setValue(!this.projectFormErrorAlert.value);

    if (!this.projectFormErrorAlert.value) {
      this.projectFormQuantity.clearValidators();
      this.projectFormQuantity.setValue("");
      this.projectFormTimespan.clearValidators();
      this.projectFormTimespan.setValue("");
    } else {
      this.initializeIntervalValidation();
      this.projectFormQuantity.setValue(1);
      this.projectFormTimespan.setValue(1);
    }

    this.projectAlertForm.updateValueAndValidity();
  }

  toggleFromInput(): void {
    if (!this.projectFormErrorAlert.value) {
      this.projectFormErrorAlert.setValue(true);
      this.initializeIntervalValidation();
      this.projectFormQuantity.setValue(1);
      this.projectFormTimespan.setValue(1);
      this.projectFormTimespan.updateValueAndValidity();
    }
  }

  toggleUptime(): void {
    this.projectFormUptime.setValue(!this.projectFormUptime.value);

    if (!this.projectFormUptime.value) {
      this.projectFormUptimeQuantity.clearValidators();
      this.projectFormUptimeQuantity.setValue("");
      this.projectFormUptimeTimespan.clearValidators();
      this.projectFormUptimeTimespan.setValue("");
    } else {
      this.initializeUptimeIntervalValidation();
      this.projectFormUptimeQuantity.setValue(1);
      this.projectFormUptimeTimespan.setValue(1);
    }

    this.projectAlertForm.updateValueAndValidity();
  }

  initializeIntervalValidation(): void {
    this.projectFormQuantity.setValidators(this.intervalValidators);
    this.projectFormTimespan.setValidators(this.intervalValidators);
  }

  initializeUptimeIntervalValidation(): void {
    this.projectFormUptimeQuantity.setValidators(this.intervalValidators);
    this.projectFormUptimeTimespan.setValidators(this.intervalValidators);
  }

  onSubmit(): void {
    if (this.projectAlertForm.valid) {
      this.alertSubmit.emit({
        timespanMinutes: this.projectFormErrorAlert.value
          ? this.projectFormTimespan.value
          : null,
        quantity: this.projectFormErrorAlert.value
          ? this.projectFormQuantity.value
          : null,
        uptime: this.projectFormUptime.value,
        uptimeTimespanMinutes: this.projectFormUptime.value
          ? this.projectFormUptimeTimespan.value
          : null,
        uptimeQuantity: this.projectFormUptime.value
          ? this.projectFormUptimeQuantity.value
          : null,
      });
    }
  }
}
