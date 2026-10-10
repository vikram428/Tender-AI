import React from 'react';
import { useTender } from '../context/TenderContext';
import { formatCurrency } from '../utils/calculations';
import { GitCompare, Check, AlertTriangle, ShieldCheck, X } from 'lucide-react';

export const TenderComparison: React.FC = () => {
  const { tenders, comparisonSelectedIds, toggleComparisonTender, setCurrentPage } = useTender();

  const selectedTenders = tenders.filter(t => comparisonSelectedIds.includes(t.id));

  if (tenders.length < 2) {
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>PORTFOLIO BID BENCHMARKING</span>
            <span className="text-slate-600">/</span>
            <span>SIDE-BY-SIDE MATRIX</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Tender Comparison & Feasibility Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Contrast financial outlays, defect liability periods, escalation clauses, and liquidated damages across multiple active tender notices.
          </p>
        </div>

        <div className="p-12 text-center border border-dashed border-slate-800 rounded-lg bg-[#0F1726]/40">
          <GitCompare className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">
            {tenders.length === 0 ? 'No Tenders in Workspace' : 'Upload Another Tender to Compare'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Comparative analysis benchmarks two or more civil tenders side-by-side on ECPT, EMD %, completion timeframe, and GCC penalties.
          </p>
          <button
            onClick={() => setCurrentPage('upload')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
          >
            <span>Upload Tender Document</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>PORTFOLIO BID BENCHMARKING</span>
          <span className="text-slate-600">/</span>
          <span>SIDE-BY-SIDE MATRIX</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          Tender Comparison & Feasibility Matrix
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Contrast financial outlays, defect liability periods, escalation clauses, and liquidated damages across multiple active tender notices.
        </p>
      </div>

      {/* Tender Selection Chips */}
      <div className="p-3 bg-[#0E1726] border border-slate-800 rounded-lg space-y-2">
        <span className="text-[11px] font-mono text-slate-400 block">
          SELECT TENDERS TO COMPARE (SELECT 2 OR MORE):
        </span>
        <div className="flex flex-wrap gap-2">
          {tenders.map((t) => {
            const isChecked = comparisonSelectedIds.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleComparisonTender(t.id)}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors flex items-center gap-2 ${
                  isChecked
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{t.authority}: {t.nitNumber}</span>
                {isChecked ? <Check className="w-3.5 h-3.5" /> : <span className="text-slate-600">+</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparative Table */}
      <div className="border border-slate-800 rounded-lg bg-[#0E1726] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono">
              <th className="py-3 px-4 w-52 font-normal">PARAMETER</th>
              {selectedTenders.map(t => (
                <th key={t.id} className="py-3 px-4 min-w-[260px] font-semibold text-slate-200">
                  <div className="text-amber-400 font-mono text-xs">{t.authority}</div>
                  <div className="truncate text-slate-100 mt-0.5">{t.nitNumber}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">
            {/* Title */}
            <tr>
              <td className="py-2.5 px-4 font-mono text-slate-400 bg-slate-900/30">Work Description</td>
              {selectedTenders.map(t => (
                <td key={t.id} className="py-2.5 px-4 text-xs font-medium text-slate-200">
                  {t.title}
                </td>
              ))}
            </tr>

            {/* Estimated Cost */}
            <tr>
              <td className="py-2.5 px-4 font-mono text-slate-400 bg-slate-900/30">Estimated Cost (ECPT)</td>
              {selectedTenders.map(t => (
                <td key={t.id} className="py-2.5 px-4 font-mono font-bold text-amber-400 text-sm tabular-nums">
                  {formatCurrency(t.estimatedCost, t.currency)}
                </td>
              ))}
            </tr>

            {/* EMD */}
            <tr>
              <td className="py-2.5 px-4 font-mono text-slate-400 bg-slate-900/30">Earnest Money (EMD)</td>
              {selectedTenders.map(t => (
                <td key={t.id} className="py-2.5 px-4 font-mono text-emerald-400 font-semibold tabular-nums">
                  {formatCurrency(t.emdAmount, t.currency)} ({((t.emdAmount / t.estimatedCost) * 100).toFixed(1)}%)
                </td>
              ))}
            </tr>

            {/* Completion Period */}
            <tr>
              <td className="py-2.5 px-4 font-mono text-slate-400 bg-slate-900/30">Completion Period</td>
              {selectedTenders.map(t => (
                <td key={t.id} className="py-2.5 px-4 font-mono text-slate-200">
                  {t.completionPeriodMonths} Months ({(t.completionPeriodMonths * 30.5).toFixed(0)} Days)
                </td>
              ))}
            </tr>

            {/* Defect Liability */}
            <tr>
              <td className="py-2.5 px-4 font-mono text-slate-400 bg-slate-900/30">Defect Liability Period (DLP)</td>
              {selectedTenders.map(t => (
                <td key={t.id} className="py-2.5 px-4 font-mono text-slate-200">
                  {t.defectLiabilityMonths} Months ({(t.defectLiabilityMonths / 12).toFixed(1)} Years)
                </td>
              ))}
            </tr>

            {/* Liquidated Damages */}
            <tr>
              <td className="py-2.5 px-4 font-mono text-slate-400 bg-slate-900/30">Liquidated Damages (LD)</td>
              {selectedTenders.map(t => {
                const ldClause = t.clauses.find(c => c.type === 'liquidated_damages');
                return (
                  <td key={t.id} className="py-2.5 px-4 text-xs font-mono text-rose-400">
                    {ldClause ? ldClause.summary : 'Standard GCC applies (Max 10%)'}
                  </td>
                );
              })}
            </tr>

            {/* Price Escalation */}
            <tr>
              <td className="py-2.5 px-4 font-mono text-slate-400 bg-slate-900/30">Price Escalation (10CA / 10CC)</td>
              {selectedTenders.map(t => {
                const hasEsc = t.clauses.some(c => c.type === 'price_escalation');
                return (
                  <td key={t.id} className="py-2.5 px-4 font-mono text-xs">
                    {hasEsc ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Applicable (RBI Index)
                      </span>
                    ) : (
                      <span className="text-slate-500">Fixed Rate / No Escalation</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Submission Deadline */}
            <tr>
              <td className="py-2.5 px-4 font-mono text-slate-400 bg-slate-900/30">Submission Deadline</td>
              {selectedTenders.map(t => (
                <td key={t.id} className="py-2.5 px-4 font-mono text-cyan-400">
                  {t.submissionDeadline}
                </td>
              ))}
            </tr>

            {/* Total BOQ Items */}
            <tr>
              <td className="py-2.5 px-4 font-mono text-slate-400 bg-slate-900/30">BOQ Line Items Count</td>
              {selectedTenders.map(t => (
                <td key={t.id} className="py-2.5 px-4 font-mono text-slate-200 tabular-nums">
                  {t.boqItems.length} Extracted items
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
