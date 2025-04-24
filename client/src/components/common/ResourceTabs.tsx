import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";

interface ResourceTabsProps {
  tabs: Array<{
    value: string;
    label: string;
    render: () => React.ReactNode;
    empty?: { icon?: React.ReactNode; title: string; message: string };
  }>;
  defaultValue: string;
  isLoading: boolean;
  loadingCount?: number;
  className?: string;
  onTabChange?: (value: string) => void;
}

export default function ResourceTabs({
  tabs,
  defaultValue,
  isLoading,
  loadingCount = 6,
  className = "",
  onTabChange,
}: ResourceTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className={`mb-8 ${className}`} onValueChange={onTabChange}>
      <TabsList>
        {tabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="mt-4">
          {isLoading ? (
            <LoadingSkeleton count={loadingCount} />
          ) : (
            tab.render() || (tab.empty && <EmptyState {...tab.empty} />)
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
