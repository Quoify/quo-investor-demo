"use client";

import { QuoDeal, PropertyType, Strategy, PurchaseContext } from "@/lib/types";
import { StepShell } from "@/components/ui/StepShell";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { NumberInput } from "@/components/ui/NumberInput";

const SUPPORTED_MARKETS = [
  { prefix: "900", label: "Los Angeles" },
  { prefix: "902", label: "Compton / South LA" },
  { prefix: "904", label: "Inglewood" },
  { prefix: "907", label: "Long Beach" },
  { prefix: "910", label: "Pasadena / Alhambra" },
  { prefix: "913", label: "San Fernando Valley" },
  { prefix: "917", label: "San Bernardino" },
  { prefix: "919", label: "San Diego North" },
  { prefix: "920", label: "San Diego East" },
  { prefix: "921", label: "San Diego Central" },
  { prefix: "923", label: "Inland Empire East" },
  { prefix: "925", label: "Riverside" },
  { prefix: "930", label: "Ventura County" },
  { prefix: "931", label: "Santa Barbara" },
  { prefix: "932", label: "Bakersfield" },
  { prefix: "934", label: "San Luis Obispo" },
  { prefix: "936", label: "Fresno" },
  { prefix: "937", label: "Fresno South" },
  { prefix: "939", label: "Monterey" },
  { prefix: "940", label: "Peninsula / Daly City" },
  { prefix: "941", label: "San Francisco" },
  { prefix: "945", label: "East Bay / Fremont" },
  { prefix: "946", label: "Oakland" },
  { prefix: "949", label: "Marin County" },
  { prefix: "950", label: "San Jose" },
  { prefix: "951", label: "San Jose South" },
  { prefix: "952", label: "Stockton" },
  { prefix: "953", label: "Modesto" },
  { prefix: "954", label: "Sonoma County" },
  { prefix: "956", label: "Sacramento North" },
  { prefix: "957", label: "Sacramento Central" },
  { prefix: "958", label: "Sacramento East" },
  { prefix: "959", label: "Chico / Yuba City" },
  { prefix: "960", label: "Redding" },
  { prefix: "966", label: "Placer County" },
];

const CA_COUNTIES = [
  "Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa",
  "Contra Costa", "Del Norte", "El Dorado", "Fresno", "Glenn", "Humboldt",
  "Imperial", "Inyo", "Kern", "Kings", "Lake", "Lassen", "Los Angeles",
  "Madera", "Marin", "Mariposa", "Mendocino", "Merced", "Modoc", "Mono",
  "Monterey", "Napa", "Nevada", "Orange", "Placer", "Plumas", "Riverside",
  "Sacramento", "San Benito", "San Bernardino", "San Diego", "San Francisco",
  "San Joaquin", "San Luis Obispo", "San Mateo", "Santa Barbara",
  "Santa Clara", "Santa Cruz", "Shasta", "Sierra", "Siskiyou", "Solano",
  "Sonoma", "Stanislaus", "Sutter", "Tehama", "Trinity", "Tulare",
  "Tuolumne", "Ventura", "Yolo", "Yuba",
];

interface Step1Props {
  deal: QuoDeal;
  dispatch: React.Dispatch<{ type: "SET_BASICS"; payload: Partial<QuoDeal["basics"]> }>;
  onContinue: () => void;
}

export function Step1Basics({ deal, dispatch, onContinue }: Step1Props) {
  const { basics } = deal;

  const isComplete = basics.city.trim() !== "" && basics.county !== "";

  function update(payload: Partial<QuoDeal["basics"]>) {
    dispatch({ type: "SET_BASICS", payload });
  }

  return (
    <StepShell
      title="What kind of deal is this?"
      subtitle="Set the basics. You can change any of these later."
      onContinue={onContinue}
      continueDisabled={!isComplete}
    >
      {/* Property type */}
      <ToggleGroup<PropertyType>
        label="Property type"
        options={[
          { value: "sfr", label: "Single Family" },
          { value: "duplex", label: "Duplex" },
          { value: "triplex", label: "Triplex" },
          { value: "fourplex", label: "Fourplex" },
        ]}
        value={basics.propertyType}
        onChange={(v) => update({ propertyType: v })}
      />

      {/* Location */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Location</p>
        <div className="flex gap-3 flex-wrap">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">City</label>
            <input
              type="text"
              value={basics.city}
              onChange={(e) => update({ city: e.target.value })}
              placeholder="e.g. Long Beach"
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 w-48"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">County</label>
            <select
              value={basics.county}
              onChange={(e) => update({ county: e.target.value })}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 w-48"
            >
              <option value="">Select county</option>
              {CA_COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Strategy */}
      <ToggleGroup<Strategy>
        label="Your strategy"
        helpText="How are you planning to exit or hold this deal?"
        options={[
          { value: "flip", label: "Flip", description: "sell after rehab" },
          { value: "brrr", label: "BRRR", description: "buy, rehab, rent, refi" },
          { value: "hold", label: "Hold", description: "keep as rental" },
        ]}
        value={basics.strategy}
        onChange={(v) => update({ strategy: v })}
      />

      {/* Purchase context */}
      <ToggleGroup<PurchaseContext>
        label="How did you find this deal?"
        options={[
          { value: "on-market", label: "On-market (MLS)" },
          { value: "off-market", label: "Off-market" },
          { value: "wholesale", label: "Wholesale" },
          { value: "auction", label: "Auction" },
          { value: "other", label: "Other" },
        ]}
        value={basics.purchaseContext}
        onChange={(v) => update({ purchaseContext: v })}
      />

      {/* Financial inputs — optional */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-slate-700">
          Pricing estimates{" "}
          <span className="text-xs font-normal text-slate-400">optional — but required for full flag analysis</span>
        </p>
        <div className="flex gap-6 flex-wrap pt-1">
          <NumberInput
            label="Asking price"
            value={basics.askingPrice}
            onChange={(v) => update({ askingPrice: v })}
            prefix="$"
            placeholder="0"
            min={0}
            optional
          />
          <NumberInput
            label="Estimated ARV"
            helpText="What's it worth after full repair?"
            value={basics.estimatedARV}
            onChange={(v) => update({ estimatedARV: v })}
            prefix="$"
            placeholder="0"
            min={0}
            optional
          />
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Market (ZIP prefix)</label>
            <select
              value={basics.zip ?? ""}
              onChange={(e) => update({ zip: e.target.value })}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 w-48"
            >
              <option value="">Select market</option>
              {SUPPORTED_MARKETS.map((m) => (
                <option key={m.prefix} value={m.prefix}>
                  {m.prefix} — {m.label}
                </option>
              ))}
            </select>
          </div>
         
<label>Square Footage</label>
<input
  type="number"
  value={basics.sqft ?? 0}
  onChange={(e) => update({ sqft: Number(e.target.value) })}
/>
   
        </div>
      </div>
    </StepShell>
  );
}
