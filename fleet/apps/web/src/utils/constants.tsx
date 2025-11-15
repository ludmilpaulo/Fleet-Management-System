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

export { adminMenuItems };
