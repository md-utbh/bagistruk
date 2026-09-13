/**
 * Receipt Data Types
 *
 * Shared type definitions for the receipt processing pipeline.
 * Used by both the API route handler and client-side components.
 */

/** Supported document types */
export type DocumentType = "expense_receipt" | "income_transfer";

/** Receipt category classification */
export type ReceiptCategory =
  | "F&B"
  | "Groceries"
  | "Transport"
  | "Entertainment"
  | "Others";

/** A single line item extracted from a receipt */
export interface ReceiptItem {
  name: string;
  category: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

/** Financial summary of the receipt */
export interface ReceiptFinancials {
  discount: number;
  tax: number;
  service_fee: number;
  grand_total: number;
}

/** Complete parsed receipt data — the core domain object */
export interface ReceiptData {
  is_valid_receipt: boolean;
  error_reason: string | null;
  document_type: "expense_receipt" | "income_transfer";
  receipt_category: "F&B" | "Groceries" | "Transport" | "Entertainment" | "Others";
  store_name: string;
  date: string; // YYYY-MM-DD
  items: ReceiptItem[];
  financials: ReceiptFinancials;
}

/** Request body sent from the client to /api/process-receipt */
export interface ProcessReceiptRequest {
  base64Image: string;
  mimeType: "image/webp" | "image/jpeg";
}

/** Successful response from /api/process-receipt */
export interface ProcessReceiptResponse {
  success: true;
  data: ReceiptData;
}

/** Error response from /api/process-receipt */
export interface ProcessReceiptErrorResponse {
  success: false;
  error: string;
  code: "INVALID_INPUT" | "AI_ERROR" | "PARSE_ERROR" | "SERVER_ERROR" | "RATE_LIMIT";
}

// ─── Split Bill Data Types ──────────────────────────────────────────

/** A participant sharing the bill */
export interface Participant {
  id: string;
  name: string;
}

/** An item that can be assigned to participants */
export interface SplitItem extends ReceiptItem {
  id: string;
  assignees: string[]; // Array of participant IDs
}

/** The final calculated split result for a participant */
export interface SplitResult {
  participantId: string;
  name: string;
  grossSubtotal: number;
  discount: number;
  tax: number;
  service_fee: number;
  total: number;
  items: {
    name: string;
    quantityShared: number; // e.g. if 2 people share 1 item, this is 0.5
    pricePerPerson: number;
  }[];
}
