import {
  Component,
  computed,
  input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  effect,
  untracked,
} from "@angular/core";
import {
  Chart,
  ScriptableContext,
  TooltipItem,
  // FIX: Import necessary components for a time-series line chart
  TimeScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";

import { ResponseTimeSeries } from "../uptime.interfaces";

// FIX: Register all the components you intend to use with Chart.js
Chart.register(
  TimeScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
);

/**
 * Helper function to round a date down to the nearest 5-minute interval.
 * @param date The date to round.
 * @returns A new Date object with the time rounded down.
 */
function roundDownToNearest5Minutes(date: Date): Date {
  const newDate = new Date(date);
  const minutes = newDate.getMinutes();
  newDate.setMinutes(minutes - (minutes % 5));
  newDate.setSeconds(0);
  newDate.setMilliseconds(0);
  return newDate;
}

@Component({
  selector: "gt-monitor-response-chart",
  imports: [],
  standalone: true,
  template: `
    <div class="chart-container">
      <canvas
        #chartCanvas
        aria-label="A line chart showing monitor response times over the selected period."
        role="img"
      ></canvas>
    </div>
  `,
  styles: `
    .chart-container {
      position: relative;
      height: 250px;
      width: 100%;
    }
  `,
})
export class MonitorResponseChart implements AfterViewInit, OnDestroy {
  @ViewChild("chartCanvas") chartCanvas?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  data = input<ResponseTimeSeries[] | undefined | null>();
  scale = input<
    { yScaleMin: number; yScaleMax: number; xScaleMin: Date } | undefined
  >();

  constructor() {
    effect(() => {
      const data = this.chartData();
      const options = this.chartOptions();

      untracked(() => {
        if (this.chart) {
          this.chart.data = data;
          // Type assertion to satisfy the strict options type
          this.chart.options = options as any;
          this.chart.update();
        }
      });
    });
  }

  ngAfterViewInit(): void {
    if (this.chartCanvas) {
      this.createChart(this.chartCanvas.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private createChart(canvas: HTMLCanvasElement): void {
    this.chart = new Chart(canvas, {
      type: "line",
      data: this.chartData(),
      options: this.chartOptions(),
    });
  }

  private chartData = computed(() => {
    const chartData = this.data();
    if (!chartData) {
      return { datasets: [] };
    }
    return {
      datasets: chartData.map((series) => ({
        label: String(series.name),
        data: series.series.map((point) => ({
          x: new Date(point.name).getTime(),
          y: point.value,
        })),
        fill: "origin",
        borderWidth: 0,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.1,
        backgroundColor: (context: ScriptableContext<"line">) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return "rgba(0,0,0,0)";
          }
          const isUp = context.dataset.label === "Up";
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );
          if (isUp) {
            gradient.addColorStop(0, "#7aba7e");
            gradient.addColorStop(0.5, "#96c99a");
            gradient.addColorStop(1, "#b9dbbc");
          } else {
            gradient.addColorStop(0, "#e22a46");
            gradient.addColorStop(0.5, "#ea6f81");
            gradient.addColorStop(1, "#f3b4bd");
          }
          return gradient;
        },
      })),
    };
  });

  private chartOptions = computed(() => {
    const scale = this.scale();
    const roundedXMin = scale?.xScaleMin
      ? roundDownToNearest5Minutes(scale.xScaleMin).getTime()
      : undefined;

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      interaction: {
        intersect: false,
        mode: "index" as const,
      },
      elements: {
        line: {
          tension: 0.4,
        },
      },
      scales: {
        x: {
          type: "time" as const,
          time: {
            unit: "minute" as const,
            tooltipFormat: "PPpp",
            displayFormats: {
              minute: "h:mm a",
            },
          },
          min: roundedXMin,
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 7,
          },
          grid: {
            display: false,
          },
        },
        y: {
          min: Math.max(scale?.yScaleMin ?? 0, 0),
          max: scale?.yScaleMax,
          title: {
            display: true,
            text: "Response Time (ms)",
            font: {
              size: 14,
              weight: "bold" as const,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: (context: TooltipItem<"line">[]) => {
              const date = new Date(context[0].parsed.x);
              return date.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              });
            },
            label: (context: TooltipItem<"line">) => {
              return `${context.dataset.label}: ${context.parsed.y}ms`;
            },
          },
        },
      },
    };
  });
}
