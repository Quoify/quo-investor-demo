"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function moduleLabel(type: string) {
  if (type === "fix_flip") return "FIX & FLIP";
  if (type === "buy_hold") return "BUY & HOLD";
  return type.replace(/_/g, " ").toUpperCase();
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center px-4 py-3 ${
        highlight ? "bg-blue-50" : "bg-white"
      }`}
    >
      <p
        className={`text-sm ${
          highlight ? "font-semibold text-blue-800" : "text-gray-500"
        }`}
      >
        {label}
      </p>
      <span
        className={`text-sm font-semibold font-mono ${
          highlight ? "text-blue-900" : "text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function OfferSummaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const address = searchParams.get("address") || "";
  const moduleType = searchParams.get("module_type") || "fix_flip";
  const offerPriceRaw = searchParams.get("offer_price") || "";
  const earnestMoneyRaw = searchParams.get("earnest_money") || "";
  const closeDays = searchParams.get("close_days") || "30";
  const inspectionDays = searchParams.get("inspection_days") || "10";
  const hasFinancing = searchParams.get("has_financing") === "1";
  const hasInspection = searchParams.get("has_inspection") === "1";
  const hasAppraisal = searchParams.get("has_appraisal") === "1";
  const sellerCreditsRaw = searchParams.get("seller_credits") || "";
  const notes = searchParams.get("notes") || "";

  const label = moduleLabel(moduleType);
  const offerPrice = offerPriceRaw ? fmt(Number(offerPriceRaw)) : "—";
  const earnestMoney = earnestMoneyRaw ? fmt(Number(earnestMoneyRaw)) : "—";
  const sellerCredits = sellerCreditsRaw ? fmt(Number(sellerCreditsRaw)) : "None";

  const contingencies = [
    hasFinancing && "Financing",
    hasInspection && "Inspection",
    hasAppraisal && "Appraisal",
  ]
    .filter(Boolean)
    .join(", ") || "None";

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function buildBackUrl() {
    const params = new URLSearchParams();
    if (address) params.set("address", address);
    if (moduleType) params.set("module_type", moduleType);
    return `/offer-blueprint?${params}`;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl overflow-hidden">

        {/* Top nav strip */}
        <div className="px-8 py-2 bg-white border-b border-gray-100 flex items-center justify-between min-h-[36px]">
          <button
            onClick={() => router.push(buildBackUrl())}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            ← Back to Offer Blueprint
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
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors border border-gray-200"
              >
                🖨 Print
              </button>
              <button
                onClick={() => {
                  navigator.clipboard
                    .writeText(window.location.href)
                    .then(() => alert("Link copied to clipboard!"));
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
              >
                🔗 Share
              </button>
            </div>
          </div>
          {address && (
            <p className="text-sm text-gray-500 font-medium mt-2">
              📍 {address}
            </p>
          )}
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Offer Blueprint Summary
            </h2>
            <p className="text-sm text-gray-400 mt-1">Generated {today}</p>
          </div>

          {/* Offer Details */}
          <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Offer Terms
              </p>
            </div>
            <Row label="Offer Price" value={offerPrice} highlight />
            <Row label="Earnest Money Deposit" value={earnestMoney} />
            <Row label="Close of Escrow" value={`${closeDays} days`} />
            <Row label="Inspection Period" value={`${inspectionDays} days`} />
            <Row label="Contingencies" value={contingencies} />
            <Row label="Seller Credits Requested" value={sellerCredits} />
          </div>

          {/* Notes */}
          {notes && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">
                Special Conditions
              </p>
              <p className="text-sm text-amber-900 leading-relaxed">{notes}</p>
            </div>
          )}

          {/* Contingency Summary */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Contingency Status
            </p>
            <div className="space-y-2">
              {[
                {
                  label: "Financing",
                  active: hasFinancing,
                  desc: "Purchase is contingent on loan approval",
                },
                {
                  label: "Inspection",
                  active: hasInspection,
                  desc: "Right to cancel based on inspection findings",
                },
                {
                  label: "Appraisal",
                  active: hasAppraisal,
                  desc: "Property must appraise at or above offer price",
                },
              ].map(({ label: cLabel, active, desc }) => (
                <div key={cLabel} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {active ? "✓" : "×"}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        active ? "text-gray-800" : "text-gray-400"
                      }`}
                    >
                      {cLabel} Contingency{" "}
                      {active ? (
                        <span className="text-blue-600 font-normal">
                          (included)
                        </span>
                      ) : (
                        <span className="text-gray-400 font-normal">
                          (waived)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            This Offer Blueprint is a planning tool only. It does not constitute
            a legal offer, contract, or real estate advice. Consult a licensed
            California real estate professional before submitting any offer.
          </p>
        </div>

        {/* Bottom nav */}
        <div className="flex justify-between items-center px-8 py-5 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => router.push(buildBackUrl())}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
          >
            ← Back
          </button>
          <button
            onClick={() => router.push("/demo")}
            className="px-6 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Analyze Another Property
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OfferBlueprintSummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      }
    >
      <OfferSummaryContent />
    </Suspense>
  );
}
