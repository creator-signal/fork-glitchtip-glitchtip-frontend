import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "gt-chart-tooltip",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./chart-tooltip.html",
  styleUrl: "./chart-tooltip.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartTooltipComponent {

  header = input<string>("");
  value = input<string>("");
  

  visible = input<boolean>(false);
  
  x = input<number>(0);
  y = input<number>(0);
  
  ngOnChanges() {
  console.log('Tooltip inputs:', {
    visible: this.visible(),
    x: this.x(),
    y: this.y(),
    header: this.header(),
    value: this.value()
  });
}
  shouldShow = computed(() => this.visible() && (this.header() || this.value()));
}