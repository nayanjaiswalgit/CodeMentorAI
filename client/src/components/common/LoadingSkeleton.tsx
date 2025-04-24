import React from "react";

export default function LoadingSkeleton({ count = 6, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse p-6 bg-neutral-200 rounded-lg">
          <div className="w-12 h-12 bg-neutral-300 rounded-full mb-4"></div>
          <div className="h-6 bg-neutral-300 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-neutral-300 rounded mb-1 w-full"></div>
          <div className="h-4 bg-neutral-300 rounded mb-4 w-2/3"></div>
          <div className="h-8 bg-neutral-300 rounded w-1/3 ml-auto"></div>
        </div>
      ))}
    </div>
  );
}
