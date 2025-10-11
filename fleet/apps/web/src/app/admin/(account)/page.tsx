import React from "react";
import DashboardCard from "@/components/common/dashboard-card";
import RecentInspections from "@/components/pages/admin/dashboard/recent-inspections";
import VehicleStatus from "@/components/pages/admin/dashboard/vehicle-status";
import { dashboardCardItems } from "@/utils/constants";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-4 p-4 w-full">
      <h1>Dashboard</h1>
      <p>Welcome back here's an overview of your fleet.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardCardItems.map((item) => (
          <DashboardCard
            key={item.title}
            {...item}
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
            <p>No recent activities.</p>
          </div>
        </div>
        <div>
          <h2 className="mb-4 mt-8 text-lg font-semibold">Alerts</h2>
          <div className="flex flex-col gap-2">
            <p>No alerts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
