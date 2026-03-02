import { RiskFlag } from "@/lib/flags";

interface RiskFlagCardProps {
  flag: RiskFlag;
}

export function RiskFlagCard({ flag }: RiskFlagCardProps) {
  const isRed = flag.severity === "red";
  const isSuppressed = flag.suppressedByAggressiveness;

  return (
    <div
      className={`
        rounded-xl border p-4 space-y-2
        ${
          isSuppressed
            ? "border-slate-200 bg-slate-50 opacity-70"
            : isRed
            ? "border-red-200 bg-red-50"
            : "border-amber-200 bg-amber-50"
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`
              inline-block w-2 h-2 rounded-full shrink-0 mt-1
              ${isSuppressed ? "bg-slate-400" : isRed ? "bg-red-500" : "bg-amber-500"}
            `}
          />
          <p
            className={`text-sm font-semibold ${
              isSuppressed
                ? "text-slate-500"
                : isRed
                ? "text-red-800"
                : "text-amber-800"
            }`}
          >
            {flag.headline}
          </p>
        </div>
        {isSuppressed && (
          <span className="text-xs text-slate-400 font-medium shrink-0 border border-slate-200 rounded px-1.5 py-0.5">
            noted
          </span>
        )}
        {!isSuppressed && (
          <span
            className={`text-xs font-semibold shrink-0 uppercase tracking-wide ${
              isRed ? "text-red-500" : "text-amber-600"
            }`}
          >
            {isRed ? "red" : "orange"}
          </span>
        )}
      </div>

      <p
        className={`text-sm leading-relaxed ${
          isSuppressed ? "text-slate-500" : isRed ? "text-red-700" : "text-amber-700"
        }`}
      >
        {flag.explanation}
      </p>

      {flag.clearedBy && !isSuppressed && (
        <p
          className={`text-xs font-medium ${
            isRed ? "text-red-600" : "text-amber-600"
          }`}
        >
          Fix: {flag.clearedBy}
        </p>
      )}
    </div>
  );
}
