"use client";

import { useCallback } from "react";
import {
  ArrowLeft,
  ScanLine,
  FileImage,
  ArrowDown,
  RotateCcw,
  Info,
  Loader2,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatFileSize, extractBase64 } from "@/lib/image-compression";
import type { ProcessReceiptResponse, ProcessReceiptErrorResponse } from "@/lib/types";
import ScanningLoader from "./ScanningLoader";

export default function PreviewScreen() {
  const {
    compressedImage,
    isProcessing,
    resetToLanding,
    setIsProcessing,
    setError,
    setReceiptData,
    setView,
  } = useAppStore();

  const handleProcessClick = useCallback(async () => {
    if (!compressedImage || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const base64 = extractBase64(compressedImage.dataUrl);

      const response = await fetch("/api/process-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: base64,
          mimeType: compressedImage.mimeType,
        }),
      });

      const result: ProcessReceiptResponse | ProcessReceiptErrorResponse =
        await response.json();

      if (!result.success) {
        setError(result.error);
        console.error("[API Error]", result);
        return;
      }

      if (result.data && !result.data.is_valid_receipt) {
        setError(result.data.error_reason || "Gambar yang diunggah bukan struk belanja yang valid.");
        return;
      }

      // Store the parsed receipt data
      setReceiptData(result.data);
      console.log("[Receipt Data]", JSON.stringify(result.data, null, 2));

      // Navigate to result view (to be built in future stages)
      setView("result");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghubungi server.";
      setError(message);
      console.error("[Fetch Error]", err);
    } finally {
      setIsProcessing(false);
    }
  }, [compressedImage, isProcessing, setIsProcessing, setError, setReceiptData, setView]);

  const handleRetake = useCallback(() => {
    resetToLanding();
  }, [resetToLanding]);

  if (!compressedImage) return null;

  const reductionPercent = Math.round(
    (1 - compressedImage.compressionRatio) * 100
  );

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{
          background: "rgba(248, 250, 249, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <button
          onClick={handleRetake}
          disabled={isProcessing}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200 active:scale-95 disabled:opacity-50"
          style={{ background: "var(--accent)" }}
          aria-label="Kembali"
        >
          <ArrowLeft size={20} style={{ color: "var(--primary)" }} />
        </button>
        <div className="flex-1">
          <h1
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Preview Struk
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {isProcessing
              ? "Sedang menganalisis struk..."
              : "Periksa gambar sebelum diproses"}
          </p>
        </div>
      </header>

      {/* Image Preview */}
      <main className="flex-1 px-4 py-5">
        <div className="mx-auto max-w-md">
          {/* Image container */}
          <div
            className="relative overflow-hidden rounded-2xl animate-scale-in"
            style={{
              background: "var(--surface)",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--border-light)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={compressedImage.dataUrl}
              alt="Preview struk yang telah dikompresi"
              className="w-full object-contain"
              style={{
                maxHeight: "55dvh",
                opacity: isProcessing ? 0.6 : 1,
                transition: "opacity 0.3s",
              }}
            />

            {/* Processing overlay on image */}
            {isProcessing && <ScanningLoader />}

            {/* Image format badge */}
            <div
              className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <FileImage size={12} color="white" />
              <span className="text-[11px] font-medium text-white uppercase">
                {compressedImage.mimeType.split("/")[1]}
              </span>
            </div>
          </div>

          {/* Compression Stats */}
          <div
            className="mt-4 rounded-2xl p-4 animate-fade-in"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Info size={14} style={{ color: "var(--primary)" }} />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Detail Kompresi
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatItem
                label="Ukuran Asli"
                value={formatFileSize(compressedImage.originalSize)}
              />
              <StatItem
                label="Setelah Kompresi"
                value={formatFileSize(compressedImage.compressedSize)}
                highlight
              />
              <StatItem
                label="Dimensi"
                value={`${compressedImage.width} × ${compressedImage.height}`}
              />
              <StatItem
                label="Pengurangan"
                value={`${reductionPercent}%`}
                highlight
              />
            </div>

            {/* Compression bar */}
            <div className="mt-3">
              <div
                className="h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "var(--border-light)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.min(compressedImage.compressionRatio * 100, 100)}%`,
                    background:
                      "linear-gradient(90deg, var(--primary), var(--primary-light))",
                  }}
                />
              </div>
              <div className="mt-1.5 flex items-center gap-1">
                <ArrowDown size={10} style={{ color: "var(--success)" }} />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: "var(--success)" }}
                >
                  {reductionPercent > 0
                    ? `Gambar berhasil dikecilkan ${reductionPercent}%`
                    : "Gambar sudah optimal"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div
        className="sticky bottom-0 px-4 pb-6 pt-4"
        style={{
          background:
            "linear-gradient(to top, var(--background) 80%, transparent)",
        }}
      >
        <div className="mx-auto flex max-w-md gap-3">
          {/* Retake Button */}
          <button
            onClick={handleRetake}
            disabled={isProcessing}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
            aria-label="Ambil ulang foto"
          >
            <RotateCcw size={20} style={{ color: "var(--text-secondary)" }} />
          </button>

          {/* Process Button */}
          <button
            onClick={handleProcessClick}
            disabled={isProcessing}
            className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl px-6 py-4 font-semibold text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--primary-light))",
              boxShadow: "0 6px 20px rgba(16, 153, 129, 0.35)",
              minHeight: "56px",
            }}
            id="process-receipt-btn"
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <ScanLine size={20} strokeWidth={2.2} />
                <span>Proses Struk Ini</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== Stat Item Sub-Component ===== */
interface StatItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function StatItem({ label, value, highlight = false }: StatItemProps) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{
        background: highlight ? "var(--accent)" : "var(--background)",
      }}
    >
      <p
        className="text-[10px] uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <p
        className="mt-0.5 text-sm font-bold"
        style={{
          color: highlight ? "var(--primary)" : "var(--text-primary)",
        }}
      >
        {value}
      </p>
    </div>
  );
}
