"use client";

import React, { useState, useMemo } from "react";
type Tier = "Low" | "Mid" | "High";

// ── Phase 2: AI Cost Analysis ──────────────────────────────────────────────
const ANTHROPIC_API_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY; 

// ── Opportunity Zone ZIP Lookup ────────────────────────────────────────────
// Source: IRS Notice 2018-48 · California designated QOZ census tracts
// Mapped to 3-digit ZIP prefixes for market-level detection
// Full tract data: dof.ca.gov/forecasting/demographics/california-opportunity-zones
const OZ_ZIP_PREFIXES = new Set([
  // Los Angeles County OZ areas
  "900","901","902","903","904","905","906","907","908","910","911","912",
  "913","914","915","916","917","918",
  // San Diego County OZ areas

  "921","922",
  // San Francisco / Bay Area OZ areas
  "940","941","942","943","944","945","946","947","948",
  // Sacramento / Central Valley OZ areas
  "956","957","958","959","960","961",
  // Inland Empire OZ areas
  "917","918","919","920","923","924","925",
  // Fresno / Central Valley OZ areas
  "936","937","938",
  // Oakland / East Bay OZ areas
  "946","947",
  // Stockton / Modesto OZ areas
  "952","953","954","955",
  // Bakersfield OZ areas
  "932","933",
  // Long Beach OZ areas
  "907","908",
]);

// OZ market context by region
const OZ_REGION_INFO = {
  "900": "South LA / Central LA",
  "901": "Pasadena / Alhambra area",
  "902": "Compton / Watts area",
  "903": "East Los Angeles",
  "904": "Inglewood / Hawthorne area",
  "906": "East LA / Boyle Heights",
  "907": "Long Beach North",
  "908": "Long Beach South",
  "910": "Alhambra / Monterey Park",
  "921": "Central San Diego",
  "922": "Southeast San Diego / National City",
  "940": "Daly City / Colma",
  "941": "San Francisco — Bayview / Mission",
  "946": "Oakland — East / West Oakland",
  "947": "Berkeley / Emeryville",
  "956": "Sacramento North",
  "957": "Sacramento Central / South",
  "958": "Sacramento East / Rancho Cordova",
  "932": "Bakersfield Central",
  "936": "Fresno West",
  "937": "Fresno South / Southeast",
  "952": "Stockton Central",
  "953": "Modesto",
};

function getOZInfo(zipPrefix: keyof typeof OZ_REGION_INFO) {
  const inOZ = OZ_ZIP_PREFIXES.has(zipPrefix);
  const region = OZ_REGION_INFO[zipPrefix] || null;
  return { inOZ, region };
}

const ENTRY_PATHS = [
  { key: "MLS",        label: "MLS",             tag: "Listed",       discount: 0,    fee: 0,     why: "Full market price. Widest selection, most competition." },
  { key: "OFF_MARKET", label: "Off-Market",       tag: "−10%",        discount: 0.10, fee: 0,     why: "Direct outreach. Avoids competitive bidding." },
  { key: "WHOLESALER", label: "Wholesaler",        tag: "−15% + fee", discount: 0.15, fee: 10000, why: "Pre-negotiated deal. Assignment fee applies." },
  { key: "DIRECT",     label: "Direct to Seller",  tag: "−12%",       discount: 0.12, fee: 0,     why: "No agents. Seller motivation drives the discount." },
];

const ZIP_INDEX = {
  "941": { label: "San Francisco", idx: 1.35 },
  "946": { label: "Oakland",       idx: 1.15 },
  "900": { label: "Los Angeles",   idx: 1.25 },
  "921": { label: "San Diego",     idx: 1.10 },
  "958": { label: "Sacramento",    idx: 0.95 },
};

const TIER_MULT = { Low: 0.9, Mid: 1.0, High: 1.2 };
const TIER_DESC = {
  Low:  "Economy finishes, value contractors.",
  Mid:  "Standard quality, reliable trades.",
  High: "Premium materials, licensed specialists.",
};

const LINE_CATEGORIES = [
  {
    category: "Interior Finishes",
    items: [
      { key: "paint",         label: "Paint & Finishes",       basis: "sqft", low: 2.50,  mid: 3.25,  high: 4.00  },
      { key: "flooring_lvp",  label: "Flooring — LVP",         basis: "sqft", low: 5.00,  mid: 6.50,  high: 8.00  },
      { key: "flooring_tile", label: "Flooring — Tile",        basis: "sqft", low: 6.00,  mid: 9.00,  high: 14.00 },
      { key: "flooring_hard", label: "Flooring — Hardwood",    basis: "sqft", low: 8.00,  mid: 12.00, high: 18.00 },
      { key: "drywall",       label: "Drywall & Texture",      basis: "sqft", low: 1.50,  mid: 2.25,  high: 3.50  },
      { key: "trim",          label: "Trim & Baseboards",      basis: "sqft", low: 1.00,  mid: 1.75,  high: 2.75  },
      { key: "doors_int",     label: "Interior Doors",         basis: "flat", low: 1500,  mid: 3500,  high: 7000  },
      { key: "closets",       label: "Closet Build-Out",       basis: "flat", low: 800,   mid: 2000,  high: 5000  },
    ]
  },
  {
    category: "Kitchen",
    items: [
      { key: "kitchen",       label: "Kitchen Remodel",        basis: "flat", low: 8000,  mid: 22000, high: 45000 },
      { key: "cabinets",      label: "Cabinets & Hardware",    basis: "flat", low: 4000,  mid: 10000, high: 22000 },
      { key: "countertops",   label: "Countertops",            basis: "flat", low: 1500,  mid: 4000,  high: 9000  },
      { key: "appliances",    label: "Appliances (full set)",  basis: "flat", low: 2500,  mid: 5000,  high: 12000 },
      { key: "kitchen_plumb", label: "Kitchen Plumbing",       basis: "flat", low: 800,   mid: 2000,  high: 4500  },
    ]
  },
  {
    category: "Bathrooms",
    items: [
      { key: "bathroom",      label: "Bathroom Remodel",       basis: "bath", low: 8000,  mid: 15000, high: 28000 },
      { key: "bath_tile",     label: "Shower/Tub Tile",        basis: "bath", low: 1500,  mid: 3500,  high: 7000  },
      { key: "bath_vanity",   label: "Vanity & Fixtures",      basis: "bath", low: 800,   mid: 2000,  high: 5000  },
      { key: "bath_plumb",    label: "Bathroom Plumbing",      basis: "bath", low: 1200,  mid: 2500,  high: 5000  },
    ]
  },
  {
    category: "Systems",
    items: [
      { key: "electrical",    label: "Electrical",             basis: "flat", low: 3000,  mid: 7000,  high: 15000 },
      { key: "panel",         label: "Panel Upgrade",          basis: "flat", low: 2500,  mid: 4500,  high: 8000  },
      { key: "plumbing",      label: "Plumbing (main)",        basis: "flat", low: 4000,  mid: 9000,  high: 18000 },
      { key: "hvac",          label: "HVAC",                   basis: "flat", low: 7000,  mid: 12000, high: 18000 },
      { key: "water_heater",  label: "Water Heater",           basis: "flat", low: 1200,  mid: 2000,  high: 4000  },
      { key: "insulation",    label: "Insulation",             basis: "sqft", low: 1.00,  mid: 1.75,  high: 3.00  },
    ]
  },
  {
    category: "Exterior & Structure",
    items: [
      { key: "roof",          label: "Roof",                   basis: "flat", low: 9000,  mid: 14000, high: 20000 },
      { key: "windows",       label: "Windows (per unit)",     basis: "flat", low: 4000,  mid: 8000,  high: 16000 },
      { key: "doors_ext",     label: "Exterior Doors",         basis: "flat", low: 1200,  mid: 2500,  high: 5000  },
      { key: "siding",        label: "Siding / Stucco",        basis: "sqft", low: 3.00,  mid: 5.50,  high: 9.00  },
      { key: "foundation",    label: "Foundation Repair",      basis: "flat", low: 5000,  mid: 12000, high: 30000 },
      { key: "garage",        label: "Garage Door & Opener",   basis: "flat", low: 900,   mid: 1800,  high: 4000  },
    ]
  },
  {
    category: "Landscaping & Site",
    items: [
      { key: "landscape",     label: "Landscaping",            basis: "flat", low: 1500,  mid: 4000,  high: 10000 },
      { key: "concrete",      label: "Concrete / Driveway",    basis: "flat", low: 2000,  mid: 5000,  high: 10000 },
      { key: "fence",         label: "Fencing",                basis: "flat", low: 1500,  mid: 3500,  high: 7000  },
      { key: "deck",          label: "Deck / Patio",           basis: "flat", low: 3000,  mid: 8000,  high: 18000 },
    ]
  },
  {
    category: "Permits & Soft Costs",
    items: [
      { key: "permits",       label: "Permits & Fees",         basis: "flat", low: 1500,  mid: 3500,  high: 8000  },
      { key: "design",        label: "Design / Architecture",  basis: "flat", low: 0,     mid: 2500,  high: 8000  },
      { key: "cleanup",       label: "Demo & Haul Away",       basis: "flat", low: 1200,  mid: 2500,  high: 5000  },
      { key: "staging",       label: "Staging",                basis: "flat", low: 1500,  mid: 3000,  high: 6000  },
    ]
  },
];

const LINE_DEFS = LINE_CATEGORIES.flatMap(c => c.items);

const BASE_PURCHASE   = 650000;
const BASE_ARV        = 900000;
const BASE_SQFT       = 1200;
const BASE_BATHS      = 2;
const DEFAULT_AGENT_FEE   = 4.5;  // %
const DEFAULT_CLOSING_FEE = 1.5;  // %
const CONTINGENCY     = 0.15;
const HOLD_OPTIONS    = [3, 6, 9, 12, 18];

// Labor as % of total cost per LINE ITEM (remainder is materials)
// Based on actual California contractor breakdowns
const LABOR_PCT = {
  // Interior Finishes
  "paint":         0.70,  // Painting is mostly labor
  "flooring_lvp":  0.40,  // LVP is half materials
  "flooring_tile": 0.50,  // Tile is even split
  "flooring_hard": 0.35,  // Hardwood is mostly materials
  "drywall":       0.55,  // Drywall is mostly labor
  "insulation":    0.45,  // Even split
  "doors_int":     0.25,  // Doors are mostly materials
  "doors_ext":     0.20,  // Exterior doors even more materials
  "windows":       0.20,  // Windows are mostly materials
  "trim":          0.60,  // Trim is mostly labor
  "closets":       0.45,  // Even split
  // Kitchen
  "kitchen":       0.40,  // Kitchen remodel is heavy materials
  "cabinets":      0.25,  // Cabinets are mostly materials
  "countertops":   0.20,  // Countertops are mostly materials
  "appliances":    0.05,  // Appliances are almost all materials
  // Bathrooms
  "bathroom":      0.50,  // Even split
  "bath_tile":     0.60,  // Tile work is mostly labor
  "bath_vanity":   0.20,  // Vanity is mostly materials
  "bath_shower":   0.55,  // Shower is mostly labor
  // Systems
  "electrical":    0.75,  // Electrical is mostly labor
  "panel":         0.60,  // Panel is mostly labor
  "plumbing":      0.70,  // Plumbing is mostly labor
  "hvac":          0.55,  // HVAC is even-ish
  "water_heater":  0.30,  // Water heater is mostly materials
  // Exterior
  "roof":          0.50,  // Even split
  "siding":        0.45,  // Siding is even split
  "exterior_paint":0.75,  // Exterior paint is mostly labor
  "garage":        0.30,  // Garage door is mostly materials
  "concrete":      0.55,  // Concrete is mostly labor
  // Landscaping
  "landscape":     0.60,  // Landscaping is mostly labor
  "fence":         0.45,  // Fence is even split
  "deck":          0.50,  // Deck is even split
  // Permits & Soft Costs
  "permits":       0.05,  // Permits are almost all fees (materials)
  "design":        0.90,  // Design is almost all labor
  "cleanup":       0.80,  // Cleanup is almost all labor
  "staging":       0.30,  // Staging is mostly materials/furniture
};

const fmt = (n: number) => "$" + Math.round(n).toLocaleString();
const fmtP = (n: number) => (n * 100).toFixed(0) + "%";

// ── Sample Deals ────────────────────────────────────────────────────────────
const SAMPLE_DEALS = [
  {
    label: "Oakland Bungalow",
    address: "2847 Fruitvale Ave, Oakland, CA 94601",
    entryKey: "OFF_MARKET", purchaseOverride: 520000, arv: 780000,
    sqft: 1100, baths: 1, zip: "946", tier: "Mid",
    checked: ["paint","flooring_lvp","kitchen","bathroom","roof","permits","staging","contingency"],
  },
  {
    label: "LA Fixer",
    address: "1134 E 45th St, Los Angeles, CA 90011",
    entryKey: "WHOLESALER", purchaseOverride: 480000, arv: 720000,
    sqft: 1300, baths: 2, zip: "900", tier: "Low",
    checked: ["paint","flooring_lvp","drywall","kitchen","bathroom","electrical","hvac","landscape","permits","contingency"],
  },
  {
    label: "SF TIC Unit",
    address: "388 29th St, San Francisco, CA 94131",
    entryKey: "MLS", purchaseOverride: 875000, arv: 1200000,
    sqft: 1050, baths: 2, zip: "941", tier: "High",
    checked: ["paint","flooring_hard","kitchen","cabinets","countertops","bathroom","bath_tile","bath_vanity","electrical","panel","staging","permits","contingency"],
  },
  {
    label: "Sacramento Rental",
    address: "4521 Broadway, Sacramento, CA 95820",
    entryKey: "DIRECT", purchaseOverride: 310000, arv: 460000,
    sqft: 1400, baths: 2, zip: "958", tier: "Low",
    checked: ["paint","flooring_lvp","kitchen","bathroom","hvac","roof","landscape","permits","contingency"],
  },
];

function baselineCost(
  def: {
    basis: "sqft" | "bath" | "flat";
    low: number;
    mid: number;
    high: number;
  },
  tier: Tier,
  sqft: number,
  baths: number
)

{
  const rate = tier === "Low" ? def.low : tier === "Mid" ? def.mid : def.high;
  if (def.basis === "sqft") return rate * sqft;
  if (def.basis === "bath") return rate * baths;
  return rate;
}

function ScreenHdr({ sub }: { sub: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold text-gray-800 leading-snug">{sub}</h2>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  valueColor = "text-gray-900",
}: {
  label: string;
  value: string | number;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      <p className={`text-lg font-bold font-mono ${valueColor}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  sub,
  bold,
  plain,
  valueColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  bold?: boolean;
  plain?: boolean;
  valueColor?: string;
}) {
  return (
    <div className={`flex justify-between items-center px-4 py-3 ${bold ? "bg-gray-50" : "bg-white"}`}>
      <div>
        <p className={`text-sm ${bold ? "font-semibold text-gray-800" : "text-gray-500"}`}>{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <span className={`font-mono text-sm font-semibold ${valueColor ?? (plain ? "text-gray-600" : bold ? "text-gray-900" : "text-gray-700")}`}>
        {value}
      </span>
    </div>
  );
}

export default function DemoPage() {
  const [screen, setScreen] = useState(0);
  const [address, setAddress] = useState("");
  const [entryKey, setEntryKey] = useState("MLS");
  const [purchaseOverride, setPurchaseOverride] = useState(null);
  const [arv,   setArv]   = useState(BASE_ARV);
  const [sqft,  setSqft]  = useState(BASE_SQFT);
  const [baths, setBaths] = useState(BASE_BATHS);
  const [zip, setZip] = useState<keyof typeof ZIP_INDEX>("946" as keyof typeof ZIP_INDEX);
  const [tier, setTier] = useState<keyof typeof TIER_MULT>("Mid" as keyof typeof TIER_MULT);
  const [agentFee,   setAgentFee]   = useState(DEFAULT_AGENT_FEE);
  const [closingFee, setClosingFee] = useState(DEFAULT_CLOSING_FEE);

  const defaultChecked = Object.fromEntries(
    LINE_DEFS.map((d) => [d.key, ["paint", "flooring_lvp"].includes(d.key)])
  );
  defaultChecked["contingency"] = true;
  const [checked, setChecked] = useState(defaultChecked);
  const [holdMonths, setHoldMonths] = useState(6);

  function loadSample(deal: any) {
    setAddress(deal.address);
    setEntryKey(deal.entryKey);
    setPurchaseOverride(deal.purchaseOverride);
    setArv(deal.arv);
    setSqft(deal.sqft);
    setBaths(deal.baths);
    setZip(deal.zip as keyof typeof ZIP_INDEX);
    setTier(deal.tier as keyof typeof TIER_MULT);
    const newChecked = Object.fromEntries(LINE_DEFS.map(d => [d.key, deal.checked.includes(d.key)]));
    newChecked["contingency"] = deal.checked.includes("contingency");
    setChecked(newChecked);
    setScreen(4);
  }

  const entry = ENTRY_PATHS.find((e) => e.key === entryKey);

if (!entry) {
  throw new Error("Invalid entry key");
}

const adjustedPurchase = Math.round(
  BASE_PURCHASE * (1 - entry.discount) + entry.fee
);
  const finalPurchase    = purchaseOverride !== null ? purchaseOverride : adjustedPurchase;
  const zipInfo = ZIP_INDEX[zip as keyof typeof ZIP_INDEX];
  const laborMultiplier =
  zipInfo.idx * TIER_MULT[tier as keyof typeof TIER_MULT];
  const effectiveRate    = laborMultiplier;
  const sellingCost      = (agentFee + closingFee) / 100;

  const lineCalcs = useMemo(() =>
    LINE_DEFS.map((def) => {
      const base  = baselineCost(def, tier, sqft, baths);
      const total = base * laborMultiplier;
      return { ...def, base, total };
    }),
    [tier, sqft, baths, laborMultiplier]
  );

  const subtotal       = lineCalcs.filter((d) => checked[d.key]).reduce((s, d) => s + d.total, 0);
  const contingencyAmt = checked["contingency"] ? subtotal * CONTINGENCY : 0;
  const rehabCost      = subtotal + contingencyAmt;
  const totalInvested  = finalPurchase + rehabCost;
  const netProceeds    = arv * (1 - sellingCost);
  const profit         = netProceeds - totalInvested;
  const flipIRR        = totalInvested > 0 ? (profit / totalInvested) * (12 / holdMonths) * 100 : 0;

  const screens = ["Entry Path", "Basics", "Renovation", "Inventory", "Results"];
  const isLast  = screen === screens.length - 1;

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900";

  function reset() {
    setScreen(0); setAddress(""); setEntryKey("MLS"); setPurchaseOverride(null);
    setArv(BASE_ARV); setSqft(BASE_SQFT); setBaths(BASE_BATHS);
    setZip("946"); setTier("Mid"); setChecked(defaultChecked); setHoldMonths(6);
    setAgentFee(DEFAULT_AGENT_FEE); setClosingFee(DEFAULT_CLOSING_FEE);
  }

  const irrColor = flipIRR >= 25 ? "text-emerald-600" : flipIRR >= 15 ? "text-blue-600" : flipIRR >= 0 ? "text-amber-600" : "text-red-600";
  const profitColor = profit >= 0 ? "text-emerald-600" : "text-red-500";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl overflow-hidden">

        {/* Top navigation strip — always visible */}
        <div className="px-8 py-2 bg-white border-b border-gray-100 flex items-center justify-between min-h-[36px]">
          <div className="flex items-center gap-3">
            {screen > 0 ? (
              <button onClick={() => setScreen((s) => s - 1)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
                ← Back to {screens[screen - 1]}
              </button>
            ) : (
              <span className="text-xs text-gray-300">Step 1 of {screens.length}</span>
            )}
            {address && screen > 0 && <span className="text-xs text-gray-400 truncate max-w-xs">· {address}</span>}
          </div>
          {!isLast && (
            <button onClick={() => setScreen((s) => s + 1)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
              Next: {screens[screen + 1]} →
            </button>
          )}
        </div>

        <div className="px-8 pt-7 pb-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button onClick={() => setScreen(0)} className="text-left group">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors cursor-pointer">Deal Evaluator</h1>
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">California Residential · 1–4 Units</p>
            </div>
          </div>

          {/* Sample Deals */}
          {screen === 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Load a Sample Deal</p>
              <div className="flex gap-2 flex-wrap">
                {SAMPLE_DEALS.map((deal) => (
                  <button key={deal.label} onClick={() => loadSample(deal)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200 transition-all">
                    {deal.label} →
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1">
            {screens.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  i === screen ? "bg-blue-600 text-white" : i < screen ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                }`}>
                  <span className={`w-4 h-4 rounded-full text-center leading-4 text-xs ${
                    i === screen ? "bg-white text-blue-600" : i < screen ? "bg-blue-600 text-white" : "bg-gray-300 text-white"
                  }`}>{i < screen ? "✓" : i + 1}</span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < screens.length - 1 && <div className={`h-px w-3 ${i < screen ? "bg-blue-300" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-6 min-h-96 space-y-6">

          {screen === 0 && (
            <>
              <ScreenHdr sub="Evaluate a deal quickly using real acquisition assumptions." />
              <div className="grid grid-cols-2 gap-3">
                {ENTRY_PATHS.map((ep) => {
                  const adj   = Math.round(BASE_PURCHASE * (1 - ep.discount) + ep.fee);
                  const delta = adj - BASE_PURCHASE;
                  const sel   = entryKey === ep.key;
                  return (
                    <button key={ep.key}
                      onClick={() => { setEntryKey(ep.key); setPurchaseOverride(null); }}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${sel ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                      <div className="flex items-start justify-between mb-2">
                        <p className={`text-sm font-bold ${sel ? "text-blue-700" : "text-gray-900"}`}>{ep.label}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ep.discount > 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{ep.tag}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-snug mb-3">{ep.why}</p>
                      <div className="pt-2.5 border-t border-gray-100">
                        <p className="text-lg font-bold text-gray-900">{fmt(adj)}</p>
                        {delta !== 0 && <p className={`text-xs font-semibold mt-0.5 ${delta < 0 ? "text-emerald-600" : "text-red-500"}`}>{delta < 0 ? "−" : "+"}{fmt(Math.abs(delta)).replace("$", "")} vs. list</p>}
                        {delta === 0 && <p className="text-xs text-gray-400 mt-0.5">At list price</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {screen === 1 && (
            <>
              <ScreenHdr sub="Set the core numbers that drive the deal outcome." />
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Property Address</label>
                  <input type="text" className={inp} placeholder="e.g. 1234 Main St, Oakland, CA 94601"
                    value={address} onChange={(e) => setAddress(e.target.value)} />
                  <p className="text-xs text-gray-400 mt-1">Optional — appears on printed results</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Purchase Price</label>
                  <input type="number" className={inp} value={finalPurchase} onChange={(e) => setPurchaseOverride(Number(e.target.value))} />
                  <p className="text-xs text-gray-400 mt-1">
                    {entry.label} path · base {fmt(BASE_PURCHASE)}
                    {entry.discount > 0 && ` → ${fmtP(entry.discount)} discount applied`}
                    {entry.fee > 0 && ` + ${fmt(entry.fee)} fee`}
                  </p>
                  {purchaseOverride !== null && purchaseOverride !== adjustedPurchase && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">⚠ Overridden manually. Path suggested {fmt(adjustedPurchase)}.</p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">ARV ($)</label>
                    <input type="number" className={inp} value={arv} onChange={(e) => setArv(Number(e.target.value))} />
                    <p className="text-xs text-gray-400 mt-1">After-repair sale value</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Sq Ft</label>
                    <input type="number" className={inp} value={sqft} onChange={(e) => setSqft(Number(e.target.value))} />
                    <p className="text-xs text-gray-400 mt-1">Drives per-sqft costs</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Baths</label>
                    <input type="number" className={inp} value={baths} min={1} onChange={(e) => setBaths(Math.max(1, Number(e.target.value)))} />
                    <p className="text-xs text-gray-400 mt-1">Per-bath remodel cost</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Gross spread (ARV − purchase)</span>
                    <span className="font-semibold text-gray-800">{fmt(arv - finalPurchase)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {screen === 2 && (
            <>
              <ScreenHdr sub="Adjust renovation costs based on market and contractor quality." />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Market (ZIP Prefix)</label>
                  <select className={inp} value={zip} onChange={(e) => setZip(e.target.value)}>
                    <option value="941">941 — San Francisco</option>
                    <option value="946">946 — Oakland</option>
                    <option value="900">900 — Los Angeles</option>
                    <option value="921">921 — San Diego</option>
                    <option value="958">958 — Sacramento</option>
                  </select>
                  {getOZInfo(zip).inOZ && (
                    <p className="text-xs text-purple-600 font-semibold mt-1.5">⭐ Opportunity Zones present in this market</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Labor index: ×{zipInfo.idx.toFixed(2)} — {
                      zip === "941" ? "highest cost market" :
                      zip === "946" ? "mid-tier Bay Area" :
                      zip === "900" ? "high-cost SoCal market" :
                      zip === "921" ? "mid-tier SoCal market" :
                      "most competitive labor"
                    }
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contractor Grade</p>
                  <div className="flex gap-1.5">
                    {["Low", "Mid", "High"].map((t) => (
                      <button key={t} onClick={() => setTier(t)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tier === t ? "bg-blue-600 text-white shadow" : "bg-white text-gray-500 border border-gray-200 hover:border-blue-200"}`}>
                        {t}
                        <span className="block text-xs font-normal opacity-75 mt-0.5">×{TIER_MULT[t].toFixed(1)}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{TIER_DESC[tier]}</p>
                </div>
              </div>
              <div className="bg-slate-900 text-white rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Effective Labor Multiplier</p>
                  <p className="text-3xl font-bold tracking-tight">×{laborMultiplier.toFixed(3)}</p>
                  <p className="text-xs text-slate-400 mt-1">ZIP ×{zipInfo.idx.toFixed(2)} · Tier ×{TIER_MULT[tier].toFixed(1)} · Applied to all line items</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1">vs. baseline Sacramento</p>
                  <p className={`text-base font-bold ${effectiveRate > 1 ? "text-amber-400" : "text-emerald-400"}`}>
                    {effectiveRate > 1 ? "+" : ""}{((laborMultiplier - 0.95) * 100).toFixed(0)}% above low
                  </p>
                </div>
              </div>
            </>
          )}

          {screen === 3 && (
            <>
              <div className="flex items-center justify-between">
                <ScreenHdr sub="Select rehab scope and see realistic cost ranges." />
                <button onClick={() => setScreen(s => s + 1)}
                  className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                  Continue →
                </button>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-2.5 pl-4 w-8"></th>
                      <th className="py-2.5 text-left font-semibold text-gray-600">Scope</th>
                      <th className="py-2.5 pr-3 text-right font-semibold text-gray-500 text-xs">Labor</th>
                      <th className="py-2.5 pr-3 text-right font-semibold text-gray-500 text-xs">Materials</th>
                      <th className="py-2.5 pr-4 text-right font-semibold text-gray-800">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {LINE_CATEGORIES.map((cat) => (
                      <React.Fragment key={cat.category}>
                        <tr className="bg-slate-50">
                          <td colSpan={4} className="py-2 pl-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{cat.category}</td>
                        </tr>
                        {cat.items.map((d) => {
                          const calc = lineCalcs.find(c => c.key === d.key);
                          if (!calc) return null;
                          const isOn = checked[d.key];
                          const rateVal = tier === "Low" ? d.low : tier === "Mid" ? d.mid : d.high;
                          const basisLabel =
                            d.basis === "sqft" ? `$${rateVal}/sqft × ${sqft.toLocaleString()}` :
                            d.basis === "bath" ? `$${rateVal.toLocaleString()}/bath × ${baths}` : `flat`;
                          const laborPct = LABOR_PCT[d.key] ?? 0.50;
                          const laborAmt = calc.total * laborPct;
                          const materialsAmt = calc.total * (1 - laborPct);
                          return (
                            <tr key={d.key} className={`transition-colors ${isOn ? "bg-white" : "bg-gray-50 opacity-50"}`}>
                              <td className="py-3 pl-4">
                                <input type="checkbox" className="accent-blue-600 w-4 h-4 cursor-pointer"
                                  checked={isOn} onChange={(e) => setChecked((c) => ({ ...c, [d.key]: e.target.checked }))} />
                              </td>
                              <td className="py-3">
                                <p className={`font-medium ${isOn ? "text-gray-900" : "text-gray-400"}`}>{d.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{basisLabel}</p>
                              </td>
                              <td className="py-3 pr-3 text-right text-xs text-blue-600 font-mono">{fmt(laborAmt)}</td>
                              <td className="py-3 pr-3 text-right text-xs text-gray-400 font-mono">{fmt(materialsAmt)}</td>
                              <td className={`py-3 pr-4 text-right font-semibold font-mono ${isOn ? "text-gray-900" : "text-gray-400"}`}>{fmt(calc.total)}</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                <div className={`border-t-2 border-dashed border-gray-200 transition-colors ${checked["contingency"] ? "bg-amber-50" : "bg-gray-50"}`}>
                  <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="accent-amber-500 w-4 h-4"
                        checked={checked["contingency"]} onChange={(e) => setChecked((c) => ({ ...c, contingency: e.target.checked }))} />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Contingency</p>
                        <p className="text-xs text-gray-400">15% buffer on active line items</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-amber-700 font-mono">{fmt(contingencyAmt)}</span>
                  </label>
                </div>
              </div>
              <div className="bg-slate-900 text-white rounded-xl p-5">
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">Rehab Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Scope subtotal</span>
                    <span className="font-mono">{fmt(subtotal)}</span>
                  </div>
                  {checked["contingency"] && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Contingency (15%)</span>
                      <span className="font-mono text-amber-400">{fmt(contingencyAmt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold border-t border-slate-700 pt-2 mt-1">
                    <span>Total Rehab</span>
                    <span className="font-mono text-white">{fmt(rehabCost)}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">Based on regional contractor ranges · {zip} market · {tier} grade · ×{laborMultiplier.toFixed(2)} multiplier · Blue = labor · Gray = materials · Splits vary by line item</p>
              </div>
            </>
          )}

          {screen === 4 && (
            <ResultsScreen
              entry={entry} finalPurchase={finalPurchase} arv={arv}
              rehabCost={rehabCost} totalInvested={totalInvested}
              netProceeds={netProceeds} profit={profit}
              holdMonths={holdMonths} setHoldMonths={setHoldMonths}
              tier={tier} zip={zip} checked={checked}
              flipIRR={flipIRR} irrColor={irrColor} profitColor={profitColor}
              agentFee={agentFee} setAgentFee={setAgentFee}
              closingFee={closingFee} setClosingFee={setClosingFee}
              sellingCost={sellingCost} address={address}
              onReset={reset}
            />
          )}
        </div>

        <div className="flex justify-between items-center px-8 py-5 border-t border-gray-100 bg-gray-50">
          <button onClick={() => setScreen((s) => s - 1)} disabled={screen === 0}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm">
            ← Back
          </button>
          <span className="text-xs text-gray-400 font-medium">{screen + 1} of {screens.length}</span>
          {!isLast ? (
            <button onClick={() => setScreen((s) => s + 1)}
              className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
              Continue →
            </button>
          ) : (
            <button onClick={reset}
              className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-sm">
              Analyze Another Property
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Results Screen ─────────────────────────────────────────────────────────
function ResultsScreen({
  entry, finalPurchase, arv, rehabCost, totalInvested,
  netProceeds, profit, holdMonths, setHoldMonths,
  tier, zip, checked, flipIRR, irrColor, profitColor,
  agentFee, setAgentFee, closingFee, setClosingFee, sellingCost, address, onReset
}) {
  const [useLoan, setUseLoan] = useState(false);
  const [downPct, setDownPct] = useState(25);
  const [interestRate, setInterestRate] = useState(8.5);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const downAmount  = useLoan ? Math.round(finalPurchase * (downPct / 100)) : finalPurchase;
  const loanAmount  = useLoan ? finalPurchase - downAmount : 0;
  const monthlyRate = interestRate / 100 / 12;
  const holdCost    = useLoan ? loanAmount * monthlyRate * holdMonths : 0;
  const cashIn      = useLoan ? downAmount + rehabCost + holdCost : totalInvested;
  const cocReturn   = cashIn > 0 ? (profit - holdCost) / cashIn * 100 : 0;

  const mao         = arv * 0.70 - rehabCost;
  const maoGap      = finalPurchase - mao;
  const maoOk       = finalPurchase <= mao;

  const breakEvenArv  = totalInvested / (1 - sellingCost);
  const arvBuffer     = arv - breakEvenArv;
  const arvBufferPct  = arv > 0 ? (arvBuffer / arv) * 100 : 0;

  let scorePoints = 0;
  if (maoOk) scorePoints += 2; else if (maoGap < 30000) scorePoints += 1;
  if (flipIRR >= 25) scorePoints += 2; else if (flipIRR >= 15) scorePoints += 1;
  if (arvBufferPct >= 15) scorePoints += 2; else if (arvBufferPct >= 8) scorePoints += 1;
  if (profit > 50000) scorePoints += 1;

  const dealScore =
    scorePoints >= 6 ? { label: "Strong Deal",          color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", emoji: "✅", detail: "This deal checks all the key boxes. Price, margin, and return are aligned." } :
    scorePoints >= 3 ? { label: "Proceed with Caution", color: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   emoji: "⚠️", detail: "Some metrics are borderline. Review the warnings below before committing." } :
                       { label: "Walk Away",             color: "bg-red-500",     text: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",     emoji: "🚫", detail: "This deal doesn't meet key investment thresholds. The numbers don't work yet." };

  const warnings = [];
  if (!maoOk) warnings.push({ type: "danger",  msg: `Purchase price is ${fmt(maoGap)} above Maximum Allowable Offer. You're overpaying based on the 70% rule.` });
  if (arvBufferPct < 8) warnings.push({ type: "danger",  msg: `Break-even ARV is only ${fmt(arvBuffer)} below your target. Very little room if the market softens.` });
  if (flipIRR < 15) warnings.push({ type: "danger",  msg: `IRR of ${flipIRR.toFixed(1)}% is below the 15% minimum most investors require.` });
  if (maoOk && maoGap < -10000) warnings.push({ type: "success", msg: `Purchase price is ${fmt(Math.abs(maoGap))} below MAO — strong acquisition margin.` });
  if (arvBufferPct >= 15) warnings.push({ type: "success", msg: `${arvBufferPct.toFixed(0)}% ARV buffer gives solid downside protection.` });
  if (flipIRR >= 25) warnings.push({ type: "success", msg: `IRR of ${flipIRR.toFixed(1)}% exceeds the 25% strong-deal threshold.` });
  if (useLoan && holdCost > 20000) warnings.push({ type: "caution", msg: `Financing hold costs are ${fmt(holdCost)} over ${holdMonths} months. Consider a shorter hold or lower rate.` });

  const inp2 = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900";

  const activeScope = LINE_DEFS.filter(d => checked[d.key]).map(d => d.label).join(", ");
  const marketName  = ZIP_INDEX[zip]?.label || zip;

  async function runAiAnalysis() {
    setAiLoading(true);
    setAiError(null);
    setAiAnalysis(null);
    try {
      const prompt = `You are a seasoned California real estate investment advisor for a platform called Quo.

A property investor is evaluating this deal:
- Market: ${marketName} (ZIP prefix ${zip})
- Purchase Price: ${fmt(finalPurchase)}
- After Repair Value (ARV): ${fmt(arv)}
- Total Rehab Cost: ${fmt(rehabCost)}
- Total Invested: ${fmt(totalInvested)}
- Estimated Profit: ${fmt(profit)}
- Annualized IRR: ${flipIRR.toFixed(1)}%
- Hold Period: ${holdMonths} months
- Contractor Grade: ${tier}
- Financing: ${useLoan ? `Loan with ${downPct}% down at ${interestRate}%` : "All Cash"}
- Selected Scope of Work: ${activeScope || "None selected"}

Please provide a concise, expert analysis in 3 short sections:
1. **Market Context** - What should this investor know about rehab costs and deal dynamics in the ${marketName} market right now?
2. **Scope Assessment** - Based on the selected scope, what cost risks or opportunities stand out?
3. **Decision Guidance** - One clear, direct recommendation for this investor.

Keep each section to 2-3 sentences. Be direct. No fluff. Write like a trusted advisor, not a brochure.`;

   const response = await fetch("/api/analyze", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ prompt }),
});

const data = await response.json();

if (data.text) {
  setAiAnalysis(data.text);
} else {
  setAiError("No response from AI.");
}   
    
    
      
    } catch (err) {
      setAiError("Could not connect to AI. Check your API key is set correctly.");
    } finally {
      setAiLoading(false);
    }
  }

  function formatAnalysis(text) {
    return text.split("\n").filter(l => l.trim()).map((line, i) => {
      const isBold = line.startsWith("**") || line.match(/^\d\./);
      const cleaned = line.replace(/\*\*/g, "");
      return isBold
        ? <p key={i} className="text-sm font-bold text-gray-800 mt-3 mb-1">{cleaned}</p>
        : <p key={i} className="text-sm text-gray-600 leading-relaxed">{cleaned}</p>;
    });
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 leading-snug">Review returns based on your assumptions.</h2>
          {address && <p className="text-sm text-gray-500 mt-1 font-medium">📍 {address}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors border border-gray-200">
            🖨 Print
          </button>
          <button onClick={() => {
            const params = new URLSearchParams({
              a: address, p: finalPurchase, arv, sqft: 0, z: zip, t: tier,
              profit: Math.round(profit), irr: flipIRR.toFixed(1)
            });
            const url = `${window.location.origin}${window.location.pathname}?${params}`;
            navigator.clipboard.writeText(url).then(() => alert("Link copied to clipboard!"));
          }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200">
            🔗 Share
          </button>
        </div>
      </div>

      {/* Opportunity Zone Banner */}
      {(() => {
        const oz = getOZInfo(zip);
        if (!oz.inOZ) return null;
        return (
          <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">⭐</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-purple-900">Opportunity Zone Detected</p>
                  <span className="text-xs bg-purple-200 text-purple-800 font-bold px-2 py-0.5 rounded-full">Tax Advantage</span>
                </div>
                {oz.region && <p className="text-xs text-purple-700 font-medium mb-1">{oz.region}</p>}
                <p className="text-xs text-purple-700 leading-relaxed">
                  This market area contains federally designated Opportunity Zones. Investors who reinvest capital gains into a Qualified Opportunity Fund (QOF) may be eligible to <strong>defer or eliminate federal capital gains taxes</strong> on this deal.
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-2 text-center border border-purple-100">
                    <p className="text-xs font-bold text-purple-800">Defer</p>
                    <p className="text-xs text-purple-600">Capital gains until 2026</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center border border-purple-100">
                    <p className="text-xs font-bold text-purple-800">Reduce</p>
                    <p className="text-xs text-purple-600">Step-up in basis over time</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center border border-purple-100">
                    <p className="text-xs font-bold text-purple-800">Eliminate</p>
                    <p className="text-xs text-purple-600">Gains after 10-yr hold</p>
                  </div>
                </div>
                <p className="text-xs text-purple-400 mt-2">Consult a tax advisor to confirm eligibility · OZ 1.0 designations active through Dec 2028</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Deal Score */}
      <div className={`rounded-xl border-2 ${dealScore.border} ${dealScore.bg} p-5`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{dealScore.emoji}</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-0.5">Deal Score</p>
              <p className={`text-xl font-bold ${dealScore.text}`}>{dealScore.label}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < scorePoints ? dealScore.color : "bg-gray-200"}`} />
            ))}
          </div>
        </div>
        <p className={`text-sm ${dealScore.text} leading-snug`}>{dealScore.detail}</p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div key={i} className={`flex items-start gap-2 px-4 py-3 rounded-lg text-sm ${
              w.type === "danger"  ? "bg-red-50 text-red-700 border border-red-200" :
              w.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                     "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              <span className="mt-0.5 shrink-0">{w.type === "danger" ? "⚠" : w.type === "success" ? "✓" : "ℹ"}</span>
              <p>{w.msg}</p>
            </div>
          ))}
        </div>
      )}

      {/* IRR Hero */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center">
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-2">Annualized IRR</p>
        <p className={`text-6xl font-bold tracking-tight ${irrColor}`}>
          {flipIRR.toFixed(1)}<span className="text-3xl">%</span>
        </p>
        <p className="text-xs text-slate-400 mt-2">Based on {holdMonths}-month hold · simple annualization</p>
        <div className="mt-5 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 font-medium mb-3">Hold Period (months)</p>
          <div className="flex gap-2 justify-center">
            {HOLD_OPTIONS.map((m) => (
              <button key={m} onClick={() => setHoldMonths(m)}
                className={`w-10 h-9 rounded-lg text-sm font-bold transition-all ${holdMonths === m ? "bg-blue-600 text-white shadow-lg" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Financing Toggle */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Financing</p>
          <div className="flex gap-1 bg-gray-200 rounded-lg p-0.5">
            <button onClick={() => setUseLoan(false)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${!useLoan ? "bg-white text-gray-800 shadow" : "text-gray-500"}`}>
              All Cash
            </button>
            <button onClick={() => setUseLoan(true)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${useLoan ? "bg-white text-gray-800 shadow" : "text-gray-500"}`}>
              Loan
            </button>
          </div>
        </div>
        {useLoan && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Down Payment %</label>
              <input type="number" className={inp2} value={downPct} min={10} max={50}
                onChange={(e) => setDownPct(Number(e.target.value))} />
              <p className="text-xs text-gray-400 mt-1">Cash in: {fmt(downAmount)}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Interest Rate %</label>
              <input type="number" className={inp2} value={interestRate} step={0.1}
                onChange={(e) => setInterestRate(Number(e.target.value))} />
              <p className="text-xs text-gray-400 mt-1">Hold cost: {fmt(holdCost)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Max Allowable Offer</p>
          <p className={`text-lg font-bold font-mono ${maoOk ? "text-emerald-600" : "text-red-500"}`}>{fmt(mao)}</p>
          <p className={`text-xs mt-1 font-medium ${maoOk ? "text-emerald-600" : "text-red-500"}`}>
            {maoOk ? `✓ ${fmt(Math.abs(maoGap))} under MAO` : `⚠ ${fmt(maoGap)} over MAO`}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Break-Even ARV</p>
          <p className="text-lg font-bold font-mono text-gray-900">{fmt(breakEvenArv)}</p>
          <p className={`text-xs mt-1 font-medium ${arvBufferPct >= 10 ? "text-emerald-600" : "text-amber-600"}`}>
            {arvBufferPct.toFixed(0)}% buffer · {fmt(arvBuffer)} headroom
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{useLoan ? "Cash-on-Cash Return" : "Return on Investment"}</p>
          <p className={`text-lg font-bold font-mono ${cocReturn >= 15 ? "text-emerald-600" : cocReturn >= 8 ? "text-amber-600" : "text-red-500"}`}>
            {cocReturn.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">{useLoan ? `On ${fmt(cashIn)} cash deployed` : "Total capital deployed"}</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Est. Profit</p>
          <p className={`text-lg font-bold font-mono ${profitColor}`}>{fmt(profit)}</p>
          <p className="text-xs text-gray-400 mt-1">{holdMonths}-mo hold · net of selling costs</p>
        </div>
      </div>

      {/* Selling Costs */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-700">Selling Costs</p>
            <p className="text-xs text-gray-400 mt-0.5">Adjust fees to match your market and deal structure</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-sm font-bold text-gray-800">{((agentFee + closingFee)).toFixed(1)}% · {fmt(arv * sellingCost)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Agent Fees %</label>
            <input type="number" className={inp2} value={agentFee} step={0.25} min={0} max={10}
              onChange={(e) => setAgentFee(Number(e.target.value))} />
            <p className="text-xs text-gray-400 mt-1">Buyer + seller agent · {fmt(arv * agentFee / 100)}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Closing Fees %</label>
            <input type="number" className={inp2} value={closingFee} step={0.25} min={0} max={5}
              onChange={(e) => setClosingFee(Number(e.target.value))} />
            <p className="text-xs text-gray-400 mt-1">Title, escrow, transfer · {fmt(arv * closingFee / 100)}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Agent fees ({agentFee}%)</span>
            <span className="font-mono">{fmt(arv * agentFee / 100)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Closing fees ({closingFee}%)</span>
            <span className="font-mono">{fmt(arv * closingFee / 100)}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-gray-700 pt-1 border-t border-gray-200">
            <span>Total selling costs</span>
            <span className="font-mono">{fmt(arv * sellingCost)}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-gray-700">
            <span>Net proceeds after costs</span>
            <span className="font-mono text-emerald-600">{fmt(netProceeds)}</span>
          </div>
        </div>
      </div>

      {/* Deal Breakdown */}
      <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
        <SummaryRow label="Acquisition"   value={`${entry.label}${entry.discount > 0 ? ` · −${fmtP(entry.discount)}` : ""}${entry.fee > 0 ? ` + ${fmt(entry.fee)} fee` : ""}`} plain />
        <SummaryRow label="Purchase Price" value={fmt(finalPurchase)} />
        {useLoan && <SummaryRow label="Loan Amount" value={fmt(loanAmount)} sub={`${interestRate}% · ${holdMonths}-mo hold cost ${fmt(holdCost)}`} />}
        <SummaryRow label="Rehab"          value={fmt(rehabCost)} />
        <SummaryRow label="Total Invested" value={fmt(totalInvested)} bold />
        <SummaryRow label="Net Proceeds"   value={fmt(netProceeds)} sub={`ARV ${fmt(arv)} − ${(sellingCost*100).toFixed(1)}% selling costs`} />
        <SummaryRow label="Profit"         value={fmt(profit)} bold valueColor={profitColor} />
      </div>

      {/* AI Analysis */}
      <div className="rounded-xl border-2 border-blue-200 bg-blue-50 overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-0.5">Quo AI Advisor</p>
            <p className="text-sm font-semibold text-blue-900">Get a live deal analysis from AI</p>
            <p className="text-xs text-blue-500 mt-0.5">Powered by Claude · Market-aware · {marketName} specific</p>
          </div>
          <button
            onClick={runAiAnalysis}
            disabled={aiLoading}
            className="ml-4 shrink-0 px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {aiLoading ? "Analyzing..." : aiAnalysis ? "Re-analyze" : "Analyze Deal →"}
          </button>
        </div>

        {aiLoading && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Reviewing your deal assumptions...
            </div>
          </div>
        )}

        {aiError && (
          <div className="px-5 pb-4">
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">⚠ {aiError}</p>
          </div>
        )}

        {aiAnalysis && !aiLoading && (
          <div className="px-5 pb-5 border-t border-blue-200 mt-1 pt-4">
            {formatAnalysis(aiAnalysis)}
            <p className="text-xs text-blue-400 mt-4">Analysis based on your current inputs · Refresh after changing assumptions</p>
          </div>
        )}
      </div>

      {/* Primary action buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <a
          href={`https://quo-os.vercel.app/offer-blueprint?address=${encodeURIComponent(address || "")}&module_type=fix_flip`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white text-center shadow-md transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#155EEF" }}
        >
          Proceed to Offer Blueprint →
        </a>
        <button
          onClick={onReset}
          className="w-full py-3 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Analyze Another Property
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        {holdMonths}-month hold · {(sellingCost*100).toFixed(1)}% selling costs ({agentFee}% agent + {closingFee}% closing) · {checked["contingency"] ? "15% contingency included" : "no contingency"} · {tier.toLowerCase()} contractor grade · {useLoan ? `${downPct}% down` : "all cash"}
      </p>
    </>
  );
}
