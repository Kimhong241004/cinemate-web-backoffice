import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import Pagination from "../../components/shared/Pagination";
import StatusFilterDropdown from "../../components/shared/FilterDropdown/StatusFilterDropdown";
import PromoCodeFormModal from "../../components/promocodes/PromoCodeFormModal";
import GeneratedCodesModal from "../../components/promocodes/GeneratedCodesModal";
import PromoCodeListItem, {
  PromoCodeListItemSkeleton,
  type PromoCode,
} from "../../components/promocodes/PromoCodeListItem";
import {
  promoCodeService,
  type PromoCodeFromApi,
  type PromoCodeType,
} from "../../../api/services/promoCodeService";

type PromoCodeTypeFilter = "all" | "movie" | "subscription";

const ENTRIES_PER_PAGE = 10;

const generateBatchCodes = (prefix: string, count: number, usedCount: number) =>
  Array.from({ length: count }, (_, i) => ({
    code: `${prefix}${String(i + 1).padStart(4, "0")}`,
    used: i < usedCount,
  }));

const MOCK_PRIVATE_CODES: PromoCode[] = [
  {
    globalId: "mock-private-1",
    id: -1,
    code: "VIP2026A",
    description: "Private VIP code for selected users",
    promoCodeType: ["movie"],
    status: "active",
    discountType: "percentage",
    discountValue: 20,
    usageCount: 1,
    usageLimit: 1,
    expiresAt: "2026-12-31",
    createdAt: "2026-01-01",
    visibility: "private",
    generatedCodes: [
      { code: "VIP2026A1X9K", used: true },
      { code: "VIP2026B7M2P", used: false },
      { code: "VIP2026C3R8Q", used: false },
      { code: "VIP2026D5T4N", used: true },
      { code: "VIP2026E9W1L", used: false },
    ],
  },
  {
    globalId: "mock-private-2",
    id: -2,
    code: "STAFF50B",
    description: "Staff discount — do not share",
    promoCodeType: ["subscription"],
    status: "active",
    discountType: "percentage",
    discountValue: 50,
    usageCount: 0,
    usageLimit: 1,
    expiresAt: "2026-09-30",
    createdAt: "2026-01-01",
    visibility: "private",
    generatedCodes: [
      { code: "STAFF50B2K7", used: true },
      { code: "STAFF50B9M3", used: false },
      { code: "STAFF50B4Q1", used: false },
    ],
  },
  {
    globalId: "mock-private-3",
    id: -3,
    code: "PRIV10C",
    description: "Private subscription discount",
    promoCodeType: ["subscription"],
    status: "inactive",
    discountType: "amount",
    discountValue: 10,
    usageCount: 0,
    usageLimit: 1,
    expiresAt: "2026-08-15",
    createdAt: "2026-01-01",
    visibility: "private",
    generatedCodes: [
      { code: "PRIV10C8X2", used: false },
      { code: "PRIV10C1Y5", used: false },
      { code: "PRIV10C6Z9", used: false },
      { code: "PRIV10C3A4", used: false },
    ],
  },
  {
    globalId: "mock-private-4",
    id: -4,
    code: "BULK100X",
    description: "Bulk private batch for partner giveaway",
    promoCodeType: ["movie"],
    status: "active",
    discountType: "percentage",
    discountValue: 15,
    usageCount: 32,
    usageLimit: 1,
    expiresAt: "2026-11-30",
    createdAt: "2026-01-01",
    visibility: "private",
    generatedCodes: generateBatchCodes("BULK100X-", 100, 32),
  },
];

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
    visibility: "public",
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
  const [toggleConfirmPromo, setToggleConfirmPromo] = useState<PromoCode | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [viewCodesPromo, setViewCodesPromo] = useState<PromoCode | null>(null);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedType, setSelectedType] = useState<PromoCodeTypeFilter>("all");
  const [selectedVisibility, setSelectedVisibility] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    quantity: "",
    description: "",
    promoCodeType: ["movie"] as string[],
    discountType: "percentage" as "percentage" | "amount",
    discountValue: "",
    usageLimit: "",
    usagePerUser: "",
    expiresAt: "",
    status: "active" as "active" | "inactive",
    visibility: "public" as "public" | "private",
  });

  const [formErrors, setFormErrors] = useState({
    code: "",
    quantity: "",
    discountValue: "",
    usageLimit: "",
    usagePerUser: "",
    expiresAt: "",
  });

  const fetchPromoCodes = async (
    page: number,
    search: string,
    status: string,
    visibility: string,
  ) => {
    setIsLoading(true);
    try {
      // When the "all" view is active, page 1 makes room for the mock private
      // codes so every page still shows exactly ENTRIES_PER_PAGE entries total.
      const mockCount = MOCK_PRIVATE_CODES.length;
      const reserveMockSlots = visibility === "" && page === 1;
      const take = reserveMockSlots ? ENTRIES_PER_PAGE - mockCount : ENTRIES_PER_PAGE;
      const skip =
        visibility === "" && page > 1
          ? (page - 1) * ENTRIES_PER_PAGE - mockCount
          : (page - 1) * ENTRIES_PER_PAGE;
      const apiStatus =
        status === "active" ? 1 : status === "inactive" ? 0 : undefined;
      const res = await promoCodeService.getPromoCodes({
        skip,
        take,
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
    fetchPromoCodes(currentPage, searchQuery, selectedStatus, selectedVisibility);
  }, [currentPage, searchQuery, selectedStatus, selectedVisibility]);

  // 'expired' has no API-side filter — derive it client-side from the mapped data
  const allCodes = selectedVisibility === "private"
    ? MOCK_PRIVATE_CODES
    : selectedVisibility === ""
      ? currentPage === 1
        ? [...promoCodes, ...MOCK_PRIVATE_CODES]
        : promoCodes
      : promoCodes;

  const filteredPromoCodes = allCodes
    .filter((promo) => selectedStatus !== "expired" || promo.status === "expired")
    .filter((promo) => selectedType === "all" || promo.promoCodeType.includes(selectedType))
    .filter((promo) => !selectedDiscount || promo.discountType === selectedDiscount);

  const effectiveTotal = selectedVisibility === "private"
    ? MOCK_PRIVATE_CODES.length
    : selectedVisibility === ""
      ? total + MOCK_PRIVATE_CODES.length
      : total;

  const totalPages = filteredPromoCodes.length < ENTRIES_PER_PAGE
    ? currentPage
    : Math.max(1, Math.ceil(effectiveTotal / ENTRIES_PER_PAGE));

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`${t.promoCodes.copiedToClipboard}`, "success");
  };

  const validateForm = () => {
    const errors = {
      code: "",
      quantity: "",
      discountValue: "",
      usageLimit: "",
      usagePerUser: "",
      expiresAt: "",
    };
    let isValid = true;

    if (formData.visibility === "private" && !editingPromo) {
      if (!formData.quantity || Number(formData.quantity) <= 0) {
        errors.quantity = "Quantity must be greater than 0";
        isValid = false;
      }
    } else if (!formData.code.trim()) {
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

    if (
      formData.visibility === "public" &&
      (!formData.usageLimit || Number(formData.usageLimit) <= 0)
    ) {
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
      const basePayload = {
        description: formData.description,
        promo_code_type: formData.promoCodeType[0] as PromoCodeType,
        discount_type: formData.discountType,
        discount_amount: Number(formData.discountValue),
        expires_at: new Date(formData.expiresAt).toISOString(),
        status: formData.status === "active" ? 1 : 0,
      };

      if (!editingPromo && formData.visibility === "private") {
        const quantity = Number(formData.quantity);
        const generateCode = () => {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          const random = Array.from({ length: 6 }, () =>
            chars[Math.floor(Math.random() * chars.length)],
          ).join("");
          return random.toUpperCase();
        };
        for (let i = 0; i < quantity; i++) {
          await promoCodeService.createPromoCode({
            ...basePayload,
            code: generateCode(),
            usage_limit: 1,
          });
        }
        showToast(`${quantity} codes generated`, "success");
      } else if (editingPromo) {
        await promoCodeService.updatePromoCode(editingPromo.globalId, {
          ...basePayload,
          code: formData.code,
          usage_limit: Number(formData.usageLimit),
        });
        showToast(t.promoCodes.updateSuccess, "success");
      } else {
        await promoCodeService.createPromoCode({
          ...basePayload,
          code: formData.code,
          usage_limit: Number(formData.usageLimit),
        });
        showToast(t.promoCodes.createSuccess, "success");
      }

      handleCloseModal();
      fetchPromoCodes(currentPage, searchQuery, selectedStatus, selectedVisibility);
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
        quantity: "",
        description: promo.description,
        promoCodeType: promo.promoCodeType as string[],
        discountType: promo.discountType,
        discountValue: String(promo.discountValue),
        usageLimit: String(promo.usageLimit),
        usagePerUser: "",
        expiresAt: promo.expiresAt,
        status: promo.status === "expired" ? "inactive" : promo.status,
        visibility: promo.visibility,
      });
    } else {
      setEditingPromo(null);
      setFormData({
        code: "",
        quantity: "",
        description: "",
        promoCodeType: ["movie"],
        discountType: "percentage",
        discountValue: "",
        usageLimit: "",
        usagePerUser: "",
        expiresAt: "",
        status: "active",
        visibility: "public",
      });
    }
    setFormErrors({
      code: "",
      quantity: "",
      discountValue: "",
      usageLimit: "",
      usagePerUser: "",
      expiresAt: "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPromo(null);
    setFormData({
      code: "",
      quantity: "",
      description: "",
      promoCodeType: ["movie"],
      discountType: "percentage",
      discountValue: "",
      usageLimit: "",
      usagePerUser: "",
      expiresAt: "",
      status: "active",
      visibility: "public",
    });
    setFormErrors({
      code: "",
      quantity: "",
      discountValue: "",
      usageLimit: "",
      usagePerUser: "",
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
      fetchPromoCodes(currentPage, searchQuery, selectedStatus, selectedVisibility);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      showToast(message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = (promo: PromoCode) => {
    setToggleConfirmPromo(promo);
  };

  const handleToggleConfirm = async () => {
    if (!toggleConfirmPromo) return;
    const newStatus = toggleConfirmPromo.status === "active" ? 0 : 1;
    setIsToggling(true);
    try {
      await promoCodeService.updatePromoCode(toggleConfirmPromo.globalId, { status: newStatus });
      showToast(
        newStatus === 1 ? t.promoCodes.activateSuccess : t.promoCodes.deactivateSuccess,
        "success",
      );
      setToggleConfirmPromo(null);
      fetchPromoCodes(currentPage, searchQuery, selectedStatus, selectedVisibility);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      showToast(message, "error");
    } finally {
      setIsToggling(false);
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

          {/* Visibility Filter */}
          <StatusFilterDropdown
            label={t.promoCodes.visibility}
            allLabel={t.promoCodes.allVisibility}
            selectedValue={selectedVisibility}
            onSelect={setSelectedVisibility}
            options={[
              { value: "public", label: t.promoCodes.visibilityPublic },
              { value: "private", label: t.promoCodes.visibilityPrivate },
            ]}
          />

          {/* Discount Filter */}
          <StatusFilterDropdown
            label={t.promoCodes.discount}
            allLabel={t.promoCodes.allDiscount}
            selectedValue={selectedDiscount}
            onSelect={setSelectedDiscount}
            options={[
              { value: "percentage", label: t.promoCodes.percentageLabel },
              { value: "amount", label: t.promoCodes.fixedLabel },
            ]}
          />

          {/* Promo Type Filter */}
          <StatusFilterDropdown
            label={t.promoCodes.promoType}
            allLabel={t.promoCodes.allTypes}
            selectedValue={selectedType === "all" ? "" : selectedType}
            onSelect={(v) => setSelectedType((v || "all") as PromoCodeTypeFilter)}
            options={[
              { value: "movie", label: t.promoCodes.typeMovie },
              { value: "subscription", label: t.promoCodes.typeSubscription },
            ]}
          />
        </div>

        {/* Promo Codes List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <PromoCodeListItemSkeleton key={i} />)
          ) : filteredPromoCodes.length === 0 ? (
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-12 text-center">
              <p className="text-[#71717a] text-sm">{t.promoCodes.noFound}</p>
            </div>
          ) : (
            filteredPromoCodes.map((promo, index) => (
              <PromoCodeListItem
                key={promo.globalId}
                promo={promo}
                index={startEntry + index}
                onCopy={handleCopyCode}
                onToggleStatus={handleToggleStatus}
                onEdit={handleOpenModal}
                onDelete={setDeletePromo}
                onViewCodes={setViewCodesPromo}
                t={t}
              />
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

      <ConfirmDialog
        isOpen={!!toggleConfirmPromo}
        title="Are you sure?"
        message={
          toggleConfirmPromo?.status === "active"
            ? "Are you sure you want to deactivate this promo code? Customers will no longer be able to use it until it is activated again."
            : "Are you sure you want to activate this promo code? Customers will be able to use it if it meets all redemption conditions."
        }
        confirmLabel={toggleConfirmPromo?.status === "active" ? "Deactivate" : "Activate"}
        cancelLabel={t.promoCodes.cancel}
        variant={toggleConfirmPromo?.status === "active" ? "danger" : "success"}
        loading={isToggling}
        onConfirm={handleToggleConfirm}
        onCancel={() => setToggleConfirmPromo(null)}
      />

      <GeneratedCodesModal
        isOpen={!!viewCodesPromo}
        promo={viewCodesPromo}
        onClose={() => setViewCodesPromo(null)}
        onCopyCode={handleCopyCode}
      />
    </>
  );
};

export default PromoCodes;
