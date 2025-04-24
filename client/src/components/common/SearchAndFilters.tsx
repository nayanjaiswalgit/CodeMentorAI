import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: Array<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder?: string;
  }>;
  className?: string;
}

export default function SearchAndFilters({
  searchQuery,
  onSearchChange,
  filters,
  className = "",
}: SearchAndFiltersProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${1 + filters.length} gap-4 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search..."
          className="pl-10"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      {filters.map((filter, idx) => (
        <Select key={idx} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger>
            <SelectValue placeholder={filter.placeholder || filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
