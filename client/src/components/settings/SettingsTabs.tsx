import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Tab {
  label: string;
  value: string;
}

const tabs: Tab[] = [
  { label: "Account", value: "account" },
  { label: "Security", value: "security" },
  { label: "Preferences", value: "preferences" },
];

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="flex gap-2 mb-8 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`px-4 py-2 font-medium text-sm focus:outline-none border-b-2 transition-colors duration-200 ` +
            (activeTab === tab.value
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-gray-500 hover:text-primary hover:bg-primary/5")}
          onClick={() => onTabChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
