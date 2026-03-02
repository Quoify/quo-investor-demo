"use client";

import { useState, useMemo } from "react";

type Screen = "summary" | "renovation";

const ZIP_RENO_RATE: Record<string, number> = {
  "941": 95,
  "946": 85,
  "947": 90,
  "950": 80,
  "956": 65,
  default: 70,
};

export default function DemoPage() {
  const [screen, setScreen] = useState<Screen>("summary");

  const [purchase, setPurchase] = useState(650000);
  const [arv, setArv] = useState(900000);
  const [rehab, setRehab] = useState(75000);

  const [zip, setZip] = useState("946");
  const [sqft, setSqft] = useState(1200);

  const renoRate =
    ZIP_RENO_RATE[zip.slice(0, 3)] ?? ZIP_RENO_RATE.default;

  const estimatedRehab = useMemo(
    () => sqft * renoRate,
    [sqft, renoRate]
  );

  const totalInvested = purchase + rehab;

  const flipIRR = useMemo(() => {
    const profit = arv - totalInvested;
    return ((profit / totalInvested) * 100).toFixed(1);
  }, [arv, totalInvested]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Quo Investor Demo</h1>

      <div className="flex gap-3">
        <button
          onClick={() => setScreen("summary")}
          className={`px-4 py-2 border rounded ${
            screen === "summary" ? "bg-black text-white" : ""
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setScreen("renovation")}
          className={`px-4 py-2 border rounded ${
            screen === "renovation" ? "bg-black text-white" : ""
          }`}
        >
          Renovation
        </button>
      </div>

      {screen === "summary" && (
        <div className="space-y-6">
          <div className="rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Assumptions</h2>

            <label>Purchase price</label>
            <input
              type="number"
              value={purchase}
              onChange={(e) => setPurchase(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />

            <label>After-repair value</label>
            <input
              type="number"
              value={arv}
              onChange={(e) => setArv(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />

            <label>Rehab budget</label>
            <input
              type="number"
              value={rehab}
              onChange={(e) => setRehab(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="rounded-xl border p-6 space-y-3">
            <h2 className="text-lg font-semibold">Results</h2>

            <div className="flex justify-between">
              <span>Total invested</span>
              <span>${totalInvested.toLocaleString()}</span>
            </div>

            <div className="text-2xl font-bold">
              Flip IRR: {flipIRR}%
            </div>
          </div>
        </div>
      )}

      {screen === "renovation" && (
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Renovation</h2>

          <label>ZIP code</label>
          <input
            type="number"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <label>Square footage</label>
          <input
            type="number"
            value={sqft}
            onChange={(e) => setSqft(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />

          <div className="rounded-md bg-slate-100 p-3">
            <div className="text-sm text-slate-500">
              ZIP-based renovation estimate
            </div>
            <div className="text-xl font-semibold">
              ${estimatedRehab.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              ${renoRate}/sqft baseline
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between">
              <span>Paint & finishes</span>
              <span>$18,000</span>
            </div>
            <div className="flex justify-between">
              <span>Flooring</span>
              <span>$14,000</span>
            </div>
            <div className="flex justify-between">
              <span>Kitchen & bath</span>
              <span>$28,000</span>
            </div>
            <div className="flex justify-between">
              <span>Contingency</span>
              <span>$15,000</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}