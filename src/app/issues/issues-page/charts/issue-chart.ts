import {
  Component,
  ChangeDetectionStrategy,
  input,
  HostListener,
  computed,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxChartsModule } from "@swimlane/ngx-charts";

interface ChartData {
  name: string;
  value: number;
}

interface IssueStats {
  "24h"?: [number, number][];
  "14d"?: [number, number][];
}

interface HoveredBarData {
  value: {
    name: string;
    value: number;
    label: string;
  };
  entries?: any[];
}

type TimeRange = "24h" | "14d";

@Component({
  selector: "gt-issue-chart",
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: "./issue-chart.html",
  styleUrl: "./issue-chart.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueChartComponent {
  @ViewChild("chartContainer", { static: false }) chartContainer!: ElementRef;

  issueStats = input<IssueStats>();
  loading = input<boolean>(false);
  timeRange = input<TimeRange>("24h");
  view = input<[number, number]>([300, 40]);

  hoveredBar: HoveredBarData | null = null;
  hoveredColumnIndex: number | null = null;

  private readonly TOOLTIP_Y_OFFSET = 70;
  private readonly HIGH_THRESHOLD_RATIO = 0.8;
  private readonly TIME_RANGE_COUNTS = { "14d": 14, "24h": 24 } as const;

  chartData = computed(() => this.convertStatsToChartData(this.issueStats()));

  showLoading = computed(() => {
    if (this.loading()) return true;

    const stats = this.issueStats();
    const dataKey = this.timeRange();
    return !stats?.[dataKey] || !Array.isArray(stats[dataKey]);
  });

  customColors = computed(() => {
    const data = this.chartData();
    if (data.length === 0) return [];

    const maxValue = Math.max(...data.map((d) => d.value));
    const highThreshold = maxValue * this.HIGH_THRESHOLD_RATIO;

    return data
      .filter((item) => item.value > 0)
      .map((item) => ({
        name: item.name,
        value:
          item.value >= highThreshold
            ? "var(--mat-sys-error)"
            : "var(--mat-sys-secondary)",
      }));
  });

  get chartDataValue() {
    return this.chartData();
  }
  get showLoadingValue() {
    return this.showLoading();
  }
  get customColorsValue() {
    return this.customColors();
  }
  get skeletonBarsValue() {
    return Array.from({ length: this.TIME_RANGE_COUNTS[this.timeRange()] });
  }

  @HostListener("mousemove", ["$event"])
  onMouseMove(event: MouseEvent): void {
    if (this.hoveredBar || this.hoveredColumnIndex !== null) {
      this.updateTooltipPosition(event.clientX, event.clientY);
    }
  }

  onChartMouseMove(event: MouseEvent): void {
    if (!this.chartContainer) return;

    const chartRect = this.chartContainer.nativeElement.getBoundingClientRect();
    const relativeX = event.clientX - chartRect.left;

    const chartWidth = this.view()[0];
    const columnCount = this.TIME_RANGE_COUNTS[this.timeRange()];
    const columnWidth = chartWidth / columnCount;
    const columnIndex = Math.floor(relativeX / columnWidth);

    if (
      columnIndex >= 0 &&
      columnIndex < columnCount &&
      columnIndex < this.chartData().length
    ) {
      this.hoveredColumnIndex = columnIndex;
      this.updateTooltipPosition(event.clientX, event.clientY);
    } else {
      this.hoveredColumnIndex = null;
    }
  }

  onChartMouseLeave(): void {
    this.hoveredColumnIndex = null;
  }

  onActivate(event: HoveredBarData): void {
    this.hoveredBar = event;
  }

  onDeactivate(event?: any): void {
    this.hoveredBar = null;
  }

  getTooltipHour(): string {
    if (this.hoveredBar) {
      const data = (this.hoveredBar as any).value || this.hoveredBar;
      return data?.name || data?.label || "";
    }

    if (this.hoveredColumnIndex !== null) {
      const chartData = this.chartData();
      return chartData[this.hoveredColumnIndex]?.name || "";
    }

    return "";
  }

  getTooltipEventCount(): number {
    if (this.hoveredBar) {
      const data = (this.hoveredBar as any).value || this.hoveredBar;
      return data?.value || 0;
    }

    if (this.hoveredColumnIndex !== null) {
      const chartData = this.chartData();
      return chartData[this.hoveredColumnIndex]?.value || 0;
    }

    return 0;
  }

  getActualTimestamp(): number | null {
    const hoveredName = this.getTooltipHour();
    if (!hoveredName) return null;

    const stats = this.issueStats();
    const timeRange = this.timeRange();

    if (!stats?.[timeRange] || timeRange === "14d") return null;

    const dataPoints = stats[timeRange];
    return this.findTimestampByHour(dataPoints, parseInt(hoveredName, 10));
  }

  formatEventDateTime(): string {
    const timeRange = this.timeRange();

    if (timeRange === "14d") {
      const hoveredName = this.getTooltipHour();
      if (!hoveredName) return "";

      const [month, day] = hoveredName.split("/").map(Number);
      const date = new Date();
      date.setMonth(month - 1, day);

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } else {
      const timestamp = this.getActualTimestamp();
      const date = timestamp
        ? new Date(timestamp * 1000)
        : this.createFallbackDate();

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
        timeZoneName: "short",
      });
    }
  }

  private updateTooltipPosition(x: number, y: number): void {
    const root = document.documentElement.style;
    root.setProperty("--tooltip-x", `${x}px`);
    root.setProperty("--tooltip-y", `${y - this.TOOLTIP_Y_OFFSET}px`);
  }

  private convertStatsToChartData(stats: IssueStats | undefined): ChartData[] {
    if (!stats) return this.createEmptyData();

    const timeRange = this.timeRange();
    const dataPoints = stats[timeRange];

    if (!dataPoints || !Array.isArray(dataPoints)) {
      return this.createEmptyData();
    }

    return timeRange === "14d"
      ? this.convert14DayStats(dataPoints)
      : this.convert24HourStats(dataPoints);
  }

  private convert24HourStats(dataPoints: [number, number][]): ChartData[] {
    const hourlyData = this.initializeHourlyData();

    dataPoints.forEach(([timestamp, eventCount]) => {
      if (timestamp && eventCount != null) {
        const hour = new Date(timestamp * 1000).getHours();
        hourlyData[hour] += eventCount;
      }
    });

    return Array.from({ length: 24 }, (_, hour) => ({
      name: hour.toString().padStart(2, "0"),
      value: hourlyData[hour],
    }));
  }

  private convert14DayStats(dataPoints: [number, number][]): ChartData[] {
    const dailyData = this.initializeDailyData();

    dataPoints.forEach(([timestamp, eventCount]) => {
      if (timestamp && eventCount != null) {
        const date = new Date(timestamp * 1000);
        const dateKey = this.getDateKey(date);

        if (dateKey in dailyData) {
          dailyData[dateKey] += eventCount;
        }
      }
    });

    return this.generateDailyChartData(dailyData);
  }

  private createEmptyData(): ChartData[] {
    const timeRange = this.timeRange();
    const count = this.TIME_RANGE_COUNTS[timeRange];

    return Array.from({ length: count }, (_, i) => ({
      name:
        timeRange === "14d"
          ? this.getDateKeyForDay(count - 1 - i)
          : i.toString().padStart(2, "0"),
      value: 0,
    }));
  }

  private initializeHourlyData(): Record<number, number> {
    return Object.fromEntries(Array.from({ length: 24 }, (_, i) => [i, 0]));
  }

  private initializeDailyData(): Record<string, number> {
    return Object.fromEntries(
      Array.from({ length: 14 }, (_, i) => [this.getDateKeyForDay(13 - i), 0]),
    );
  }

  private generateDailyChartData(
    dailyData: Record<string, number>,
  ): ChartData[] {
    return Array.from({ length: 14 }, (_, i) => {
      const dateKey = this.getDateKeyForDay(13 - i);
      return {
        name: dateKey,
        value: dailyData[dateKey],
      };
    });
  }

  private getDateKey(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  private getDateKeyForDay(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return this.getDateKey(date);
  }

  private createFallbackDate(): Date {
    const hoveredName = this.getTooltipHour();
    const date = new Date();

    if (hoveredName) {
      const hour = parseInt(hoveredName, 10);
      date.setHours(hour, 0, 0, 0);
    }

    return date;
  }

  private findTimestampByHour(
    dataPoints: [number, number][],
    targetHour: number,
  ): number | null {
    for (const [timestamp] of dataPoints) {
      if (timestamp) {
        const date = new Date(timestamp * 1000);
        if (date.getHours() === targetHour) {
          return timestamp;
        }
      }
    }
    return null;
  }
}
