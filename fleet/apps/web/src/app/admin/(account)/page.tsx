'use client';

import React, { useEffect, useMemo, useState } from "react";
import DashboardCard from "@/components/common/dashboard-card";
import RecentInspections from "@/components/pages/admin/dashboard/recent-inspections";
import VehicleStatus from "@/components/pages/admin/dashboard/vehicle-status";
import { API_CONFIG } from "@/config/api";
import { apiClient } from "@/lib/apiClient";
import { AlertCircle, Loader2, Truck, Users, Shield, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient(API_CONFIG.ENDPOINTS.FLEET_STATS.DASHBOARD);
        if (!isMounted) return;
        setStats(response);
        setError(null);
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Failed to load dashboard stats:", err);
        setError(err?.message || "Unable to load dashboard data.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const cardItems = useMemo(() => {
    if (!stats) return [];
    return [
      {
        icon: Truck,
        title: "Total Vehicles",
        value: stats.total_vehicles ?? 0,
        description: `${stats.active_vehicles ?? 0} active today`,
        iconColor: "text-green-500",
      },
      {
        icon: Users,
        title: "Active Shifts",
        value: stats.active_shifts ?? 0,
        description: `${stats.completed_shifts_today ?? 0} completed today`,
        iconColor: "text-blue-500",
      },
      {
        icon: Shield,
        title: "Inspections",
        value: stats.inspections_today ?? 0,
        description: `${stats.failed_inspections_today ?? 0} failed`,
        iconColor: "text-purple-500",
      },
      {
        icon: AlertTriangle,
        title: "Open Issues",
        value: stats.open_issues ?? 0,
        description: `${stats.critical_issues ?? 0} critical`,
        iconColor: "text-yellow-500",
      },
    ];
  }, [stats]);

  return (
    <div className="flex flex-col gap-4 p-4 w-full">
      <h1>Dashboard</h1>
      <p>Welcome back here's an overview of your fleet.</p>
      {loading && (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading dashboard metrics...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cardItems.map((item) => (
          <DashboardCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            value={item.value}
            description={item.description}
            iconClass={`${item.iconColor} h-4 w-4`}
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <VehicleStatus />
        <RecentInspections />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent activities</h2>
          <div className="flex flex-col gap-2">
            <p>See admin dashboard for up-to-date activities.</p>
          </div>
        </div>
        <div>
          <h2 className="mb-4 mt-8 text-lg font-semibold">Alerts</h2>
          <div className="flex flex-col gap-2">
            <p>Alerts surface automatically when issues are detected.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
