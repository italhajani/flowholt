import React from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";

const DashboardLayout: React.FC = () => {
  // We use `zoom` styling to achieve the precise 10% structural scaling 
  // without the box-model preservation bugs of CSS `transform: scale()`.
  const zoomStyle = { zoom: 0.9 } as React.CSSProperties;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-slate-900">
      <DashboardSidebar />
      <div 
        className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative"
        style={zoomStyle}
      >
        <main className="relative flex-1 w-full overflow-y-auto bg-background">
          <div className="min-h-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
