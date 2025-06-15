import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { ListTitleComponent } from "src/app/list-elements/list-title/list-title.component";

@Component({
  selector: "gt-top-app-bar",
  standalone: true,
  imports: [CommonModule, MatDividerModule, ListTitleComponent],
  templateUrl: "./top-app-bar.component.html",
  styleUrls: ["./top-app-bar.component.scss"],
})
export class TopAppBarComponent {
  @Input() alignment: "start" | "end" = "end";
  @Input() title?: string;
  @Input() searchHits?: string;
  @Input() isSubPage: boolean = false;
}
