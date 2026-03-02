import type { QuoDeal } from "../types"
import { InvestorStep6Outputs } from "../types"
import { evaluateRehabAndIRR } from "./rules"

// Explicit enum translation (NO patching, just mapping)
function mapRehabLevel(level: "cosmetic" | "mid" | "full-gut") {
  if (level === "cosmetic") return "cosmetic"
  if (level === "mid") return "moderate"
  return "major"
}

function mapStructuralWork(work: "none" | "some" | "major") {
  if (work === "none") return "none"
  if (work === "some") return "minor"
  return "major"
}

export function buildInvestorStep6(
  deal: QuoDeal
): InvestorStep6Outputs {
  const purchasePrice =
  deal.basics.askingPrice && deal.basics.askingPrice > 0
    ? deal.basics.askingPrice
    : 750000;

const arv =
  deal.basics.estimatedARV && deal.basics.estimatedARV > 0
    ? deal.basics.estimatedARV
    : 950000;

const r = evaluateRehabAndIRR({
  purchasePrice,
  sellerCredits: deal.offerIntent.sellerCreditsAmount ?? 0,
  arv,
  rehabLevel: mapRehabLevel(deal.condition.rehabLevel),
  structuralWork: mapStructuralWork(deal.condition.structuralWork),
  exteriorOrSiteWork: false,
  monthsHeld: 12,
});

  const baseIRR = (r.irrLow + r.irrHigh) / 2

  return {
    rehabRange: {
      low: r.adjustedRehabLow,
      high: r.adjustedRehabHigh,
    },
    capitalAtRisk: r.capitalAtRiskHigh,
    dealIRR: {
      worst: r.irrLow,
      base: baseIRR,
      best: r.irrHigh,
    },
    exitPaths: {
      sell: {
        exitType: "sell",
        irr: {
          worst: r.irrLow,
          base: baseIRR,
          best: r.irrHigh,
        },
      },
      hold: {
        exitType: "hold",
        irr: {
          worst: r.irrLow,
          base: baseIRR,
          best: r.irrHigh,
        },
      },
    },
  }
}