import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Copy,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import { useLanguage } from "../context/LanguageContext";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import Pagination from "../components/shared/Pagination";
import {
  promoCodeService,
  type PromoCodeFromApi,
} from "../../api/services/promoCodeService";

interface PromoCode {
  globalId: string;
  id: number;
  code: string;
  description: string;
  promoCodeType: "movie" | "subscription";
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
    promoCodeType: item.promo_code_type,
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
  const [showStatusFilter, setShowStatusFilter] = useState(false);
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
    promoCodeType: "movie" as "movie" | "subscription",
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

    if (!formData.expiresAt) {
      errors.expiresAt = t.promoCodes.expiresRequired;
      isValid = false;
    } else if (new Date(formData.expiresAt) < new Date()) {
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
        promo_code_type: formData.promoCodeType,
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
        promoCodeType: promo.promoCodeType,
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
        promoCodeType: "movie",
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
      promoCodeType: "movie",
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

  useEffect(() => {
    const handleClickOutside = () => setShowStatusFilter(false);
    if (showStatusFilter) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showStatusFilter]);

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
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#ef4444] to-[#f97316] rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
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
          <div className="relative w-full sm:w-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusFilter(!showStatusFilter);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm hover:bg-[#27272a] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t.promoCodes.status}</span>
              {selectedStatus && (
                <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              )}
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showStatusFilter && (
              <div className="absolute z-10 mt-2 w-48 bg-[#18181b] border border-[#27272a] rounded-lg shadow-lg">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setSelectedStatus("");
                      setShowStatusFilter(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#27272a] rounded-lg transition-colors"
                  >
                    {t.promoCodes.allStatus}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStatus("active");
                      setShowStatusFilter(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedStatus === "active"
                        ? "bg-[#27272a] text-[#22c55e]"
                        : "text-white hover:bg-[#27272a]"
                    }`}
                  >
                    {t.promoCodes.active}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStatus("inactive");
                      setShowStatusFilter(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedStatus === "inactive"
                        ? "bg-[#27272a] text-[#71717a]"
                        : "text-white hover:bg-[#27272a]"
                    }`}
                  >
                    {t.promoCodes.inactive}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStatus("expired");
                      setShowStatusFilter(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedStatus === "expired"
                        ? "bg-[#27272a] text-[#ef4444]"
                        : "text-white hover:bg-[#27272a]"
                    }`}
                  >
                    {t.promoCodes.expired}
                  </button>
                </div>
              </div>
            )}
          </div>
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
                      className="w-6 h-6 text-[#f97316]"
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
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        promo.promoCodeType === "movie"
                          ? "bg-[#3b82f6]/20 text-[#3b82f6]"
                          : "bg-[#f97316]/20 text-[#f97316]"
                      }`}>
                        {promo.promoCodeType === "movie" ? "Movie" : "Subscription"}
                      </span>
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
                        <p className="text-[#ef4444] text-sm font-bold">
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
                        className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#ef4444] to-[#f97316]"
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
                      <Edit className="w-4 h-4 text-[#3b82f6]" />
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">
                {editingPromo ? t.promoCodes.editCode : t.promoCodes.createCode}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Code */}
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
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, promoCodeType: "movie" })}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.promoCodeType === "movie"
                        ? "bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    Movie
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, promoCodeType: "subscription" })}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.promoCodeType === "subscription"
                        ? "bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    Subscription
                  </button>
                </div>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {t.promoCodes.discountType} *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, discountType: "percentage" })
                    }
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.discountType === "percentage"
                        ? "bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    {t.promoCodes.percentageLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, discountType: "amount" })
                    }
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.discountType === "amount"
                        ? "bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    {t.promoCodes.fixedLabel}
                  </button>
                </div>
              </div>

              {/* Discount Value */}
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

              {/* Usage Limit */}
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

              {/* Expiration Date */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {t.promoCodes.expiresAt} *
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  className={`w-full bg-[#0a0a0a] text-white px-4 py-2.5 rounded-lg border ${
                    formErrors.expiresAt
                      ? "border-[#ef4444]"
                      : "border-[#27272a]"
                  } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
                />
                {formErrors.expiresAt && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.expiresAt}
                  </p>
                )}
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
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#27272a] text-white text-sm hover:bg-[#3f3f46] transition-colors disabled:opacity-50"
                >
                  {t.promoCodes.cancel}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : `${editingPromo ? t.promoCodes.updateBtn : t.promoCodes.createBtn} ${t.promoCodes.code}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
