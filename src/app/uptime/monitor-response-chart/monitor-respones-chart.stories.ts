import type { Meta, StoryObj } from "@storybook/angular";
import { MonitorResponseChart } from "./monitor-response-chart";
import { ResponseTimeSeries } from "../uptime.interfaces";

/**
 * Helper function to generate a specific date for reproducible stories.
 * @param offsetMinutes The number of minutes to add to the base time.
 * @returns A new Date object.
 */
const generateDate = (offsetMinutes: number): Date => {
  // Use a fixed time so the story is the same every time it's viewed.
  const baseDate = new Date("2025-07-21T10:00:00.000Z");
  baseDate.setMinutes(baseDate.getMinutes() + offsetMinutes);
  return baseDate;
};

/**
 * Generates a sequence of data points for a chart segment.
 * @param startTimeOffset The starting minute offset for the series.
 * @param count The number of data points to generate.
 * @param valueFn A function that returns the value for each point.
 * @returns An array of data points conforming to the imported interface.
 */
const generateSeries = (
  startTimeOffset: number,
  count: number,
  valueFn: () => number,
) => {
  const series: { name: Date; value: number }[] = [];
  for (let i = 0; i < count; i++) {
    series.push({
      name: generateDate(startTimeOffset + i * 5), // Data points are 5 minutes apart
      value: valueFn(),
    });
  }
  return series;
};

// Functions to generate random but plausible response times.
const upValue = () => Math.floor(Math.random() * 150) + 50; // Random value between 50-200ms
const hardDownValue = () => 5000; // A fixed high value for a "hard down" state
const degradedValue = () => Math.floor(Math.random() * 1000) + 1500; // Random high value between 1500-2500ms
const stableValue = () => Math.floor(Math.random() * 50) + 70; // Very stable, low response time

// Data for the "Default" story with hard downtime.
const hardDownStoryData: ResponseTimeSeries[] = [
  { name: "Up", series: generateSeries(0, 10, upValue) },
  { name: "Down", series: generateSeries(50, 5, hardDownValue) },
  { name: "Up", series: generateSeries(75, 8, upValue) },
  { name: "Down", series: generateSeries(115, 1, hardDownValue) },
  { name: "Up", series: generateSeries(120, 6, upValue) },
];

// Data for the "DegradedPerformance" story.
const degradedStoryData: ResponseTimeSeries[] = [
  { name: "Up", series: generateSeries(0, 10, upValue) },
  { name: "Down", series: generateSeries(50, 5, degradedValue) },
  { name: "Up", series: generateSeries(75, 8, upValue) },
  { name: "Down", series: generateSeries(115, 1, degradedValue) },
  { name: "Up", series: generateSeries(120, 6, upValue) },
];

// Data for the new "StableUptime" story.
const stableUptimeStoryData: ResponseTimeSeries[] = [
  { name: "Up", series: generateSeries(0, 30, stableValue) },
];

// --- STORYBOOK CONFIGURATION ---

const meta: Meta<MonitorResponseChart> = {
  title: "Uptime/Monitor Response Chart",
  component: MonitorResponseChart,
  tags: ["autodocs"],
  argTypes: {
    data: {
      control: "object",
      description: 'The time-series data, split into "Up" and "Down" segments.',
    },
  },
};

export default meta;
type Story = StoryObj<MonitorResponseChart>;

export const HardDowntime: Story = {
  name: "Hard Downtime",
  args: {
    data: hardDownStoryData,
  },
};

export const DegradedPerformance: Story = {
  name: "Degraded Performance",
  args: {
    data: degradedStoryData,
  },
};

// NEW: Add a story for the 100% uptime, stable performance case.
export const StableUptime: Story = {
  name: "100% Uptime",
  args: {
    data: stableUptimeStoryData,
  },
};
