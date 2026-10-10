import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { ContractClause, ClauseType } from '../types/tender';
import { formatCurrency } from '../utils/calculations';
import { EmptyState } from '../components/common/EmptyState';
import {
  Scale,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  FileText,
  Sliders,
  DollarSign
} from 'lucide-react';

export const ClauseExplorer: React.FC = () => {
  const { activeTender, setCurrentPage } = useTender();

  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [clauseSearch, setClauseSearch] = useState<string>('');
  const [selectedClause, setSelectedClause] = useState<ContractClause | null>(null);

  // Liquidated Damages Simulator State
  const [delayedWeeks, setDelayedWeeks] = useState<number>(4);

  if (!activeTender) {
    return (
      <EmptyState
        title="No Active Tender in Workspace"
        description="Select a tender to audit contract clauses, or upload your first tender document."
        actionLabel="Upload New Tender"
        onAction={() => setCurrentPage('upload')}
      />
    );
  }

  const clauses = activeTender.clauses || [];

  const filteredClauses = clauses.filter((c) => {
    const matchesRisk = selectedRisk === 'all' || c.riskLevel === selectedRisk;
    const q = clauseSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      c.title.toLowerCase().includes(q) ||
      c.articleRef.toLowerCase().includes(q) ||
      c.rawExtract.toLowerCase().includes(q) ||
      c.detectedKeywords.some(k => k.toLowerCase().includes(q));
    return matchesRisk && matchesSearch;
  });

  const activeAudit = selectedClause || filteredClauses[0] || clauses[0];

  // LD calculation: 1% per month = 0.25% per week, max 10%
  const simulatedLdExposure = Math.min(
    activeTender.estimatedCost * 0.10,
    activeTender.estimatedCost * (0.01 / 4) * delayedWeeks
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>LEGAL & CONTRACT AUDIT</span>
          <span className="text-slate-600">/</span>
          <span>{activeTender.nitNumber}</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          Contract Clause Explorer & Risk Matrix
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Rule-based analysis of CPWD General Conditions of Contract (GCC), special conditions, penalty caps, and arbitration mechanisms.
        </p>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#0E1726] border border-slate-800 rounded-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={clauseSearch}
            onChange={(e) => setClauseSearch(e.target.value)}
            placeholder="Search clauses, keywords (e.g. 10CA, DLP, penalty)..."
            className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical Exposure (Penalty / Forfeiture)</option>
            <option value="attention">Attention Needed (Escalation / DLP)</option>
            <option value="standard">Standard Operational Clauses</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Clauses List & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredClauses.map((clause) => {
            const isSelected = activeAudit?.id === clause.id;

            return (
              <div
                key={clause.id}
                onClick={() => setSelectedClause(clause)}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400/5 border-amber-400/50'
                    : 'bg-[#0E1726] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200">{clause.title}</span>
                  <span className={`text-[10px] font-mono font-medium ${
                    clause.riskLevel === 'critical' ? 'text-rose-400' : clause.riskLevel === 'attention' ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                    {clause.riskLevel.toUpperCase()}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-cyan-400">
                  {clause.articleRef} · Page {clause.pageNumber}
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {clause.summary}
                </p>
              </div>
            );
          })}

          {filteredClauses.length === 0 && (
            <div className="p-8 text-center text-xs font-mono text-slate-500 border border-slate-800 rounded-lg">
              No clauses matched the filter criteria.
            </div>
          )}
        </div>

        {/* Right Inspector & Exposure Simulator */}
        <div className="lg:col-span-7 space-y-4">
          {activeAudit ? (
            <div className="border border-slate-800 rounded-lg bg-[#0E1726] p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-mono text-amber-400 mb-1">
                    {activeAudit.articleRef} · CITATION PAGE {activeAudit.pageNumber}
                  </div>
                  <h3 className="text-base font-semibold text-slate-100">
                    {activeAudit.title}
                  </h3>
                </div>
                <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded ${
                  activeAudit.riskLevel === 'critical' 
                    ? 'bg-rose-950/40 text-rose-400 border border-rose-800/40' 
                    : activeAudit.riskLevel === 'attention'
                    ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                    : 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/40'
                }`}>
                  {activeAudit.riskLevel} Exposure
                </span>
              </div>

              {/* Exact Document Excerpt */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  EXACT TENDER DOCUMENT EXCERPT (RULE EXTRACT)
                </label>
                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded text-xs font-mono text-slate-300 leading-relaxed">
                  {activeAudit.rawExtract}
                </div>
              </div>

              {/* Matched Keywords */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  DETECTED TAXONOMY KEYWORDS
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {activeAudit.detectedKeywords.map((kw, i) => (
                    <span key={i} className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mitigation Strategy */}
              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded text-xs space-y-1">
                <span className="text-[11px] font-mono text-amber-400 block font-semibold">
                  CIVIL CONTRACTOR MITIGATION ADVISORY:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {activeAudit.recommendation}
                </p>
              </div>

              {/* Interactive Delay / LD Exposure Simulator if clause is Liquidated Damages */}
              {activeAudit.type === 'liquidated_damages' && (
                <div className="p-4 bg-slate-950/80 border border-amber-400/30 rounded space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Liquidated Damages Exposure Simulator</span>
                    </span>
                    <span className="text-slate-400">Cap: 10% ({formatCurrency(activeTender.estimatedCost * 0.1, activeTender.currency)})</span>
                  </div>

                  <div className="text-xs">
                    <div className="flex justify-between text-slate-300 mb-1 font-mono">
                      <span>Simulated Project Delay:</span>
                      <span className="text-amber-400">{delayedWeeks} Weeks ({Math.round(delayedWeeks * 7)} Days)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={delayedWeeks}
                      onChange={(e) => setDelayedWeeks(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs font-mono">
                    <span className="text-slate-400">Potential Contractual Deduction:</span>
                    <span className="text-base font-bold text-rose-400 tabular-nums">
                      {formatCurrency(simulatedLdExposure, activeTender.currency)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 font-mono border border-slate-800 rounded-lg">
              Select a clause from the left list to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
