"use client";

interface StepShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
}

export function StepShell({
  title,
  subtitle,
  children,
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
}: StepShellProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>

      <div className="space-y-7">{children}</div>

      {onContinue && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onContinue}
            disabled={continueDisabled}
            className={`
              px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${
                continueDisabled
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-slate-700 active:bg-slate-800"
              }
            `}
          >
            {continueLabel}
          </button>
        </div>
      )}
    </div>
  );
}
