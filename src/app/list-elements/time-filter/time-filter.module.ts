import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatNativeDateModule } from "@angular/material/core";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { SharedModule } from "src/app/shared/shared.module";
import { TimeFilterComponent } from "./time-filter.component";


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatInputModule,
    MatNativeDateModule,
    MatMenuModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  declarations: [TimeFilterComponent],
  exports: [TimeFilterComponent],
})
export class TimeFilterModule {}
