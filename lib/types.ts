// =======================================
// Quo Investor OS — Canonical Type System
// =======================================

// ─── Enums / Union Types ─────────────────────────────────────────────────────

export type PropertyType = "sfr" | "duplex" | "triplex" | "fourplex"
export type Strategy = "flip" | "brrr" | "hold"
export type PurchaseContext =
  | "on-market"
  | "off-market"
  | "wholesale"
  | "auction"
  | "other"

export type RehabLevel = "cosmetic" | "mid" | "full-gut"
export type StructuralWork = "none" | "some" | "major"
export type SystemTouched = "roof" | "electrical" | "plumbing" | "hvac"
export type PermitLikelihood = "unlikely" | "possible" | "likely" | "unknown"

export type AddingUnits = "no" | "possibly" | "yes"
export type DealRequiresUnits = "no" | "unsure" | "yes"
export type ExpansionLevel = "modest" | "aggressive"
export type LandSignal =
  | "large-lot"
  | "alley-access"
  | "detached-garage"
  | "existing-structure"
  | "corner-lot"
export type ApprovalPath =
  | "by-right"
  | "discretionary"
  | "unknown"
  | "not-checked"

export type Aggressiveness = "conservative" | "moderate" | "aggressive"
export type FinancingType = "cash" | "hard-money" | "dscr" | "conventional"
export type ContingencyIntent =
  | "keep-all"
  | "waive-some"
  | "waive-most"
  | "waive-all"
export type WalkAwaySensitivity = "low" | "medium" | "high"

export type CloseSpeed = "standard" | "fast" | "very-fast"

export type FlagSeverity = "red" | "orange"
export type FlagCategory =
  | "condition"
  | "adu"
  | "strategy"
  | "financing"
  | "offer"
  | "data-gap"
export type Signal = "go" | "caution" | "no-go"

// ─── Core Deal Object (Inputs) ───────────────────────────────────────────────

export interface QuoDeal {
  meta: {
    sessionId: string
    schemaVersion: "1.0"
    createdAt: string
  }

  basics: {
    propertyType: PropertyType
    city: string
    county: string
    strategy: Strategy
    purchaseContext: PurchaseContext
    askingPrice: number | null
    estimatedARV: number | null
    zip?: string | null
sqft?: number | null
  }

  condition: {
    rehabLevel: RehabLevel
    structuralWork: StructuralWork
    systemsTouched: SystemTouched[]
    permitLikelihood: PermitLikelihood
  }

  unitStrategy: {
    addingUnits: AddingUnits
    dealRequiresUnits: DealRequiresUnits | null
    expansionLevel: ExpansionLevel | null
    landSignals: LandSignal[]
    unverified: UnverifiedADU
  }

  riskPosture: {
    aggressiveness: Aggressiveness
    financingType: FinancingType
    contingencyIntent: ContingencyIntent
    walkAwaySensitivity: WalkAwaySensitivity
  }

  offerIntent: {
    offerRangeLow: number | null
    offerRangeHigh: number | null
    closeSpeed: CloseSpeed
    inspectionIntended: boolean
    inspectionDays: number | null
    sellerCreditsRequested: boolean
    sellerCreditsAmount: number | null
  }
}

export interface UnverifiedADU {
  zoningDesignation: string
  maxUnitsAllowed: string
  approvalPath: ApprovalPath
  knownConstraints: string
  verificationSource: string
}

// ─── Risk & Diagnostics ──────────────────────────────────────────────────────

export interface RiskFlag {
  id: string
  severity: FlagSeverity
  category: FlagCategory
  headline: string
  explanation: string
  dependency?: string
  clearedBy?: string
  unverifiedAssumption: boolean
  suppressedByAggressiveness?: boolean
}

export interface DerivedResults {
  flags: RiskFlag[]
  signal: Signal
  dependencies: string[]
  unverifiedAssumptions: string[]
}

// ─── Investor-Grade Rehab Detail (Inputs, v1) ────────────────────────────────

export interface RehabSystems {
  roof: "none" | "repair" | "replace" | "unknown"
  electrical: "none" | "panel" | "partial" | "full" | "unknown"
  plumbing: "none" | "fixtures" | "partial" | "full" | "unknown"
  foundation: "none" | "minor" | "major" | "unknown"
}

export interface ExteriorRisks {
  driveway: boolean
  gradingOrSlope: boolean
  retainingWalls: boolean
  soilOrDrainage: boolean
  unknown: boolean
}

export interface RehabScope {
  kitchen: "none" | "cosmetic" | "reconfigure" | "full" | "unknown"
  bathsCount: number | null
  bathsScope: "cosmetic" | "full" | "unknown"
  systems: RehabSystems
  exterior: ExteriorRisks
  permitRisk: "low" | "medium" | "high" | "unknown"
}

// ─── Step 6: Investor Decision Outputs (Read-Only) ───────────────────────────

export interface RehabRange {
  low: number
  high: number
}

export interface IRRCase {
  worst: number
  base: number
  best: number
}

export type ExitType = "sell" | "hold"

export interface ExitPathIRR {
  exitType: ExitType
  irr: IRRCase
}

export interface InvestorStep6Outputs {
  rehabRange: RehabRange

  // Peak cash exposure across the deal lifecycle
  capitalAtRisk: number

  // Deal-level IRR (strategy-agnostic anchor)
  dealIRR: IRRCase

  // Exit-specific comparisons
  exitPaths: {
    sell: ExitPathIRR
    hold: ExitPathIRR
  }
}