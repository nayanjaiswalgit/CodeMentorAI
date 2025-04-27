import React from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// Breadcrumbs item type: { label: string, href?: string }
export interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => (
  <Breadcrumb className={"w-full overflow-x-auto whitespace-nowrap flex items-center " + (className || "")}
    style={{ WebkitOverflowScrolling: 'touch' }}
  >
    <div className="flex flex-row items-center gap-1.5">
      {items.map((item, idx) => (
        <React.Fragment key={item.href || item.label}>
          <BreadcrumbItem>
            {item.href ? (
              <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
            ) : (
              <span>{item.label}</span>
            )}
          </BreadcrumbItem>
          {idx !== items.length - 1 && <BreadcrumbSeparator />}
        </React.Fragment>
      ))}
    </div>
  </Breadcrumb>
);
