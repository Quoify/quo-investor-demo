import { Signal } from "@/lib/types";

interface SignalBadgeProps {
  signal: Signal;
}

const CONFIG = {
  go: {
    label: "Go",
    sub: "This deal looks clean based on your inputs.",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    text: "text-emerald-800",
    sub_text: "text-emerald-600",
  },
  caution: {
    label: "Caution",
    sub: "There are things to watch before you commit.",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    text: "text-amber-800",
    sub_text: "text-amber-600",
  },
  "no-go": {
    label: "No-Go",
    sub: "At least one serious issue needs to be resolved.",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    text: "text-red-800",
    sub_text: "text-red-600",
  },
};

export function SignalBadge({ signal }: SignalBadgeProps) {
  const c = CONFIG[signal];
  return (
    <div
      className={`rounded-xl border-2 ${c.bg} ${c.border} px-6 py-5 flex items-center gap-4`}
    >
      <span className={`w-4 h-4 rounded-full shrink-0 ${c.dot}`} />
      <div>
        <p className={`text-2xl font-bold tracking-tight ${c.text}`}>
          {c.label}
        </p>
        <p className={`text-sm mt-0.5 ${c.sub_text}`}>{c.sub}</p>
      </div>
    </div>
  );
}
