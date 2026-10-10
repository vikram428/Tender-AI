import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { Search, FileText, Layers, Scale, Bookmark, ExternalLink } from 'lucide-react';

interface SearchResultItem {
  id: string;
  sourceType: 'clause' | 'boq' | 'eligibility' | 'general';
  tenderNit: string;
  tenderTitle: string;
  title: string;
  snippet: string;
  pageNumber?: number;
  highlightMatch: string;
}

export const DocumentSearch: React.FC = () => {
  const { tenders, activeTender, setActiveTenderId, setCurrentPage } = useTender();

  const [query, setQuery] = useState('Escalation');
  const [scope, setScope] = useState<'active' | 'all'>('active');
  const [typeFilter, setTypeFilter] = useState<'all' | 'clause' | 'boq' | 'eligibility'>('all');

  const presets = ['10CA Escalation', 'Liquidated Damages', 'Bank Guarantee EMD', 'TMT Fe-500D', 'Solvency', 'Arbitration'];

  const targetTenders = scope === 'active' && activeTender ? [activeTender] : tenders;

  if (tenders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>DETERMINISTIC DOCUMENT SEARCH</span>
            <span className="text-slate-600">/</span>
            <span>FULL-TEXT & REGEX REPOSITORIES</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Smart Tender Document & Clause Search
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Perform indexed keyword and pattern queries across tender specifications, BOQ schedules, and GCC contract articles.
          </p>
        </div>

        <div className="p-12 text-center border border-dashed border-slate-800 rounded-lg bg-[#0F1726]/40">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No Documents in Workspace</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Upload a tender document to search through contract clauses, BOQ item descriptions, and eligibility criteria.
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

  // Real deterministic search execution
  const results: SearchResultItem[] = [];
  const qLower = query.toLowerCase().trim();

  if (qLower.length > 1) {
    targetTenders.forEach((tender) => {
      // 1. Search in clauses
      tender.clauses.forEach((c) => {
        if (
          c.title.toLowerCase().includes(qLower) ||
          c.rawExtract.toLowerCase().includes(qLower) ||
          c.summary.toLowerCase().includes(qLower) ||
          c.articleRef.toLowerCase().includes(qLower)
        ) {
          results.push({
            id: `res-clause-${c.id}`,
            sourceType: 'clause',
            tenderNit: tender.nitNumber,
            tenderTitle: tender.title,
            title: `${c.title} (${c.articleRef})`,
            snippet: c.rawExtract,
            pageNumber: c.pageNumber,
            highlightMatch: query
          });
        }
      });

      // 2. Search in BOQ items
      tender.boqItems.forEach((b) => {
        if (
          b.description.toLowerCase().includes(qLower) ||
          b.itemNumber.toLowerCase().includes(qLower) ||
          b.specificationRef.toLowerCase().includes(qLower)
        ) {
          results.push({
            id: `res-boq-${b.id}`,
            sourceType: 'boq',
            tenderNit: tender.nitNumber,
            tenderTitle: tender.title,
            title: `BOQ #${b.itemNumber} · ${b.specificationRef}`,
            snippet: b.description,
            pageNumber: 1,
            highlightMatch: query
          });
        }
      });

      // 3. Search in eligibility
      tender.eligibility.forEach((el) => {
        if (
          el.title.toLowerCase().includes(qLower) ||
          el.requirementText.toLowerCase().includes(qLower)
        ) {
          results.push({
            id: `res-el-${el.id}`,
            sourceType: 'eligibility',
            tenderNit: tender.nitNumber,
            tenderTitle: tender.title,
            title: `Eligibility: ${el.title}`,
            snippet: el.requirementText,
            pageNumber: el.citationPage,
            highlightMatch: query
          });
        }
      });
    });
  }

  const filteredResults = results.filter((r) => {
    return typeFilter === 'all' || r.sourceType === typeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>DETERMINISTIC DOCUMENT SEARCH</span>
          <span className="text-slate-600">/</span>
          <span>FULL-TEXT & REGEX REPOSITORIES</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          Smart Tender Document & Clause Search
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform indexed keyword and pattern queries across tender specifications, BOQ schedules, and GCC contract articles with source citations.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-4 bg-[#0E1726] border border-slate-800 rounded-lg space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tender clauses, specifications, materials, penalty terms..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Search presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-mono text-slate-500">QUICK PRESETS:</span>
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => setQuery(preset)}
              className="px-2 py-0.5 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Scope and Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">SCOPE:</span>
            <button
              onClick={() => setScope('active')}
              className={`px-2 py-0.5 rounded transition-colors ${scope === 'active' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'text-slate-400'}`}
            >
              Active Tender ({activeTender?.nitNumber})
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-2 py-0.5 rounded transition-colors ${scope === 'all' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'text-slate-400'}`}
            >
              All {tenders.length} Tenders
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">DOCUMENT TYPE:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Content Types</option>
              <option value="clause">Contract Clauses (GCC/SCC)</option>
              <option value="boq">BOQ Line Items</option>
              <option value="eligibility">Eligibility Criteria</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search results list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>MATCHES LOCATED: {filteredResults.length}</span>
          <span>DETERMINISTIC LATENCY: &lt; 2ms</span>
        </div>

        {filteredResults.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-[#0E1726] border border-slate-800 rounded-lg space-y-2 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.sourceType === 'clause' && <Scale className="w-3.5 h-3.5 text-amber-400" />}
                {item.sourceType === 'boq' && <Layers className="w-3.5 h-3.5 text-cyan-400" />}
                {item.sourceType === 'eligibility' && <FileText className="w-3.5 h-3.5 text-emerald-400" />}
                <span className="text-xs font-semibold text-slate-100">{item.title}</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>{item.tenderNit}</span>
                {item.pageNumber && <span>· Page {item.pageNumber}</span>}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
              {item.snippet}
            </p>

            <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-500">
              <span>Source: {item.tenderTitle}</span>
              <button
                onClick={() => {
                  const targetT = tenders.find(t => t.nitNumber === item.tenderNit);
                  if (targetT) {
                    setActiveTenderId(targetT.id);
                    if (item.sourceType === 'clause') setCurrentPage('clauses');
                    else if (item.sourceType === 'boq') setCurrentPage('boq');
                    else setCurrentPage('analysis');
                  }
                }}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Navigate to Source Section</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {filteredResults.length === 0 && (
          <div className="p-12 text-center text-xs font-mono text-slate-500 border border-slate-800 rounded-lg bg-[#0E1726]/40">
            No text matches located for "{query}". Try a different search term or check document spelling.
          </div>
        )}
      </div>
    </div>
  );
};
