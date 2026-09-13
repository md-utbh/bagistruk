import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type {
  ProcessReceiptResponse,
  ProcessReceiptErrorResponse,
  ReceiptData,
} from "@/lib/types";

// ─── Gemini Client (Server-Side Only) ───────────────────────────────

const apiKey = process.env.GEMINI_API_KEY;

function getGeminiClient(): GoogleGenAI {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
}

// ─── Dev Mock Mode ──────────────────────────────────────────────────
// Set to `true` to skip real Gemini API calls during UI development.
// This saves your quota (15 RPM limit) while working on frontend.
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && true;

const MOCK_RECEIPT_DATA: ReceiptData = {
  is_valid_receipt: true,
  error_reason: null,
  document_type: "expense_receipt",
  receipt_category: "F&B",
  store_name: "Warung Bahari Nusantara",
  date: new Date().toISOString().split("T")[0],
  items: [
    { name: "Nasi Goreng Spesial", category: "Makanan", quantity: 2, unit_price: 25000, subtotal: 50000 },
    { name: "Es Teh Manis", category: "Minuman", quantity: 2, unit_price: 8000, subtotal: 16000 },
    { name: "Kerupuk Udang", category: "Snack", quantity: 1, unit_price: 5000, subtotal: 5000 },
  ],
  financials: {
    discount: 0,
    tax: 7100,
    service_fee: 0,
    grand_total: 78100,
  },
};

// ─── System Prompt ──────────────────────────────────────────────────

const SYSTEM_PROMPT = `Kamu adalah AI ahli membaca struk belanja dan tanda terima (receipt/invoice).

TUGAS:
Analisis gambar struk/tanda terima yang diberikan. Ekstrak SEMUA informasi yang terlihat dan kembalikan dalam format JSON yang ketat.

ATURAN KETAT:
1. WAJIB balas HANYA dengan JSON murni. JANGAN gunakan markdown, code block, backtick, atau teks apapun di luar JSON.
2. Semua nilai angka (number) harus berupa angka tanpa format (tanpa titik ribuan, tanpa "Rp"). Contoh: 185500, bukan "Rp 185.500" atau "185.500".
3. Jika gambar yang diunggah BUKAN struk belanja atau bukti transfer, set is_valid_receipt = false, dan tulis alasannya di error_reason. Jangan isi array items.
4. Jika ada item yang tidak jelas terbaca, tetap tulis perkiraan terbaik.
5. Jika informasi tidak tersedia, gunakan nilai default: string kosong "", angka 0.
6. Tanggal HARUS dalam format "YYYY-MM-DD". Jika tahun tidak terlihat, asumsikan tahun saat ini (2026).
7. Kategori receipt_category hanya boleh salah satu dari: "F&B", "Groceries", "Transport", "Entertainment", "Others".
8. document_type: gunakan "expense_receipt" untuk struk pembelian/belanja, "income_transfer" untuk bukti transfer masuk.
9. Untuk setiap item, hitung subtotal = quantity × unit_price.
10. grand_total adalah total akhir yang tertera di struk (setelah diskon, pajak, service fee).

SKEMA JSON YANG WAJIB DIIKUTI:
{
  "is_valid_receipt": boolean,
  "error_reason": "string | null",
  "document_type": "expense_receipt" | "income_transfer",
  "receipt_category": "F&B" | "Groceries" | "Transport" | "Entertainment" | "Others",
  "store_name": "string",
  "date": "YYYY-MM-DD",
  "items": [
    {
      "name": "string",
      "category": "string (kategori spesifik item, misal: Minuman, Makanan, Snack, dll)",
      "quantity": number,
      "unit_price": number,
      "subtotal": number
    }
  ],
  "financials": {
    "discount": number,
    "tax": number,
    "service_fee": number,
    "grand_total": number
  }
}

INGAT: Jawab HANYA dengan JSON. Tidak boleh ada teks lain.`;

// ─── Validation ─────────────────────────────────────────────────────

function isValidBase64(str: string): boolean {
  if (!str || str.length === 0) return false;
  // Check for reasonable base64 length (at least ~1KB of image data)
  if (str.length < 100) return false;
  // Basic base64 character validation
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  return base64Regex.test(str);
}

function isValidMimeType(mime: string): mime is "image/webp" | "image/jpeg" {
  return mime === "image/webp" || mime === "image/jpeg";
}

const VALID_CATEGORIES = ["F&B", "Groceries", "Transport", "Entertainment", "Others"];
const VALID_DOC_TYPES = ["expense_receipt", "income_transfer"];

/**
 * Validates and sanitizes the parsed receipt data.
 * Ensures all required fields exist with correct types.
 */
function validateReceiptData(data: unknown): ReceiptData {
  if (!data || typeof data !== "object") {
    throw new Error("Response bukan object JSON yang valid.");
  }

  const d = data as Record<string, unknown>;

  const isValidReceipt = typeof d.is_valid_receipt === "boolean" ? d.is_valid_receipt : true;
  const errorReason = typeof d.error_reason === "string" ? d.error_reason : null;

  // Validate document_type
  const docType = VALID_DOC_TYPES.includes(d.document_type as string)
    ? (d.document_type as ReceiptData["document_type"])
    : "expense_receipt";

  // Validate receipt_category
  const category = VALID_CATEGORIES.includes(d.receipt_category as string)
    ? (d.receipt_category as ReceiptData["receipt_category"])
    : "Others";

  // Validate store_name
  const storeName = typeof d.store_name === "string" ? d.store_name : "";

  // Validate date
  const dateStr = typeof d.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d.date)
    ? d.date
    : new Date().toISOString().split("T")[0];

  // Validate items
  const rawItems = Array.isArray(d.items) ? d.items : [];
  const items = rawItems.map((item: unknown) => {
    const i = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    return {
      name: typeof i.name === "string" ? i.name : "",
      category: typeof i.category === "string" ? i.category : "",
      quantity: typeof i.quantity === "number" && i.quantity > 0 ? i.quantity : 1,
      unit_price: typeof i.unit_price === "number" ? i.unit_price : 0,
      subtotal: typeof i.subtotal === "number" ? i.subtotal : 0,
    };
  });

  // Validate financials
  const rawFin = (d.financials && typeof d.financials === "object"
    ? d.financials
    : {}) as Record<string, unknown>;

  const financials = {
    discount: typeof rawFin.discount === "number" ? rawFin.discount : 0,
    tax: typeof rawFin.tax === "number" ? rawFin.tax : 0,
    service_fee: typeof rawFin.service_fee === "number" ? rawFin.service_fee : 0,
    grand_total: typeof rawFin.grand_total === "number" ? rawFin.grand_total : 0,
  };

  return {
    is_valid_receipt: isValidReceipt,
    error_reason: errorReason,
    document_type: docType,
    receipt_category: category,
    store_name: storeName,
    date: dateStr,
    items,
    financials,
  };
}

// ─── Route Handler ──────────────────────────────────────────────────

export async function POST(
  request: NextRequest
): Promise<NextResponse<ProcessReceiptResponse | ProcessReceiptErrorResponse>> {
  try {
    // 1. Parse request body
    let body: { base64Image?: string; mimeType?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Body request tidak valid.", code: "INVALID_INPUT" as const },
        { status: 400 }
      );
    }

    const { base64Image, mimeType } = body;

    // 2. Validate input
    if (!base64Image || !isValidBase64(base64Image)) {
      return NextResponse.json(
        { success: false, error: "Data gambar base64 tidak valid atau kosong.", code: "INVALID_INPUT" as const },
        { status: 400 }
      );
    }

    if (!mimeType || !isValidMimeType(mimeType)) {
      return NextResponse.json(
        { success: false, error: "MIME type tidak valid. Harus image/webp atau image/jpeg.", code: "INVALID_INPUT" as const },
        { status: 400 }
      );
    }

    // 3. Dev Mock Mode — skip Gemini to save quota
    if (USE_MOCK_DATA) {
      console.log("[Mock Mode] Returning dummy receipt data (Gemini API skipped)");
      await new Promise((resolve) => setTimeout(resolve, 3000)); // simulate AI latency
      return NextResponse.json({
        success: true,
        data: MOCK_RECEIPT_DATA,
      });
    }

    // 4. Call Gemini Vision API
    const ai = getGeminiClient();

    let responseText: string;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: SYSTEM_PROMPT },
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
              { text: "Analisis struk pada gambar ini dan kembalikan hasilnya dalam format JSON sesuai skema." },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 4096,
        },
      });

      responseText = response.text ?? "";
    } catch (err: unknown) {
      console.error("[Gemini API Error]", err);

      // Handle 429 Rate Limit / RESOURCE_EXHAUSTED
      const errObj = err as { status?: number; message?: string };
      const is429 =
        errObj.status === 429 ||
        errObj.message?.includes("429") ||
        errObj.message?.includes("RESOURCE_EXHAUSTED");

      if (is429) {
        return NextResponse.json(
          {
            success: false,
            error: "Server AI sedang sibuk memproses banyak struk. Mohon tunggu sekitar 30 detik sebelum mencoba lagi.",
            code: "RATE_LIMIT" as const,
          },
          { status: 429 }
        );
      }

      const message = err instanceof Error ? err.message : "Unknown AI error";
      return NextResponse.json(
        { success: false, error: `Gagal menghubungi AI: ${message}`, code: "AI_ERROR" as const },
        { status: 502 }
      );
    }

    // 4. Parse AI response
    if (!responseText.trim()) {
      return NextResponse.json(
        { success: false, error: "AI mengembalikan respons kosong.", code: "AI_ERROR" as const },
        { status: 502 }
      );
    }

    let parsedData: unknown;
    try {
      // Clean up potential markdown code fences the AI might add despite instructions
      let cleaned = responseText.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();

      parsedData = JSON.parse(cleaned);
    } catch {
      console.error("[JSON Parse Error] Raw response:", responseText);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal memproses respons AI. Format tidak valid.",
          code: "PARSE_ERROR" as const,
        },
        { status: 422 }
      );
    }

    // 5. Validate and sanitize the parsed data
    const receiptData = validateReceiptData(parsedData);

    // 6. Return success response
    return NextResponse.json({
      success: true,
      data: receiptData,
    });
  } catch (err) {
    console.error("[Server Error]", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server.";
    return NextResponse.json(
      { success: false, error: message, code: "SERVER_ERROR" as const },
      { status: 500 }
    );
  }
}
