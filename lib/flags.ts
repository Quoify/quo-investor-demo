import { QuoDeal } from "./types";

export type RiskFlag = {
  id: string;
  severity: "red" | "orange";
  category: string;
  headline: string;
  explanation: string;
  dependency?: string;
  clearedBy?: string;
  unverifiedAssumption?: boolean;
  suppressedByAggressiveness?: boolean;
};

export type DerivedResults = {
  flags: RiskFlag[];
  signal: "go" | "caution" | "no-go";
  dependencies: string[];
  unverifiedAssumptions: string[];
};

// ─────────────────────────────────────────────────────────────
// FLAG LOGIC
// ─────────────────────────────────────────────────────────────

function computeFlags(deal: QuoDeal): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const isAggressive = deal.riskPosture.aggressiveness === "aggressive";

  // ── COSMETIC REHAB MISMATCH ────────────────────────────────
  if (
    deal.condition.rehabLevel === "cosmetic" &&
    deal.condition.structuralWork !== "none"
  ) {
    flags.push({
      id: "cosmetic-rehab-mismatch",
      severity: "orange",
      category: "condition",
      headline: "Rehab classified as cosmetic but structural work selected",
      explanation:
        "Cosmetic rehabs exclude structural, grading, concrete, drainage, or exterior work. Structural input indicates a broader rehab scope.",
      dependency:
        "Confirm true rehab scope with licensed contractor walk-through",
      unverifiedAssumption: true,
    });
  }

  // ── STRUCTURAL WORK RISK ───────────────────────────────────
  if (deal.condition.structuralWork === "major") {
    flags.push({
      id: "structural-work-risk",
      severity: "orange",
      category: "condition",
      headline: "Structural work introduces scope and permit risk",
      explanation:
        "Structural repairs vary widely based on access, load paths, foundation type, and local code. Reliable estimates require contractor inspection.",
      dependency:
        "Obtain contractor scope and rough order-of-magnitude estimate",
      unverifiedAssumption: true,
    });
  }

  // ── SITE / EXTERIOR WORK UNKNOWNs ──────────────────────────
  if (
    deal.unitStrategy.landSignals?.includes("large-lot") ||
    deal.unitStrategy.landSignals?.includes("corner-lot")
  ) {
    flags.push({
      id: "site-work-unknowns",
      severity: "orange",
      category: "condition",
      headline: "Exterior or site work introduces unknown costs",
      explanation:
        "Exterior work such as grading, concrete, drainage, retaining walls, or access improvements depends on slope, soil, and jurisdiction. These cannot be estimated reliably without site inspection.",
      dependency:
        "Verify site conditions and zoning constraints before finalizing offer",
      unverifiedAssumption: true,
    });
  }

  // ── BRRRR + CONVENTIONAL FINANCING MISMATCH ────────────────
  if (
    deal.basics.strategy === "brrr" &&
    deal.riskPosture.financingType === "conventional" &&
    deal.condition.rehabLevel !== "cosmetic"
  ) {
    flags.push({
      id: "brrr-conventional-mismatch",
      severity: "red",
      category: "financing",
      headline: "BRRRR strategy incompatible with conventional financing",
      explanation:
        "Conventional lenders typically will not finance properties requiring non-cosmetic rehab. BRRRR strategies usually require cash or hard money for acquisition and rehab.",
      dependency:
        "Use cash or hard money financing for acquisition and rehab phase",
      unverifiedAssumption: false,
    });
  }

  // ── FAST CLOSE WITH NON-CASH ───────────────────────────────
  if (
    deal.offerIntent.closeSpeed === "fast" &&
    deal.riskPosture.financingType !== "cash"
  ) {
    const flag: RiskFlag = {
      id: "fast-close-financing-risk",
      severity: "orange",
      category: "financing",
      headline: "Fast close may not be achievable with selected financing",
      explanation:
        "Non-cash financing often requires underwriting timelines that exceed fast-close expectations.",
      dependency:
        "Confirm lender timeline or extend close period to 21+ days",
      unverifiedAssumption: false,
    };

    if (isAggressive) flag.suppressedByAggressiveness = true;
    flags.push(flag);
  }

  return flags;
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────

export function computeResults(deal: QuoDeal): DerivedResults {
  const flags = computeFlags(deal);

  const activeRedFlags = flags.filter((f) => f.severity === "red");
  const activeOrangeFlags = flags.filter(
    (f) => f.severity === "orange" && !f.suppressedByAggressiveness
  );

  let signal: DerivedResults["signal"];
  if (activeRedFlags.length > 0) {
    signal = "no-go";
  } else if (activeOrangeFlags.length > 0) {
    signal = "caution";
  } else {
    signal = "go";
  }

  const dependencies = flags
    .filter((f) => f.dependency)
    .map((f) => f.dependency as string);

  const unverifiedAssumptions = flags
    .filter((f) => f.unverifiedAssumption)
    .map((f) => f.headline);

  return { flags, signal, dependencies, unverifiedAssumptions };
}