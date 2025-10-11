import React from "react";
import { type ChartConfig } from "@/components/ui/chart";
import BarChartComponent from "@/components/common/charts/barchart";

const VehicleStatus = () => {
  return (
    <div>
      <h2>Vehicle status</h2>
      <div className="my-8">
        <BarChartComponent data={chartData} config={chartConfig} />
      </div>
    </div>
  );
};

export default VehicleStatus;

const chartData = [
  { month: "January", active: 186, inService: 80 },
  { month: "February", active: 305, inService: 200 },
  { month: "March", active: 237, inService: 120 },
  { month: "April", active: 73, inService: 190 },
  { month: "May", active: 209, inService: 130 },
  { month: "June", active: 214, inService: 140 },
];

const chartConfig = {
  active: {
    label: "Active",
    color: "var(--chart-1)",
  },
  inService: {
    label: "In Service",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;
