import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  inject,
} from "@angular/core";
import { debounceTime, fromEvent, Subscription } from "rxjs";
import { ResponseTimeSeries } from "../uptime.interfaces";
import {
  Chart,
  Colors,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Legend
} from 'chart.js'
Chart.register(
  Colors,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend
);


@Component({
  selector: "gt-monitor-response-chart",
  templateUrl: "./monitor-response-chart.component.html",
  styleUrls: ["./monitor-response-chart.component.scss"],
})
export class MonitorResponseChartComponent
  implements AfterViewInit, OnInit, OnDestroy
{
  private changeDetector = inject(ChangeDetectorRef);

  @Input() data?: ResponseTimeSeries[] | null;
  @Input() scale?: {
    yScaleMin: number;
    yScaleMax: number;
    xScaleMin: Date;
  };

  @ViewChild("canvasRef") canvasRef?: ElementRef<HTMLCanvasElement>;
  //Ngx-charts does not do continuous resizing, but only adjusts after window resizing completes.
  //This is a workaround to force continous resizing
  @HostListener("window:resize")
  windowResize() {
    this.resizeChart();
  }

  delayedResize$?: Subscription;
  //Keeping these dimensions in state to avoid ngx-chart bleeding off edge of mat-card
  view: [number, number] = [0, 0];
  customColors = [
    { name: "Up", value: "#54a65a" },
    { name: "Down", value: "#e22a46" },
  ];
  ngOnInit(): void {
    this.delayedResize$ = fromEvent(window, "resize")
      .pipe(debounceTime(400))
      .subscribe(() => {
        this.resizeChart();
        this.changeDetector.detectChanges();
      });
  }

  ngAfterViewInit(): void {
    const data = [
    { year: 2010, count: 10 },
    { year: 2011, count: 20 },
    { year: 2012, count: 15 },
    { year: 2013, count: 25 },
    { year: 2014, count: 22 },
    { year: 2015, count: 30 },
    { year: 2016, count: 28 },
  ];

    if (this.canvasRef) {
      console.log("container ref")
      new Chart(this.canvasRef.nativeElement, {
        type: "bar",
        data: {
          labels: data.map((row) => row.year),
          datasets: [
            {
              label: "Acquisitions by year",
              data: data.map((row) => row.count),
            },
          ],
        },
      });
    }
  }

  resizeChart() {
    // if (this.containerRef) {
    //   this.view = [this.containerRef.nativeElement.offsetWidth, 250];
    // }
  }

  ngOnDestroy(): void {
    this.delayedResize$?.unsubscribe();
  }
}
