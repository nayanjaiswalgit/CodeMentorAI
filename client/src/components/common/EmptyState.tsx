import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  className?: string;
}

export default function EmptyState({ icon, title, message, className = "" }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-500 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-neutral-600">{message}</p>
    </div>
  );
}
