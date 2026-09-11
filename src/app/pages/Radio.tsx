import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Radio as RadioIcon,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { usePageParam } from "../hooks/usePageParam";
import {
  radioService,
  RadioChannelFromApi,
  CreateRadioChannelData,
} from "../../api/services/radioService";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import ImageUploader from "../components/shared/ImageUploader";
import Pagination from "../components/shared/Pagination";

const TAKE = 10;

const emptyForm: CreateRadioChannelData = {
  name: "",
  genre: "",
  frequency: "",
  stream_url: "",
  logo_url: "",
  isDefault: false,
  status: 1,
};

const emptyErrors = {
  name: "",
  genre: "",
  frequency: "",
  stream_url: "",
};

const Radio = () => {
  const { t } = useLanguage();

  // ── data state ────────────────────────────────────────────────────────────
  const [stations, setStations] = useState<RadioChannelFromApi[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = usePageParam();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const skip = (currentPage - 1) * TAKE;
  const totalPages = Math.max(1, Math.ceil(total / TAKE));

  // ── ui state ──────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [editingStation, setEditingStation] =
    useState<RadioChannelFromApi | null>(null);
  const [deleteStation, setDeleteStation] =
    useState<RadioChannelFromApi | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState<CreateRadioChannelData>(emptyForm);
  const [formErrors, setFormErrors] = useState(emptyErrors);

  // ── search debounce ───────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchStations = useCallback(async () => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    try {
      const res = await radioService.getRadioChannels({
        skip,
        take: TAKE,
        search: debouncedSearch || undefined,
      });
      if (!cancelled) {
        setStations(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      if (!cancelled)
        setError(
          err instanceof Error ? err.message : "Failed to load stations",
        );
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, refreshKey, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // ── toast helper ──────────────────────────────────────────────────────────
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── form helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingStation(null);
    setFormData(emptyForm);
    setFormErrors(emptyErrors);
    setShowModal(true);
  };

  const openEdit = (station: RadioChannelFromApi) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      genre: station.genre,
      frequency: station.frequency,
      stream_url: station.stream_url,
      logo_url: station.logo_url ?? "",
      isDefault: station.isDefault,
      status: station.status,
    });
    setFormErrors(emptyErrors);
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = { ...emptyErrors };
    let ok = true;

    if (!formData.name.trim()) {
      errors.name = "Station name is required";
      ok = false;
    }
    if (!formData.genre.trim()) {
      errors.genre = "Genre is required";
      ok = false;
    }
    if (!formData.frequency.trim()) {
      errors.frequency = "Frequency is required";
      ok = false;
    }
    if (!formData.stream_url.trim()) {
      errors.stream_url = "Stream URL is required";
      ok = false;
    } else if (!/^https?:\/\//.test(formData.stream_url)) {
      errors.stream_url = "Must start with http:// or https://";
      ok = false;
    }

    setFormErrors(errors);
    return ok;
  };

  const handleSubmitRequest = () => {
    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }
    setShowSubmitConfirm(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (editingStation) {
        await radioService.updateRadioChannel(
          editingStation.global_id,
          payload,
        );
        showToast("Station updated successfully", "success");
      } else {
        await radioService.createRadioChannel(payload);
        showToast("Station created successfully", "success");
      }
      setShowSubmitConfirm(false);
      setShowModal(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Something went wrong",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteStation) return;
    setIsDeleting(true);
    try {
      await radioService.deleteRadioChannel(deleteStation.global_id);
      showToast("Station deleted successfully", "success");
      setDeleteStation(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete station",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // ── field helper ──────────────────────────────────────────────────────────
  const field = (key: keyof typeof emptyErrors) => ({
    value: formData[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value })),
    className: `w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
      formErrors[key] ? "border-[#ef4444]" : "border-[#27272a]"
    } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`,
  });

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
              Radio Management
            </h1>
            <p className="text-[#71717a] text-sm">
              {total} station{total !== 1 ? "s" : ""} total
            </p>
          </div>
          <button
            onClick={openCreate}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#ef4444] to-[#f97316] rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Station
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
          <input
            type="text"
            placeholder="Search stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] text-white placeholder:text-[#52525b] pl-10 pr-4 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
          />
        </div>

        {/* Stations List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#71717a] text-sm">Loading stations...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-[#ef4444] text-sm">{error}</p>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="px-4 py-2 bg-[#27272a] text-white text-sm rounded-lg hover:bg-[#3f3f46] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : stations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RadioIcon className="w-12 h-12 text-[#3f3f46]" />
            <p className="text-[#71717a] text-sm">No stations found</p>
          </div>
        ) : (
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#0a0a0a]">
                  <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    #
                  </th>
                  <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Logo
                  </th>
                  <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Station
                  </th>
                  <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Genre
                  </th>
                  <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Frequency
                  </th>
                  <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Views
                  </th>
                  <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Default
                  </th>
                  <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-4 text-center text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {stations.map((station, index) => (
                  <tr
                    key={station.global_id}
                    className="hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                  >
                    {/* # */}
                    <td className="px-4 py-3.5 text-white text-sm whitespace-nowrap">
                      {index + 1}
                    </td>

                    {/* Logo */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#27272a] flex items-center justify-center flex-shrink-0">
                        {station.logo_url ? (
                          <img
                            src={station.logo_url}
                            alt={station.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <RadioIcon className="w-5 h-5 text-[#52525b]" />
                        )}
                      </div>
                    </td>

                    {/* Station name + stream url */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-white text-sm font-semibold">
                        {station.name}
                      </p>
                      <p className="text-[#71717a] text-xs mt-0.5 max-w-[200px] truncate">
                        {station.stream_url}
                      </p>
                    </td>

                    {/* Genre */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-[#27272a] text-xs text-[#a1a1aa] font-medium">
                        {station.genre}
                      </span>
                    </td>

                    {/* Frequency */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-white text-sm">{station.frequency}</p>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-white text-sm">
                        {station.total_views.toLocaleString()}
                      </p>
                    </td>

                    {/* Default */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {station.isDefault ? (
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-medium">
                          Default
                        </span>
                      ) : (
                        <span className="text-[#52525b] text-xs"></span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          station.status === 1
                            ? "bg-[#22c55e]/20 text-[#22c55e]"
                            : "bg-[#71717a]/20 text-[#71717a]"
                        }`}
                      >
                        {station.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEdit(station)}
                          className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-[#3b82f6]" />
                        </button>
                        <button
                          onClick={() => setDeleteStation(station)}
                          className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-[#ef4444]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          disabled={loading}
          summary={<>Showing {total > 0 ? skip + 1 : 0} to {Math.min(skip + TAKE, total)} of {total} stations</>}
        />
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
              <h2 className="text-white text-lg font-bold">
                {editingStation ? "Edit Station" : "Create New Station"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="p-2 rounded-lg hover:bg-[#27272a] transition-colors disabled:opacity-40"
              >
                <X className="w-5 h-5 text-[#71717a]" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Station Name *
                </label>
                <input {...field("name")} placeholder="e.g. MOITV FM 101.5" />
                {formErrors.name && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Genre */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Genre *
                </label>
                <input {...field("genre")} placeholder="e.g. Pop, Rock, Jazz" />
                {formErrors.genre && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.genre}
                  </p>
                )}
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Frequency *
                </label>
                <input {...field("frequency")} placeholder="e.g. 101.5 FM" />
                {formErrors.frequency && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.frequency}
                  </p>
                )}
              </div>

              {/* Stream URL */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Stream URL *
                </label>
                <input
                  {...field("stream_url")}
                  type="url"
                  placeholder="https://stream.example.com/live"
                />
                {formErrors.stream_url && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.stream_url}
                  </p>
                )}
              </div>

              {/* Logo */}
              <ImageUploader
                label="Logo"
                folder="radio"
                value={formData.logo_url ?? ""}
                onChange={(url) =>
                  setFormData((p) => ({ ...p, logo_url: url }))
                }
                defaultTab="device"
              />

              {/* Status + Default row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Status */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Status
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, status: 1 }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        formData.status === 1
                          ? "bg-[#22c55e] text-white"
                          : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, status: 0 }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        formData.status === 0
                          ? "bg-[#71717a] text-white"
                          : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>

                {/* Default */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Set as Default
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, isDefault: !p.isDefault }))
                    }
                    className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
                      formData.isDefault
                        ? "bg-[#3b82f6] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    {formData.isDefault ? "Yes — Default" : "No"}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 px-6 py-4 border-t border-[#27272a]">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#27272a] text-white text-sm font-medium hover:bg-[#3f3f46] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {editingStation ? "Update Station" : "Create Station"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Update confirm ─────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={showSubmitConfirm}
        title={editingStation ? "Update Station" : "Create Station"}
        message={
          editingStation
            ? `Are you sure you want to update "${editingStation.name}"?`
            : `Are you sure you want to add "${formData.name}" as a new station?`
        }
        confirmLabel={editingStation ? "Update Station" : "Create Station"}
        cancelLabel="Cancel"
        variant="warning"
        loading={isSubmitting}
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitConfirm(false)}
      />

      {/* ── Delete confirm ──────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteStation}
        title="Delete Station"
        message={`Are you sure you want to delete "${deleteStation?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Station"
        cancelLabel="Cancel"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteStation(null)}
      />

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === "success" ? "bg-[#22c55e]" : "bg-[#ef4444]"
            } text-white`}
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
    </>
  );
};

export default Radio;
