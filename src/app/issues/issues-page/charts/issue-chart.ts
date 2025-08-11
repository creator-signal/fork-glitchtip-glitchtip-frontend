import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  OnInit,
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
  // Input for actual data (can be undefined for mock data)
  data = input<ChartData[]>();

  // Loading state input (kept for backward compatibility)
  loading = input<boolean>(false);

  // Internal loading state signal for skeleton
  isLoading = signal(true);

  // Generate skeleton bars with random heights
  get skeletonBars(): { height: number }[] {
    const barCount = 24; // Default, could be dynamic based on your needs
    return Array.from({ length: barCount }, () => ({
      height: Math.random() * 60 + 20, // Random height between 20% and 80%
    }));
  }

  // Chart configuration
  view = input<[number, number]>([700, 300]);

  // Cache the generated mock data
  private _mockData: ChartData[] | null = null;

  // Simple color scheme - use string instead of object
  colorScheme = "cool";

  // Flag to disable tooltips if they cause issues
  tooltipDisabled = true; // Disabled to prevent the error

  // Custom tooltip state
  hoveredBar: ChartData | null = null;
  tooltipPosition = { x: 0, y: 0 };

  ngOnInit() {
    // If external loading prop is provided, use that
    if (this.loading()) {
      this.isLoading.set(true);
      return;
    }

    // If no real data provided, show skeleton for 5 seconds then show mock data
    if (!this.data()) {
      setTimeout(() => {
        this.isLoading.set(false);
      }, 5000); // 5 seconds
    } else {
      // If real data is provided, don't show skeleton
      this.isLoading.set(false);
    }
  }

  // Format tooltip text
  tooltipText(data: any): string {
    return `
      <div style="padding: 8px; background: rgba(0,0,0,0.9); border-radius: 4px; color: white;">
        <div style="font-size: 12px; color: #aaa;">Hour: ${data.name}</div>
        <div style="font-size: 14px; font-weight: bold;">Events: ${data.value}</div>
      </div>
    `;
  }

  // Handle bar click/hover events
  onSelect(event: any): void {
    console.log("Bar selected:", event);
    // You can use this for click events if needed
  }

  // Handle mouse events for custom tooltip
  onActivate(event: any): void {
    if (event && event.value !== undefined) {
      this.hoveredBar = event;
    }
  }

  onDeactivate(event: any): void {
    this.hoveredBar = null;
  }

  // Generate realistic mock data patterns
  private generateRealisticData(): ChartData[] {
    // If we already generated mock data, return it
    if (this._mockData) {
      return this._mockData;
    }

    // Different realistic patterns
    const patterns = [
      // High consistent activity - Like your first chart with steady bars
      () => this.generateHighActivityPattern(),

      // Medium steady activity - Consistent but lower volume
      () => this.generateSteadyPattern(),

      // Sparse activity with gaps - Like your third chart with lots of empty hours
      () => this.generateSparsePattern(),

      // High variation - Active but with different heights
      () => this.generateHighVariationPattern(),

      // Very low activity - Like your "New" issue with minimal events
      () => this.generateLowActivityPattern(),

      // Recent activity pattern - Activity concentrated in recent hours
      () => this.generateRecentActivityPattern(),
    ];

    const selectedPattern =
      patterns[Math.floor(Math.random() * patterns.length)];

    // Cache the generated data
    this._mockData = selectedPattern();
    return this._mockData;
  }

  private generateHighActivityPattern(): ChartData[] {
    return Array.from({ length: 24 }, (_, i) => ({
      name: i.toString().padStart(2, "0"),
      value: Math.floor(Math.random() * 3) + 1, // 1-3 events per hour, consistent
    }));
  }

  private generateSteadyPattern(): ChartData[] {
    return Array.from({ length: 24 }, (_, i) => ({
      name: i.toString().padStart(2, "0"),
      value: Math.random() < 0.8 ? Math.floor(Math.random() * 2) + 1 : 0, // Mostly 1-2, some gaps
    }));
  }

  private generateSparsePattern(): ChartData[] {
    return Array.from({ length: 24 }, (_, i) => ({
      name: i.toString().padStart(2, "0"),
      value: Math.random() < 0.4 ? Math.floor(Math.random() * 2) + 1 : 0, // 40% chance of activity
    }));
  }

  private generateHighVariationPattern(): ChartData[] {
    return Array.from({ length: 24 }, (_, i) => ({
      name: i.toString().padStart(2, "0"),
      value: Math.random() < 0.85 ? Math.floor(Math.random() * 4) + 1 : 0, // Higher variation, mostly active
    }));
  }

  private generateLowActivityPattern(): ChartData[] {
    return Array.from({ length: 24 }, (_, i) => ({
      name: i.toString().padStart(2, "0"),
      value: Math.random() < 0.15 ? 1 : 0, // Very sparse, mostly zeros with occasional 1
    }));
  }

  private generateRecentActivityPattern(): ChartData[] {
    return Array.from({ length: 24 }, (_, i) => {
      // More activity in recent hours (higher indices)
      const activityChance = i > 18 ? 0.7 : 0.1;
      return {
        name: i.toString().padStart(2, "0"),
        value:
          Math.random() < activityChance
            ? Math.floor(Math.random() * 2) + 1
            : 0,
      };
    });
  }

  // Get chart data
  get chartData(): ChartData[] {
    return this.data() || this.generateRealisticData();
  }

  // Check if we should show loading state (either external prop or internal state)
  get showLoading(): boolean {
    return this.loading() || this.isLoading();
  }

  // Generate custom colors based on data thresholds
  get customColors(): any[] {
    const data = this.chartData;
    if (data.length === 0) return [];

    // Find the maximum value to calculate thresholds
    const maxValue = Math.max(...data.map((d) => d.value));

    // Calculate thresholds (80% and 50% of max)
    const highThreshold = maxValue * 0.8;
    const mediumThreshold = maxValue * 0.5;

    return data.map((item) => ({
      name: item.name,
      value:
        item.value >= highThreshold
          ? "#d06868ff" // Red for high
          : item.value >= mediumThreshold
            ? "#908986ff" // Yellow for medium
            : "#908986ff", // Green for low/normal
    }));
  }
}
