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
  // Input for issue stats data - ONLY real data, no mock data
  issueStats = input<any>();

  // Loading state input
  loading = input<boolean>(false);

  // Internal loading state signal
  isLoading = signal(true);

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

  // Chart configuration
  view = input<[number, number]>([700, 300]);

  // Simple color scheme
  colorScheme = "cool";

  // Custom tooltip state
  hoveredBar: any = null;

  // Generate skeleton bars with random heights
  get skeletonBars(): { height: number }[] {
    const barCount = 24; // 24 hours
    return Array.from({ length: barCount }, () => ({
      height: 0, // Random height between 20% and 80%
    }));
  }

  // ngOnInit() {
  //   // If external loading prop is provided, use that
  //   if (this.loading()) {
  //     this.isLoading.set(true);
  //     return;
  //   }

  // }

  //   ngOnInit() {
  //   console.log('Issue stats received:', this.issueStats());
  //   console.log('Loading state:', this.loading());

  //   // If external loading prop is provided, use that
  //   if (this.loading()) {
  //     this.isLoading.set(true);
  //     return;
  //   }
  // }

  ngOnInit() {
    // If external loading prop is provided, use that
    if (this.loading()) {
      this.isLoading.set(true);
      return;
    }

    // If no real data provided, show skeleton for 5 seconds then show mock data

    setTimeout(() => {
      this.isLoading.set(false);
    }, 7000); // 5 seconds

    // If real data is provided, don't show skeleton
    this.isLoading.set(false);
  }

  // // Handle bar click/hover events
  // onSelect(event: any): void {
  //   console.log("Bar selected:", event);
  // }

  // Handle mouse events for custom tooltip
  onActivate(event: any): void {
    this.hoveredBar = event;
  }

  onDeactivate(event: any): void {
    this.hoveredBar = null;
  }

  // Convert issue stats to chart format - REAL DATA ONLY
  private convertStatsToChartData(stats: any): ChartData[] {
    if (!stats || !stats["24h"] || !Array.isArray(stats["24h"])) {
      return this.createEmptyHourData();
    }

    // Create 24-hour array (one for each hour 0-23)
    const hourlyData: ChartData[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const dataPoint = stats["24h"][hour];
      let eventCount = 0;

      if (dataPoint && Array.isArray(dataPoint) && dataPoint.length >= 2) {
        eventCount = dataPoint[1] || 0; // Second element is the event count
      }

      hourlyData.push({
        name: hour.toString().padStart(2, "0"), // "00", "01", "02", etc.
        value: eventCount,
      });
    }

    return hourlyData;
  }

  // Create empty data structure if no real data (24 hours with 0 events)
  private createEmptyHourData(): ChartData[] {
    return Array.from({ length: 24 }, (_, hour) => ({
      name: hour.toString().padStart(2, "0"),
      value: 0,
    }));
  }

  // Get chart data - ONLY REAL DATA
  get chartData(): ChartData[] {
    if (this.issueStats()) {
      return this.convertStatsToChartData(this.issueStats());
    }

    // Return empty data if no real data available
    return this.createEmptyHourData();
  }

  // Check if we should show loading state
  // get showLoading(): boolean {
  //   return this.loading() || this.isLoading();
  // }
  get showLoading(): boolean {
    // Show loading if explicitly told to load
    if (this.loading()) {
      return true;
    }

    // Show loading if we don't have valid stats data yet
    const stats = this.issueStats();
    const hasValidStats =
      stats &&
      stats["24h"] &&
      Array.isArray(stats["24h"]) &&
      stats["24h"].length > 0;

    return !hasValidStats;
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

  // Extract hour from the complex tooltip data structure
  getTooltipHour(): string {
    if (!this.hoveredBar) return "";

    // From debug: hoveredBar has structure like { "value": { "name": "04", "value": 2, "label": "04" } }
    const data = this.hoveredBar.value || this.hoveredBar;
    return data?.name || data?.label || "";
  }

  // Extract event count from the complex tooltip data structure
  getTooltipEventCount(): number {
    if (!this.hoveredBar) return 0;

    const data = this.hoveredBar.value || this.hoveredBar;
    return data?.value || 0;
  }

  // Generate custom colors based on data thresholds
  get customColors(): any[] {
    const data = this.chartData;
    if (data.length === 0) return [];

    // Find the maximum value to calculate thresholds
    const maxValue = Math.max(...data.map((d) => d.value));

    // Avoid division by zero
    if (maxValue === 0) {
      return data.map((item) => ({
        name: item.name,
        value: "#e0e0e0ff", // Gray for all zero values
      }));
    }

    // Calculate thresholds (80% and 50% of max)
    const highThreshold = maxValue * 0.8;
    const mediumThreshold = maxValue * 0.5;

    return data.map((item) => ({
      name: item.name,
      value:
        item.value >= highThreshold
          ? "#d06868ff" // Red for high
          : item.value >= mediumThreshold
            ? "#f4a261ff" // Orange for medium
            : item.value > 0
              ? "#2a9d8fff" // Teal for low but not zero
              : "#e0e0e0ff", // Gray for zero
    }));
  }
}
