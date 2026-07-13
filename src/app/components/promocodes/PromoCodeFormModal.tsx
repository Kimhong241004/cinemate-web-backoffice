import { X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { TranslationKeys } from "../../../i18n";
import DateInput, { type DateRangeValue } from "../shared/DateInput";

export interface PromoCodeFormData {
  code: string;
  quantity: string;
  prefix: string;
  suffix: string;
  description: string;
  promoCodeType: string[];
  discountType: "percentage" | "amount";
  discountValue: string;
  usageLimit: string;
  usagePerUser: string;
  expiresAt: string;
  status: "active" | "inactive";
  visibility: "public" | "private";
}

export interface PromoCodeFormErrors {
  code: string;
  quantity: string;
  discountValue: string;
  usageLimit: string;
  usagePerUser: string;
  expiresAt: string;
}

interface PromoCodeFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: PromoCodeFormData;
  setFormData: Dispatch<SetStateAction<PromoCodeFormData>>;
  formErrors: PromoCodeFormErrors;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  t: TranslationKeys;
}

const PromoCodeFormModal = ({
  isOpen,
  isEditing,
  formData,
  setFormData,
  formErrors,
  isSubmitting,
  onClose,
  onSubmit,
  t,
}: PromoCodeFormModalProps) => {
  if (!isOpen) return null;

  const expiresAtDate = formData.expiresAt ? new Date(`${formData.expiresAt}T00:00:00`) : null;

  const handleExpiresAtChange = (range: DateRangeValue) => {
    const chosen = range.end ?? range.start;
    if (!chosen) {
      setFormData({ ...formData, expiresAt: "" });
      return;
    }
    const y = chosen.getFullYear();
    const m = String(chosen.getMonth() + 1).padStart(2, "0");
    const d = String(chosen.getDate()).padStart(2, "0");
    setFormData({ ...formData, expiresAt: `${y}-${m}-${d}` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">
            {isEditing ? t.promoCodes.editCode : t.promoCodes.createCode}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-[#0a0a0a] p-1 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, visibility: "public" })}
            className={`py-2 rounded-md text-sm font-medium transition-colors ${
              formData.visibility === "public"
                ? "bg-[#27272a] text-white"
                : "text-[#71717a] hover:text-white"
            }`}
          >
            Public
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, visibility: "private" })}
            className={`py-2 rounded-md text-sm font-medium transition-colors ${
              formData.visibility === "private"
                ? "bg-[#27272a] text-white"
                : "text-[#71717a] hover:text-white"
            }`}
          >
            Private
          </button>
        </div>

        <div className="space-y-4">
          {/* Code / Quantity */}
          {formData.visibility === "public" ? (
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                {t.promoCodes.code} *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
                  formErrors.code ? "border-[#ef4444]" : "border-[#27272a]"
                } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm font-mono`}
                placeholder="WELCOME2024"
              />
              {formErrors.code && (
                <p className="text-[#ef4444] text-xs mt-1">
                  {formErrors.code}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
                    formErrors.quantity
                      ? "border-[#ef4444]"
                      : "border-[#27272a]"
                  } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
                  placeholder="10"
                  min="1"
                />
                {formErrors.quantity && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.quantity}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Prefix
                </label>
                <input
                  type="text"
                  value={formData.prefix}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prefix: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm font-mono"
                  placeholder="WELCOME"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Suffix
                </label>
                <input
                  type="text"
                  value={formData.suffix}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      suffix: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm font-mono"
                  placeholder="2024"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
              placeholder="Optional description"
            />
          </div>

          {/* Promo Code Type */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Promo Code Type *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["movie", "subscription", "product"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    const current = Array.isArray(formData.promoCodeType) ? formData.promoCodeType : [formData.promoCodeType];
                    const updated = current.includes(type)
                      ? current.filter((t) => t !== type)
                      : [...current, type];
                    if (updated.length > 0) setFormData({ ...formData, promoCodeType: updated });
                  }}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    (Array.isArray(formData.promoCodeType) ? formData.promoCodeType : [formData.promoCodeType]).includes(type)
                      ? "bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white"
                      : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Discount Type & Discount Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                {t.promoCodes.discountType} *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, discountType: "percentage" })
                  }
                  className={`px-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    formData.discountType === "percentage"
                      ? "bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white"
                      : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, discountType: "amount" })
                  }
                  className={`px-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    formData.discountType === "amount"
                      ? "bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white"
                      : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                  }`}
                >
                  $
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                {t.promoCodes.discountValue} *
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({ ...formData, discountValue: e.target.value })
                }
                className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
                  formErrors.discountValue
                    ? "border-[#ef4444]"
                    : "border-[#27272a]"
                } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
                placeholder={
                  formData.discountType === "percentage" ? "50" : "5"
                }
                min="0"
                max={
                  formData.discountType === "percentage" ? "100" : undefined
                }
              />
              {formErrors.discountValue && (
                <p className="text-[#ef4444] text-xs mt-1">
                  {formErrors.discountValue}
                </p>
              )}
            </div>
          </div>

          {/* Usage Limit & Usage Per User */}
          {formData.visibility === "public" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {t.promoCodes.usageLimit} *
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                  className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
                    formErrors.usageLimit
                      ? "border-[#ef4444]"
                      : "border-[#27272a]"
                  } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
                  placeholder="1000"
                  min="1"
                />
                {formErrors.usageLimit && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.usageLimit}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {t.promoCodes.usagePerUser}
                </label>
                <input
                  type="number"
                  value={formData.usagePerUser}
                  onChange={(e) =>
                    setFormData({ ...formData, usagePerUser: e.target.value })
                  }
                  className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
                    formErrors.usagePerUser
                      ? "border-[#ef4444]"
                      : "border-[#27272a]"
                  } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
                  placeholder="1"
                  min="1"
                />
                {formErrors.usagePerUser && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.usagePerUser}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Expiration Date */}
          <div>
            <DateInput
              label={t.promoCodes.expiresAt}
              error={!!formErrors.expiresAt}
              requireFuture
              initialRange={{ start: expiresAtDate, end: expiresAtDate }}
              onChange={handleExpiresAtChange}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              {t.promoCodes.status}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, status: "active" })
                }
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  formData.status === "active"
                    ? "bg-[#22c55e] text-white"
                    : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                }`}
              >
                {t.promoCodes.active}
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, status: "inactive" })
                }
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  formData.status === "inactive"
                    ? "bg-[#71717a] text-white"
                    : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                }`}
              >
                {t.promoCodes.inactive}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#27272a] text-white text-sm hover:bg-[#3f3f46] transition-colors disabled:opacity-50"
            >
              {t.promoCodes.cancel}
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : !isEditing && formData.visibility === "private"
                  ? "Generate Code"
                  : `${isEditing ? t.promoCodes.updateBtn : t.promoCodes.createBtn} ${t.promoCodes.code}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoCodeFormModal;
