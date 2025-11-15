'use client';

import React, { useEffect, useState } from "react";
import { type ChartConfig } from "@/components/ui/chart";
import BarChartComponent from "@/components/common/charts/barchart";
import { apiClient } from "@/lib/apiClient";
import { API_CONFIG } from "@/config/api";
import { Loader2, AlertCircle } from "lucide-react";

const VehicleStatus = () => {
  const [data, setData] = useState(chartData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchVehicleStats = async () => {
      try {
        setLoading(true);
        const stats = await apiClient(API_CONFIG.ENDPOINTS.FLEET_STATS.VEHICLES);
        if (!isMounted) return;
        const active = stats?.active_vehicles || stats?.vehicles_by_status?.ACTIVE || 0;
        const maintenance = stats?.maintenance_vehicles || stats?.vehicles_by_status?.MAINTENANCE || 0;
        const inactive = stats?.vehicles_by_status?.INACTIVE || 0;

        setData([
          {
            month: "Current",
            active,
            maintenance,
            inactive,
          },
        ]);
        setError(null);
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Failed to load vehicle stats:", err);
        setError(err?.message || "Unable to load vehicle stats.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchVehicleStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <h2>Vehicle status</h2>
      <div className="my-8">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading vehicle stats...
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {!loading && !error && <BarChartComponent data={data} config={chartConfig} />}
      </div>
    </div>
  );
};

export default VehicleStatus;

const chartData = [{ month: "Current", active: 0, maintenance: 0, inactive: 0 }];

const chartConfig = {
  active: {
    label: "Active",
    color: "var(--chart-1)",
  },
  maintenance: {
    label: "Maintenance",
    color: "var(--chart-2)",
  },
  inactive: {
    label: "Inactive",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;
