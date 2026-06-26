import { useState, useEffect } from "react";
import {
  Plus,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Search,
  SlidersHorizontal,
  Eye,
  X,
  Check,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import Pagination from "../../components/shared/Pagination";
import StatusFilterDropdown from "../../components/shared/StatusFilterDropdown";
import {
  planService,
  PlanFromApi,
  GetPlansParams,
} from "../../../api/services/planService";

interface Plan {
  id: number;
  global_id: string;
  name: string;
  description: string;
  billing_cycle: "monthly" | "yearly" | "weekly";
  price: number;
  status: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

const formatPrice = (n: number) => `${new Intl.NumberFormat('en-US').format(n)} ៛`;

const Subscriptions = () => {
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "all" | "monthly" | "yearly" | "weekly"
  >("all");
  const [showPeriodFilter, setShowPeriodFilter] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPlans, setTotalPlans] = useState(0);
  const [entriesPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    billing_cycle: "monthly" as "monthly" | "yearly" | "weekly",
    price: "",
    status: 1,
  });

  useEffect(() => {
    fetchPlans();
  }, [currentPage, searchQuery, selectedStatus, selectedPeriod]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params: GetPlansParams = {
        skip: (currentPage - 1) * entriesPerPage,
        take: entriesPerPage,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedStatus !== "") params.status = Number(selectedStatus);
      if (selectedPeriod !== "all") params.billing_cycle = selectedPeriod;

      const response = await planService.getPlans(params);
      setPlans(response.data);
      setTotalPlans(response.total);
    } catch (error) {
      console.error("Error fetching plans:", error);
      showToast("Failed to load plans", "error");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalPlans / entriesPerPage);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.price) {
      showToast(t.subscriptions.requiredFields, "error");
      return;
    }

    try {
      await planService.createPlan({
        name: formData.name,
        description: formData.description,
        billing_cycle: formData.billing_cycle,
        price: Math.round(Number(formData.price)),
        status: formData.status,
      });
      showToast(t.subscriptions.createSuccess, "success");
      setShowCreateModal(false);
      setFormData({
        name: "",
        description: "",
        billing_cycle: "monthly",
        price: "",
        status: 1,
      });
      fetchPlans();
    } catch (error) {
      console.error("Error creating plan:", error);
      showToast("Failed to create plan", "error");
    }
  };

  const handleEdit = async () => {
    if (!selectedPlan || !formData.name || !formData.price) {
      showToast(t.subscriptions.requiredFields, "error");
      return;
    }

    try {
      await planService.updatePlan(selectedPlan.global_id, {
        name: formData.name,
        description: formData.description,
        billing_cycle: formData.billing_cycle,
        price: Math.round(Number(formData.price)),
        status: formData.status,
      });
      showToast(t.subscriptions.updateSuccess, "success");
      setShowEditModal(false);
      setSelectedPlan(null);
      fetchPlans();
    } catch (error) {
      console.error("Error updating plan:", error);
      showToast("Failed to update plan", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;
    setIsDeleting(true);
    try {
      await planService.deletePlan(selectedPlan.global_id);
      showToast(t.subscriptions.deleteSuccess, "success");
      setShowDeleteModal(false);
      setSelectedPlan(null);
      fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
      showToast("Failed to delete plan", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      billing_cycle: plan.billing_cycle,
      price: plan.price.toString(),
      status: plan.status,
    });
    setShowEditModal(true);
  };

  const totalPlansCount = plans.length;
  const activePlans = plans.filter((p) => p.status === 1).length;

  const getStatusLabel = (status: "all" | number) => {
    if (status === "all") return t.subscriptions.allStatus;
    if (status === 1) return t.subscriptions.active;
    return t.subscriptions.inactive;
  };

  const getPeriodLabel = (period: "all" | "monthly" | "yearly" | "weekly") => {
    if (period === "all") return t.subscriptions.allPeriods;
    if (period === "monthly") return t.subscriptions.monthly;
    if (period === "yearly") return t.subscriptions.yearly;
    return t.subscriptions.weekly;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl sm:text-3xl font-bold mb-1">
            {t.subscriptions.title}
          </h1>
          <p className="text-[#71717a] text-sm">{t.subscriptions.subtitle}</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: "",
              description: "",
              billing_cycle: "monthly",
              price: "",
              status: 1,
            });
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t.subscriptions.createPlan}
        </button>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#71717a] text-sm">
              {t.subscriptions.totalPlans}
            </p>
            <TrendingUp className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <p className="text-white text-2xl font-bold">{totalPlansCount}</p>
          <p className="text-[#71717a] text-xs mt-1">
            {t.subscriptions.totalPlansDesc || "Total plans available"}
          </p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#71717a] text-sm">
              {t.subscriptions.activePlans}
            </p>
            <Users className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <p className="text-white text-2xl font-bold">{activePlans}</p>
          <p className="text-[#71717a] text-xs mt-1">
            {t.subscriptions.activePlansDesc || "Currently active"}
          </p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#71717a] text-sm">
              {t.subscriptions.inactivePlans}
            </p>
            <DollarSign className="w-4 h-4 text-[#22c55e]" />
          </div>
          <p className="text-[#22c55e] text-2xl font-bold">
            {totalPlansCount - activePlans}
          </p>
          <p className="text-[#71717a] text-xs mt-1">
            {t.subscriptions.inactivePlansDesc || "Currently inactive"}
          </p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#71717a] text-sm">{t.subscriptions.avgPrice}</p>
            <DollarSign className="w-4 h-4 text-[#6C5CE7]" />
          </div>
          <p className="bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] bg-clip-text text-transparent text-2xl font-bold">
            {formatPrice(totalPlansCount > 0
              ? Math.round(plans.reduce((sum, plan) => sum + plan.price, 0) / totalPlansCount)
              : 0)}
          </p>
          <p className="text-[#71717a] text-xs mt-1">
            {t.subscriptions.avgPriceDesc || "Average price per plan"}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 sm:max-w-md">
          <input
            type="text"
            placeholder={t.subscriptions.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] text-white placeholder:text-[#52525b] pl-4 pr-10 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
        </div>

        {/* Status Filter */}
        <StatusFilterDropdown
          label={t.subscriptions.status}
          allLabel={t.subscriptions.allStatus}
          selectedValue={selectedStatus}
          onSelect={setSelectedStatus}
          options={[
            { value: "1", label: t.subscriptions.active },
            { value: "0", label: t.subscriptions.inactive },
          ]}
        />

        {/* Period Filter */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPeriodFilter(!showPeriodFilter);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm hover:bg-[#27272a] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t.subscriptions.period}</span>
            {selectedPeriod !== "all" && (
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
            )}
          </button>
          {showPeriodFilter && (
            <div className="absolute z-10 mt-2 w-48 bg-[#18181b] border border-[#27272a] rounded-lg shadow-lg">
              <div className="p-2">
                {[
                  { value: "all" as const, label: t.subscriptions.allPeriods },
                  { value: "monthly" as const, label: t.subscriptions.monthly },
                  { value: "yearly" as const, label: t.subscriptions.yearly },
                  { value: "weekly" as const, label: t.subscriptions.weekly },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSelectedPeriod(value);
                      setShowPeriodFilter(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedPeriod === value
                        ? "bg-[#27272a] text-[#ef4444]"
                        : "text-white hover:bg-[#27272a]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272a] bg-[#0a0a0a]">
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                No.
              </th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {t.subscriptions.planName}
              </th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {t.subscriptions.description}
              </th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {t.subscriptions.price}
              </th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {t.subscriptions.billingCycle}
              </th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {t.subscriptions.status}
              </th>
              <th className="px-4 py-4 text-center text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {t.subscriptions.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <p className="text-[#71717a] text-sm">Loading plans...</p>
                </td>
              </tr>
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <p className="text-[#71717a] text-sm">
                    {t.subscriptions.noPlansFound}
                  </p>
                </td>
              </tr>
            ) : (
              plans.map((plan, index) => (
                <tr
                  key={plan.global_id}
                  className="hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                >
                  <td className="px-4 py-3.5 text-white text-sm whitespace-nowrap">
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3.5 text-white text-sm font-medium whitespace-nowrap">
                    {plan.name}
                  </td>
                  <td className="px-4 py-3.5 text-white text-sm whitespace-nowrap max-w-xs truncate">
                    {plan.description}
                  </td>
                  <td className="px-4 py-3.5 text-white text-sm font-bold whitespace-nowrap">
                    {formatPrice(plan.price)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1.5 bg-[#27272a] text-white text-xs rounded-full font-medium">
                      {plan.billing_cycle}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                        plan.status === 1
                          ? "bg-[#22c55e]/20 text-[#22c55e]"
                          : "bg-[#71717a]/20 text-[#71717a]"
                      }`}
                    >
                      {plan.status === 1
                        ? t.subscriptions.active
                        : t.subscriptions.inactive}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowViewModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                      >
                        <Eye className="w-4 h-4 text-[#3b82f6]" />
                      </button>
                      <button
                        onClick={() => openEditModal(plan)}
                        className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                      >
                        <Edit className="w-4 h-4 text-[#6C5CE7]" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-[#ef4444]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        summary={<>{t.subscriptions.showing} {plans.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0} {t.subscriptions.to} {Math.min(currentPage * entriesPerPage, totalPlans)} {t.subscriptions.of} {totalPlans} {t.subscriptions.entries}</>}
      />

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">
                {showCreateModal
                  ? t.subscriptions.createPlan
                  : t.subscriptions.editPlan}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  {t.subscriptions.planName} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
                  placeholder={t.subscriptions.planNamePlaceholder}
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  {t.subscriptions.description}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
                  rows={3}
                  placeholder="Enter plan description"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  {t.subscriptions.price} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] pl-4 pr-10 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
                    placeholder="10000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] text-sm">៛</span>
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  {t.subscriptions.billingCycle}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setFormData({ ...formData, billing_cycle: "monthly" })
                    }
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.billing_cycle === "monthly"
                        ? "bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    {t.subscriptions.monthly}
                  </button>
                  <button
                    onClick={() =>
                      setFormData({ ...formData, billing_cycle: "yearly" })
                    }
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.billing_cycle === "yearly"
                        ? "bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    {t.subscriptions.yearly}
                  </button>
                  <button
                    onClick={() =>
                      setFormData({ ...formData, billing_cycle: "weekly" })
                    }
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.billing_cycle === "weekly"
                        ? "bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    {t.subscriptions.weekly}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  {t.subscriptions.status}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, status: 1 })}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      formData.status === 1
                        ? "bg-[#22c55e] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    {t.subscriptions.active}
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, status: 0 })}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      formData.status === 0
                        ? "bg-[#71717a] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    {t.subscriptions.inactive}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#27272a] text-white text-sm hover:bg-[#3f3f46] transition-colors"
              >
                {t.subscriptions.cancel}
              </button>
              <button
                onClick={showCreateModal ? handleCreate : handleEdit}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {showCreateModal
                  ? t.subscriptions.createBtn
                  : t.subscriptions.updateBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">
                {t.subscriptions.planDetails}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#71717a] text-xs mb-1">
                    {t.subscriptions.planName}
                  </p>
                  <p className="text-white text-sm font-medium">
                    {selectedPlan.name}
                  </p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs mb-1">
                    {t.subscriptions.status}
                  </p>
                  <span
                    className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                      selectedPlan.status === 1
                        ? "bg-[#22c55e]/20 text-[#22c55e]"
                        : "bg-[#71717a]/20 text-[#71717a]"
                    }`}
                  >
                    {selectedPlan.status === 1
                      ? t.subscriptions.active
                      : t.subscriptions.inactive}
                  </span>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs mb-1">
                    {t.subscriptions.price}
                  </p>
                  <p className="text-white text-sm font-bold">
                    {formatPrice(selectedPlan.price)}
                  </p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs mb-1">
                    {t.subscriptions.billingCycle}
                  </p>
                  <p className="text-white text-sm">
                    {selectedPlan.billing_cycle}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[#71717a] text-xs mb-1">
                    {t.subscriptions.description}
                  </p>
                  <p className="text-white text-sm">
                    {selectedPlan.description}
                  </p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs mb-1">
                    {t.subscriptions.createdDate}
                  </p>
                  <p className="text-white text-sm">
                    {new Date(selectedPlan.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs mb-1">
                    {t.subscriptions.updatedDate}
                  </p>
                  <p className="text-white text-sm">
                    {new Date(selectedPlan.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#27272a]">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 rounded-lg bg-[#27272a] text-white text-sm hover:bg-[#3f3f46] transition-colors"
              >
                {t.subscriptions.close}
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedPlan);
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {t.subscriptions.editBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteModal && !!selectedPlan}
        title={t.subscriptions.deletePlan}
        message={`${t.subscriptions.deleteConfirm} "${selectedPlan?.name}"? ${t.subscriptions.deleteConfirmEnd}`}
        confirmLabel={t.subscriptions.deletePlan}
        cancelLabel={t.subscriptions.cancel}
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-[#22c55e] text-white"
                : "bg-[#ef4444] text-white"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
