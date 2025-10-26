'use client';

import React from "react";
import SideBar from "@/components/common/sidebar";
import RequireSuperuser from "@/components/auth/RequireSuperuser";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <RequireSuperuser>
      <div className="flex h-full w-full max-h-screen overflow-hidden">
        <SideBar />
        <main className="w-full overflow-y-auto p-4">{children}</main>
      </div>
    </RequireSuperuser>
  );
};

export default AdminLayout;
