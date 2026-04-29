import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  className?: string;
  layout?: "stack" | "grid";
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  className,
  layout = "stack",
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        layout === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 gap-2"
          : "flex flex-col gap-2",
        className,
      )}
    >
      {options.map((opt) => (
        <RadioCard
          key={opt.value}
          name={name}
          option={opt}
          checked={value === opt.value}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function RadioCard({
  name,
  option,
  checked,
  onChange,
}: {
  name: string;
  option: RadioOption;
  checked: boolean;
  onChange: (v: string) => void;
}): ReactNode {
  return (
    <label
      className={cn(
        "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors",
        checked
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card hover:border-primary/50",
      )}
    >
      <input
        type="radio"
        name={name}
        value={option.value}
        checked={checked}
        onChange={() => onChange(option.value)}
        className="mt-1 h-4 w-4 accent-primary"
      />
      <span className="flex flex-col">
        <span className="font-medium text-sm">{option.label}</span>
        {option.description ? (
          <span className="text-xs text-muted-foreground mt-0.5">
            {option.description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
