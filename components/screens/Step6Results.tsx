"use client";

type Results = {
  rehabRange: { low: number; high: number };
  capitalAtRisk: number;
  dealIRR: { base: number };
  exitPaths: {
    sell: { irr: { base: number } };
    hold: { irr: { base: number } };
  };
};

export function Step6Results({
  results,
  onReset,
}: {
  results: Results;
  onReset: () => void;
}) {
  if (!results) {
    return <div className="p-6">No results yet</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-white border rounded-xl">
      <h2 className="text-xl font-bold">Deal Results</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <div className="text-sm text-slate-500">Rehab Range</div>
          <div className="text-lg font-semibold">
            ${results.rehabRange.low.toLocaleString()} – $
            {results.rehabRange.high.toLocaleString()}
          </div>
        </div>

        <div className="border p-4 rounded">
          <div className="text-sm text-slate-500">Capital at Risk</div>
          <div className="text-lg font-semibold">
            ${results.capitalAtRisk.toLocaleString()}
          </div>
        </div>

        <div className="border p-4 rounded">
          <div className="text-sm text-slate-500">Deal IRR</div>
          <div className="text-lg font-semibold">
            {(results.dealIRR.base * 100).toFixed(1)}%
          </div>
        </div>

        <div className="border p-4 rounded">
          <div className="text-sm text-slate-500 mb-2">Exit Paths</div>
          <div className="flex justify-between">
            <span>Sell</span>
            <span>{(results.exitPaths.sell.irr.base * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Hold</span>
            <span>{(results.exitPaths.hold.irr.base * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="text-sm text-slate-500 underline"
      >
        Review or change inputs
      </button>
    </div>
  );
}