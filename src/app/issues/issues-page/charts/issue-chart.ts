import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  OnInit,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxChartsModule } from "@swimlane/ngx-charts";

interface ChartData {
  name: string;
  value: number;
}

@Component({
  selector: "gt-issue-chart",
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: "./issue-chart.html",
  styleUrl: "./issue-chart.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueChartComponent implements OnInit {
  issueStats = input<any>();
  loading = input<boolean>(false);
  timeRange = input<"24h" | "14d">("24h");

  view = input<[number, number]>([300, 40]);

  isLoading = signal(true);
  hoveredBar: any = null;

  @HostListener("mousemove", ["$event"])
  onMouseMove(event: MouseEvent) {
    if (this.hoveredBar) {
      document.documentElement.style.setProperty(
        "--tooltip-x",
        event.clientX + "px",
      );
      document.documentElement.style.setProperty(
        "--tooltip-y",
        event.clientY - 70 + "px",
      );
    }
  }

  get skeletonBars(): { height: number }[] {
    const barCount = this.timeRange() === "14d" ? 14 : 24;
    return Array.from({ length: barCount }, () => ({
      height: 0,
    }));
  }

  ngOnInit() {
    if (this.loading()) {
      this.isLoading.set(true);
      return;
    }
    this.isLoading.set(false);
  }

  onActivate(event: any): void {
    this.hoveredBar = event;
  }

  onDeactivate(event: any): void {
    this.hoveredBar = null;
  }

  // Updated to handle both time ranges
  private convertStatsToChartData(stats: any): ChartData[] {
    if (!stats) {
      return this.createEmptyData();
    }

    const timeRange = this.timeRange();

    if (timeRange === "14d") {
      return this.convert14DayStats(stats);
    } else {
      return this.convert24HourStats(stats);
    }
  }

  // Handle 24h data (renamed from original method)
  private convert24HourStats(stats: any): ChartData[] {
    if (!stats["24h"] || !Array.isArray(stats["24h"])) {
      return this.createEmpty24HourData();
    }

    // Initialize 24-hour array with zero counts
    const hourlyData: { [hour: number]: number } = {};
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = 0;
    }

    // Process each data point in the stats array
    stats["24h"].forEach((dataPoint: any) => {
      if (dataPoint && Array.isArray(dataPoint) && dataPoint.length >= 2) {
        const timestamp = dataPoint[0];
        const eventCount = dataPoint[1] || 0;
        const date = new Date(timestamp * 1000);
        const hour = date.getHours();
        hourlyData[hour] += eventCount;
      }
    });

    // Convert to ChartData format
    const result: ChartData[] = [];
    for (let hour = 0; hour < 24; hour++) {
      result.push({
        name: hour.toString().padStart(2, "0"),
        value: hourlyData[hour],
      });
    }

    return result;
  }

  // Handle 14d data (new method)
  private convert14DayStats(stats: any): ChartData[] {
    if (!stats["14d"] || !Array.isArray(stats["14d"])) {
      return this.createEmpty14DayData();
    }

    // Create a map to store daily data (similar to hourlyData for 24h)
    const dailyData: { [dateKey: string]: number } = {};

    // Initialize all 14 days with zero counts
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i)); // 13 days ago to today
      const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;
      dailyData[dateKey] = 0;
    }

    // Process each data point from the API
    stats["14d"].forEach((dataPoint: any) => {
      if (dataPoint && Array.isArray(dataPoint) && dataPoint.length >= 2) {
        const timestamp = dataPoint[0];
        const eventCount = dataPoint[1] || 0;
        const date = new Date(timestamp * 1000);
        const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;

        // Add events to the corresponding day (if it exists in our 14-day range)
        if (dailyData.hasOwnProperty(dateKey)) {
          dailyData[dateKey] += eventCount;
        }
      }
    });

    // Convert to ChartData format (ensuring correct order)
    const result: ChartData[] = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i)); // 13 days ago to today
      const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;

      result.push({
        name: dateKey,
        value: dailyData[dateKey],
      });
    }

    return result;
  }

  // Updated empty data methods
  private createEmpty24HourData(): ChartData[] {
    return Array.from({ length: 24 }, (_, hour) => ({
      name: hour.toString().padStart(2, "0"),
      value: 0,
    }));
  }

  private createEmpty14DayData(): ChartData[] {
    return Array.from({ length: 14 }, (_, day) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - day));
      return {
        name: `${date.getMonth() + 1}/${date.getDate()}`,
        value: 0,
      };
    });
  }

  private createEmptyData(): ChartData[] {
    return this.timeRange() === "14d"
      ? this.createEmpty14DayData()
      : this.createEmpty24HourData();
  }

  // Updated chartData getter
  get chartData(): ChartData[] {
    if (this.issueStats()) {
      return this.convertStatsToChartData(this.issueStats());
    }
    return this.createEmptyData();
  }

  // Updated showLoading to check both time ranges
  get showLoading(): boolean {
    // If explicitly loading, show skeleton
    if (this.loading()) {
      return true;
    }

    const stats = this.issueStats();

    // If we have no stats object at all, show skeleton
    if (!stats) {
      return true;
    }

    const timeRange = this.timeRange();
    const dataKey = timeRange === "14d" ? "14d" : "24h";

    // If the expected data property exists (even if empty array), hide skeleton
    // This means we got a response from the API, even if no events occurred
    if (stats.hasOwnProperty(dataKey) && Array.isArray(stats[dataKey])) {
      return false; // Hide skeleton - we have data structure, even if empty
    }

    // If we don't have the expected data structure, keep showing skeleton
    return true;
  }

  // Format hour for display in tooltip
  formatHour(hourString: string): string {
    if (!hourString) return "Unknown";

    const hour = parseInt(hourString, 10);
    if (isNaN(hour)) return "Invalid";

    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  }

  // Updated to handle both time ranges
  getActualTimestamp(): number | null {
    if (!this.hoveredBar) return null;

    const stats = this.issueStats();
    const timeRange = this.timeRange();
    const dataKey = timeRange === "14d" ? "14d" : "24h";

    if (!stats || !stats[dataKey] || !Array.isArray(stats[dataKey])) {
      return null;
    }

    const hoveredName = this.getTooltipHour();

    if (timeRange === "14d") {
      // For 14d, match by date string
      for (const dataPoint of stats["14d"]) {
        if (dataPoint && Array.isArray(dataPoint) && dataPoint.length >= 2) {
          const timestamp = dataPoint[0];
          const date = new Date(timestamp * 1000);
          const dateString = `${date.getMonth() + 1}/${date.getDate()}`;

          if (dateString === hoveredName) {
            return timestamp;
          }
        }
      }
    } else {
      // For 24h, match by hour
      const hour = parseInt(hoveredName, 10);
      for (const dataPoint of stats["24h"]) {
        if (dataPoint && Array.isArray(dataPoint) && dataPoint.length >= 2) {
          const timestamp = dataPoint[0];
          const date = new Date(timestamp * 1000);

          if (date.getHours() === hour) {
            return timestamp;
          }
        }
      }
    }

    return null;
  }

  formatEventDateTime(timestamp: number | null): string {
    if (!timestamp) {
      return this.timeRange() === "14d"
        ? "No events this day"
        : "No events this hour";
    }

    const date = new Date(timestamp * 1000);

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    };

    return date.toLocaleDateString("en-US", options);
  }

  getTooltipHour(): string {
    if (!this.hoveredBar) return "";
    const data = this.hoveredBar.value || this.hoveredBar;
    return data?.name || data?.label || "";
  }

  getTooltipEventCount(): number {
    if (!this.hoveredBar) return 0;
    const data = this.hoveredBar.value || this.hoveredBar;
    return data?.value || 0;
  }

  get customColors(): any[] {
    const data = this.chartData;
    if (data.length === 0) return [];

    const maxValue = Math.max(...data.map((d) => d.value));

    if (maxValue === 0) {
      return data.map((item) => ({
        name: item.name,
        value: "#e0e0e0ff",
      }));
    }

    const highThreshold = maxValue * 0.8;
    const mediumThreshold = maxValue * 0.5;

    return data.map((item) => ({
      name: item.name,
      value:
        item.value >= highThreshold
          ? "#d06868ff"
          : item.value >= mediumThreshold
            ? "#f4a261ff"
            : item.value > 0
              ? "#2a9d8fff"
              : "#e0e0e0ff",
    }));
  }
}
