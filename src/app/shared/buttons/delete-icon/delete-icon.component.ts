import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "gt-delete-icon",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: "./delete-icon.component.html",
})
export class DeleteIconComponent {
  @Input({ required: true }) label = "";
  @Input({ required: true }) confirmMessage = "";
  @Output() delete = new EventEmitter();

  confirmDelete() {
    if (window.confirm(this.confirmMessage)) {
      this.delete.emit();
    }
  }
}
