import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface McqOptionsProps {
  options: string[];
  selectedOption: number | null;
  onSelect: (index: number) => void;
}

export function McqOptions({ options, selectedOption, onSelect }: McqOptionsProps) {
  return (
    <RadioGroup value={selectedOption !== null ? selectedOption.toString() : ""} onValueChange={value => onSelect(parseInt(value))}>
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 rounded-md border hover:bg-neutral-50">
            <RadioGroupItem value={index.toString()} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
}
