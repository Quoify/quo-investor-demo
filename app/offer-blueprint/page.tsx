"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function moduleLabel(type: string) {
  if (type === "fix_flip") return "FIX & FLIP";
  if (type === "buy_hold") return "BUY & HOLD";
  return type.replace(/_/g, " ").toUpperCase();
}

const inp =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900";

function OfferBlueprintForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const address = searchParams.get("address") || "";
  const moduleType = searchParams.get("module_type") || "fix_flip";
  const label = moduleLabel(moduleType);

  const [offerPrice, setOfferPrice] = useState("");
  const [earnestMoney, setEarnestMoney] = useState("");
  const [closeDays, setCloseDays] = useState("30");
  const [inspectionDays, setInspectionDays] = useState("10");
  const [hasFinancing, setHasFinancing] = useState(false);
  const [hasInspection, setHasInspection] = useState(true);
  const [hasAppraisal, setHasAppraisal] = useState(false);
  const [sellerCredits, setSellerCredits] = useState("");
  const [notes, setNotes] = useState("");

  const canContinue = offerPrice.trim().length > 0;

  function handleContinue() {
    const params = new URLSearchParams({
      address,
      module_type: moduleType,
      offer_price: offerPrice,
      earnest_money: earnestMoney,
      close_days: closeDays,
      inspection_days: inspectionDays,
      has_financing: hasFinancing ? "1" : "0",
      has_inspection: hasInspection ? "1" : "0",
      has_appraisal: hasAppraisal ? "1" : "0",
      seller_credits: sellerCredits,
      notes,
    });
    router.push(`/offer-blueprint/summary?${params}`);
  }

  const Toggle = ({
    val,
    onToggle,
    title,
    desc,
  }: {
    val: boolean;
    onToggle: () => void;
    title: string;
    desc: string;
  }) => (
    <label
      className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer border-2 transition-all ${
        val ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
      }`}
    >
      <div>
        <p
          className={`text-sm font-semibold ${
            val ? "text-blue-800" : "text-gray-600"
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <div
        className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
          val ? "bg-blue-600" : "bg-gray-200"
        }`}
        onClick={onToggle}
      >
        <div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
          style={{ left: val ? "18px" : "2px" }}
        />
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl overflow-hidden">

        {/* Top nav strip */}
        <div className="px-8 py-2 bg-white border-b border-gray-100 flex items-center justify-between min-h-[36px]">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            ← Back to Results
          </button>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            {label}
          </span>
        </div>

        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => router.push("/demo")}
              className="text-left group"
            >
              <h1 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors cursor-pointer">
                Deal Evaluator
              </h1>
            </button>
            <p className="text-xs text-gray-400">Offer Blueprint</p>
          </div>
          {address && (
            <p className="text-sm text-gray-500 font-medium mt-2">
              📍 {address}
            </p>
          )}
        </div>

        {/* Form */}
        <div className="px-8 py-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Build your offer strategy.
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your planned offer terms. These will appear on your Offer
              Blueprint summary.
            </p>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Pricing
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Offer Price ($)
                </label>
                <input
                  type="number"
                  className={inp}
                  placeholder="e.g. 580000"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Your proposed purchase price
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Earnest Money Deposit ($)
                </label>
                <input
                  type="number"
                  className={inp}
                  placeholder="e.g. 10000"
                  value={earnestMoney}
                  onChange={(e) => setEarnestMoney(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Good-faith deposit held in escrow
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Timeline
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Close of Escrow (days)
                </label>
                <div className="flex gap-2">
                  {[21, 30, 45, 60].map((d) => (
                    <button
                      key={d}
                      onClick={() => setCloseDays(String(d))}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        closeDays === String(d)
                          ? "bg-blue-600 text-white shadow"
                          : "bg-white text-gray-500 border border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Days from accepted offer to close
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Inspection Period (days)
                </label>
                <div className="flex gap-2">
                  {[7, 10, 14, 17].map((d) => (
                    <button
                      key={d}
                      onClick={() => setInspectionDays(String(d))}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        inspectionDays === String(d)
                          ? "bg-blue-600 text-white shadow"
                          : "bg-white text-gray-500 border border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Days to complete due diligence
                </p>
              </div>
            </div>
          </div>

          {/* Contingencies */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Contingencies
            </p>
            <Toggle
              val={hasFinancing}
              onToggle={() => setHasFinancing((v) => !v)}
              title="Financing Contingency"
              desc="Offer is contingent on securing financing"
            />
            <Toggle
              val={hasInspection}
              onToggle={() => setHasInspection((v) => !v)}
              title="Inspection Contingency"
              desc="Right to cancel based on inspection findings"
            />
            <Toggle
              val={hasAppraisal}
              onToggle={() => setHasAppraisal((v) => !v)}
              title="Appraisal Contingency"
              desc="Offer is contingent on property appraising at or above offer price"
            />
          </div>

          {/* Additional Terms */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Additional Terms
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Seller Credits Requested ($)
              </label>
              <input
                type="number"
                className={inp}
                placeholder="e.g. 5000 — leave blank if none"
                value={sellerCredits}
                onChange={(e) => setSellerCredits(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Credits applied toward closing costs or repairs
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Notes / Special Conditions
              </label>
              <textarea
                className={`${inp} resize-none`}
                rows={3}
                placeholder="e.g. As-is sale, seller to provide access for contractor walk-through prior to close..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex justify-between items-center px-8 py-5 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => router.back()}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="px-6 py-2 rounded-lg text-sm font-bold text-white transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#155EEF" }}
          >
            Generate Summary →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OfferBlueprintPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      }
    >
      <OfferBlueprintForm />
    </Suspense>
  );
}
