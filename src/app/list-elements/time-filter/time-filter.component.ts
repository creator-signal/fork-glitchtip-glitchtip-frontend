import { Component, OnInit, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
} from "@angular/forms";
import { MatExpansionPanel } from "@angular/material/expansion";
import { MatMenuTrigger } from "@angular/material/menu";
import { map } from "rxjs/operators";
import { LessAnnoyingErrorStateMatcher } from "src/app/shared/less-annoying-error-state-matcher";

const relativeTimeRegex = /now(\+|\-)\d+(s|m|h|d)/;

function datetimeValidator(control: AbstractControl): ValidationErrors | null {
  if (
    relativeTimeRegex.test(control.value) ||
    control.value === "now" ||
    control.value === ""
  ) {
    return null;
  } else if (!isNaN(new Date(control.value).getTime())) {
    return null;
  }
  return { invalidDatetime: true };
}

@Component({
  selector: "gt-time-filter",
  templateUrl: "./time-filter.component.html",
  styleUrls: ["./time-filter.component.scss"],
})
export class TimeFilterComponent implements OnInit {
  @ViewChild("expansionPanel") expansionPanel?: MatExpansionPanel;
  @ViewChild("startMenuTrigger") startMenuTrigger?: MatMenuTrigger;
  @ViewChild("endMenuTrigger") endMenuTrigger?: MatMenuTrigger;
  dateForm = new FormGroup({
    startDate: new FormControl("", datetimeValidator),
    endDate: new FormControl("", datetimeValidator),
  });

  formStartDate = this.dateForm.get("startDate") as FormControl;
  formEndDate = this.dateForm.get("endDate") as FormControl;

  formStartDateValue$ = this.formStartDate.valueChanges.pipe(
    map((_) => {
      const dateConversion = new Date(this.formStartDate.value);
      return isNaN(dateConversion.getTime()) ? null : dateConversion;
    })
  );

  formEndDateValue$ = this.formEndDate.valueChanges.pipe(
    map((_) => {
      const dateConversion = new Date(this.formEndDate.value);
      return isNaN(dateConversion.getTime()) ? null : dateConversion;
    })
  );

  matcher = new LessAnnoyingErrorStateMatcher();

  constructor() {}

  ngOnInit(): void {}

  setFormFromShortcut(relativeTime: string) {
    this.formStartDate.setValue(relativeTime);
    this.formEndDate.setValue("now");
    this.onSubmit();
  }

  setDatefromCalendar(event: Date, startDate: boolean = false) {
    const baseDateString = `${
      event.getMonth() + 1
    }/${event.getDate()}/${event.getFullYear()}`;
    const timeString = startDate ? "00:00:00" : "23:59:59";
    if (startDate) {
      this.formStartDate.setValue(`${baseDateString} ${timeString}`);
      this.startMenuTrigger?.closeMenu();
    } else {
      this.formEndDate.setValue(`${baseDateString} ${timeString}`);
      this.endMenuTrigger?.closeMenu();
    }
  }

  onSubmit() {
    if (this.dateForm.valid) {
      this.expansionPanel?.close();
    }
  }

  dateFormClear() {
    this.formStartDate.setValue("");
    this.formEndDate.setValue("");
  }
}
