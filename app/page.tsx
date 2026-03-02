"use client";

import { useState, useMemo } from "react";

type RehabLevel = "low" | "mid" | "high";

export default function DemoPage() {
  const [purchase, setPurchase] = useState(650000);
  const [arv, setArv] = useState(900000);
  const [sqft, setSqft] = useState(1200);

  // SINGLE, OBVIOUS LEVER
  const [level, setLevel] = useState<RehabLevel>("mid");

  // BASE CONTRACTOR TABLE
  const BASE_RATES = {
    low: 85,
    mid: 115,
    high: 160,
  };

  const rehabSubtotal = useMemo(() => {
    return sqft * BASE_RATES[level];
  }, [sqft, level]);

  const contingency = rehabSubtotal * 0.15;
  const totalRehab = rehabSubtotal + contingency;
  const totalInvested = purchase + totalRehab;

  const flipIRR = useMemo(() => {
    const profit = arv - totalInvested;
    return ((profit / totalInvested) * 100).toFixed(1);
  }, [arv, totalInvested]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Quo Rehab Model (Sanity Check)</h1>

      <div className="rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold">Deal Inputs</h2>

        <label>Purchase Price</label>
        <input
          type="number"
          value={purchase}
          onChange={(e) => setPurchase(+e.target.value)}
          className="w-full border p-2"
        />

        <label>ARV</label>
        <input
          type="number"
          value={arv}
          onChange={(e) => setArv(+e.target.value)}
          className="w-full border p-2"
        />

        <label>Square Footage</label>
        <input
          type="number"
          value={sqft}
          onChange={(e) => setSqft(+e.target.value)}
          className="w-full border p-2"
        />
      </div>

      <div className="rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold">Contractor Quality</h2>

        <div className="flex gap-3">
          {(["low", "mid", "high"] as RehabLevel[]).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-4 py-2 border rounded ${
                level === l ? "bg-black text-white" : ""
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="text-sm text-slate-500">
          ${BASE_RATES[level]} / sqft baseline
        </div>
      </div>

      <div className="rounded-xl border p-6 space-y-3">
        <h2 className="font-semibold">Results</h2>

        <div>Rehab Subtotal: ${Math.round(rehabSubtotal).toLocaleString()}</div>
        <div>Contingency (15%): ${Math.round(contingency).toLocaleString()}</div>
        <div className="font-bold">
          Total Rehab: ${Math.round(totalRehab).toLocaleString()}
        </div>

        <div className="pt-2 text-2xl font-bold">
          Flip IRR: {flipIRR}%
        </div>
      </div>
    </main>
  );
}