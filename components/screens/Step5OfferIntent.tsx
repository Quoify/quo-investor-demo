"use client";

import { QuoDeal, CloseSpeed } from "@/lib/types";
import { StepShell } from "@/components/ui/StepShell";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { NumberInput } from "@/components/ui/NumberInput";

interface Step5Props {
  deal: QuoDeal;
  dispatch: React.Dispatch<{ type: "SET_OFFER_INTENT"; payload: Partial<QuoDeal["offerIntent"]> }>;
  onContinue: () => void;
}

export function Step5OfferIntent({ deal, dispatch, onContinue }: Step5Props) {
  const { offerIntent } = deal;

  function update(payload: Partial<QuoDeal["offerIntent"]>) {
    dispatch({ type: "SET_OFFER_INTENT", payload });
  }

  return (
    <StepShell
      title="What are you putting on the table?"
      subtitle="This captures your intent — not legal terms or contract language."
      onContinue={onContinue}
      continueLabel="See results"
    >
      {/* Offer range */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">
          Offer range{" "}
          <span className="text-xs font-normal text-slate-400">optional</span>
        </p>
        <p className="text-xs text-slate-400">
          Enter a low and high — a range is more honest than a single number at
          this stage.
        </p>
        <div className="flex gap-6 flex-wrap pt-1">
          <NumberInput
            label="Low end"
            value={offerIntent.offerRangeLow}
            onChange={(v) => update({ offerRangeLow: v })}
            prefix="$"
            placeholder="0"
            min={0}
            optional
          />
          <NumberInput
            label="High end"
            value={offerIntent.offerRangeHigh}
            onChange={(v) => update({ offerRangeHigh: v })}
            prefix="$"
            placeholder="0"
            min={0}
            optional
          />
        </div>
      </div>

      {/* Close speed */}
      <ToggleGroup<CloseSpeed>
        label="Target close speed"
        options={[
          { value: "standard", label: "Standard", description: "30–45 days" },
          { value: "fast", label: "Fast", description: "~21 days" },
          { value: "very-fast", label: "Very fast", description: "14 days or less" },
        ]}
        value={offerIntent.closeSpeed}
        onChange={(v) => update({ closeSpeed: v })}
      />

      {/* Inspection */}
      <div className="space-y-3">
        <ToggleGroup<"yes" | "no">
          label="Are you planning an inspection?"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No — waiving" },
          ]}
          value={offerIntent.inspectionIntended ? "yes" : "no"}
          onChange={(v) => {
            if (v === "yes") {
              update({ inspectionIntended: true, inspectionDays: offerIntent.inspectionDays ?? 10 });
            } else {
              update({ inspectionIntended: false, inspectionDays: null });
            }
          }}
        />
        {offerIntent.inspectionIntended && (
          <NumberInput
            label="Inspection period"
            value={offerIntent.inspectionDays}
            onChange={(v) => update({ inspectionDays: v })}
            suffix="days"
            placeholder="10"
            min={1}
          />
        )}
      </div>

      {/* Seller credits */}
      <div className="space-y-3">
        <ToggleGroup<"yes" | "no">
          label="Are you requesting seller credits?"
          options={[
            { value: "no", label: "No" },
            { value: "yes", label: "Yes" },
          ]}
          value={offerIntent.sellerCreditsRequested ? "yes" : "no"}
          onChange={(v) => {
            if (v === "yes") {
              update({ sellerCreditsRequested: true });
            } else {
              update({ sellerCreditsRequested: false, sellerCreditsAmount: null });
            }
          }}
        />
        {offerIntent.sellerCreditsRequested && (
          <NumberInput
            label="Credit amount"
            value={offerIntent.sellerCreditsAmount}
            onChange={(v) => update({ sellerCreditsAmount: v })}
            prefix="$"
            placeholder="0"
            min={0}
            optional
          />
        )}
      </div>
    </StepShell>
  );
}
