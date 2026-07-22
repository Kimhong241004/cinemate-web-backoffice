import { ChevronRight, Copy, Edit, Globe, Lock, Power, Trash2 } from "lucide-react";

export interface PromoCode {
  globalId: string;
  id: number;
  code: string;
  description: string;
  promoCodeType: string[];
  status: "active" | "inactive" | "expired";
  discountType: "percentage" | "amount";
  discountValue: number;
  usageCount: number;
  usageLimit: number;
  expiresAt: string;
  createdAt: string;
  visibility: "public" | "private";
  generatedCodes?: { code: string; used: boolean }[];
}

interface Props {
  promo: PromoCode;
  index: number;
  onCopy: (code: string) => void;
  onToggleStatus: (promo: PromoCode) => void;
  onEdit: (promo: PromoCode) => void;
  onDelete: (promo: PromoCode) => void;
  onViewCodes?: (promo: PromoCode) => void;
  t: {
    promoCodes: {
      active: string;
      inactive: string;
      expired: string;
      discount: string;
      usage: string;
      expires: string;
      used: string;
    };
  };
}

const TYPE_STYLE: Record<string, string> = {
  movie: "bg-[#3b82f6]/20 text-[#3b82f6]",
  subscription: "bg-[#10b981]/20 text-[#10b981]",
};

const getProgressPercent = (usageCount: number, usageLimit: number) =>
  usageLimit > 0 ? Math.round((usageCount / usageLimit) * 100) : 0;

const formatDiscount = (type: "percentage" | "amount", value: number) =>
  type === "percentage" ? `${value}%` : `$${value}`;

const PromoCodeListItem = ({ promo, index, onCopy, onToggleStatus, onEdit, onDelete, onViewCodes, t }: Props) => {
  const getStatusLabel = (status: string) => {
    if (status === "active") return t.promoCodes.active;
    if (status === "inactive") return t.promoCodes.inactive;
    return t.promoCodes.expired;
  };

  const types = (Array.isArray(promo.promoCodeType) ? promo.promoCodeType : [promo.promoCodeType]).filter(Boolean);

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 sm:p-5 hover:border-[#3f3f46] transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <span className="hidden sm:block text-white text-xs font-medium w-5 text-right flex-shrink-0">
          {index}
        </span>

        <div className="w-12 h-12 rounded-xl bg-[#27272a] hidden sm:flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-[#6C5CE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-white font-bold text-lg">{promo.code}</h3>
            <button
              onClick={() => onCopy(promo.code)}
              className="p-1 hover:bg-[#27272a] rounded transition-colors"
            >
              <Copy className="w-4 h-4 text-[#71717a]" />
            </button>
            <span className={`text-xs px-2 py-1 rounded-full ${
              promo.status === "active" ? "bg-[#22c55e] text-white"
              : promo.status === "inactive" ? "bg-[#71717a] text-white"
              : "bg-[#ef4444] text-white"
            }`}>
              {getStatusLabel(promo.status)}
            </span>
            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
              promo.visibility === "private"
                ? "bg-[#71717a]/20 text-[#a1a1aa]"
                : "bg-[#27272a] text-[#71717a]"
            }`}>
              {promo.visibility === "private"
                ? <><Lock className="w-3 h-3" /> Private</>
                : <><Globe className="w-3 h-3" /> Public</>}
            </span>
            {types.map((type) => (
              <span
                key={type}
                className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_STYLE[type] ?? "bg-[#6C5CE7]/20 text-[#6C5CE7]"}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            ))}
          </div>

          {promo.description && (
            <p className="text-[#71717a] text-xs mb-2">{promo.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-3">
            <div>
              <p className="text-[#71717a] text-xs mb-1">{t.promoCodes.discount}</p>
              <p className="bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] bg-clip-text text-transparent text-sm font-bold">
                {formatDiscount(promo.discountType, promo.discountValue)}
              </p>
            </div>
            <div>
              <p className="text-[#71717a] text-xs mb-1">{t.promoCodes.usage}</p>
              <p className="text-white text-sm font-bold">{promo.usageCount} / {promo.usageLimit}</p>
            </div>
            <div>
              <p className="text-[#71717a] text-xs mb-1">{t.promoCodes.expires}</p>
              <p className="text-white text-sm font-bold">{promo.expiresAt}</p>
            </div>
          </div>

          <div className="relative w-full h-2 bg-[#27272a] rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63]"
              style={{ width: `${getProgressPercent(promo.usageCount, promo.usageLimit)}%` }}
            />
          </div>

          {promo.visibility === "private" && !!promo.generatedCodes?.length && (
            <button
              onClick={() => onViewCodes?.(promo)}
              className="flex items-center gap-1 text-xs text-[#a1a1aa] hover:text-white transition-colors mt-3"
            >
              View more ({promo.generatedCodes.length} codes) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onToggleStatus(promo)}
            disabled={promo.status === "expired"}
            title={promo.status === "active" ? "Deactivate" : "Activate"}
            className={`flex-1 sm:flex-none p-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              promo.status === "active"
                ? "bg-[#22c55e]/20 hover:bg-[#22c55e]/30"
                : "bg-[#27272a] hover:bg-[#3f3f46]"
            }`}
          >
            <Power className={`w-4 h-4 ${promo.status === "active" ? "text-[#22c55e]" : "text-[#71717a]"}`} />
          </button>
          <button
            onClick={() => onEdit(promo)}
            className="flex-1 sm:flex-none p-2.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] transition-colors"
          >
            <Edit className="w-4 h-4 text-[#6C5CE7]" />
          </button>
          <button
            onClick={() => onDelete(promo)}
            className="flex-1 sm:flex-none p-2.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] transition-colors"
          >
            <Trash2 className="w-4 h-4 text-[#ef4444]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const PromoCodeListItemSkeleton = () => (
  <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 sm:p-5 animate-pulse">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
      <div className="hidden sm:block w-5 h-3 bg-[#27272a] rounded" />
      <div className="w-12 h-12 rounded-xl bg-[#27272a] hidden sm:block flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-28 bg-[#27272a] rounded" />
          <div className="h-5 w-14 bg-[#27272a] rounded-full" />
          <div className="h-5 w-16 bg-[#27272a] rounded-full" />
        </div>
        <div className="h-3 w-48 bg-[#27272a] rounded mb-4" />
        <div className="grid grid-cols-3 gap-6 mb-3">
          <div className="h-8 bg-[#27272a] rounded" />
          <div className="h-8 bg-[#27272a] rounded" />
          <div className="h-8 bg-[#27272a] rounded" />
        </div>
        <div className="h-2 bg-[#27272a] rounded-full" />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <div className="flex-1 sm:w-10 h-10 bg-[#27272a] rounded-lg" />
        <div className="flex-1 sm:w-10 h-10 bg-[#27272a] rounded-lg" />
      </div>
    </div>
  </div>
);

export default PromoCodeListItem;
