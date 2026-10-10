import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { SAMPLE_DRAFT_TEMPLATES } from '../data/sampleTenders';
import { formatCurrency } from '../utils/calculations';
import { EmptyState } from '../components/common/EmptyState';
import {
  FileEdit,
  Copy,
  Download,
  Check,
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const DraftGenerator: React.FC = () => {
  const { activeTender, settings, showNotification, setCurrentPage } = useTender();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(SAMPLE_DRAFT_TEMPLATES[0].id);
  const [copied, setCopied] = useState(false);

  // Variable overrides
  const [signatoryName, setSignatoryName] = useState('Er. Rajesh Kumar Sharma');
  const [signatoryDesignation, setSignatoryDesignation] = useState('Chief Managing Director');
  const [signatoryContact, setSignatoryContact] = useState('+91 98101 23456 / r.sharma@shreeinfra.in');
  const [customQueryText, setCustomQueryText] = useState('Clarification requested regarding Clause 10CA wholesale price index baseline month.');

  if (!activeTender) {
    return (
      <EmptyState
        title="No Active Tender in Workspace"
        description="Select a tender to generate official pre-bid queries, or upload your first tender document."
        actionLabel="Upload New Tender"
        onAction={() => setCurrentPage('upload')}
      />
    );
  }

  const selectedTemplate = SAMPLE_DRAFT_TEMPLATES.find(t => t.id === selectedTemplateId) || SAMPLE_DRAFT_TEMPLATES[0];

  // Deterministic substitution engine
  const compiledDraft = selectedTemplate.templateBody
    .replace(/\{\{AUTHORITY_NAME\}\}/g, activeTender.authority)
    .replace(/\{\{ISSUING_OFFICE\}\}/g, activeTender.issuingDepartment)
    .replace(/\{\{WORK_NAME\}\}/g, activeTender.title)
    .replace(/\{\{NIT_NUMBER\}\}/g, activeTender.nitNumber)
    .replace(/\{\{COMPANY_NAME\}\}/g, settings.organizationName)
    .replace(/\{\{SIGNATORY_NAME\}\}/g, signatoryName)
    .replace(/\{\{SIGNATORY_DESIGNATION\}\}/g, signatoryDesignation)
    .replace(/\{\{SIGNATORY_CONTACT\}\}/g, signatoryContact)
    .replace(/\{\{EMD_AMOUNT\}\}/g, formatCurrency(activeTender.emdAmount, activeTender.currency))
    .replace(/\{\{EMD_TYPE\}\}/g, activeTender.bidSecurityType)
    .replace(/\{\{EMD_REF_NO\}\}/g, 'BG/2026/SBI/DEL/49821')
    .replace(/\{\{EMD_DATE\}\}/g, activeTender.publicationDate)
    .replace(/\{\{BANK_NAME\}\}/g, 'State Bank of India, CAG Branch')
    .replace(/\{\{UDYAM_REG_NO\}\}/g, 'UDYAM-DL-08-0049281')
    .replace(/\{\{CATEGORY_CLASS\}\}/g, settings.contractorLicenseClass)
    .replace(/\{\{CLAUSE_REF\}\}/g, 'Special Conditions Section 4.2 / BOQ Item 05.02')
    .replace(/\{\{PAGE_NUMBER\}\}/g, '28')
    .replace(/\{\{EXISTING_TEXT\}\}/g, 'Cement and steel escalation adjustment as per RBI index')
    .replace(/\{\{OBSERVATION_TEXT\}\}/g, customQueryText)
    .replace(/\{\{REQUESTED_MODIFICATION\}\}/g, 'Confirm whether cement base index corresponds to tender publication month or bid submission month.');

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledDraft);
    setCopied(true);
    showNotification('Draft document copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([compiledDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedTemplate.id}_${activeTender.nitNumber.replace(/[\/\\]/g, '_')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Official bid correspondence downloaded.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>TEMPLATE-BASED CORRESPONDENCE</span>
            <span className="text-slate-600">/</span>
            <span>{activeTender.nitNumber}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Tender Draft & Query Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Produce deterministic, legally structured civil bidding correspondence, pre-bid queries, EMD exemptions, and nil-deviation certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Draft'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Draft (.txt)</span>
          </button>
        </div>
      </div>

      {/* Template Selector Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SAMPLE_DRAFT_TEMPLATES.map((tmpl) => {
          const isSelected = tmpl.id === selectedTemplateId;
          return (
            <div
              key={tmpl.id}
              onClick={() => setSelectedTemplateId(tmpl.id)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-amber-400/10 border-amber-400/40 text-amber-200'
                  : 'bg-[#0E1726] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <FileText className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  {tmpl.category.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-xs font-semibold text-slate-200 line-clamp-1">{tmpl.name}</h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tmpl.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Variables Form */}
        <div className="lg:col-span-4 border border-slate-800 rounded-lg bg-[#0E1726] p-4 space-y-3 text-xs">
          <h3 className="text-xs font-semibold text-slate-200 pb-2 border-b border-slate-800 font-mono">
            LETTER VARIABLES & SIGNATORY
          </h3>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">AUTHORIZED SIGNATORY</label>
            <input
              type="text"
              value={signatoryName}
              onChange={(e) => setSignatoryName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">DESIGNATION</label>
            <input
              type="text"
              value={signatoryDesignation}
              onChange={(e) => setSignatoryDesignation(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">CONTACT / EMAIL</label>
            <input
              type="text"
              value={signatoryContact}
              onChange={(e) => setSignatoryContact(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
            />
          </div>

          {selectedTemplate.category === 'prebid_query' && (
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">OBSERVATION / TECHNICAL QUERY</label>
              <textarea
                value={customQueryText}
                onChange={(e) => setCustomQueryText(e.target.value)}
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
              />
            </div>
          )}

          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div>Target Authority: {activeTender.authority}</div>
            <div>Tender NIT: {activeTender.nitNumber}</div>
            <div>Company: {settings.organizationName}</div>
          </div>
        </div>

        {/* Right: Compiled Document Preview */}
        <div className="lg:col-span-8 border border-slate-800 rounded-lg bg-[#0E1726] p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>DRAFT PREVIEW · READY FOR PRINT & SIGNATURE</span>
            <span className="text-amber-400">UNCONDITIONAL ACCEPTANCE TEMPLATE</span>
          </div>

          <pre className="p-4 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto min-h-[420px]">
            {compiledDraft}
          </pre>
        </div>
      </div>
    </div>
  );
};
