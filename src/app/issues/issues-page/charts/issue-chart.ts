import {
  Component,
  ChangeDetectionStrategy,
  input,
  HostListener,
  computed,
  ElementRef,
  ViewChild,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { ChartTooltipComponent } from "src/app/shared/chart-tooltip/chart-tooltip";

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
  imports: [CommonModule, NgxChartsModule, ChartTooltipComponent],
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

  // Reactive state using signals
  private hoveredBarSignal = signal<HoveredBarData | null>(null);
  private hoveredColumnIndexSignal = signal<number | null>(null);
  private tooltipPosition = signal({ x: 0, y: 0 });

  private readonly TOOLTIP_Y_OFFSET = 70;
  private readonly HIGH_THRESHOLD_RATIO = 0.8;
  private readonly TIME_RANGE_COUNTS = { "14d": 14, "24h": 24 } as const;

  // Computed properties
  chartData = computed(() => this.convertStatsToChartData(this.issueStats()));
  
  tooltipVisible = computed(() => 
    this.hoveredBarSignal() !== null || this.hoveredColumnIndexSignal() !== null
  );
  
  tooltipHeader = computed(() => this.formatEventDateTime());
  
  tooltipValue = computed(() => `${this.getTooltipEventCount()} events`);
  
  tooltipX = computed(() => this.tooltipPosition().x);
  tooltipY = computed(() => this.tooltipPosition().y);

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

  // Getters for template
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
    this.updateTooltipPosition(event.clientX, event.clientY);
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
      this.hoveredColumnIndexSignal.set(columnIndex);
      this.updateTooltipPosition(event.clientX, event.clientY);
    } else {
      this.hoveredColumnIndexSignal.set(null);
    }
  }

  onChartMouseLeave(): void {
    this.hoveredColumnIndexSignal.set(null);
    this.hoveredBarSignal.set(null);
  }

  onActivate(event: any): void {
    if (!event) return;
    
    // Handle different event formats from ngx-charts
    let wrappedData: HoveredBarData;
    
    // Check if it's already in the expected format
    if (event.value && typeof event.value === 'object') {
      wrappedData = event as HoveredBarData;
    }
    // If event has name and value properties directly
    else if ('name' in event && 'value' in event) {
      wrappedData = {
        value: {
          name: event.name,
          value: event.value,
          label: event.name
        }
      };
    } else {
      return; // Unknown format, ignore
    }
    
    this.hoveredBarSignal.set(wrappedData);
  }

  onDeactivate(event?: any): void {
    this.hoveredBarSignal.set(null);
  }

  private getTooltipHour(): string {
    const hoveredBar = this.hoveredBarSignal();
    const hoveredColumnIndex = this.hoveredColumnIndexSignal();
    
    if (hoveredBar) {
      return hoveredBar.value?.name || hoveredBar.value?.label || "";
    }

    if (hoveredColumnIndex !== null) {
      const chartData = this.chartData();
      return chartData[hoveredColumnIndex]?.name || "";
    }

    return "";
  }

  private getTooltipEventCount(): number {
    const hoveredBar = this.hoveredBarSignal();
    const hoveredColumnIndex = this.hoveredColumnIndexSignal();
    
    if (hoveredBar) {
      return hoveredBar.value?.value || 0;
    }

    if (hoveredColumnIndex !== null) {
      const chartData = this.chartData();
      return chartData[hoveredColumnIndex]?.value || 0;
    }

    return 0;
  }

  private getActualTimestamp(): number | null {
    const hoveredName = this.getTooltipHour();
    if (!hoveredName) return null;

    const stats = this.issueStats();
    const timeRange = this.timeRange();

    if (!stats?.[timeRange] || timeRange === "14d") return null;

    const dataPoints = stats[timeRange];
    return this.findTimestampByHour(dataPoints, parseInt(hoveredName, 10));
  }

  private formatEventDateTime(): string {
    const timeRange = this.timeRange();

    if (timeRange === "14d") {
      const hoveredName = this.getTooltipHour();
      if (!hoveredName) return "";

      const [month, day] = hoveredName.split("/").map(Number);
      if (isNaN(month) || isNaN(day)) return "";
      
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
    this.tooltipPosition.set({ 
      x, 
      y: y - this.TOOLTIP_Y_OFFSET 
    });
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
      if (!isNaN(hour)) {
        date.setHours(hour, 0, 0, 0);
      }
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