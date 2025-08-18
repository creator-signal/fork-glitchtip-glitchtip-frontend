// import {
//   Component,
//   ChangeDetectionStrategy,
//   input,
//   signal,
//   OnInit,
//   HostListener,
// } from "@angular/core";
// import { CommonModule } from "@angular/common";
// import { NgxChartsModule } from "@swimlane/ngx-charts";

// interface ChartData {
//   name: string;
//   value: number;
// }

// @Component({
//   selector: "gt-issue-chart",
//   standalone: true,
//   imports: [CommonModule, NgxChartsModule],
//   templateUrl: "./issue-chart.html",
//   styleUrl: "./issue-chart.scss",
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class IssueChartComponent implements OnInit {
//   // Input for actual data (can be undefined for mock data)
//   data = input<ChartData[]>();

//   // Loading state input (kept for backward compatibility)
//   loading = input<boolean>(false);

//   // Internal loading state signal for skeleton
//   isLoading = signal(true);

//   @HostListener("mousemove", ["$event"])
//   onMouseMove(event: MouseEvent) {
//     if (this.hoveredBar) {
//       document.documentElement.style.setProperty(
//         "--tooltip-x",
//         event.clientX + "px",
//       );
//       document.documentElement.style.setProperty(
//         "--tooltip-y",
//         event.clientY - 70 + "px",
//       );
//     }
//   }

//   // Generate skeleton bars with random heights
//   get skeletonBars(): { height: number }[] {
//     const barCount = 24; // Default, could be dynamic based on your needs
//     return Array.from({ length: barCount }, () => ({
//       height: Math.random() * 60 + 20, // Random height between 20% and 80%
//     }));
//   }

//   // Chart configuration
//   view = input<[number, number]>([700, 300]);

//   // Cache the generated mock data
//   private _mockData: ChartData[] | null = null;

//   // Simple color scheme - use string instead of object
//   colorScheme = "cool";

//   // Flag to disable tooltips if they cause issues
//   tooltipDisabled = true; // Disabled to prevent the error

//   // Custom tooltip state
//   hoveredBar: ChartData | null = null;
//   tooltipPosition = { x: 0, y: 0 };

//   ngOnInit() {
//     // If external loading prop is provided, use that
//     if (this.loading()) {
//       this.isLoading.set(true);
//       return;
//     }

//     // If no real data provided, show skeleton for 5 seconds then show mock data
//     if (!this.data()) {
//       setTimeout(() => {
//         this.isLoading.set(false);
//       }, 5000); // 5 seconds
//     } else {
//       // If real data is provided, don't show skeleton
//       this.isLoading.set(false);
//     }
//   }

//   // Format tooltip text
//   // tooltipText(data: any): string {
//   //   return `
//   //     <div style="padding: 8px; background: rgba(0,0,0,0.9); border-radius: 4px; color: white;">
//   //       <div style="font-size: 12px; color: #aaa;">Hour: ${data.name}</div>
//   //       <div style="font-size: 14px; font-weight: bold;">Events: ${data.value}</div>
//   //     </div>
//   //   `;
//   // }

//   // Handle bar click/hover events
//   onSelect(event: any): void {
//     console.log("Bar selected:", event);
//     // You can use this for click events if needed
//   }

//   // Handle mouse events for custom tooltip
//   onActivate(event: any): void {
//     if (event && event.value !== undefined) {
//       this.hoveredBar = event;
//     }
//   }

//   onDeactivate(event: any): void {
//     this.hoveredBar = null;
//   }

//   // Generate realistic mock data patterns
//   private generateRealisticData(): ChartData[] {
//     // If we already generated mock data, return it
//     if (this._mockData) {
//       return this._mockData;
//     }

//     // Different realistic patterns
//     const patterns = [
//       // High consistent activity - Like your first chart with steady bars
//       () => this.generateHighActivityPattern(),

//       // Medium steady activity - Consistent but lower volume
//       () => this.generateSteadyPattern(),

//       // Sparse activity with gaps - Like your third chart with lots of empty hours
//       () => this.generateSparsePattern(),

//       // High variation - Active but with different heights
//       () => this.generateHighVariationPattern(),

//       // Very low activity - Like your "New" issue with minimal events
//       () => this.generateLowActivityPattern(),

//       // Recent activity pattern - Activity concentrated in recent hours
//       () => this.generateRecentActivityPattern(),
//     ];

//     const selectedPattern =
//       patterns[Math.floor(Math.random() * patterns.length)];

//     // Cache the generated data
//     this._mockData = selectedPattern();
//     return this._mockData;
//   }

//   private generateHighActivityPattern(): ChartData[] {
//     return Array.from({ length: 24 }, (_, i) => ({
//       name: i.toString().padStart(2, "0"),
//       value: Math.floor(Math.random() * 3) + 1, // 1-3 events per hour, consistent
//     }));
//   }

//   private generateSteadyPattern(): ChartData[] {
//     return Array.from({ length: 24 }, (_, i) => ({
//       name: i.toString().padStart(2, "0"),
//       value: Math.random() < 0.8 ? Math.floor(Math.random() * 2) + 1 : 0, // Mostly 1-2, some gaps
//     }));
//   }

//   private generateSparsePattern(): ChartData[] {
//     return Array.from({ length: 24 }, (_, i) => ({
//       name: i.toString().padStart(2, "0"),
//       value: Math.random() < 0.4 ? Math.floor(Math.random() * 2) + 1 : 0, // 40% chance of activity
//     }));
//   }

//   private generateHighVariationPattern(): ChartData[] {
//     return Array.from({ length: 24 }, (_, i) => ({
//       name: i.toString().padStart(2, "0"),
//       value: Math.random() < 0.85 ? Math.floor(Math.random() * 4) + 1 : 0, // Higher variation, mostly active
//     }));
//   }

//   private generateLowActivityPattern(): ChartData[] {
//     return Array.from({ length: 24 }, (_, i) => ({
//       name: i.toString().padStart(2, "0"),
//       value: Math.random() < 0.15 ? 1 : 0, // Very sparse, mostly zeros with occasional 1
//     }));
//   }

//   private generateRecentActivityPattern(): ChartData[] {
//     return Array.from({ length: 24 }, (_, i) => {
//       // More activity in recent hours (higher indices)
//       const activityChance = i > 18 ? 0.7 : 0.1;
//       return {
//         name: i.toString().padStart(2, "0"),
//         value:
//           Math.random() < activityChance
//             ? Math.floor(Math.random() * 2) + 1
//             : 0,
//       };
//     });
//   }

//   // Get chart data
//   get chartData(): ChartData[] {
//     return this.data() || this.generateRealisticData();
//   }

//   // Check if we should show loading state (either external prop or internal state)
//   get showLoading(): boolean {
//     return this.loading() || this.isLoading();
//   }

//   // Generate custom colors based on data thresholds
//   get customColors(): any[] {
//     const data = this.chartData;
//     if (data.length === 0) return [];

//     // Find the maximum value to calculate thresholds
//     const maxValue = Math.max(...data.map((d) => d.value));

//     // Calculate thresholds (80% and 50% of max)
//     const highThreshold = maxValue * 0.8;
//     const mediumThreshold = maxValue * 0.5;

//     return data.map((item) => ({
//       name: item.name,
//       value:
//         item.value >= highThreshold
//           ? "#d06868ff" // Red for high
//           : item.value >= mediumThreshold
//             ? "#908986ff" // Yellow for medium
//             : "#908986ff", // Green for low/normal
//     }));
//   }
// }

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

  ngOnInit() {
    // If external loading prop is provided, use that
    if (this.loading()) {
      this.isLoading.set(true);
      return;
    }

    // Always show skeleton for 5 seconds, then show real data
    setTimeout(() => {
      this.isLoading.set(false);
    }, 5000); // 5 seconds
  }

  // Handle bar click/hover events
  onSelect(event: any): void {
    console.log("Bar selected:", event);
  }

  // Handle mouse events for custom tooltip
  onActivate(event: any): void {
    console.log("Full activate event:", event);
    this.hoveredBar = event;
  }

  onDeactivate(event: any): void {
    this.hoveredBar = null;
  }

  // Convert issue stats to chart format - REAL DATA ONLY
  private convertStatsToChartData(stats: any): ChartData[] {
    console.log("Converting stats:", stats);

    if (!stats || !stats["24h"] || !Array.isArray(stats["24h"])) {
      console.log("No valid 24h stats data");
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

    console.log("Generated hourly data:", hourlyData);
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
  get showLoading(): boolean {
    return this.loading() || this.isLoading();
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
