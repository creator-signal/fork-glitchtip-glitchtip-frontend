import { formatDate } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
} from "@angular/forms";
import { MatExpansionPanel } from "@angular/material/expansion";
import { MatMenuTrigger } from "@angular/material/menu";
import { ActivatedRoute, Router } from "@angular/router";
import { defer } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { LessAnnoyingErrorStateMatcher } from "src/app/shared/less-annoying-error-state-matcher";

const relativeTimeRegex = /now\-\d+(m|h|d)$/;

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

  formStartDateValue$ = defer(() => {
    return this.formStartDate.valueChanges.pipe(
      startWith(this.formStartDate.value),
      map((_) => {
        const dateConversion = new Date(this.formStartDate.value);
        return isNaN(dateConversion.getTime()) ? null : dateConversion;
      })
    );
  });

  formEndDateValue$ = this.formEndDate.valueChanges.pipe(
    map((_) => {
      const dateConversion = new Date(this.formEndDate.value);
      return isNaN(dateConversion.getTime()) ? null : dateConversion;
    })
  );

  queryParams$ = this.route.queryParams.pipe(
    map(() => {
      const start: string | undefined = this.route.snapshot.queryParams.start;
      const end: string | undefined = this.route.snapshot.queryParams.end;
      if (relativeTimeRegex.test(start!) && end === "now") {
        return `Last ${this.convertTimeUnits(start!)}`;
      } else if (start && end) {
        return `${this.convertToTitleDate(start)} to ${this.convertToTitleDate(
          end
        )}`;
      } else if (start) {
        return `From ${this.convertToTitleDate(start)}`;
      } else if (end) {
        return `To ${this.convertToTitleDate(end)}`;
      } else return null;
    })
  );

  matcher = new LessAnnoyingErrorStateMatcher();

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(() => {
      const start: string | undefined = this.route.snapshot.queryParams.start;
      const end: string | undefined = this.route.snapshot.queryParams.end;
      this.dateForm.setValue({
        startDate: start ? this.convertToInputDate(start) : null,
        endDate: end ? this.convertToInputDate(end) : null,
      });
    });
  }

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

  convertToZTime(date: Date) {
    return formatDate(date, "yyyy-MM-ddTHH:mm:ss.SSS", "en-US") + "Z";
  }

  convertToTitleDate(dateString: string) {
    if (dateString === "now") {
      return dateString;
    }
    if (relativeTimeRegex.test(dateString)) {
      return `${this.convertTimeUnits(dateString)} ago`;
    }
    const convertedDate = new Date(dateString.replace("Z", ""));
    if (!isNaN(convertedDate.getTime())) {
      return formatDate(convertedDate, "MM/dd/yyyy HH:mm:ss", "en-us")
        .replace(" 00:00:00", "")
        .replace(" 23:59:59", "");
    } else {
      return dateString;
    }
  }

  convertToInputDate(dateString: string) {
    if (dateString === "now" || relativeTimeRegex.test(dateString)) {
      return dateString;
    }
    const convertedDate = new Date(dateString.replace("Z", ""));
    if (!isNaN(convertedDate.getTime())) {
      return formatDate(convertedDate, "MM/dd/yyyy HH:mm:ss", "en-us");
    } else {
      return null;
    }
  }

  convertTimeUnits(relativeTime: string) {
    const number = relativeTime.match(/([0-9]+)/)![1];
    const unit = relativeTime.split(number)[1];
    const conversions: { [key: string]: string } = {
      m: "minutes",
      h: "hours",
      d: "days",
    };
    const text = `${number} ${conversions[unit]}`;
    return parseInt(number) === 1 ? text.slice(0, -1) : text;
  }

  onSubmit() {
    if (this.dateForm.valid) {
      var start = null;
      if (
        relativeTimeRegex.test(this.formStartDate.value) ||
        this.formStartDate.value === "now"
      ) {
        start = this.formStartDate.value;
      } else if (this.formStartDate.value) {
        start = this.convertToZTime(this.dateForm?.value.startDate);
      }

      var end = null;
      if (
        relativeTimeRegex.test(this.formEndDate.value) ||
        this.formEndDate.value === "now"
      ) {
        end = this.formEndDate.value;
      } else if (this.formEndDate.value) {
        end = this.convertToZTime(this.formEndDate.value);
      }

      this.expansionPanel?.close();

      this.router.navigate([], {
        queryParams: { start, end },
        queryParamsHandling: "merge",
      });
    }
  }

  dateFormClear() {
    this.formStartDate.setValue("");
    this.formEndDate.setValue("");
  }
}
