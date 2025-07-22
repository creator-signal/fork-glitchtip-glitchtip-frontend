import { Component, computed, input } from "@angular/core";
import {
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
  BarController,
  BarElement,
  Plugin,
  ChartOptions,
  Scale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { BaseChartDirective, provideCharts } from "ng2-charts";

import { ResponseTimeSeries } from "../uptime.interfaces";

// A robust, type-safe way to manage state for our custom plugin.
// This Map will store the hover state for each chart instance, keyed by the chart's id.
const hoverState = new Map<string, { x: number; draw: boolean }>();

// This is our custom plugin to draw the vertical hover line.
const lineHoverPlugin: Plugin = {
  id: "lineHover",
  afterInit: (chart) => {
    hoverState.set(chart.id, { x: 0, draw: false });
  },
  afterDestroy: (chart) => {
    hoverState.delete(chart.id);
  },
  afterEvent: (chart, args) => {
    const { event } = args;
    const state = hoverState.get(chart.id);

    if (state) {
      state.x = event.x ?? 0;
      state.draw = args.inChartArea;
    }
    chart.draw();
  },
  beforeDatasetsDraw: (chart) => {
    const { ctx } = chart;
    const { top, bottom } = chart.chartArea;
    const state = hoverState.get(chart.id);

    if (!state?.draw || typeof state.x !== "number") {
      return;
    }

    // Draw the vertical line
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(156, 163, 175, 0.7)"; // A visible gray color
    ctx.moveTo(state.x, bottom);
    ctx.lineTo(state.x, top);
    ctx.stroke();
    ctx.restore();
  },
};

/**
 * Helper function to round a date down to the nearest 5-minute interval.
 */
function roundDownToNearest5Minutes(date: Date): Date {
  const newDate = new Date(date);
  const minutes = newDate.getMinutes();
  newDate.setMinutes(minutes - (minutes % 5));
  newDate.setSeconds(0);
  newDate.setMilliseconds(0);
  return newDate;
}

/**
 * Helper function to round a date up to the nearest 5-minute interval.
 */
function roundUpToNearest5Minutes(date: Date): Date {
  const newDate = new Date(date);
  const minutes = newDate.getMinutes();
  const remainder = minutes % 5;
  if (remainder !== 0) {
    newDate.setMinutes(minutes + (5 - remainder));
  }
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
        [data]="chartData()"
        [options]="chartOptions()"
        [plugins]="plugins"
        [type]="'line'"
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
        BarController,
        BarElement,
      ],
    }),
  ],
})
export class MonitorResponseChart {
  // Pass our custom plugin to the chart
  public plugins: Plugin[] = [lineHoverPlugin];

  data = input<ResponseTimeSeries[] | undefined | null>();
  scale = input<
    { yScaleMin: number; yScaleMax: number; xScaleMin: Date } | undefined
  >();

  chartData = computed(() => {
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
          if (isUp) {
            gradient.addColorStop(0, "rgba(34, 197, 94, 0.85)");
            gradient.addColorStop(1, "rgba(74, 222, 128, 0.65)");
          } else {
            gradient.addColorStop(0, "rgba(239, 68, 68, 0.85)");
            gradient.addColorStop(1, "rgba(248, 113, 113, 0.65)");
          }
          return gradient;
        };

        if (isSinglePoint) {
          return {
            type: "bar" as const,
            label: String(series.name),
            data: seriesData,
            backgroundColor: backgroundColor,
            barThickness: 2,
          };
        }

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

  chartOptions = computed((): ChartOptions => {
    const scale = this.scale();
    const chartData = this.data();

    let calculatedMin: number | undefined;
    let calculatedMax: number | undefined;

    if (chartData && chartData.length > 0) {
      const allPoints = chartData.flatMap((series) => series.series);
      if (allPoints.length > 0) {
        const minTime = Math.min(
          ...allPoints.map((p) => new Date(p.name).getTime()),
        );
        const maxTime = Math.max(
          ...allPoints.map((p) => new Date(p.name).getTime()),
        );

        calculatedMin = roundDownToNearest5Minutes(new Date(minTime)).getTime();
        calculatedMax = roundUpToNearest5Minutes(new Date(maxTime)).getTime();
      }
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      clip: false as const,
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
          min: calculatedMin,
          max: calculatedMax,
          ticks: {
            maxRotation: 0,
            callback: function (this: Scale, tickValue: string | number) {
              const date = new Date(tickValue);
              // Only show labels for ticks that are a multiple of 5 minutes
              if (date.getMinutes() % 5 === 0) {
                // FIX: Manually format the time to be concise, like "8:45 PM"
                return date.toLocaleTimeString(navigator.language, {
                  hour: "numeric",
                  minute: "2-digit",
                });
              }
              // Return null for all other ticks to hide them
              return null;
            },
          },
          grid: {
            display: true,
            color: "rgba(200, 200, 200, 0.2)",
          },
        },
        y: {
          min: Math.max(scale?.yScaleMin ?? 0, 0),
          max: scale?.yScaleMax,
          border: {
            display: false,
          },
          title: {
            display: true,
            text: "Response Time (ms)",
            font: {
              size: 14,
              weight: "bold" as const,
            },
          },
          grid: {
            color: "rgba(200, 200, 200, 0.2)",
          },
          ticks: {
            callback: function (
              value: string | number,
              index: number,
              ticks: Tick[],
            ) {
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
