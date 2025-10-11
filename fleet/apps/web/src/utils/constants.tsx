import {
  ClipboardCheck,
  LayoutDashboard,
  Settings,
  TriangleAlert,
  Truck,
  UsersRound,
  Wrench,
} from "lucide-react";

const adminMenuItems = [
  {
    name: "Dashboard",
    path: "/admin",
    exact: true,
    icon: LayoutDashboard,
    iconProps: { className: "" },
  },
  {
    name: "Vehicles",
    path: "/admin/vehicles",
    exact: true,
    icon: Truck,
    iconProps: { className: "" },
  },
  {
    name: "Inspections",
    path: "/admin/inspections",
    exact: true,
    icon: ClipboardCheck,
    iconProps: { className: "" },
  },
  {
    name: "Tickets",
    path: "/admin/tickets",
    exact: true,
    icon: Wrench,
    iconProps: { className: "" },
  },
  {
    name: "Users",
    path: "/admin/users",
    exact: true,
    icon: UsersRound,
    iconProps: { className: "" },
  },
  {
    name: "Settings",
    path: "/admin/settings",
    exact: true,
    icon: Settings,
    iconProps: { className: "" },
  },
];

const dashboardCardItems = [
  {
    icon: Truck,
    title: "Total Vehicles",
    value: 10,
    description: "5 in service",
    iconColor: "text-green-500",
  },
  {
    icon: ClipboardCheck,
    title: "Active Shifts",
    value: 5,
    description: "3 drivers",
    iconColor: "text-blue-500",
  },
  {
    icon: TriangleAlert,
    title: "Pending Issues",
    value: 2,
    description: "1 critical",
    iconColor: "text-red-500",
  },
  {
    icon: Wrench,
    title: "Open Tickets",
    value: 8,
    description: "4 high priority",
    iconColor: "text-yellow-500",
  },
];
export { adminMenuItems, dashboardCardItems };
