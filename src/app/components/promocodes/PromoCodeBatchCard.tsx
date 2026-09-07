import { ChevronRight, Lock } from "lucide-react";
import type { PromoCodeBatch } from "../../../api/services/promoCodeService";

interface Props {
  batch: PromoCodeBatch;
  index: number;
  isLoadingCodes: boolean;
  onViewCodes: (batch: PromoCodeBatch) => void;
}

const TYPE_STYLE: Record<string, string> = {
  movie: "bg-[#3b82f6]/20 text-[#3b82f6]",
  subscription: "bg-[#10b981]/20 text-[#10b981]",
};

const formatDiscount = (type: "percentage" | "amount", value: number) =>
  type === "percentage" ? `${value}%` : `$${value}`;

const PromoCodeBatchCard = ({ batch, index, isLoadingCodes, onViewCodes }: Props) => {
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 sm:p-5 hover:border-[#3f3f46] transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <span className="hidden sm:block text-white text-xs font-medium w-5 text-right flex-shrink-0">
          {index}
        </span>

        <div className="w-12 h-12 rounded-xl bg-[#27272a] hidden sm:flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-[#6C5CE7]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-white font-bold text-lg">
              {batch.description || "Private batch"}
            </h3>
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-[#71717a]/20 text-[#a1a1aa]">
              <Lock className="w-3 h-3" /> Private
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                TYPE_STYLE[batch.promo_code_type] ?? "bg-[#6C5CE7]/20 text-[#6C5CE7]"
              }`}
            >
              {batch.promo_code_type.charAt(0).toUpperCase() + batch.promo_code_type.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            <div>
              <p className="text-[#71717a] text-xs mb-1">Discount</p>
              <p className="bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] bg-clip-text text-transparent text-sm font-bold">
                {formatDiscount(batch.discount_type, batch.discount_amount)}
              </p>
            </div>
            <div>
              <p className="text-[#71717a] text-xs mb-1">Codes</p>
              <p className="text-white text-sm font-bold">{batch.codes_count}</p>
            </div>
            <div>
              <p className="text-[#71717a] text-xs mb-1">Expires</p>
              <p className="text-white text-sm font-bold">{batch.expires_at.split("T")[0]}</p>
            </div>
          </div>

          <button
            onClick={() => onViewCodes(batch)}
            disabled={isLoadingCodes}
            className="flex items-center gap-1 text-xs text-[#a1a1aa] hover:text-white transition-colors mt-3 disabled:opacity-50"
          >
            {isLoadingCodes ? "Loading..." : `View ${batch.codes_count} codes`}
            {!isLoadingCodes && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoCodeBatchCard;
