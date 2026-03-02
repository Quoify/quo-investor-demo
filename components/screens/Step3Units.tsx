"use client";

import { QuoDeal, AddingUnits, DealRequiresUnits, ExpansionLevel, LandSignal } from "@/lib/types";
import { StepShell } from "@/components/ui/StepShell";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { ChipSelect } from "@/components/ui/ChipSelect";
import { FillInLaterBlock } from "@/components/ui/FillInLaterBlock";
import { UnverifiedADU } from "@/lib/types";

interface Step3Props {
  deal: QuoDeal;
  dispatchUnit: React.Dispatch<{ type: "SET_UNIT_STRATEGY"; payload: Partial<QuoDeal["unitStrategy"]> }>;
  dispatchUnverified: React.Dispatch<{ type: "SET_UNVERIFIED"; payload: Partial<UnverifiedADU> }>;
  onContinue: () => void;
}

export function Step3Units({ deal, dispatchUnit, dispatchUnverified, onContinue }: Step3Props) {
  const { unitStrategy } = deal;
  const isAddingUnits = unitStrategy.addingUnits !== "no";

  function updateUnit(payload: Partial<QuoDeal["unitStrategy"]>) {
    dispatchUnit({ type: "SET_UNIT_STRATEGY", payload });
  }

  function handleAddingUnitsChange(v: AddingUnits) {
    if (v === "no") {
      // Reset dependent fields when toggling off
      updateUnit({
        addingUnits: v,
        dealRequiresUnits: null,
        expansionLevel: null,
        landSignals: [],
      });
    } else {
      updateUnit({ addingUnits: v });
    }
  }

  return (
    <StepShell
      title="Are you planning to add units?"
      subtitle="ADUs, garage conversions, new construction — anything that increases the unit count."
      onContinue={onContinue}
    >
      {/* Primary question */}
      <ToggleGroup<AddingUnits>
        label="Is adding units part of your strategy?"
        options={[
          { value: "no", label: "No" },
          { value: "possibly", label: "Possibly" },
          { value: "yes", label: "Yes" },
        ]}
        value={unitStrategy.addingUnits}
        onChange={handleAddingUnitsChange}
      />

      {/* Conditional expansion */}
      {isAddingUnits && (
        <div className="space-y-7 pt-2 border-t border-slate-100">
          {/* Does deal require it? */}
          <ToggleGroup<DealRequiresUnits>
            label="Does this deal REQUIRE added units to work?"
            helpText="Would the deal still make sense without the additional units?"
            options={[
              { value: "no", label: "No — it's upside" },
              { value: "unsure", label: "Unsure" },
              { value: "yes", label: "Yes — deal needs it" },
            ]}
            value={unitStrategy.dealRequiresUnits ?? null}
            onChange={(v) => updateUnit({ dealRequiresUnits: v })}
          />

          {/* Expansion level */}
          <ToggleGroup<ExpansionLevel>
            label="What level of expansion are you assuming?"
            options={[
              {
                value: "modest",
                label: "Modest",
                description: "by-right / common ADU",
              },
              {
                value: "aggressive",
                label: "Aggressive",
                description: "entitlement / discretionary",
              },
            ]}
            value={unitStrategy.expansionLevel ?? null}
            onChange={(v) => updateUnit({ expansionLevel: v })}
          />

          {/* Land signals */}
          <ChipSelect<LandSignal>
            label="What lot or land signals exist?"
            helpText="Select anything that applies — these inform risk, not feasibility"
            options={[
              { value: "large-lot", label: "Large lot" },
              { value: "alley-access", label: "Alley access" },
              { value: "detached-garage", label: "Detached garage" },
              { value: "existing-structure", label: "Existing structure" },
              { value: "corner-lot", label: "Corner lot" },
            ]}
            selected={unitStrategy.landSignals}
            onChange={(v) => updateUnit({ landSignals: v })}
          />

          {/* Fill in later block */}
          <FillInLaterBlock
            value={unitStrategy.unverified}
            onChange={(payload) =>
              dispatchUnverified({ type: "SET_UNVERIFIED", payload })
            }
          />
        </div>
      )}
    </StepShell>
  );
}
