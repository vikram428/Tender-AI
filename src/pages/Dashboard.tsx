import React from 'react';
import { useTender } from '../context/TenderContext';
import { formatCurrency, calculateDaysRemaining } from '../utils/calculations';
import {
  Building2,
  FileText,
  Calendar,
  Layers,
  Calculator,
  ArrowRight,
  ShieldCheck,
  HardHat,
  Search,
  Scale,
  UploadCloud,
  FolderOpen
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { tenders, activeTender, setActiveTenderId, setCurrentPage, loadingTenders } = useTender();

  // Aggregate stats strictly across authenticated user's real Firestore tenders
  const hasTenders = tenders.length > 0;
  const totalValue = hasTenders ? tenders.reduce((acc, t) => acc + (t.estimatedCost || 0), 0) : 0;
  const totalEMD = hasTenders ? tenders.reduce((acc, t) => acc + (t.emdAmount || 0), 0) : 0;
  const totalBOQItems = hasTenders ? tenders.reduce((acc, t) => acc + (t.boqItems?.length || 0), 0) : 0;

  return (
    <div className="space-y-6">
      {/* Engineering Control Room Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>CIVIL ENGINEERING TENDER CONTROL ROOM</span>
            <span className="text-slate-600">·</span>
            <span>PRIVATE WORKSPACE ACTIVE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            TenderAI Document Assistant
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Deterministic document intelligence for civil contractors and estimators. Private cloud repository backed by Firestore.
          </p>
        </div>

        {/* Quick action strip */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage('upload')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload New Tender</span>
          </button>
          <button
            onClick={() => setCurrentPage('reports')}
            disabled={!hasTenders}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 rounded transition-colors whitespace-nowrap"
          >
            Export Dossier
          </button>
        </div>
      </div>

      {/* Fresh User Experience Banner (Required when workspace has no tenders) */}
      {!hasTenders && !loadingTenders && (
        <div className="border border-amber-400/30 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#0E1726] to-[#0E1726] p-6 relative overflow-hidden">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">
              INITIAL WORKSPACE STATE
            </span>
            <h2 className="text-xl font-bold text-slate-100">
              Welcome to TenderAI
            </h2>
            <p className="text-sm text-slate-300 font-medium">
              Your construction tender workspace is ready.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Upload your first tender PDF to begin. TenderAI extracts Notice Inviting Tender (NIT) parameters, estimates project costs, parses BOQ rates, and benchmarks critical contract clauses deterministically.
            </p>
            <div className="pt-3">
              <button
                onClick={() => setCurrentPage('upload')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-md"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload New Tender</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Visual & Active Tender Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Visual Blueprint Card with Real Context */}
        <div className="lg:col-span-5 relative rounded-lg border border-slate-800 overflow-hidden bg-slate-950 flex flex-col justify-between">
          <div className="relative h-48 w-full overflow-hidden bg-slate-900">
            <img
              src="/src/assets/images/tender_blueprint_technical_1791620265592.jpg"
              alt="Technical Civil Engineering Blueprint"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-black/30" />
            
            <div className="absolute top-3 left-3 bg-slate-950/80 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300">
              CAD SPEC: IS-456:2000 / CPWD DSR
            </div>
          </div>

          <div className="p-4 space-y-3 bg-[#0D1524]">
            {activeTender ? (
              <>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>SELECTED DOCUMENT</span>
                  <span className="text-amber-400">{activeTender.authority}</span>
                </div>
                <h2 className="text-sm font-semibold text-slate-100 line-clamp-2">
                  {activeTender.title}
                </h2>
                <div className="text-xs text-slate-400 font-mono">
                  NIT: {activeTender.nitNumber}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Estimated Value</span>
                  <span className="text-base font-bold font-mono text-amber-400 tabular-nums">
                    {formatCurrency(activeTender.estimatedCost || 0, activeTender.currency)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setCurrentPage('analysis')}
                    className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded text-xs font-medium text-center transition-colors"
                  >
                    Inspect Clauses
                  </button>
                  <button
                    onClick={() => setCurrentPage('boq')}
                    className="w-full py-1.5 px-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded text-xs font-medium text-center transition-colors"
                  >
                    Manage BOQ ({activeTender.boqItems?.length || 0})
                  </button>
                </div>
              </>
            ) : (
              <div className="py-6 text-center space-y-2">
                <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-semibold text-slate-300">No Tender Loaded in Workspace</div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Upload an NIT document or tender specification to populate active analysis.
                </p>
                <button
                  onClick={() => setCurrentPage('upload')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded text-xs font-medium"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Tender Document</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quantitative Infrastructure Metrics (Dynamic Real Data Only) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          {/* Key Metrics Strip (Tabular Figures, Zero-Pill) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg border border-slate-800 bg-[#0E1726]">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Active Tenders</span>
                <FileText className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                {tenders.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {hasTenders ? 'In your private repository' : 'Workspace empty'}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-800 bg-[#0E1726]">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Cumulative Value</span>
                <Calculator className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                {hasTenders ? formatCurrency(totalValue, 'INR', true) : '₹ 0.00'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {hasTenders ? 'Active tenders sum' : 'No active tenders'}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-800 bg-[#0E1726]">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Total EMD / BG</span>
                <Building2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {hasTenders ? formatCurrency(totalEMD, 'INR', true) : '₹ 0.00'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {hasTenders ? 'Bank Guarantee pool' : 'No active tenders'}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-800 bg-[#0E1726]">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>BOQ Items</span>
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                {totalBOQItems}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {hasTenders ? 'Extracted rate items' : 'No active tenders'}
              </div>
            </div>
          </div>

          {/* Quick Engineering Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div 
              onClick={() => setCurrentPage('estimator')}
              className="p-3.5 rounded-lg border border-slate-800 bg-[#0E1726] hover:border-slate-700 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </div>
              <h3 className="text-xs font-semibold text-slate-200">Budget Takeoff</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Calculate direct costs, materials, labor, margins & contingency.
              </p>
            </div>

            <div 
              onClick={() => setCurrentPage('clauses')}
              className="p-3.5 rounded-lg border border-slate-800 bg-[#0E1726] hover:border-slate-700 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-xs font-semibold text-slate-200">Clause Risk Audit</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Audit Liquidated Damages, Defect Liability, and Escalation (10CA).
              </p>
            </div>

            <div 
              onClick={() => setCurrentPage('drafts')}
              className="p-3.5 rounded-lg border border-slate-800 bg-[#0E1726] hover:border-slate-700 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <HardHat className="w-4 h-4 text-emerald-400" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-xs font-semibold text-slate-200">Pre-Bid Letters</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Generate formal query letters, EMD undertakings, and covers.
              </p>
            </div>
          </div>

          {/* Construction Site Asset Strip */}
          <div className="relative rounded-lg border border-slate-800 overflow-hidden bg-slate-900 h-28 flex items-center px-5">
            <img
              src="/src/assets/images/construction_site_engineering_1791620277627.jpg"
              alt="Construction Site Engineering Team"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17] via-[#0B0F17]/80 to-transparent" />
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>USER-ISOLATED CLOUD FIRESTORE STORAGE</span>
              </div>
              <p className="text-xs text-slate-300 max-w-lg">
                Your uploaded tenders, BOQ item schedules, and clause analyses are isolated to your account UID.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tenders Repository Table */}
      <div className="border border-slate-800 rounded-lg bg-[#0E1726] overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Tender Repository & Active Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any document to load into the engineering workspace
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {tenders.length} {tenders.length === 1 ? 'Document' : 'Documents'} Indexed
          </span>
        </div>

        <div className="overflow-x-auto">
          {hasTenders ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-normal">NIT REFERENCE</th>
                  <th className="py-2.5 px-4 font-normal">AUTHORITY & WORK TITLE</th>
                  <th className="py-2.5 px-4 font-normal text-right">ESTIMATED COST</th>
                  <th className="py-2.5 px-4 font-normal text-right">EMD / BG</th>
                  <th className="py-2.5 px-4 font-normal">SUBMISSION DEADLINE</th>
                  <th className="py-2.5 px-4 font-normal text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {tenders.map((tender) => {
                  const daysInfo = tender.submissionDeadline 
                    ? calculateDaysRemaining(tender.submissionDeadline)
                    : { days: 0, isOverdue: false, label: 'Not available' };
                  const isSelected = tender.id === activeTender?.id;

                  return (
                    <tr 
                      key={tender.id}
                      className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-amber-400/5' : ''}`}
                    >
                      <td className="py-3 px-4 font-mono font-medium text-amber-400 whitespace-nowrap">
                        {tender.nitNumber || 'Not available'}
                      </td>
                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {tender.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {tender.authority} · {tender.workLocation || 'Not available'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-slate-100 tabular-nums whitespace-nowrap">
                        {tender.estimatedCost ? formatCurrency(tender.estimatedCost, tender.currency) : 'Not available'}
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-slate-400 tabular-nums whitespace-nowrap">
                        {tender.emdAmount ? formatCurrency(tender.emdAmount, tender.currency) : 'Not available'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-slate-200">{tender.submissionDeadline || 'Not available'}</div>
                        <div className={`text-[11px] font-mono ${daysInfo.isOverdue ? 'text-rose-400' : 'text-cyan-400'}`}>
                          {daysInfo.label}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isSelected ? (
                          <span className="text-xs font-mono text-amber-400 font-semibold px-2 py-1">
                            ACTIVE
                          </span>
                        ) : (
                          <button
                            onClick={() => setActiveTenderId(tender.id)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors"
                          >
                            Select
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-semibold text-slate-300">
                No tender records in your private workspace yet
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Upload your first Notice Inviting Tender (NIT) document to populate the repository.
              </p>
              <button
                onClick={() => setCurrentPage('upload')}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Tender</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
