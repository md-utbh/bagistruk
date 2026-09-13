"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const LOADING_TEXTS = [
  "Menganalisis gambar...",
  "Mengekstrak harga item...",
  "Mengidentifikasi pajak & diskon...",
  "Menyiapkan kalkulasi...",
  "Hampir selesai...",
];

export default function ScanningLoader() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in z-20 overflow-hidden"
      style={{ 
        background: "rgba(255, 255, 255, 0.8)", 
        backdropFilter: "blur(4px)",
      }}
    >
      {/* Laser Scanner Effect */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 z-10"
        style={{
          background: "var(--primary)",
          boxShadow: "0 0 15px 5px var(--primary-light)",
          animation: "scan-laser 2.5s ease-in-out infinite alternate",
        }}
      />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan-laser {
          0% { transform: translateY(0); opacity: 0.8; }
          100% { transform: translateY(55vh); opacity: 1; } /* adjust approx image height */
        }
      `}} />

      {/* Loading Box */}
      <div
        className="relative z-20 flex flex-col items-center justify-center gap-3 bg-white p-5 rounded-3xl shadow-xl"
        style={{
          border: "1px solid var(--border-light)",
        }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
            boxShadow: "0 4px 16px rgba(16, 153, 129, 0.3)",
          }}
        >
          <Loader2 size={26} color="white" className="animate-spin" />
        </div>
        <div className="text-center min-w-[200px]">
          <p className="text-sm font-semibold transition-all duration-300" style={{ color: "var(--text-primary)" }}>
            {LOADING_TEXTS[textIndex]}
          </p>
          <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
            AI sedang bekerja
          </p>
        </div>
      </div>
    </div>
  );
}
