import { useState } from "react";
import { Check, Copy, Download, X } from "lucide-react";
import type { PromoCode } from "./PromoCodeListItem";

interface GeneratedCodesModalProps {
  isOpen: boolean;
  promo: PromoCode | null;
  onClose: () => void;
  onCopyCode: (code: string) => void;
}

const GeneratedCodesModal = ({ isOpen, promo, onClose, onCopyCode }: GeneratedCodesModalProps) => {
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen || !promo) return null;

  const codes = promo.generatedCodes ?? [];

  const handleCopyAll = () => {
    navigator.clipboard.writeText(codes.map((c) => c.code).join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  const handleExport = () => {
    const rows = ["code,status,expires_at"];
    for (const c of codes) {
      rows.push(`${c.code},${c.used ? "Used" : "Active"},${promo.expiresAt}`);
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${promo.code}-codes.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="generated-codes-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#18181b] border border-[#27272a] rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4 pr-8">
          <h2 id="generated-codes-title" className="text-white text-lg font-bold">
            Generated Codes
          </h2>
          <p className="text-[#71717a] text-xs mt-1">
            {promo.code} &middot; {codes.length} codes generated
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
          {codes.map(({ code, used }) => (
            <div
              key={code}
              className="flex items-center justify-between gap-2 bg-[#0a0a0a] border border-[#27272a] rounded-lg px-3 py-2"
            >
              <span className="text-white text-sm font-mono">{code}</span>
              <div className="flex items-center gap-2">
                {used ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#71717a]/20 text-[#a1a1aa] font-medium">
                    Used
                  </span>
                ) : (
                  <span className="text-xs text-[#71717a]">{promo.expiresAt}</span>
                )}
                <button
                  onClick={() => onCopyCode(code)}
                  className="p-1.5 hover:bg-[#27272a] rounded transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-[#71717a]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-[#27272a]">
          <button
            onClick={handleCopyAll}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#27272a] text-white text-sm font-medium hover:bg-[#3f3f46] transition-colors"
          >
            {copiedAll ? <Check className="w-4 h-4 text-[#22c55e]" /> : <Copy className="w-4 h-4" />}
            {copiedAll ? "Copied!" : "Copy All"}
          </button>
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedCodesModal;
