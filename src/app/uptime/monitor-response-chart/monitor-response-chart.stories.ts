import type { Meta, StoryObj } from "@storybook/angular";
import { MonitorResponseChart } from "./monitor-response-chart";
// FIX: Import the actual interface from your application to ensure type safety.
import { ResponseTimeSeries } from "../uptime.interfaces";

// --- MOCK DATA GENERATION ---

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
  // The type here will now be correctly inferred from the imported interface
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
const downValue = () => 5000; // A fixed high value for a "down" state

// This data is crafted to show multiple segments and edge cases.
const storyData: ResponseTimeSeries[] = [
  {
    name: "Up",
    series: generateSeries(0, 10, upValue), // 10 "Up" points (50 minutes)
  },
  {
    name: "Down",
    series: generateSeries(50, 5, downValue), // 5 "Down" points (25 minutes)
  },
  {
    name: "Up",
    series: generateSeries(75, 8, upValue), // 8 "Up" points (40 minutes)
  },
  {
    name: "Down",
    // The "single ping" edge case: one "Down" data point.
    series: generateSeries(115, 1, downValue),
  },
  {
    name: "Up",
    // The chart should immediately flow back into the "Up" state.
    series: generateSeries(120, 6, upValue), // 6 "Up" points (30 minutes)
  },
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
    scale: {
      control: "object",
      description: "Defines the min/max values for the chart axes.",
    },
  },
};

export default meta;
type Story = StoryObj<MonitorResponseChart>;

export const Default: Story = {
  args: {
    data: storyData,
    scale: {
      // Set the scale based on the mock data
      yScaleMin: 0,
      yScaleMax: 6000, // A bit higher than our "down" value of 5000
      // FIX: The type of `name` is now guaranteed to be a Date, resolving the error.
      xScaleMin: storyData[0].series[0].name, // Start the chart at the first data point
    },
  },
};
