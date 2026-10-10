/**
 * TenderAI: Construction Tender Document Assistant
 * Core Domain Type Definitions
 */

export type ProjectAuthority = 'CPWD' | 'NHAI' | 'State PWD' | 'Railways' | 'Metro Rail' | 'Municipal Corp' | 'Private/Industrial';

export type ClauseType = 
  | 'liquidated_damages'
  | 'defect_liability'
  | 'price_escalation'
  | 'force_majeure'
  | 'dispute_resolution'
  | 'mobilization_advance'
  | 'retention_money'
  | 'termination'
  | 'subcontracting'
  | 'environmental_safety';

export type BOQCategory = 
  | 'earthwork'
  | 'substructure_concrete'
  | 'superstructure_rcc'
  | 'reinforcement_steel'
  | 'brickwork_masonry'
  | 'finishing_plastering'
  | 'flooring_paving'
  | 'structural_steel'
  | 'plumbing_sanitary'
  | 'electrical_services'
  | 'external_development';

export interface BOQItem {
  id: string;
  itemNumber: string;
  category: BOQCategory;
  description: string;
  unit: string; // 'cum', 'sqm', 'MT', 'rmt', 'nos', 'LS'
  quantity: number;
  estimatedRate: number; // in INR
  totalAmount: number;
  specificationRef: string; // e.g. "CPWD DSR 2023 Item 2.8.1"
  notes?: string;
}

export interface ContractClause {
  id: string;
  type: ClauseType;
  title: string;
  rawExtract: string;
  summary: string;
  riskLevel: 'standard' | 'attention' | 'critical';
  pageNumber: number;
  articleRef: string; // e.g. "GCC Clause 2(v)", "SCC Section 4.2"
  detectedKeywords: string[];
  recommendation: string;
}

export interface EligibilityCriterion {
  id: string;
  category: 'financial_turnover' | 'past_experience' | 'bid_capacity' | 'solvency' | 'equipment' | 'personnel';
  title: string;
  requirementText: string;
  extractedValue: string;
  thresholdValue: string;
  mandatory: boolean;
  status: 'eligible' | 'review_needed' | 'ineligible';
  citationPage: number;
}

export interface TenderDeadline {
  id: string;
  milestone: string;
  date: string; // ISO format or YYYY-MM-DD
  time?: string;
  type: 'submission' | 'prebid' | 'clarification' | 'emd' | 'opening';
  status: 'upcoming' | 'urgent' | 'completed' | 'passed';
  notes: string;
  location?: string;
}

export interface BudgetCostBreakdown {
  materialCost: number;
  laborCost: number;
  machineryCost: number;
  overheadCost: number;
  subtotalDirect: number;
  contingencyPercent: number;
  contingencyAmount: number;
  contractorMarginPercent: number;
  contractorMarginAmount: number;
  gstPercent: number;
  gstAmount: number;
  finalBidAmount: number;
}

export interface TenderDocument {
  id: string;
  ownerUid: string;
  nitNumber: string;
  title: string;
  authority: ProjectAuthority;
  issuingDepartment: string;
  estimatedCost: number; // in INR, e.g. 487500000 (48.75 Cr)
  currency: 'INR' | 'USD';
  emdAmount: number; // in INR
  tenderFee: number; // in INR
  bidSecurityType: 'Bank Guarantee' | 'FDR' | 'e-Payment' | 'Exempted (MSME)';
  publicationDate: string;
  submissionDeadline: string;
  preBidMeetingDate: string;
  technicalBidOpeningDate: string;
  workLocation: string;
  completionPeriodMonths: number;
  defectLiabilityMonths: number;
  status: 'In Review' | 'Bidding' | 'Under Evaluation' | 'Awarded' | 'Archived';
  pageCount: number;
  rawTextExcerpt?: string;
  boqItems: BOQItem[];
  clauses: ContractClause[];
  eligibility: EligibilityCriterion[];
  deadlines: TenderDeadline[];
  budgetCalculation?: BudgetCostBreakdown;
  uploadedAt: string;
}

export interface TenderDraftTemplate {
  id: string;
  name: string;
  category: 'prebid_query' | 'covering_letter' | 'emd_undertaking' | 'deviation_statement' | 'joint_venture_declaration';
  description: string;
  templateBody: string;
  requiredFields: string[];
}

export interface AppSettings {
  organizationName: string;
  contractorLicenseClass: string;
  gstin: string;
  defaultCurrency: 'INR' | 'USD';
  measurementStandard: 'CPWD DSR' | 'IS Codes' | 'FIDIC' | 'MoRTH';
  defaultContingencyPercent: number;
  defaultMarginPercent: number;
  defaultGstPercent: number;
  turnoverLast3YearsAvg: number; // in INR
  maxBidCapacity: number; // in INR
}
