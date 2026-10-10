import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { formatCurrency, calculateBudgetBreakdown } from '../utils/calculations';
import { generateTenderDossierPDF, generateBOQSchedulePDF, generateCompliancePDF } from '../utils/pdfGenerator';
import { EmptyState } from '../components/common/EmptyState';
import { Printer, Download, FileSpreadsheet, ShieldCheck, Building2, CheckCircle2, FileText, Check } from 'lucide-react';

export const Reports: React.FC = () => {
  const { activeTender, settings, showNotification, setCurrentPage } = useTender();
  const [reportType, setReportType] = useState<'dossier' | 'boq_cost' | 'compliance'>('dossier');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!activeTender) {
    return (
      <EmptyState
        title="No Active Tender in Workspace"
        description="Select a tender to generate official civil engineering reports, or upload your first tender."
        actionLabel="Upload New Tender"
        onAction={() => setCurrentPage('upload')}
      />
    );
  }

  const breakdown = calculateBudgetBreakdown(activeTender.boqItems || []);

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      if (reportType === 'dossier') {
        generateTenderDossierPDF(activeTender, settings, breakdown);
        showNotification('Executive Dossier PDF generated and downloaded.', 'success');
      } else if (reportType === 'boq_cost') {
        generateBOQSchedulePDF(activeTender, settings);
        showNotification('BOQ Schedule PDF generated and downloaded.', 'success');
      } else {
        generateCompliancePDF(activeTender, settings);
        showNotification('Compliance Matrix PDF generated and downloaded.', 'success');
      }
    } catch (err: any) {
      showNotification(`Failed to generate PDF: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBrowserPrint = () => {
    try {
      window.print();
    } catch (err) {
      // In embedded iframes, window.print might be blocked by browser sandbox
      showNotification('Browser print restricted by iframe environment. Downloading PDF directly...', 'info');
      handleDownloadPDF();
    }
  };

  const handleExportJSON = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      system: 'TenderAI Construction Assistant',
      organization: settings.organizationName,
      tender: activeTender,
      budgetCalculation: breakdown
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TenderAI_Report_${activeTender.nitNumber.replace(/[\/\\]/g, '_')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Complete tender audit dossier exported as JSON.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>OFFICIAL REPORTING</span>
            <span className="text-slate-600">/</span>
            <span>{activeTender.nitNumber}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Civil Engineering Reports & Dossiers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate formal executive briefings, quantity takeoff reports, and bid submission compliance checklists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleBrowserPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded transition-colors whitespace-nowrap"
            title="Open browser print dialog"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Browser Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded transition-colors whitespace-nowrap shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Generating PDF...' : 'Download Dossier (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-lg max-w-fit print:hidden">
        <button
          onClick={() => setReportType('dossier')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            reportType === 'dossier' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Executive Dossier
        </button>
        <button
          onClick={() => setReportType('boq_cost')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            reportType === 'boq_cost' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          BOQ Schedule & Rates
        </button>
        <button
          onClick={() => setReportType('compliance')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            reportType === 'compliance' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Compliance Matrix
        </button>
      </div>

      {/* Printable Report Surface */}
      <div className="border border-slate-800 rounded-lg bg-[#0E1726] p-8 space-y-6 print:border-none print:bg-white print:text-black print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 print:border-black pb-4 flex items-start justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 print:text-gray-700 font-bold">
              {settings.organizationName} · BIDDING & ESTIMATION DIVISION
            </div>
            <h2 className="text-lg font-bold text-slate-100 print:text-black mt-1">
              {reportType === 'dossier' && 'Tender Assessment Dossier & Technical Feasibility Summary'}
              {reportType === 'boq_cost' && 'Bill of Quantities (BOQ) Comprehensive Cost Estimate Sheet'}
              {reportType === 'compliance' && 'Technical & Legal Qualification Compliance Matrix'}
            </h2>
            <div className="text-xs font-mono text-slate-400 print:text-gray-600 mt-1">
              NIT Ref: {activeTender.nitNumber} · Issuing Authority: {activeTender.authority}
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-400 print:text-gray-600">
            <div>DATE: {new Date().toLocaleDateString('en-GB')}</div>
            <div>STATUS: {activeTender.status}</div>
          </div>
        </div>

        {/* Report Content: Dossier */}
        {reportType === 'dossier' && (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-900/60 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300">
              <div>
                <span className="text-[11px] font-mono text-slate-400 print:text-gray-600 block">ESTIMATED ECPT</span>
                <span className="font-mono font-bold text-amber-400 print:text-black text-sm tabular-nums">
                  {formatCurrency(activeTender.estimatedCost, activeTender.currency)}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 print:text-gray-600 block">EMD REQUIREMENT</span>
                <span className="font-mono font-bold text-emerald-400 print:text-black text-sm tabular-nums">
                  {formatCurrency(activeTender.emdAmount, activeTender.currency)}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 print:text-gray-600 block">TIME FOR COMPLETION</span>
                <span className="font-mono font-bold text-slate-100 print:text-black text-sm">
                  {activeTender.completionPeriodMonths} Months
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 print:text-gray-600 block">DEFECT LIABILITY (DLP)</span>
                <span className="font-mono font-bold text-slate-100 print:text-black text-sm">
                  {activeTender.defectLiabilityMonths} Months
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-slate-200 print:text-black border-b border-slate-800 print:border-gray-300 pb-1 font-mono">
                1. SCOPE OF WORK & PROJECT SUMMARY
              </h3>
              <p className="text-slate-300 print:text-gray-800 leading-relaxed">
                {activeTender.title}. The work is to be executed in {activeTender.workLocation} in strict accordance with {settings.measurementStandard} specifications and general terms stipulated in the Notice Inviting Tender.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-slate-200 print:text-black border-b border-slate-800 print:border-gray-300 pb-1 font-mono">
                2. FINANCIAL SUMMARY & QUOTE PROJECTION
              </h3>
              <table className="w-full text-left font-mono">
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  <tr>
                    <td className="py-1.5 text-slate-400 print:text-gray-600">Sub-total Direct Civil Works</td>
                    <td className="py-1.5 text-right tabular-nums text-slate-200 print:text-black">{formatCurrency(breakdown.subtotalDirect, activeTender.currency)}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-400 print:text-gray-600">Contingency Reserve ({breakdown.contingencyPercent}%)</td>
                    <td className="py-1.5 text-right tabular-nums text-slate-200 print:text-black">{formatCurrency(breakdown.contingencyAmount, activeTender.currency)}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-400 print:text-gray-600">Contractor Profit Margin ({breakdown.contractorMarginPercent}%)</td>
                    <td className="py-1.5 text-right tabular-nums text-cyan-400 print:text-black">{formatCurrency(breakdown.contractorMarginAmount, activeTender.currency)}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-400 print:text-gray-600">GST ({breakdown.gstPercent}%)</td>
                    <td className="py-1.5 text-right tabular-nums text-slate-200 print:text-black">{formatCurrency(breakdown.gstAmount, activeTender.currency)}</td>
                  </tr>
                  <tr className="font-bold text-amber-400 print:text-black">
                    <td className="py-2">Total Recommended Bid Proposal</td>
                    <td className="py-2 text-right tabular-nums text-sm">{formatCurrency(breakdown.finalBidAmount, activeTender.currency)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report Content: BOQ */}
        {reportType === 'boq_cost' && (
          <div className="space-y-4 text-xs font-mono">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 print:border-gray-400 bg-slate-900/60 print:bg-gray-100 text-slate-400 print:text-black">
                  <th className="p-2">ITEM</th>
                  <th className="p-2">DESCRIPTION</th>
                  <th className="p-2 text-center">UNIT</th>
                  <th className="p-2 text-right">QTY</th>
                  <th className="p-2 text-right">RATE (₹)</th>
                  <th className="p-2 text-right">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {activeTender.boqItems.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2 text-amber-400 print:text-black">{item.itemNumber}</td>
                    <td className="p-2 max-w-xs">{item.description}</td>
                    <td className="p-2 text-center text-slate-400 print:text-black uppercase">{item.unit}</td>
                    <td className="p-2 text-right tabular-nums">{item.quantity.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right tabular-nums">{item.estimatedRate.toFixed(2)}</td>
                    <td className="p-2 text-right tabular-nums font-semibold text-slate-200 print:text-black">
                      {(item.quantity * item.estimatedRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Content: Compliance */}
        {reportType === 'compliance' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 print:border-gray-400 bg-slate-900/60 print:bg-gray-100 text-slate-400 print:text-black font-mono">
                  <th className="p-2">QUALIFICATION PARAMETER</th>
                  <th className="p-2">REQUIREMENT STIPULATION</th>
                  <th className="p-2">BIDDER STATUS</th>
                  <th className="p-2 text-right">CITATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {activeTender.eligibility.map((el) => (
                  <tr key={el.id}>
                    <td className="p-2 font-semibold text-slate-200 print:text-black font-mono">{el.title}</td>
                    <td className="p-2 text-slate-300 print:text-gray-800">{el.requirementText}</td>
                    <td className="p-2 font-mono text-emerald-400 print:text-green-800 font-semibold uppercase">{el.status}</td>
                    <td className="p-2 text-right font-mono text-slate-400 print:text-gray-600">Page {el.citationPage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Sign-off Block */}
        <div className="pt-10 border-t border-slate-800 print:border-gray-400 grid grid-cols-3 gap-6 text-xs text-center font-mono text-slate-400 print:text-gray-700">
          <div>
            <div className="border-b border-slate-700 print:border-gray-400 pb-8 mb-2"></div>
            <div>Prepared By</div>
            <div className="text-[11px] text-slate-500 print:text-gray-500">Quantity Surveyor</div>
          </div>
          <div>
            <div className="border-b border-slate-700 print:border-gray-400 pb-8 mb-2"></div>
            <div>Verified By</div>
            <div className="text-[11px] text-slate-500 print:text-gray-500">Chief Estimator / Project Lead</div>
          </div>
          <div>
            <div className="border-b border-slate-700 print:border-gray-400 pb-8 mb-2"></div>
            <div>Authorized Signatory</div>
            <div className="text-[11px] text-slate-500 print:text-gray-500">Managing Director</div>
          </div>
        </div>
      </div>
    </div>
  );
};
