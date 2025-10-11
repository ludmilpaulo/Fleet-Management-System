import React from "react";
import SideBar from "@/components/common/sidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full w-full max-h-screen overflow-hidden">
      <SideBar />
      <main className="w-full overflow-y-auto p-4">{children}</main>
    </div>
  );
};

export default AdminLayout;
