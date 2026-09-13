"use client";

import { Loader2 } from "lucide-react";

export default function LoadingOverlay() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 animate-fade-in"
      style={{ background: "rgba(248, 250, 249, 0.92)", backdropFilter: "blur(8px)" }}
    >
      {/* Spinner */}
      <div className="relative">
        <div
          className="h-16 w-16 rounded-full"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
            animation: "pulse-ring 1.5s ease-out infinite",
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full"
          style={{ background: "var(--surface)" }}
        >
          <Loader2
            size={28}
            className="animate-spin"
            style={{ color: "var(--primary)" }}
          />
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Mengompresi gambar...
        </p>
        <p
          className="mt-1 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Menyiapkan struk untuk dianalisis AI
        </p>
      </div>
    </div>
  );
}
