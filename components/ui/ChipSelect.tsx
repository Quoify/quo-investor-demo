"use client";

interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipSelectProps<T extends string> {
  options: ChipOption<T>[];
  selected: T[];
  onChange: (selected: T[]) => void;
  label?: string;
  helpText?: string;
}

export function ChipSelect<T extends string>({
  options,
  selected,
  onChange,
  label,
  helpText,
}: ChipSelectProps<T>) {
  function toggle(value: T) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          {helpText && (
            <p className="text-xs text-slate-400 mt-0.5">{helpText}</p>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`
                px-3 py-1.5 rounded-full text-sm border transition-all
                ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900"
                }
              `}
            >
              {isSelected && <span className="mr-1 text-xs">✓</span>}
              {opt.label}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-slate-400">None selected</p>
      )}
    </div>
  );
}
