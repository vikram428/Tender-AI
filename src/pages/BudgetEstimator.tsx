import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { calculateBudgetBreakdown, calculateBidCapacity, formatCurrency } from '../utils/calculations';
import { EmptyState } from '../components/common/EmptyState';
import {
  Calculator,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  TrendingUp,
  Landmark
} from 'lucide-react';

export const BudgetEstimator: React.FC = () => {
  const { activeTender, settings, setCurrentPage } = useTender();

  // Cost split sliders
  const [materialRatio, setMaterialRatio] = useState<number>(58);
  const [laborRatio, setLaborRatio] = useState<number>(24);
  const [machineryRatio, setMachineryRatio] = useState<number>(10);
  const [overheadRatio, setOverheadRatio] = useState<number>(8);

  const [contingencyPct, setContingencyPct] = useState<number>(settings.defaultContingencyPercent || 3.5);
  const [marginPct, setMarginPct] = useState<number>(settings.defaultMarginPercent || 10.0);
  const [gstPct, setGstPct] = useState<number>(settings.defaultGstPercent || 18.0);

  // Bid Capacity Parameters
  const [turnoverA, setTurnoverA] = useState<number>(settings.turnoverLast3YearsAvg || 585000000); // 58.5 Cr
  const [commitmentsB, setCommitmentsB] = useState<number>(120000000); // 12 Cr ongoing commitments

  if (!activeTender) {
    return (
      <EmptyState
        title="No Tender Selected for Estimation"
        description="Select an active tender from your workspace or upload a new tender to run civil rate analyses and quote forecasting."
        actionLabel="Upload New Tender"
        onAction={() => setCurrentPage('upload')}
      />
    );
  }

  const boqItems = activeTender.boqItems || [];
  
  // Deterministic calculation
  const breakdown = calculateBudgetBreakdown(
    boqItems,
    materialRatio / 100,
    laborRatio / 100,
    machineryRatio / 100,
    overheadRatio / 100,
    contingencyPct,
    marginPct,
    gstPct
  );

  // Estimated vs Quoted variance
  const costDelta = breakdown.finalBidAmount - activeTender.estimatedCost;
  const variancePercent = activeTender.estimatedCost > 0 
    ? (costDelta / activeTender.estimatedCost) * 100 
    : 0;

  // Bid Capacity Check
  const capacityCheck = calculateBidCapacity(
    turnoverA,
    activeTender.completionPeriodMonths,
    commitmentsB
  );
  const hasSufficientCapacity = capacityCheck.availableCapacity >= activeTender.estimatedCost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>DETERMINISTIC RATE ANALYSIS</span>
          <span className="text-slate-600">/</span>
          <span>{activeTender.nitNumber}</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          Construction Budget Estimator & Quote Modeler
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Compute direct material/labor/machinery costs, add site contingency reserves, contractor profit margins, and GST to derive optimal tender quotation.
        </p>
      </div>

      {/* Top Level Summary Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0E1726] border border-slate-800 rounded-lg">
          <span className="text-xs font-mono text-slate-400 block mb-1">DIRECT WORKS SUB-TOTAL</span>
          <span className="text-xl font-bold font-mono text-slate-200 tabular-nums">
            {formatCurrency(breakdown.subtotalDirect, activeTender.currency)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Calculated from {boqItems.length} BOQ items</span>
        </div>

        <div className="p-4 bg-[#0E1726] border border-slate-800 rounded-lg">
          <span className="text-xs font-mono text-slate-400 block mb-1">CONTRACTOR MARGIN</span>
          <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
            {formatCurrency(breakdown.contractorMarginAmount, activeTender.currency)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">At {marginPct.toFixed(1)}% gross margin</span>
        </div>

        <div className="p-4 bg-[#0E1726] border border-slate-800 rounded-lg">
          <span className="text-xs font-mono text-slate-400 block mb-1">ESTIMATED BID PRICE</span>
          <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            {formatCurrency(breakdown.finalBidAmount, activeTender.currency)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Inclusive of {gstPct}% GST</span>
        </div>

        <div className="p-4 bg-[#0E1726] border border-slate-800 rounded-lg">
          <span className="text-xs font-mono text-slate-400 block mb-1">VARIANCE VS TENDER ECPT</span>
          <span className={`text-xl font-bold font-mono tabular-nums ${variancePercent > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {variancePercent >= 0 ? `+${variancePercent.toFixed(2)}%` : `${variancePercent.toFixed(2)}%`}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {variancePercent >= 0 ? 'Above departmental rate' : 'Below departmental rate'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Financial Breakdown Table */}
        <div className="lg:col-span-7 border border-slate-800 rounded-lg bg-[#0E1726] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 pb-2 border-b border-slate-800 flex items-center justify-between">
            <span>Deterministic Cost Layer Breakdown</span>
            <span className="text-xs font-mono text-slate-400">IS-1200 Standards</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <div>
                <span className="text-slate-300 font-medium">1. Material Supplies</span>
                <span className="text-slate-500 block text-[11px]">Cement, Steel, Aggregates, Sand, Bricks ({materialRatio}%)</span>
              </div>
              <span className="font-mono text-slate-200 tabular-nums">{formatCurrency(breakdown.materialCost, activeTender.currency)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <div>
                <span className="text-slate-300 font-medium">2. Direct Skilled & Unskilled Labor</span>
                <span className="text-slate-500 block text-[11px]">Masons, Fitters, Helpers, Site supervisors ({laborRatio}%)</span>
              </div>
              <span className="font-mono text-slate-200 tabular-nums">{formatCurrency(breakdown.laborCost, activeTender.currency)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <div>
                <span className="text-slate-300 font-medium">3. Machinery, Plant & Fuel (POL)</span>
                <span className="text-slate-500 block text-[11px]">Excavators, Batching plants, Cranes, Transit mixers ({machineryRatio}%)</span>
              </div>
              <span className="font-mono text-slate-200 tabular-nums">{formatCurrency(breakdown.machineryCost, activeTender.currency)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <div>
                <span className="text-slate-300 font-medium">4. Site Overheads & Quality Testing</span>
                <span className="text-slate-500 block text-[11px]">Site office, power, water, lab testing, insurance ({overheadRatio}%)</span>
              </div>
              <span className="font-mono text-slate-200 tabular-nums">{formatCurrency(breakdown.overheadCost, activeTender.currency)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-800/60 bg-slate-900/40 px-2 rounded">
              <span className="text-slate-400 font-mono">SUB-TOTAL DIRECT WORKS</span>
              <span className="font-mono text-slate-100 font-semibold tabular-nums">{formatCurrency(breakdown.subtotalDirect, activeTender.currency)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <div>
                <span className="text-slate-300 font-medium">5. Contingency & Unforeseen Works</span>
                <span className="text-slate-500 block text-[11px]">Unforeseen geotechnical / subsoil risks ({contingencyPct}%)</span>
              </div>
              <span className="font-mono text-slate-300 tabular-nums">{formatCurrency(breakdown.contingencyAmount, activeTender.currency)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <div>
                <span className="text-slate-300 font-medium">6. Contractor Profit & Corporate Overheads</span>
                <span className="text-slate-500 block text-[11px]">Target operational margin ({marginPct}%)</span>
              </div>
              <span className="font-mono text-cyan-400 font-semibold tabular-nums">{formatCurrency(breakdown.contractorMarginAmount, activeTender.currency)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <div>
                <span className="text-slate-300 font-medium">7. Goods & Services Tax (GST)</span>
                <span className="text-slate-500 block text-[11px]">Statutory construction services tax ({gstPct}%)</span>
              </div>
              <span className="font-mono text-slate-300 tabular-nums">{formatCurrency(breakdown.gstAmount, activeTender.currency)}</span>
            </div>

            <div className="flex justify-between items-center py-3 bg-amber-400/10 border border-amber-400/30 px-3 rounded text-sm">
              <span className="text-amber-300 font-bold font-mono">TOTAL ESTIMATED BID PROPOSAL</span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">{formatCurrency(breakdown.finalBidAmount, activeTender.currency)}</span>
            </div>
          </div>
        </div>

        {/* Right: Parameter Controls & Bid Capacity Calculator */}
        <div className="lg:col-span-5 space-y-4">
          {/* Controls Box */}
          <div className="border border-slate-800 rounded-lg bg-[#0E1726] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Adjustment Sliders</span>
              <button 
                onClick={() => {
                  setMaterialRatio(58);
                  setLaborRatio(24);
                  setMachineryRatio(10);
                  setOverheadRatio(8);
                  setContingencyPct(3.5);
                  setMarginPct(10.0);
                }}
                className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-mono text-slate-300 mb-1">
                  <span>Contingency Reserve:</span>
                  <span className="text-amber-400">{contingencyPct}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={contingencyPct}
                  onChange={(e) => setContingencyPct(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono text-slate-300 mb-1">
                  <span>Contractor Margin:</span>
                  <span className="text-cyan-400">{marginPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="0.5"
                  value={marginPct}
                  onChange={(e) => setMarginPct(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono text-slate-300 mb-1">
                  <span>Applicable GST Rate:</span>
                  <span className="text-slate-300">{gstPct}%</span>
                </div>
                <select
                  value={gstPct}
                  onChange={(e) => setGstPct(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-xs text-slate-200"
                >
                  <option value={18}>18% (Standard Works Contract)</option>
                  <option value={12}>12% (Affordable Housing / Metro Concession)</option>
                  <option value={0}>0% (Exempt Works)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Bid Capacity Calculator */}
          <div className="border border-slate-800 rounded-lg bg-[#0E1726] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-slate-100">
                  CPWD / NHAI Bid Capacity Checker
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Formula: (2 × A × N) - B</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  A: Max Annual Turnover in Last 5 Years (₹)
                </label>
                <input
                  type="number"
                  value={turnoverA}
                  onChange={(e) => setTurnoverA(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  N: Project Duration (Years) = {activeTender.completionPeriodMonths} Months / 12 = {(activeTender.completionPeriodMonths / 12).toFixed(2)} Yrs
                </label>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  B: Value of Existing Commitments (₹)
                </label>
                <input
                  type="number"
                  value={commitmentsB}
                  onChange={(e) => setCommitmentsB(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200"
                />
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 text-[11px] font-mono">Available Capacity:</span>
                  <span className="font-mono font-bold text-slate-100 text-sm tabular-nums">
                    {formatCurrency(capacityCheck.availableCapacity, 'INR')}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {hasSufficientCapacity ? (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>BID CAPACITY QUALIFIED ({`>`} Tender ECPT)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-rose-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>INSUFFICIENT BID CAPACITY (Joint Venture Recommended)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
