import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-purple-200/60 rounded-xl" />
          <div className="h-4 w-72 bg-purple-100/60 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-28 bg-purple-200/60 rounded-xl" />
          <div className="h-10 w-32 bg-purple-200/60 rounded-xl" />
        </div>
      </div>

      {/* 2. Stat Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-purple-100 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-100/70" />
              <div className="w-12 h-5 rounded-full bg-purple-50" />
            </div>
            <div className="space-y-1.5">
              <div className="h-6 w-20 bg-purple-200/70 rounded-md" />
              <div className="h-3.5 w-32 bg-purple-100/50 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Content Table / Grid Skeleton */}
      <div className="rounded-3xl bg-white border border-purple-100 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-purple-50 pb-4">
          <div className="h-6 w-36 bg-purple-200/60 rounded-lg" />
          <div className="h-9 w-48 bg-purple-100/60 rounded-xl" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-14 w-full bg-purple-50/50 rounded-xl border border-purple-100/40" />
          ))}
        </div>
      </div>
    </div>
  );
}
