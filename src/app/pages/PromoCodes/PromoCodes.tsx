import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Copy,
  Edit,
  Trash2,
} from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import Pagination from "../../components/shared/Pagination";
import StatusFilterDropdown from "../../components/shared/StatusFilterDropdown";
import PromoCodeFormModal from "../../components/promocodes/PromoCodeFormModal";
import {
  promoCodeService,
  type PromoCodeFromApi,
} from "../../../api/services/promoCodeService";

interface PromoCode {
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
}

const ENTRIES_PER_PAGE = 10;

const mapFromApi = (item: PromoCodeFromApi): PromoCode => {
  const isExpired = new Date(item.expires_at) < new Date();
  const status = isExpired
    ? "expired"
    : item.status === 1
      ? "active"
      : "inactive";
  return {
    globalId: item.global_id,
    id: item.id,
    code: item.code,
    description: item.description,
    promoCodeType: Array.isArray(item.promo_code_type)
      ? item.promo_code_type.filter(Boolean)
      : item.promo_code_type
        ? [item.promo_code_type]
        : ["subscription"],
    status,
    discountType: item.discount_type,
    discountValue: item.discount_amount,
    usageCount: item.used_count,
    usageLimit: item.usage_limit,
    expiresAt: item.expires_at.split("T")[0],
    createdAt: item.created_at.split("T")[0],
  };
};

const PromoCodes = () => {
  const { showToast, addNotification } = useNotification();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [deletePromo, setDeletePromo] = useState<PromoCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [total, setTotal] = useState(0);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    promoCodeType: ["movie"] as string[],
    discountType: "percentage" as "percentage" | "amount",
    discountValue: "",
    usageLimit: "",
    expiresAt: "",
    status: "active" as "active" | "inactive",
  });

  const [formErrors, setFormErrors] = useState({
    code: "",
    discountValue: "",
    usageLimit: "",
    expiresAt: "",
  });

  const totalPages = Math.max(1, Math.ceil(total / ENTRIES_PER_PAGE));

  const fetchPromoCodes = async (
    page: number,
    search: string,
    status: string,
  ) => {
    setIsLoading(true);
    try {
      const skip = (page - 1) * ENTRIES_PER_PAGE;
      const apiStatus =
        status === "active" ? 1 : status === "inactive" ? 0 : undefined;
      const res = await promoCodeService.getPromoCodes({
        skip,
        take: ENTRIES_PER_PAGE,
        search: search || undefined,
        status: apiStatus,
      });
      setPromoCodes(res.data.map(mapFromApi));
      setTotal(res.total);
    } catch {
      showToast("Failed to load promo codes", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes(currentPage, searchQuery, selectedStatus);
  }, [currentPage, searchQuery, selectedStatus]);

  // 'expired' has no API-side filter — derive it client-side from the mapped data
  const filteredPromoCodes =
    selectedStatus === "expired"
      ? promoCodes.filter((promo) => promo.status === "expired")
      : promoCodes;

  const getProgressPercent = (usageCount: number, usageLimit: number) =>
    usageLimit > 0 ? Math.round((usageCount / usageLimit) * 100) : 0;

  const formatDiscount = (type: "percentage" | "amount", value: number) =>
    type === "percentage" ? `${value}%` : `$${value}`;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`${t.promoCodes.copiedToClipboard}`, "success");
  };

  const getStatusLabel = (status: string) => {
    if (status === "active") return t.promoCodes.active;
    if (status === "inactive") return t.promoCodes.inactive;
    return t.promoCodes.expired;
  };

  const validateForm = () => {
    const errors = {
      code: "",
      discountValue: "",
      usageLimit: "",
      expiresAt: "",
    };
    let isValid = true;

    if (!formData.code.trim()) {
      errors.code = t.promoCodes.codeRequired;
      isValid = false;
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      errors.code = t.promoCodes.codeFormat;
      isValid = false;
    }

    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      errors.discountValue = t.promoCodes.discountValueRequired;
      isValid = false;
    } else if (
      formData.discountType === "percentage" &&
      Number(formData.discountValue) > 100
    ) {
      errors.discountValue = t.promoCodes.discountValueMax;
      isValid = false;
    }

    if (!formData.usageLimit || Number(formData.usageLimit) <= 0) {
      errors.usageLimit = t.promoCodes.usageLimitRequired;
      isValid = false;
    }

    const expiresDate = new Date(formData.expiresAt);
    if (!formData.expiresAt || isNaN(expiresDate.getTime())) {
      errors.expiresAt = t.promoCodes.expiresRequired;
      isValid = false;
    } else if (expiresDate < new Date()) {
      errors.expiresAt = t.promoCodes.expiresFuture;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast(t.promoCodes.fixErrors, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: formData.code,
        description: formData.description,
        promo_code_type: formData.promoCodeType[0] as "movie" | "subscription" | "series" | "season" | "episode",
        discount_type: formData.discountType,
        discount_amount: Number(formData.discountValue),
        usage_limit: Number(formData.usageLimit),
        expires_at: new Date(formData.expiresAt).toISOString(),
        status: formData.status === "active" ? 1 : 0,
      };

      if (editingPromo) {
        await promoCodeService.updatePromoCode(editingPromo.globalId, payload);
        showToast(t.promoCodes.updateSuccess, "success");
      } else {
        await promoCodeService.createPromoCode(payload);
        showToast(t.promoCodes.createSuccess, "success");
      }

      handleCloseModal();
      fetchPromoCodes(currentPage, searchQuery, selectedStatus);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = (promo?: PromoCode) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        description: promo.description,
        promoCodeType: promo.promoCodeType as string[],
        discountType: promo.discountType,
        discountValue: String(promo.discountValue),
        usageLimit: String(promo.usageLimit),
        expiresAt: promo.expiresAt,
        status: promo.status === "expired" ? "inactive" : promo.status,
      });
    } else {
      setEditingPromo(null);
      setFormData({
        code: "",
        description: "",
        promoCodeType: ["movie"],
        discountType: "percentage",
        discountValue: "",
        usageLimit: "",
        expiresAt: "",
        status: "active",
      });
    }
    setFormErrors({
      code: "",
      discountValue: "",
      usageLimit: "",
      expiresAt: "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPromo(null);
    setFormData({
      code: "",
      description: "",
      promoCodeType: ["movie"],
      discountType: "percentage",
      discountValue: "",
      usageLimit: "",
      expiresAt: "",
      status: "active",
    });
    setFormErrors({
      code: "",
      discountValue: "",
      usageLimit: "",
      expiresAt: "",
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletePromo) return;
    setIsDeleting(true);
    try {
      await promoCodeService.deletePromoCode(deletePromo.globalId);
      showToast(t.promoCodes.deleteSuccess, "success");
      addNotification(
        "Promo Code Deleted",
        `Code "${deletePromo.code}" has been removed`,
        "success",
      );
      setDeletePromo(null);
      fetchPromoCodes(currentPage, searchQuery, selectedStatus);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      showToast(message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const startEntry = total === 0 ? 0 : (currentPage - 1) * ENTRIES_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * ENTRIES_PER_PAGE, total);

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
              {t.promoCodes.title}
            </h1>
            <p className="text-[#71717a] text-sm">{t.promoCodes.subtitle}</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {t.promoCodes.createCode}
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t.promoCodes.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181b] text-white placeholder:text-[#52525b] pl-4 pr-10 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
          </div>

          {/* Status Filter */}
          <StatusFilterDropdown
            label={t.promoCodes.status}
            allLabel={t.promoCodes.allStatus}
            selectedValue={selectedStatus}
            onSelect={setSelectedStatus}
            options={[
              { value: "active", label: t.promoCodes.active },
              { value: "inactive", label: t.promoCodes.inactive },
              { value: "expired", label: t.promoCodes.expired },
            ]}
          />
        </div>

        {/* Promo Codes List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-12 text-center">
              <p className="text-[#71717a] text-sm">Loading...</p>
            </div>
          ) : filteredPromoCodes.length === 0 ? (
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-12 text-center">
              <p className="text-[#71717a] text-sm">{t.promoCodes.noFound}</p>
            </div>
          ) : (
            filteredPromoCodes.map((promo, index) => (
              <div
                key={promo.globalId}
                className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 sm:p-5 hover:border-[#3f3f46] transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  {/* No. */}
                  <span className="hidden sm:block text-white text-xs font-medium w-5 text-right flex-shrink-0">
                    {startEntry + index}
                  </span>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[#27272a] hidden sm:flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-[#6C5CE7]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                  </div>

                  {/* Code & Status */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-bold text-lg">
                        {promo.code}
                      </h3>
                      <button
                        onClick={() => handleCopyCode(promo.code)}
                        className="p-1 hover:bg-[#27272a] rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-[#71717a]" />
                      </button>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          promo.status === "active"
                            ? "bg-[#22c55e] text-white"
                            : promo.status === "inactive"
                              ? "bg-[#71717a] text-white"
                              : "bg-[#ef4444] text-white"
                        }`}
                      >
                        {getStatusLabel(promo.status)}
                      </span>
                      {(Array.isArray(promo.promoCodeType) ? promo.promoCodeType : [promo.promoCodeType]).filter(Boolean).map((type) => (
                        <span key={type} className={`text-xs px-2 py-1 rounded-full font-medium ${
                          type === "movie" ? "bg-[#3b82f6]/20 text-[#3b82f6]"
                          : type === "series" ? "bg-[#10b981]/20 text-[#10b981]"
                          : type === "season" ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                          : type === "episode" ? "bg-[#ec4899]/20 text-[#ec4899]"
                          : "bg-[#6C5CE7]/20 text-[#6C5CE7]"
                        }`}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      ))}
                    </div>

                    {promo.description && (
                      <p className="text-[#71717a] text-xs mb-2">
                        {promo.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-3">
                      <div>
                        <p className="text-[#71717a] text-xs mb-1">
                          {t.promoCodes.discount}
                        </p>
                        <p className="bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] bg-clip-text text-transparent text-sm font-bold">
                          {formatDiscount(
                            promo.discountType,
                            promo.discountValue,
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#71717a] text-xs mb-1">
                          {t.promoCodes.usage}
                        </p>
                        <p className="text-white text-sm font-bold">
                          {promo.usageCount} / {promo.usageLimit}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#71717a] text-xs mb-1">
                          {t.promoCodes.expires}
                        </p>
                        <p className="text-white text-sm font-bold">
                          {promo.expiresAt}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative w-full h-2 bg-[#27272a] rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63]"
                        style={{
                          width: `${getProgressPercent(promo.usageCount, promo.usageLimit)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleOpenModal(promo)}
                      className="flex-1 sm:flex-none p-2.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] transition-colors"
                    >
                      <Edit className="w-4 h-4 text-[#6C5CE7]" />
                    </button>
                    <button
                      onClick={() => setDeletePromo(promo)}
                      className="flex-1 sm:flex-none p-2.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-[#ef4444]" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          summary={<>{t.promoCodes.showing} {startEntry} {t.promoCodes.to} {endEntry} {t.promoCodes.of} {total} {t.promoCodes.entries}</>}
        />
      </div>

      <PromoCodeFormModal
        isOpen={showModal}
        isEditing={!!editingPromo}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        t={t}
      />

      <ConfirmDialog
        isOpen={!!deletePromo}
        title={t.promoCodes.deleteCode}
        message={`${t.promoCodes.deleteConfirmStart} "${deletePromo?.code}"? ${t.promoCodes.deleteConfirmEnd}`}
        confirmLabel={t.promoCodes.deleteCode}
        cancelLabel={t.promoCodes.cancel}
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletePromo(null)}
      />
    </>
  );
};

export default PromoCodes;
