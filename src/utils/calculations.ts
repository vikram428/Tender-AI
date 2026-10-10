/**
 * Deterministic civil engineering calculation and formatting utilities
 */

import { BOQItem, BudgetCostBreakdown } from '../types/tender';

/**
 * Format currency in Indian numbering system (Lakhs, Crores) or International format
 */
export function formatCurrency(amount: number, currency: 'INR' | 'USD' = 'INR', compact: boolean = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹ 0.00';

  if (currency === 'INR') {
    if (compact) {
      if (Math.abs(amount) >= 10000000) {
        return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
      } else if (Math.abs(amount) >= 100000) {
        return `₹ ${(amount / 100000).toFixed(2)} L`;
      } else if (Math.abs(amount) >= 1000) {
        return `₹ ${(amount / 1000).toFixed(1)} K`;
      }
      return `₹ ${amount.toLocaleString('en-IN')}`;
    }

    // Standard Indian number format
    return `₹ ${amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
  }

  // USD / Default
  if (compact) {
    if (Math.abs(amount) >= 1000000) return `$ ${(amount / 1000000).toFixed(2)}M`;
    if (Math.abs(amount) >= 1000) return `$ ${(amount / 1000).toFixed(1)}K`;
  }
  return `$ ${amount.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

/**
 * Calculate deterministic budget breakdown for civil works
 */
export function calculateBudgetBreakdown(
  items: BOQItem[],
  materialRatio = 0.58, // Standard civil work material split (~58%)
  laborRatio = 0.24,    // Standard labor split (~24%)
  machineryRatio = 0.10, // Equipment & plant (~10%)
  overheadRatio = 0.08,  // Site overhead & supervision (~8%)
  contingencyPercent = 3.0,
  contractorMarginPercent = 10.0,
  gstPercent = 18.0
): BudgetCostBreakdown {
  const subtotalDirect = items.reduce((sum, item) => sum + (item.quantity * item.estimatedRate), 0);

  const materialCost = subtotalDirect * materialRatio;
  const laborCost = subtotalDirect * laborRatio;
  const machineryCost = subtotalDirect * machineryRatio;
  const overheadCost = subtotalDirect * overheadRatio;

  const contingencyAmount = (subtotalDirect * contingencyPercent) / 100;
  const contractorMarginAmount = ((subtotalDirect + contingencyAmount) * contractorMarginPercent) / 100;
  
  const taxableTotal = subtotalDirect + contingencyAmount + contractorMarginAmount;
  const gstAmount = (taxableTotal * gstPercent) / 100;
  const finalBidAmount = taxableTotal + gstAmount;

  return {
    materialCost,
    laborCost,
    machineryCost,
    overheadCost,
    subtotalDirect,
    contingencyPercent,
    contingencyAmount,
    contractorMarginPercent,
    contractorMarginAmount,
    gstPercent,
    gstAmount,
    finalBidAmount
  };
}

/**
 * Standard CPWD / NHAI Available Bid Capacity formula:
 * Available Bid Capacity = (2 * A * N) - B
 * Where:
 * A = Maximum annual civil turnover achieved in any one year during last five financial years
 * N = Number of years prescribed for completion of the subject contract (Months / 12)
 * B = Value of existing commitments and on-going works to be completed during period N
 */
export function calculateBidCapacity(
  maxAnnualTurnover: number,
  completionPeriodMonths: number,
  existingCommitmentsValue: number
): { availableCapacity: number; factorA: number; factorN: number; factorB: number; meetsRequirement: boolean; thresholdNeeded?: number } {
  const factorA = maxAnnualTurnover;
  const factorN = completionPeriodMonths / 12;
  const factorB = existingCommitmentsValue;

  const grossCapacity = 2 * factorA * factorN;
  const availableCapacity = Math.max(0, grossCapacity - factorB);

  return {
    availableCapacity,
    factorA,
    factorN,
    factorB,
    meetsRequirement: true
  };
}

/**
 * Calculate days remaining until deadline
 */
export function calculateDaysRemaining(deadlineDateStr: string): { days: number; isOverdue: boolean; label: string } {
  const target = new Date(deadlineDateStr).getTime();
  const now = new Date().getTime();
  const diffMs = target - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      isOverdue: true,
      label: `${Math.abs(diffDays)}d overdue`
    };
  } else if (diffDays === 0) {
    return {
      days: 0,
      isOverdue: false,
      label: 'Due today'
    };
  } else {
    return {
      days: diffDays,
      isOverdue: false,
      label: `${diffDays} days remaining`
    };
  }
}
