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
  TimeScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Tick,
  // Import components for the bar chart type
  BarController,
  BarElement,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { BaseChartDirective, provideCharts } from "ng2-charts";

import { ResponseTimeSeries } from "../uptime.interfaces";

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
  imports: [BaseChartDirective],
  template: `
    <div class="chart-container">
      <canvas
        baseChart
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
  providers: [
    provideCharts({
      registerables: [
        TimeScale,
        LinearScale,
        LineController,
        LineElement,
        PointElement,
        Filler,
        Tooltip,
        // Register the bar chart components
        BarController,
        BarElement,
      ],
    }),
  ],
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
      // The default type is 'line', but we override it per-dataset
      type: "line",
      data: this.chartData(),
      options: this.chartOptions() as any,
    });
  }

  private chartData = computed(() => {
    const chartData = this.data();
    if (!chartData) {
      return { datasets: [] };
    }
    return {
      datasets: chartData.map((series) => {
        const seriesData = series.series.map((point) => ({
          x: new Date(point.name).getTime(),
          y: point.value,
        }));

        const isSinglePoint = series.series.length === 1;

        // Common gradient logic for both chart types
        const backgroundColor = (
          context: ScriptableContext<"line" | "bar">,
        ) => {
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
          // FIX: Use rgba values based on the exact hex codes from the real app
          if (isUp) {
            gradient.addColorStop(0, "rgba(120, 184, 124, 0.9)"); // Top: #78b87c
            gradient.addColorStop(1, "rgba(206, 230, 207, 0.7)"); // Bottom: #cee6cf
          } else {
            gradient.addColorStop(0, "rgba(226, 42, 70, 0.9)"); // Dark Red
            gradient.addColorStop(1, "rgba(243, 180, 189, 0.7)"); // Light Red
          }
          return gradient;
        };

        // If the segment is a single point, render it as a bar
        if (isSinglePoint) {
          return {
            type: "bar" as const,
            label: String(series.name),
            data: seriesData,
            backgroundColor: backgroundColor,
            barThickness: 2,
          };
        }

        // Otherwise, render as a standard area chart
        return {
          type: "line" as const,
          label: String(series.name),
          data: seriesData,
          fill: "origin",
          borderWidth: 0,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.1,
          backgroundColor: backgroundColor,
        };
      }),
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
      clip: false,
      animation: {
        duration: 0,
      },
      interaction: {
        intersect: false,
        mode: "nearest" as const,
        axis: "x" as const,
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
          drawBorder: false,
          title: {
            display: true,
            text: "Response Time (ms)",
            font: {
              size: 14,
              weight: "bold" as const,
            },
          },
          ticks: {
            callback: function (
              value: string | number,
              index: number,
              ticks: Tick[],
            ) {
              // Hides the top-most label on the y-axis for a cleaner look.
              if (index === ticks.length - 1) {
                return null;
              }
              return value;
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
            // The context can now come from either a 'line' or 'bar' chart
            title: (context: TooltipItem<"line" | "bar">[]) => {
              const date = new Date(context[0].parsed.x);
              return date.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              });
            },
            label: (context: TooltipItem<"line" | "bar">) => {
              return `${context.dataset.label}: ${context.parsed.y}ms`;
            },
          },
        },
      },
    };
  });
}
