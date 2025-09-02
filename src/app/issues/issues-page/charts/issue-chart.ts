import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { NgxChartsModule } from "@swimlane/ngx-charts";

interface IssueStats {
  "24h"?: [number, number][];
  "14d"?: [number, number][];
}

type TimeRange = "24h" | "14d";

@Component({
  selector: "gt-issue-chart",
  standalone: true,
  imports: [CommonModule, NgxChartsModule, DatePipe],
  templateUrl: "./issue-chart.html",
  styleUrl: "./issue-chart.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueChartComponent {
  issueStats = input<IssueStats>();
  loading = input<boolean>(false);
  timeRange = input<TimeRange>("24h");
  view = input<[number, number]>([300, 40]);

  private readonly HIGH_THRESHOLD_RATIO = 0.8;
  private readonly TIME_RANGE_COUNTS = { "24h": 24, "14d": 14 } as const;

  chartData = computed(() => {
    const range = this.timeRange();
    const count = this.TIME_RANGE_COUNTS[range];
    const stats = this.issueStats()?.[range] ?? [];

    const eventMap = new Map<number, number>(
      stats.map(([ts, val]) => [ts, val]),
    );

    // Generate full chart data
    return Array.from({ length: count }, (_, i) => {
      const timestampSec =
        range === "14d"
          ? this.getUTCMidnightTimestampSec(i - count + 1)
          : this.getUTCHourTimestampSec(i);

      const value = eventMap.get(timestampSec) ?? 0;
      const timestampMs = timestampSec * 1000;

      return {
        name: timestampMs.toString(),
        value,
        timestamp: timestampMs,
      };
    });
  });

  showLoading = computed(() => {
    if (this.loading()) return true;
    const stats = this.issueStats();
    const range = this.timeRange();
    return !stats?.[range] || !Array.isArray(stats[range]);
  });

  customColors = computed(() => {
    const data = this.chartData();
    const max = Math.max(...data.map((d) => d.value), 0);
    const threshold = max * this.HIGH_THRESHOLD_RATIO;

    return data
      .filter((d) => d.value > 0)
      .map((d) => ({
        name: d.name,
        value:
          d.value >= threshold
            ? "var(--mat-sys-error)"
            : "var(--mat-sys-secondary)",
      }));
  });

  skeletonBarsValue = computed(() =>
    Array.from({ length: this.TIME_RANGE_COUNTS[this.timeRange()] }),
  );

  private getUTCMidnightTimestampSec(daysAgo: number): number {
    const now = new Date();
    const utc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysAgo,
      0,
      0,
      0,
    );
    return Math.floor(utc / 1000);
  }

  private getUTCHourTimestampSec(hour: number): number {
    const now = new Date();
    const utc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hour,
      0,
      0,
    );
    return Math.floor(utc / 1000);
  }
}
