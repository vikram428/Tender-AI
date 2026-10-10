/**
 * Deterministic Client-Side PDF Generation Utility
 * Generates official formatted civil engineering tender dossiers, BOQ rate sheets, and compliance reports.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TenderDocument, AppSettings, BudgetCostBreakdown } from '../types/tender';
import { formatCurrency } from './calculations';

export function generateTenderDossierPDF(
  tender: TenderDocument,
  settings: AppSettings,
  breakdown: BudgetCostBreakdown
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Header Banner & Branding
  doc.setFillColor(11, 15, 23); // #0B0F17
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(245, 158, 11); // Amber
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TENDERAI - CIVIL ENGINEERING CONTROL ROOM', 14, 10);

  doc.setTextColor(203, 213, 225); // Slate 300
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${settings.organizationName} · BIDDING & ESTIMATION DOSSIER`, 14, 16);

  const dateStr = new Date().toLocaleDateString('en-GB');
  doc.setTextColor(148, 163, 184);
  doc.text(`DATE: ${dateStr} | STATUS: ${tender.status}`, pageWidth - 14, 16, { align: 'right' });

  // 2. Document Title
  let cursorY = 32;
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TENDER ASSESSMENT DOSSIER & TECHNICAL FEASIBILITY', 14, cursorY);

  cursorY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(2, 132, 199); // Sky blue
  doc.text(`NIT NO: ${tender.nitNumber} | AUTHORITY: ${tender.authority}`, 14, cursorY);

  cursorY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const titleLines = doc.splitTextToSize(`WORK: ${tender.title}`, pageWidth - 28);
  doc.text(titleLines, 14, cursorY);
  cursorY += titleLines.length * 4.5 + 2;

  // 3. Executive Parameter Summary Table
  const paramHeaders = [['Parameter', 'Stipulated Specification', 'Financial / Time Value']];
  const paramRows = [
    ['Estimated Tender Cost (ECPT)', 'Official Engineering Baseline', formatCurrency(tender.estimatedCost, tender.currency)],
    ['Earnest Money Deposit (EMD)', `${tender.bidSecurityType} Format`, formatCurrency(tender.emdAmount, tender.currency)],
    ['Time Allowed for Completion', 'Contract Execution Window', `${tender.completionPeriodMonths} Months`],
    ['Defect Liability Period (DLP)', 'Maintenance & Guarantee Period', `${tender.defectLiabilityMonths} Months`],
    ['Online Submission Cutoff', 'Mandatory Electronic Bid Date', tender.submissionDeadline],
    ['Pre-Bid Meeting Date', 'Clarification Conference', tender.preBidMeetingDate],
    ['Site Location', 'Execution Territory', tender.workLocation]
  ];

  autoTable(doc, {
    startY: cursorY,
    head: paramHeaders,
    body: paramRows,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [15, 23, 42], textColor: [248, 250, 252], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 70 },
      2: { halign: 'right', fontStyle: 'bold' }
    }
  });

  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Rate Breakdown & Quote Forecast Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('DETERMINISTIC COST TAKEOFF & BID QUOTATION', 14, cursorY);
  cursorY += 4;

  const costHeaders = [['Cost Component', 'Allocation Split / Percentage', 'Amount (INR)']];
  const costRows = [
    ['1. Direct Material Supplies', 'Cement, Steel, Aggregates, Masonry (58%)', formatCurrency(breakdown.materialCost, tender.currency)],
    ['2. Direct Skilled & Unskilled Labor', 'Site workforce & tradesmen (24%)', formatCurrency(breakdown.laborCost, tender.currency)],
    ['3. Plant, Machinery & Fuel (POL)', 'Earthmoving, Batching, Transport (10%)', formatCurrency(breakdown.machineryCost, tender.currency)],
    ['4. Site Overheads & Quality Testing', 'Site setup, lab, testing, insurance (8%)', formatCurrency(breakdown.overheadCost, tender.currency)],
    ['SUBTOTAL DIRECT WORKS', 'Direct construction expenses', formatCurrency(breakdown.subtotalDirect, tender.currency)],
    ['5. Contingency Reserve', `Unforeseen subsoil & site risks (${breakdown.contingencyPercent}%)`, formatCurrency(breakdown.contingencyAmount, tender.currency)],
    ['6. Contractor Profit Margin', `Target corporate operational margin (${breakdown.contractorMarginPercent}%)`, formatCurrency(breakdown.contractorMarginAmount, tender.currency)],
    ['7. Statutory GST', `Goods & Services Tax (${breakdown.gstPercent}%)`, formatCurrency(breakdown.gstAmount, tender.currency)],
    ['TOTAL RECOMMENDED BID PROPOSAL', 'All-inclusive tendered offer', formatCurrency(breakdown.finalBidAmount, tender.currency)]
  ];

  autoTable(doc, {
    startY: cursorY,
    head: costHeaders,
    body: costRows,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [245, 158, 11], textColor: [15, 23, 42], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 75 },
      1: { cellWidth: 55 },
      2: { halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.row.index === 4 || data.row.index === 8) {
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // 5. Critical Clauses Summary
  if (cursorY < pageHeight - 50) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('CRITICAL CONTRACTUAL SAFEGUARDS', 14, cursorY);
    cursorY += 4;

    const clauseHeaders = [['Clause Ref', 'Title', 'Risk Exposure', 'Mitigation Recommendation']];
    const clauseRows = tender.clauses.slice(0, 4).map(c => [
      c.articleRef,
      c.title,
      c.riskLevel.toUpperCase(),
      c.recommendation
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: clauseHeaders,
      body: clauseRows,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 45 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 75 }
      }
    });

    cursorY = (doc as any).lastAutoTable.finalY + 14;
  } else {
    doc.addPage();
    cursorY = 20;
  }

  // 6. Formal Sign-Off Blocks
  if (cursorY > pageHeight - 40) {
    doc.addPage();
    cursorY = 30;
  }

  const signColWidth = (pageWidth - 28) / 3;
  const lineY = cursorY + 12;

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);

  // Signer 1
  doc.line(14, lineY, 14 + signColWidth - 8, lineY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('PREPARED BY', 14, lineY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Senior Quantity Surveyor', 14, lineY + 9);

  // Signer 2
  doc.line(14 + signColWidth, lineY, 14 + (signColWidth * 2) - 8, lineY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED BY', 14 + signColWidth, lineY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Chief Estimator / Project Lead', 14 + signColWidth, lineY + 9);

  // Signer 3
  doc.line(14 + (signColWidth * 2), lineY, pageWidth - 14, lineY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTHORIZED SIGNATORY', 14 + (signColWidth * 2), lineY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Managing Director / Partner', 14 + (signColWidth * 2), lineY + 9);

  // Save PDF
  const cleanNIT = tender.nitNumber.replace(/[\/\\]/g, '_');
  doc.save(`TenderAI_Dossier_${cleanNIT}.pdf`);
}

export function generateBOQSchedulePDF(
  tender: TenderDocument,
  settings: AppSettings
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(11, 15, 23);
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TENDERAI - BILL OF QUANTITIES (BOQ) RATE SCHEDULE', 14, 9);

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${tender.authority}: ${tender.nitNumber} | ${settings.organizationName}`, 14, 15);

  const boqHeaders = [['Item No', 'Category', 'Description & Specification', 'Unit', 'Quantity', 'Estimated Rate (INR)', 'Total Amount (INR)', 'DSR / IS Ref']];
  const boqRows = tender.boqItems.map(item => [
    item.itemNumber,
    item.category.replace('_', ' ').toUpperCase(),
    item.description,
    item.unit.toUpperCase(),
    item.quantity.toLocaleString('en-IN'),
    `Rs. ${item.estimatedRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    `Rs. ${(item.quantity * item.estimatedRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    item.specificationRef
  ]);

  autoTable(doc, {
    startY: 28,
    head: boqHeaders,
    body: boqRows,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [15, 23, 42], textColor: [248, 250, 252], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 28 },
      2: { cellWidth: 95 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 32, halign: 'right' },
      6: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 25 }
    }
  });

  const cleanNIT = tender.nitNumber.replace(/[\/\\]/g, '_');
  doc.save(`TenderAI_BOQ_${cleanNIT}.pdf`);
}

export function generateCompliancePDF(
  tender: TenderDocument,
  settings: AppSettings
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(11, 15, 23);
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TENDERAI - QUALIFICATION & COMPLIANCE MATRIX', 14, 9);

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`TENDER: ${tender.nitNumber} | BIDDER: ${settings.organizationName}`, 14, 15);

  const headers = [['Parameter', 'Requirement Stipulation', 'Bidder Benchmark', 'Status', 'Citation']];
  const rows = tender.eligibility.map(el => [
    el.title,
    el.requirementText,
    el.extractedValue,
    el.status.toUpperCase(),
    `Page ${el.citationPage}`
  ]);

  autoTable(doc, {
    startY: 28,
    head: headers,
    body: rows,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 35 },
      3: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 18, halign: 'center' }
    }
  });

  const cleanNIT = tender.nitNumber.replace(/[\/\\]/g, '_');
  doc.save(`TenderAI_Compliance_${cleanNIT}.pdf`);
}
