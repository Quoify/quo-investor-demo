// lib/Rehab/rules.ts
// Investor-grade rehab + IRR logic
// No point estimates. Explainable ranges only.

export type RehabRiskProfile = {
  baseRehabLow: number;
  baseRehabHigh: number;
  adjustedRehabLow: number;
  adjustedRehabHigh: number;
  capitalAtRiskLow: number;
  capitalAtRiskHigh: number;
  irrLow: number;
  irrHigh: number;
  assumptions: string[];
};

// ---- IRR helper (annualized) ----
function calculateIRR(
  cashOut: number,
  cashIn: number,
  monthsHeld: number
): number {
  if (cashOut <= 0 || cashIn <= 0 || monthsHeld <= 0) return 0;
  const multiple = cashIn / cashOut;
  const years = monthsHeld / 12;
  return Math.pow(multiple, 1 / years) - 1;
}

// ---- Main Rehab + IRR Engine ----
export function evaluateRehabAndIRR(input: {
  purchasePrice: number;
  sellerCredits: number;
  arv: number;
  rehabLevel: "cosmetic" | "moderate" | "major";
  structuralWork: "none" | "minor" | "major";
  exteriorOrSiteWork: boolean;
  monthsHeld: number;
}): RehabRiskProfile {
  const assumptions: string[] = [];

  // ---- Base rehab bands (±10%) ----
  let baseLow = 0;
  let baseHigh = 0;

  if (input.rehabLevel === "cosmetic") {
    baseLow = 20000;
    baseHigh = 30000;
  } else if (input.rehabLevel === "moderate") {
    baseLow = 40000;
    baseHigh = 60000;
  } else {
    baseLow = 70000;
    baseHigh = 100000;
  }

  assumptions.push("Base rehab uses investor bands with ±10% tolerance");

  // ---- Risk widening factors ----
  let riskMultiplierLow = 1;
  let riskMultiplierHigh = 1;

  if (input.structuralWork !== "none") {
    riskMultiplierLow *= 1.15;
    riskMultiplierHigh *= 1.35;
    assumptions.push("Structural work widens rehab range");
  }

  if (input.exteriorOrSiteWork) {
    riskMultiplierLow *= 1.1;
    riskMultiplierHigh *= 1.25;
    assumptions.push("Exterior / site work introduces grading, drainage, access risk");
  }

  // ---- Adjusted rehab range ----
  const adjustedLow = Math.round(baseLow * riskMultiplierLow);
  const adjustedHigh = Math.round(baseHigh * riskMultiplierHigh);

  // ---- Capital at risk (credits offset) ----
  const capitalLow =
    input.purchasePrice + adjustedLow - input.sellerCredits;
  const capitalHigh =
    input.purchasePrice + adjustedHigh - input.sellerCredits;

  assumptions.push("Seller credits reduce capital at risk but not execution risk");

  // ---- Exit proceeds (conservative) ----
  const exitLow = input.arv * 0.95;
  const exitHigh = input.arv;

  // ---- IRR range ----
  const irrLow = calculateIRR(
    capitalHigh,
    exitLow,
    input.monthsHeld
  );

  const irrHigh = calculateIRR(
    capitalLow,
    exitHigh,
    input.monthsHeld
  );

  assumptions.push("IRR is annualized and based on capital at risk, not paper profit");

  return {
    baseRehabLow: baseLow,
    baseRehabHigh: baseHigh,
    adjustedRehabLow: adjustedLow,
    adjustedRehabHigh: adjustedHigh,
    capitalAtRiskLow: capitalLow,
    capitalAtRiskHigh: capitalHigh,
    irrLow,
    irrHigh,
    assumptions,
  };
}