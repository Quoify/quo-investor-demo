"use client";

import {
  QuoDeal,
  Aggressiveness,
  FinancingType,
  ContingencyIntent,
  WalkAwaySensitivity,
} from "@/lib/types";
import { StepShell } from "@/components/ui/StepShell";
import { ToggleGroup } from "@/components/ui/ToggleGroup";

interface Step4Props {
  deal: QuoDeal;
  dispatch: React.Dispatch<{ type: "SET_RISK_POSTURE"; payload: Partial<QuoDeal["riskPosture"]> }>;
  onContinue: () => void;
}

export function Step4RiskPosture({ deal, dispatch, onContinue }: Step4Props) {
  const { riskPosture } = deal;

  function update(payload: Partial<QuoDeal["riskPosture"]>) {
    dispatch({ type: "SET_RISK_POSTURE", payload });
  }

  return (
    <StepShell
      title="How are you approaching this offer?"
      subtitle="Be honest — this affects which risks show up in your results."
      onContinue={onContinue}
    >
      {/* Financing */}
      <ToggleGroup<FinancingType>
        label="How are you financing this?"
        options={[
          { value: "cash", label: "Cash" },
          { value: "hard-money", label: "Hard money" },
          { value: "dscr", label: "DSCR loan" },
          { value: "conventional", label: "Conventional" },
        ]}
        value={riskPosture.financingType}
        onChange={(v) => update({ financingType: v })}
      />

      {/* Aggressiveness */}
      <ToggleGroup<Aggressiveness>
        label="How aggressive is this offer?"
        helpText="Aggressive posture can soften some orange flags — but never red ones."
        options={[
          {
            value: "conservative",
            label: "Conservative",
            description: "protecting downside",
          },
          {
            value: "moderate",
            label: "Moderate",
            description: "balanced",
          },
          {
            value: "aggressive",
            label: "Aggressive",
            description: "maximizing competitiveness",
          },
        ]}
        value={riskPosture.aggressiveness}
        onChange={(v) => update({ aggressiveness: v })}
      />

      {/* Contingency intent */}
      <ToggleGroup<ContingencyIntent>
        label="What contingencies are you planning to keep?"
        helpText="This is your intent — not legal language"
        options={[
          { value: "keep-all", label: "Keep all" },
          { value: "waive-some", label: "Waive some" },
          { value: "waive-most", label: "Waive most" },
          { value: "waive-all", label: "Waive all" },
        ]}
        value={riskPosture.contingencyIntent}
        onChange={(v) => update({ contingencyIntent: v })}
      />

      {/* Walk-away sensitivity */}
      <ToggleGroup<WalkAwaySensitivity>
        label="How easy would it be for you to walk away from this deal?"
        options={[
          { value: "low", label: "Easy to walk", description: "plenty of other deals" },
          { value: "medium", label: "Could go either way" },
          { value: "high", label: "Need this deal", description: "harder to walk" },
        ]}
        value={riskPosture.walkAwaySensitivity}
        onChange={(v) => update({ walkAwaySensitivity: v })}
      />
    </StepShell>
  );
}
