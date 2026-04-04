import React from "react";

const StudioRouteLoader: React.FC = () => {
  return (
    <div className="h-screen w-full bg-[#edf3ff] p-5">
      <div className="h-full w-full rounded-[32px] border border-white/70 bg-white overflow-hidden">
        <div className="h-16 border-b border-slate-200/80 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-100 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3.5 w-36 rounded-md bg-slate-100 animate-pulse" />
              <div className="h-3 w-28 rounded-md bg-slate-100 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-24 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-10 w-28 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-[72px,300px,1fr,340px] h-[calc(100%-64px)]">
          <div className="border-r border-slate-200/80 p-3 space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>

          <div className="border-r border-slate-200/80 p-4 space-y-4">
            <div className="h-11 w-full rounded-xl bg-slate-100 animate-pulse" />
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-slate-200/80 p-4 space-y-3">
                <div className="h-4 w-28 rounded-md bg-slate-100 animate-pulse" />
                <div className="h-3.5 w-44 rounded-md bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.24)_1px,transparent_0)] bg-[size:20px_20px]">
            <div className="absolute inset-0 p-10">
              <div className="absolute top-16 left-20 h-28 w-64 rounded-3xl border border-slate-200/80 bg-white animate-pulse" />
              <div className="absolute top-52 left-72 h-28 w-72 rounded-3xl border border-slate-200/80 bg-white animate-pulse" />
              <div className="absolute top-96 left-44 h-28 w-64 rounded-3xl border border-slate-200/80 bg-white animate-pulse" />
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-10 w-44 rounded-2xl bg-white border border-slate-200/80 animate-pulse" />
            </div>
          </div>

          <div className="border-l border-slate-200/80 p-5 space-y-4">
            <div className="h-10 w-40 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-11 w-full rounded-full bg-slate-100 animate-pulse" />
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-3.5 w-28 rounded-md bg-slate-100 animate-pulse" />
                <div className="h-11 w-full rounded-xl bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioRouteLoader;
