/**
 * Conventional NLP, Rule-Based Information Extraction and Deterministic Parser
 * Specifically calibrated for Civil Engineering and Construction Tender Documents (CPWD, NHAI, State PWD, GeM, FIDIC)
 */

import { ContractClause, BOQItem, BOQCategory, EligibilityCriterion, TenderDeadline } from '../types/tender';

export interface ExtractedTenderFields {
  nitNumber?: string;
  title?: string;
  authority?: string;
  estimatedCost?: number;
  emdAmount?: number;
  tenderFee?: number;
  completionMonths?: number;
  submissionDeadline?: string;
  preBidMeetingDate?: string;
  clauses: ContractClause[];
  boqItems: BOQItem[];
  eligibility: EligibilityCriterion[];
  deadlines: TenderDeadline[];
}

/**
 * Deterministic rule-based extractor for tender document plain text
 */
export function extractTenderMetadataFromText(text: string): ExtractedTenderFields {
  const result: ExtractedTenderFields = {
    clauses: [],
    boqItems: [],
    eligibility: [],
    deadlines: []
  };

  // 1. NIT Number extraction patterns
  const nitPatterns = [
    /(?:NIT\s*(?:No\.?|Notice\s*Inviting\s*Tender|Tender\s*Notice|e-Tender\s*No\.?)[\s\:\-]+)([A-Za-z0-9\/\-\_.]+)/i,
    /(?:Tender\s*Reference\s*Number[\s\:\-]+)([A-Za-z0-9\/\-\_.]+)/i,
    /(?:Bid\s*Identification\s*No[\s\:\-]+)([A-Za-z0-9\/\-\_.]+)/i
  ];

  for (const regex of nitPatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      result.nitNumber = match[1].trim();
      break;
    }
  }

  // 2. Authority extraction
  if (/Central\s*Public\s*Works\s*Department|CPWD/i.test(text)) {
    result.authority = 'CPWD';
  } else if (/National\s*Highways\s*Authority|NHAI/i.test(text)) {
    result.authority = 'NHAI';
  } else if (/Metro\s*Rail|DMRC|BMRCL|MMRDA/i.test(text)) {
    result.authority = 'Metro Rail';
  } else if (/Public\s*Works\s*Department|PWD/i.test(text)) {
    result.authority = 'State PWD';
  } else if (/Municipal\s*Corporation|Nagar\s*Nigam/i.test(text)) {
    result.authority = 'Municipal Corp';
  } else if (/Indian\s*Railways|Railway\s*Board/i.test(text)) {
    result.authority = 'Railways';
  } else {
    result.authority = 'State PWD';
  }

  // 3. Estimated Cost extraction
  const costMatch = text.match(/(?:Estimated\s*Cost|Tender\s*Value|Estimated\s*Value|ECPT)[\s\:\-–₹Rs\.]*([\d\,]+(?:\.\d+)?)\s*(Cr(?:ore)?s?|Lakhs?|L)?/i);
  if (costMatch) {
    const rawNum = parseFloat(costMatch[1].replace(/,/g, ''));
    const unit = costMatch[2]?.toLowerCase();
    if (unit && unit.startsWith('cr')) {
      result.estimatedCost = rawNum * 10000000;
    } else if (unit && unit.startsWith('l')) {
      result.estimatedCost = rawNum * 100000;
    } else {
      result.estimatedCost = rawNum;
    }
  }

  // 4. EMD extraction
  const emdMatch = text.match(/(?:Earnest\s*Money\s*Deposit|EMD|Bid\s*Security)[\s\:\-–₹Rs\.]*([\d\,]+(?:\.\d+)?)\s*(Cr(?:ore)?s?|Lakhs?|L)?/i);
  if (emdMatch) {
    const rawNum = parseFloat(emdMatch[1].replace(/,/g, ''));
    const unit = emdMatch[2]?.toLowerCase();
    if (unit && unit.startsWith('cr')) {
      result.emdAmount = rawNum * 10000000;
    } else if (unit && unit.startsWith('l')) {
      result.emdAmount = rawNum * 100000;
    } else {
      result.emdAmount = rawNum;
    }
  }

  // 5. Completion Period extraction
  const durationMatch = text.match(/(?:Time\s*allowed\s*for\s*completion|Completion\s*Period|Period\s*of\s*Contract|Work\s*Duration)[\s\:\-]*(\d+)\s*(Months?|Days?|Years?)/i);
  if (durationMatch) {
    const count = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2].toLowerCase();
    if (unit.startsWith('year')) {
      result.completionMonths = count * 12;
    } else if (unit.startsWith('day')) {
      result.completionMonths = Math.round(count / 30);
    } else {
      result.completionMonths = count;
    }
  }

  // 6. Rule-based clause detection using keyword dictionaries
  const clauseRules = [
    {
      type: 'liquidated_damages' as const,
      keywords: ['liquidated damages', 'compensation for delay', 'clause 2', '0.5% per week', '10% of tender value'],
      title: 'Compensation for Delay & Liquidated Damages',
      articleRef: 'CPWD GCC Clause 2 / FIDIC 8.7',
      risk: 'critical' as const,
      recommendation: 'Track project milestones meticulously. Maximum penalty capped at 10% of tendered value.'
    },
    {
      type: 'defect_liability' as const,
      keywords: ['defect liability period', 'maintenance period', 'rectification of defects', 'guarantee period'],
      title: 'Defect Liability Period (DLP)',
      articleRef: 'GCC Clause 17 / FIDIC 11',
      risk: 'standard' as const,
      recommendation: 'Ensure 5% retention money is scheduled for release after completion of defect rectification period.'
    },
    {
      type: 'price_escalation' as const,
      keywords: ['price variation', 'clause 10ca', 'clause 10cc', 'escalation', 'wholesale price index', 'labor index'],
      title: 'Price Adjustment & Material Escalation (Clause 10CA / 10CC)',
      articleRef: 'CPWD Clause 10CA / MoRTH 108',
      risk: 'attention' as const,
      recommendation: 'Verify if cement, steel, bitumen, and POL prices are reimbursable against RBI index movements.'
    },
    {
      type: 'dispute_resolution' as const,
      keywords: ['arbitration', 'dispute resolution board', 'conciliation', 'sole arbitrator', 'adjudicator'],
      title: 'Dispute Resolution & Arbitration Clause',
      articleRef: 'GCC Clause 25 / Arbitration Act',
      risk: 'standard' as const,
      recommendation: 'Notice for dispute must be raised within 30 days of engineer-in-charge determination.'
    },
    {
      type: 'mobilization_advance' as const,
      keywords: ['mobilization advance', 'plant and machinery advance', 'bank guarantee for advance', 'interest rate 10%'],
      title: 'Mobilization & Machinery Advance',
      articleRef: 'CPWD GCC Clause 10B / FIDIC 14.2',
      risk: 'attention' as const,
      recommendation: 'Secured advance of 10% contract value against unconditional Bank Guarantee at simple interest.'
    }
  ];

  const lowerText = text.toLowerCase();
  let clauseId = 1;

  for (const rule of clauseRules) {
    const matchedKeywords = rule.keywords.filter(kw => lowerText.includes(kw));
    if (matchedKeywords.length > 0) {
      // Find sentence context
      const kw = matchedKeywords[0];
      const pos = lowerText.indexOf(kw);
      const start = Math.max(0, pos - 80);
      const end = Math.min(text.length, pos + 220);
      const snippet = text.substring(start, end).replace(/\s+/g, ' ').trim();

      result.clauses.push({
        id: `clause-parsed-${clauseId++}`,
        type: rule.type,
        title: rule.title,
        articleRef: rule.articleRef,
        rawExtract: `"...${snippet}..."`,
        summary: `Detected ${matchedKeywords.join(', ')} terms. Governs contractual obligations and financial impact.`,
        riskLevel: rule.risk,
        pageNumber: Math.max(1, Math.floor(pos / 2500) + 1),
        detectedKeywords: matchedKeywords,
        recommendation: rule.recommendation
      });
    }
  }

  return result;
}

/**
 * Filter BOQ items by search keyword and category
 */
export function filterBOQItems(items: BOQItem[], query: string, category: string): BOQItem[] {
  return items.filter(item => {
    const matchesCategory = category === 'all' || item.category === category;
    const q = query.toLowerCase().trim();
    const matchesQuery = !q || 
      item.itemNumber.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.specificationRef.toLowerCase().includes(q) ||
      item.unit.toLowerCase().includes(q);
    
    return matchesCategory && matchesQuery;
  });
}
