"use client";

interface NumberInputProps {
  label: string;
  helpText?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  min?: number;
  optional?: boolean;
}

export function NumberInput({
  label,
  helpText,
  value,
  onChange,
  prefix,
  suffix,
  placeholder = "—",
  min,
  optional = false,
}: NumberInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "") {
      onChange(null);
      return;
    }
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      onChange(min !== undefined ? Math.max(min, num) : num);
    }
  }

  const displayValue =
    value !== null ? value.toLocaleString("en-US") : "";

  return (
    <div className="space-y-1.5">
      <div>
        <label className="text-sm font-medium text-slate-700">
          {label}
          {optional && (
            <span className="ml-1.5 text-xs font-normal text-slate-400">
              optional
            </span>
          )}
        </label>
        {helpText && (
          <p className="text-xs text-slate-400 mt-0.5">{helpText}</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        {prefix && (
          <span className="text-sm text-slate-500 font-medium">{prefix}</span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full max-w-[200px] px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />
        {suffix && (
          <span className="text-sm text-slate-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}
