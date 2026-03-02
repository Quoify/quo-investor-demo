"use client";

import { UnverifiedADU, ApprovalPath } from "@/lib/types";
import { UNVERIFIED_DEFAULTS } from "@/lib/defaults";
import { ToggleGroup } from "@/components/ui/ToggleGroup";

interface FillInLaterBlockProps {
  value: UnverifiedADU;
  onChange: (updated: Partial<UnverifiedADU>) => void;
}

const APPROVAL_OPTIONS: { value: ApprovalPath; label: string }[] = [
  { value: "not-checked", label: "Not checked yet" },
  { value: "by-right", label: "By-right" },
  { value: "discretionary", label: "Discretionary" },
  { value: "unknown", label: "Unknown" },
];

function TextRow({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const isEmpty = value === UNVERIFIED_DEFAULTS.zoningDesignation || value === "";
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-amber-700 font-medium w-44 shrink-0 pt-2">
        {label}
      </span>
      <input
        type="text"
        value={isEmpty ? "" : value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value || UNVERIFIED_DEFAULTS.zoningDesignation)}
        className="flex-1 px-3 py-1.5 text-sm border border-amber-200 rounded-lg bg-white text-slate-800 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
      />
    </div>
  );
}

export function FillInLaterBlock({ value, onChange }: FillInLaterBlockProps) {
  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-amber-800">
          Needs verification
        </p>
        <p className="text-xs text-amber-600 mt-1">
          Quo cannot determine zoning, unit counts, or ADU feasibility. Fill
          these in when you have confirmed information — flags will update in
          real time.
        </p>
      </div>

      <TextRow
        label="Zoning designation"
        value={value.zoningDesignation}
        placeholder="e.g. R-2, RD-1.5"
        onChange={(v) => onChange({ zoningDesignation: v })}
      />

      <TextRow
        label="Max units allowed"
        value={value.maxUnitsAllowed}
        placeholder="e.g. 4 units"
        onChange={(v) => onChange({ maxUnitsAllowed: v })}
      />

      <div className="space-y-1.5">
        <span className="text-xs text-amber-700 font-medium">
          Approval path
        </span>
        <ToggleGroup
          options={APPROVAL_OPTIONS}
          value={value.approvalPath}
          onChange={(v) => onChange({ approvalPath: v })}
        />
      </div>

      <TextRow
        label="Known constraints"
        value={value.knownConstraints}
        placeholder="e.g. fire zone, setback issues"
        onChange={(v) => onChange({ knownConstraints: v })}
      />

      <TextRow
        label="How did you verify this?"
        value={value.verificationSource}
        placeholder="e.g. city planner call, permit office"
        onChange={(v) => onChange({ verificationSource: v })}
      />
    </div>
  );
}
