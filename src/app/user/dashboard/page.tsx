import React from "react";

import Sidebar from "@/components/dashboardSideBar";
import Dashboard from "@/components/dashboard";

const Page: React.FC = () => {
  return (
    <div className="app-theme-bg flex h-auto">
      <Sidebar activeItem="Dashboard" />
      <Dashboard />
    </div>
  );
};

export default Page;