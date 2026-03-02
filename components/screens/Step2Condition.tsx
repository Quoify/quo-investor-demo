"use client";

import React from "react";
import { QuoDeal } from "@/lib/types";
import { StepShell } from "@/components/ui/StepShell";

interface Step2Props {
  deal: QuoDeal;
  dispatch: React.Dispatch<{
    type: "SET_CONDITION";
    payload: Partial<QuoDeal["condition"]>;
  }>;
  onContinue: () => void;
  estimatedRehab: number;
  renoRate: number;
}

export default function Step2Condition({
  onContinue,
  estimatedRehab,
  renoRate,
}: Step2Props) {
  return (
    <StepShell
      title="How much work does this property need?"
      subtitle="Be honest here — conservative estimates protect you later."
      onContinue={onContinue}
    >
      <div className="rounded-md bg-slate-100 p-3 mb-3">
        <div className="text-sm text-slate-500">
          ZIP-based renovation estimate
        </div>
        <div className="text-lg font-semibold">
          ${estimatedRehab.toLocaleString()}
        </div>
        <div className="text-xs text-slate-500">
          ${renoRate}/sqft baseline
        </div>
      </div>
    </StepShell>
  );
}