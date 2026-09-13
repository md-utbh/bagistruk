"use client";

import { X } from "lucide-react";
import type { ReceiptData } from "@/lib/types";

interface DigitalReceiptProps {
  data: ReceiptData;
  onClose: () => void;
}

/** Formats a number as Indonesian Rupiah */
function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DigitalReceipt({ data, onClose }: DigitalReceiptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-sm rounded-xl overflow-hidden animate-slide-up"
        style={{
          background: "#f9f9f9",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Receipt Header (Zig-zag edge effect) */}
        <div 
          className="h-4 w-full"
          style={{
            backgroundImage: "linear-gradient(-45deg, transparent 16px, #f9f9f9 0), linear-gradient(45deg, transparent 16px, #f9f9f9 0)",
            backgroundSize: "8px 8px",
            backgroundRepeat: "repeat-x",
          }}
        />

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Receipt Content */}
        <div className="px-6 py-4 font-mono text-sm text-gray-800">
          <div className="text-center mb-6">
            <h2 className="font-bold text-lg">{data.store_name?.toUpperCase() || "TOKO TIDAK DIKETAHUI"}</h2>
            <p className="text-xs text-gray-500 mt-1">{data.date}</p>
            <p className="text-xs text-gray-500">{data.receipt_category}</p>
          </div>

          <div className="border-t-2 border-dashed border-gray-300 my-4" />

          <div className="space-y-3">
            {data.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} x {formatRupiah(item.unit_price)}
                  </p>
                </div>
                <p className="font-semibold">{formatRupiah(item.subtotal)}</p>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-gray-300 my-4" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatRupiah(data.items.reduce((sum, item) => sum + item.subtotal, 0))}</span>
            </div>
            {data.financials.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Diskon</span>
                <span>-{formatRupiah(data.financials.discount)}</span>
              </div>
            )}
            {data.financials.tax > 0 && (
              <div className="flex justify-between">
                <span>Pajak</span>
                <span>{formatRupiah(data.financials.tax)}</span>
              </div>
            )}
            {data.financials.service_fee > 0 && (
              <div className="flex justify-between">
                <span>Service Charge</span>
                <span>{formatRupiah(data.financials.service_fee)}</span>
              </div>
            )}
          </div>

          <div className="border-t-2 border-dashed border-gray-300 my-4" />

          <div className="flex justify-between font-bold text-base mb-2">
            <span>GRAND TOTAL</span>
            <span>{formatRupiah(data.financials.grand_total)}</span>
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-8 mb-4">
            *** TERIMA KASIH ***
          </p>
        </div>

        {/* Receipt Footer (Zig-zag edge effect) */}
        <div 
          className="h-4 w-full rotate-180"
          style={{
            backgroundImage: "linear-gradient(-45deg, transparent 16px, #f9f9f9 0), linear-gradient(45deg, transparent 16px, #f9f9f9 0)",
            backgroundSize: "8px 8px",
            backgroundRepeat: "repeat-x",
          }}
        />
      </div>
    </div>
  );
}
