import React from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

const DashboardLayout: React.FC = () => {
  // We use `zoom` styling to achieve the precise 10% structural scaling 
  // without the box-model preservation bugs of CSS `transform: scale()`.
  const zoomStyle = { zoom: 0.9 } as React.CSSProperties;

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans text-slate-900">
      <DashboardSidebar />
      <div 
        className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative"
        style={zoomStyle}
      >
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto w-full relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
