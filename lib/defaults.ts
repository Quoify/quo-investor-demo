import { QuoDeal } from "@/lib/types";

export const UNVERIFIED_DEFAULTS = {
  zoningDesignation: "Not checked yet",
  maxUnitsAllowed: "Not checked yet",
  approvalPath: "not-checked" as const,
  knownConstraints: "Not checked yet",
  verificationSource: "Not checked yet",
};

export function createDefaultDeal(): QuoDeal {
  return {
    meta: {
      sessionId: crypto.randomUUID(),
      schemaVersion: "1.0",
      createdAt: new Date().toISOString(),
    },
    basics: {
      propertyType: "sfr",
      city: "",
      county: "",
      strategy: "flip",
      purchaseContext: "on-market",
      askingPrice: null,
      estimatedARV: null,
    },
    condition: {
      rehabLevel: "cosmetic",
      structuralWork: "none",
      systemsTouched: [],
      permitLikelihood: "unknown",
    },
    unitStrategy: {
      addingUnits: "no",
      dealRequiresUnits: null,
      expansionLevel: null,
      landSignals: [],
      unverified: { ...UNVERIFIED_DEFAULTS },
    },
    riskPosture: {
      aggressiveness: "conservative",
      financingType: "hard-money",
      contingencyIntent: "keep-all",
      walkAwaySensitivity: "medium",
    },
    offerIntent: {
      offerRangeLow: null,
      offerRangeHigh: null,
      closeSpeed: "standard",
      inspectionIntended: true,
      inspectionDays: 10,
      sellerCreditsRequested: false,
      sellerCreditsAmount: null,
    },
  };
}
