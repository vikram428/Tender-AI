import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { formatCurrency } from '../utils/calculations';
import { EmptyState } from '../components/common/EmptyState';
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Scale,
  DollarSign,
  ChevronRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const TenderAnalysis: React.FC = () => {
  const { activeTender, setCurrentPage } = useTender();
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'clauses' | 'rawText'>('overview');

  if (!activeTender) {
    return (
      <EmptyState
        title="No Tender Document Selected"
        description="Select a tender from the repository or upload a new tender document to initiate deterministic analysis."
        actionLabel="Go to Repository"
        onAction={() => setCurrentPage('dashboard')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>ENGINEERING DOSSIER</span>
            <span className="text-slate-600">/</span>
            <span>{activeTender.authority}</span>
            <span className="text-slate-600">/</span>
            <span>{activeTender.nitNumber}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            {activeTender.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {activeTender.issuingDepartment} · {activeTender.workLocation}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage('estimator')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap"
          >
            Open Budget Estimator
          </button>
          <button
            onClick={() => setCurrentPage('boq')}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded transition-colors whitespace-nowrap"
          >
            View BOQ ({activeTender.boqItems.length})
          </button>
        </div>
      </div>

      {/* Tab bar (segmented controls as functional buttons) */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-lg max-w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'overview'
              ? 'bg-slate-800 text-amber-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Executive Parameters
        </button>
        <button
          onClick={() => setActiveTab('eligibility')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'eligibility'
              ? 'bg-slate-800 text-amber-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Eligibility & Bid Capacity ({activeTender.eligibility.length})
        </button>
        <button
          onClick={() => setActiveTab('clauses')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'clauses'
              ? 'bg-slate-800 text-amber-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Contract Clauses ({activeTender.clauses.length})
        </button>
        <button
          onClick={() => setActiveTab('rawText')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'rawText'
              ? 'bg-slate-800 text-amber-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Raw Document Extract
        </button>
      </div>

      {/* TAB 1: EXECUTIVE PARAMETERS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Quantitative Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#0E1726] border border-slate-800 rounded-lg">
              <span className="text-xs font-mono text-slate-400 block mb-1">ESTIMATED COST (ECPT)</span>
              <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                {formatCurrency(activeTender.estimatedCost, activeTender.currency)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Official engineering estimate</span>
            </div>

            <div className="p-4 bg-[#0E1726] border border-slate-800 rounded-lg">
              <span className="text-xs font-mono text-slate-400 block mb-1">EARNEST MONEY (EMD)</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {formatCurrency(activeTender.emdAmount, activeTender.currency)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                {activeTender.bidSecurityType} format
              </span>
            </div>

            <div className="p-4 bg-[#0E1726] border border-slate-800 rounded-lg">
              <span className="text-xs font-mono text-slate-400 block mb-1">COMPLETION TIMEFRAME</span>
              <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                {activeTender.completionPeriodMonths} Months
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                DLP: {activeTender.defectLiabilityMonths} Months
              </span>
            </div>

            <div className="p-4 bg-[#0E1726] border border-slate-800 rounded-lg">
              <span className="text-xs font-mono text-slate-400 block mb-1">SUBMISSION CUTOFF</span>
              <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
                {activeTender.submissionDeadline}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Pre-bid: {activeTender.preBidMeetingDate}
              </span>
            </div>
          </div>

          {/* Detailed Specifications Spec Sheet */}
          <div className="border border-slate-800 rounded-lg bg-[#0E1726] p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Standard Specifications & Contract Structure</span>
              <span className="text-xs font-mono text-slate-400">Total Pages: {activeTender.pageCount}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Notice Inviting Tender (NIT)</span>
                <span className="font-mono text-slate-200 font-semibold">{activeTender.nitNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Tendering Authority</span>
                <span className="font-mono text-slate-200 font-semibold">{activeTender.authority}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Tender Processing Fee</span>
                <span className="font-mono text-slate-200 font-semibold">{formatCurrency(activeTender.tenderFee, activeTender.currency)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Pre-Bid Conference Date</span>
                <span className="font-mono text-slate-200 font-semibold">{activeTender.preBidMeetingDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Technical Bid Opening</span>
                <span className="font-mono text-slate-200 font-semibold">{activeTender.technicalBidOpeningDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Site Location</span>
                <span className="font-mono text-slate-200 font-semibold">{activeTender.workLocation}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ELIGIBILITY & BID CAPACITY */}
      {activeTab === 'eligibility' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between">
            <span>
              Qualification criteria extracted deterministically from Tender Information Volume (Section 1).
            </span>
            <span className="font-mono text-cyan-400">Formula: (2 × A × N) - B</span>
          </div>

          <div className="space-y-3">
            {activeTender.eligibility.map((crit) => (
              <div key={crit.id} className="p-4 bg-[#0E1726] border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-100">{crit.title}</span>
                    <span className="text-[11px] font-mono text-slate-500">Page {crit.citationPage}</span>
                  </div>
                  <span className={`text-xs font-mono font-medium ${
                    crit.status === 'eligible' 
                      ? 'text-emerald-400' 
                      : crit.status === 'review_needed' 
                      ? 'text-amber-400' 
                      : 'text-rose-400'
                  }`}>
                    {crit.status === 'eligible' ? 'COMPLIANT' : 'REVIEW REQUIRED'}
                  </span>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  {crit.requirementText}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-mono">
                  <span className="text-slate-500">Extracted Benchmark:</span>
                  <span className="text-slate-200">{crit.extractedValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONTRACT CLAUSES */}
      {activeTab === 'clauses' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {activeTender.clauses.map((clause) => (
              <div key={clause.id} className="p-4 bg-[#0E1726] border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-100">{clause.title}</span>
                    <span className="text-[11px] font-mono text-amber-400">{clause.articleRef}</span>
                  </div>
                  <span className={`text-xs font-mono font-medium ${
                    clause.riskLevel === 'critical' ? 'text-rose-400' : clause.riskLevel === 'attention' ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                    {clause.riskLevel.toUpperCase()} EXPOSURE
                  </span>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded text-xs font-mono text-slate-300 leading-relaxed">
                  {clause.rawExtract}
                </div>

                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300">Engineering Recommendation: </strong>
                  {clause.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RAW DOCUMENT EXTRACT */}
      {activeTab === 'rawText' && (
        <div className="border border-slate-800 rounded-lg bg-[#0E1726] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>RAW EXTRACT BUFFER (FIRST 1500 CHARS)</span>
            <span>VERIFIED DETERMINISTIC EXTRACTION</span>
          </div>
          <pre className="p-4 bg-slate-950 rounded text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
            {activeTender.rawTextExcerpt || 'No raw text extract captured for this document.'}
          </pre>
        </div>
      )}
    </div>
  );
};
