import { adminMenuItems } from "@/utils/constants";
import Link from "next/link";
import React from "react";

const SideBar = () => {
  return (
    <aside className="h-full min-w-[250px] p-4 border-r bg-sidebar text-sidebar-foreground">
      <h3 className="mb-4 text-sm">FleetTrack</h3>
      <ul className="flex flex-col gap-4 py-4 text-accent-foreground">
        {adminMenuItems.map((item) => {
          return (
            <li
              key={item.name}
              className="text-sidebar-foreground font-medium hover:bg-accent hover:text-accent-foreground rounded-sm p-2 transition-colors duration-500"
            >
              <Link href={item.path} className="flex items-center gap-2">
                <item.icon {...item.iconProps} className="h-4 w-4" />
                <p>{item.name}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default SideBar;
