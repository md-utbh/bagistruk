import type { ReceiptFinancials, SplitItem, Participant, SplitResult } from "./types";

export type RoundingMode = "exact" | "nearest_100" | "nearest_500" | "nearest_1000";

/**
 * Calculates the strict deterministic split of a receipt among participants.
 *
 * Mathematical rules:
 * 1. Participant Gross Subtotal = sum of (Item Price * Quantity / Assignee Count) for all items assigned to them.
 * 2. Total Gross Subtotal = sum of (Item Price * Quantity) for all items.
 * 3. Participant Ratio = Participant Gross Subtotal / Total Gross Subtotal.
 * 4. Discount/Tax/Service for Participant = Ratio * Nominal Discount/Tax/Service from receipt.
 * 5. Participant Total = Gross Subtotal - Discount + Tax + Service.
 * 6. Reconciliation: Use Math.floor for per-person values.
 * 7. Remainder = Grand Total - sum of Floored Participant Totals.
 * 8. Add remainder (usually 1-5 rupiah) to the first participant to ensure the sum exactly matches the Grand Total.
 *
 * @param items List of receipt items with assignee information
 * @param financials Financial summary (discount, tax, service_fee, grand_total)
 * @param participants List of all active participants
 * @returns Array of SplitResult detailing exactly what each person owes
 */
export function calculateSplit(
  items: SplitItem[],
  financials: ReceiptFinancials,
  participants: Participant[],
  roundingMode: RoundingMode = "exact"
): SplitResult[] {
  // If no participants, we can't split
  if (participants.length === 0) {
    return [];
  }

  // 1. Calculate Total Gross Subtotal of all items
  const totalGrossSubtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  // Initialize results mapping for each participant
  const resultsMap = new Map<string, Omit<SplitResult, "participantId">>();

  for (const p of participants) {
    resultsMap.set(p.id, {
      name: p.name,
      grossSubtotal: 0,
      discount: 0,
      tax: 0,
      service_fee: 0,
      total: 0,
      items: [],
    });
  }

  // 2. Calculate Participant Gross Subtotal and Itemized breakdown
  for (const item of items) {
    // If an item has no assignees, skip it in participant calculations.
    // Note: In a real app, we might want to warn the user if an item is unassigned.
    if (item.assignees.length === 0) continue;

    const totalItemValue = item.unit_price * item.quantity;
    const valuePerAssignee = totalItemValue / item.assignees.length;
    const quantityPerAssignee = item.quantity / item.assignees.length;

    for (const assigneeId of item.assignees) {
      const pResult = resultsMap.get(assigneeId);
      if (pResult) {
        pResult.grossSubtotal += valuePerAssignee;
        pResult.items.push({
          name: item.name,
          quantityShared: quantityPerAssignee,
          pricePerPerson: valuePerAssignee,
        });
      }
    }
  }

  // 3 & 4. Calculate Ratios and Proportional Fees
  let totalFlooredSum = 0;
  const finalResults: SplitResult[] = [];

  for (const p of participants) {
    const pResult = resultsMap.get(p.id)!;

    // Calculate ratio (handle 0 division if totalGrossSubtotal is 0)
    const ratio = totalGrossSubtotal > 0 ? pResult.grossSubtotal / totalGrossSubtotal : 0;

    pResult.discount = ratio * financials.discount;
    pResult.tax = ratio * financials.tax;
    pResult.service_fee = ratio * financials.service_fee;

    // 5. Exact Total
    const exactTotal =
      pResult.grossSubtotal - pResult.discount + pResult.tax + pResult.service_fee;

    // 6. Reconciliation: Apply Rounding Mode
    let roundedTotal = exactTotal;
    if (roundingMode === "exact") {
      roundedTotal = Math.floor(exactTotal);
    } else if (roundingMode === "nearest_100") {
      roundedTotal = Math.round(exactTotal / 100) * 100;
    } else if (roundingMode === "nearest_500") {
      roundedTotal = Math.round(exactTotal / 500) * 500;
    } else if (roundingMode === "nearest_1000") {
      roundedTotal = Math.round(exactTotal / 1000) * 1000;
    }

    pResult.total = roundedTotal;
    totalFlooredSum += pResult.total;

    finalResults.push({
      participantId: p.id,
      ...pResult,
    });
  }

  // 7 & 8. Distribute Remainder to the first participant
  const remainder = financials.grand_total - totalFlooredSum;

  if (finalResults.length > 0 && remainder !== 0) {
    // Ensure we don't accidentally subtract if somehow floored sum > grand total
    // Though mathematically Math.floor sum should always be <= actual sum (if all positive)
    // There might be edge cases with rounding errors, but we strictly match grand_total here.
    finalResults[0].total += remainder;
  }

  return finalResults;
}
