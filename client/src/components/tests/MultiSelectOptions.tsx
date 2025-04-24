import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MultiSelectOptionsProps {
  options: string[];
  selectedOptions: number[];
  onToggle: (index: number) => void;
}

export function MultiSelectOptions({ options, selectedOptions, onToggle }: MultiSelectOptionsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-500 font-medium">Select all that apply:</p>
      {options.map((option, index) => (
        <div key={index} className="flex items-start space-x-2">
          <Checkbox
            id={`option-${index}`}
            checked={selectedOptions.includes(index)}
            onCheckedChange={() => onToggle(index)}
          />
          <Label htmlFor={`option-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {option}
          </Label>
        </div>
      ))}
    </div>
  );
}
