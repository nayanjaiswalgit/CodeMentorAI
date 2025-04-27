import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarNavSectionProps {
  title: string;
  items: { path: string; label: string; icon: string }[];
  location: string;
  onClose: () => void;
}

export function SidebarNavSection({ title, items, location, onClose }: SidebarNavSectionProps) {
  if (!items.length) return null;
  return (
    <>
      {title && (
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 pl-2 mt-4 first:mt-0 font-sans">
          {title}
        </p>
      )}
      <div className="space-y-0.5">
        {items.map(item => (
          <div key={item.path}>
            <Link href={item.path}>
              <div
                className={cn(
                  "flex items-center gap-2 py-1.5 px-2 cursor-pointer font-medium text-sm transition-colors duration-200 font-sans border-l-4",
                  location === item.path
                    ? "bg-gray-100 text-primary border-primary"
                    : "hover:bg-gray-50 text-gray-600 hover:text-gray-900 border-transparent"
                )}
                onClick={onClose}
              >
                <i className={cn(
                  `${item.icon} w-4 text-base transition-colors duration-200`,
                  location === item.path ? "text-primary" : "text-gray-500"  
                )}></i>
                <span className="truncate">{item.label}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
