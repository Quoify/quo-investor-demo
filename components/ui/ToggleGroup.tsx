"use client";

interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface ToggleGroupProps<T extends string> {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string;
  helpText?: string;
}

export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  label,
  helpText,
}: ToggleGroupProps<T>) {
  return (
    <div className="space-y-2">
      {label && (
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          {helpText && <p className="text-xs text-slate-400 mt-0.5">{helpText}</p>}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium border transition-all
                ${
                  selected
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900"
                }
              `}
            >
              {opt.label}
              {opt.description && (
                <span
                  className={`ml-1.5 text-xs ${selected ? "text-slate-300" : "text-slate-400"}`}
                >
                  {opt.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
