"use client";

import { useState, useMemo } from "react";

type EntryPath = "mls" | "offmarket" | "wholesaler" | "direct";

const ENTRY_PATHS: {
  id: EntryPath;
  label: string;
  description: string;
  adjustment: number;
}[] = [
  { id: "mls", label: "MLS", description: "Full market price.", adjustment: 0 },
  { id: "offmarket", label: "Off-Market", description: "Direct outreach.", adjustment: -0.1 },
  { id: "wholesaler", label: "Wholesaler", description: "Assignment fee applies.", adjustment: -0.15 },
  { id: "direct", label: "Direct to Seller", description: "Seller-driven discount.", adjustment: -0.12 },
];

export default function InvestorDemo() {
  const [step, setStep] = useState<1 | 2>(1);
  const [entryPath, setEntryPath] = useState<EntryPath>("mls");

  const listPrice = 650000;

  const purchasePrice = useMemo(() => {
    const adj = ENTRY_PATHS.find(p => p.id === entryPath)?.adjustment ?? 0;
    return Math.round(listPrice * (1 + adj));
  }, [entryPath]);

  // Step 2 state (Basics)
  const [purchase, setPurchase] = useState<number>(purchasePrice);
  const [arv, setArv] = useState<number>(900000);
  const [sqft, setSqft] = useState<number>(1200);

  // keep Basics purchase synced when Entry Path changes
  useMemo(() => {
    setPurchase(purchasePrice);
  }, [purchasePrice]);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 space-y-8">

        {/* Header */}
        <div>
          <div className="text-xs tracking-wide text-blue-600 font-semibold mb-1">
            FLIP ANALYSIS
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Deal Evaluator</h1>
            <div className="text-sm text-slate-400">California Residential · 1–4 Units</div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 text-sm">
          {["Entry Path", "Basics", "Renovation", "Inventory", "Results"].map((label, i) => (
            <div
              key={label}
              className={`px-3 py-1 rounded-full ${
                step === (i + 1 as any)
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {i + 1} {label}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-1">How are you sourcing this deal?</h2>
              <p className="text-sm text-slate-500">
                Acquisition channel sets the effective purchase price.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {ENTRY_PATHS.map(path => {
                const price = Math.round(listPrice * (1 + path.adjustment));
                const delta = price - listPrice;

                return (
                  <button
                    key={path.id}
                    onClick={() => setEntryPath(path.id)}
                    className={`border rounded-xl p-4 text-left space-y-2 ${
                      entryPath === path.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">{path.label}</div>
                      {path.adjustment !== 0 && (
                        <div className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          {Math.round(path.adjustment * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">{path.description}</div>
                    <div className="pt-2">
                      <div className="text-lg font-bold">${price.toLocaleString()}</div>
                      {delta !== 0 && (
                        <div className="text-xs text-green-600">
                          {delta.toLocaleString()} vs. list
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-1">Deal Basics</h2>
              <p className="text-sm text-slate-500">
                These inputs anchor renovation and returns.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <LabeledInput
                label="Purchase Price"
                value={purchase}
                onChange={setPurchase}
              />
              <LabeledInput label="After Repair Value" value={arv} onChange={setArv} />
              <LabeledInput label="Square Footage" value={sqft} onChange={setSqft} />
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => setStep(1)}
            disabled={step === 1}
            className={`text-sm ${step === 1 ? "text-slate-300" : ""}`}
          >
            ← Back
          </button>
          <div className="text-sm text-slate-400">{step} of 5</div>
          <button
            onClick={() => setStep(step === 1 ? 2 : 2)}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium"
          >
            Continue →
          </button>
        </div>

      </div>
    </main>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="text-sm text-slate-600 mb-1">{label}</div>
      <input
        type="number"
        value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full border rounded p-2"
      />
    </label>
  );
}