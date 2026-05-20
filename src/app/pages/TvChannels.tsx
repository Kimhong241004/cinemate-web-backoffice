import { useState, useEffect } from "react";
import { Search, Plus, Copy, Edit, Trash2, X, Check, Tv } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import {
  tvChannelService,
  TvChannelFromApi,
} from "../../api/services/tvChannelService";
import ImageUploader from "../components/shared/ImageUploader";
import Pagination from "../components/shared/Pagination";
import ConfirmDialog from "../components/shared/ConfirmDialog";

interface Channel {
  id: number;
  global_id: string;
  name: string;
  description: string | null;
  category: string | null;
  tv_type: string | null;
  logo_url: string | null;
  stream_url: string;
  status: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

const TAKE = 10;

const TvChannels = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const skip = (currentPage - 1) * TAKE;
  const totalPages = Math.max(1, Math.ceil(total / TAKE));

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const response = await tvChannelService.getTvChannels({
          skip,
          take: TAKE,
        });
        setChannels(response.data);
        setTotal(response.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch channels",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [currentPage]);

  const [showModal, setShowModal] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingChannel, setDeletingChannel] = useState<Channel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    logo_url: "",
    stream_url: "",
    tv_type: "national" as "national" | "international",
    status: 1,
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    category: "",
    stream_url: "",
    tv_type: "",
  });

  // Show toast notification
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetErrors = () => ({
    name: "",
    category: "",
    stream_url: "",
    tv_type: "",
  });

  // Validate form
  const validateForm = () => {
    const errors = resetErrors();
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = t.tvChannels.channelNameRequired;
      isValid = false;
    }

    if (!formData.category.trim()) {
      errors.category = t.tvChannels.categoryRequired;
      isValid = false;
    }

    if (!formData.stream_url.trim()) {
      errors.stream_url = t.tvChannels.streamUrlRequired;
      isValid = false;
    } else if (
      !formData.stream_url.startsWith("http://") &&
      !formData.stream_url.startsWith("https://")
    ) {
      errors.stream_url = t.tvChannels.urlMustStartWith;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const emptyFormData = () => ({
    name: "",
    description: "",
    category: "",
    logo_url: "",
    stream_url: "",
    tv_type: "national" as const,
    status: 1,
  });

  // Open create modal
  const handleOpenCreateModal = () => {
    setEditingChannel(null);
    setFormData(emptyFormData());
    setFormErrors(resetErrors());
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (channel: Channel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      description: channel.description ?? "",
      category: channel.category ?? "",
      logo_url: channel.logo_url ?? "",
      stream_url: channel.stream_url,
      tv_type: (channel.tv_type as "national" | "international") ?? "national",
      status: channel.status,
    });
    setFormErrors(resetErrors());
    setShowModal(true);
  };

  // Validate then show confirm dialog
  const handleSubmitRequest = () => {
    if (!validateForm()) {
      showToast(t.tvChannels.fixErrors, "error");
      return;
    }
    setShowSubmitConfirm(true);
  };

  // Called when user confirms the dialog
  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      logo_url: formData.logo_url || undefined,
      stream_url: formData.stream_url,
      tv_type: formData.tv_type,
      status: formData.status,
    };

    setIsSubmitting(true);
    try {
      if (editingChannel) {
        const updatedChannel = await tvChannelService.updateTvChannel(
          editingChannel.global_id,
          payload,
        );
        setChannels(
          channels.map((ch) =>
            ch.global_id === editingChannel.global_id ? updatedChannel : ch,
          ),
        );
        showToast(t.tvChannels.channelUpdatedSuccess, "success");
      } else {
        const newChannel = await tvChannelService.createTvChannel(payload);
        setChannels([...channels, newChannel]);
        showToast(t.tvChannels.channelCreatedSuccess, "success");
      }
      setShowSubmitConfirm(false);
      setShowModal(false);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Operation failed",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = (channel: Channel) => {
    setDeletingChannel(channel);
  };

  const confirmDelete = async () => {
    if (!deletingChannel) return;
    setIsDeleting(true);
    try {
      await tvChannelService.deleteTvChannel(deletingChannel.global_id);
      setChannels(channels.filter((ch) => ch.id !== deletingChannel.id));
      showToast(t.tvChannels.channelDeletedSuccess, "success");
      setDeletingChannel(null);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Delete failed",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle copy URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        showToast(t.tvChannels.urlCopied, "success");
      })
      .catch(() => {
        showToast(t.tvChannels.urlCopyFailed, "error");
      });
  };

  // Filter channels by search
  const filteredChannels = channels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (channel.category ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      channel.stream_url.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
              {t.tvChannels.title}
            </h1>
            <p className="text-[#71717a] text-sm">{t.tvChannels.subtitle}</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#ef4444] to-[#f97316] rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {t.tvChannels.addChannel}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder={t.tvChannels.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] text-white placeholder:text-[#52525b] pl-4 pr-10 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
        </div>

        {/* Channels Table */}
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
                  {t.tvChannels.channelName}
                </th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                  {t.tvChannels.category}
                </th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                  {t.tvChannels.status}
                </th>
                <th className="px-4 py-4 text-center text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-[#71717a] text-sm">
                      Loading channels...
                    </p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-[#ef4444] text-sm">{error}</p>
                  </td>
                </tr>
              ) : filteredChannels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-[#71717a] text-sm">
                      {t.tvChannels.noChannelsFound}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredChannels.map((channel, index) => (
                  <tr
                    key={channel.id}
                    className="hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                  >
                    {/* # */}
                    <td className="px-4 py-3.5 text-white text-sm whitespace-nowrap">
                      {skip + index + 1}
                    </td>

                    {/* Logo */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#27272a] flex items-center justify-center flex-shrink-0">
                        {channel.logo_url ? (
                          <img
                            src={channel.logo_url}
                            alt={channel.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Tv className="w-5 h-5 text-[#52525b]" />
                        )}
                      </div>
                    </td>

                    {/* Name + URL */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-white text-sm font-semibold">
                        {channel.name}
                      </p>
                      <p className="text-[#71717a] text-xs mt-0.5 max-w-[220px] truncate">
                        {channel.stream_url}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs text-white font-medium">
                        {channel.category ?? ""}
                      </span>
                    </td>

                    {/* TV Type */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs text-white font-medium capitalize">
                        {channel.tv_type ?? "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          channel.status === 1
                            ? "bg-[#22c55e]/20 text-[#22c55e]"
                            : "bg-[#71717a]/20 text-[#71717a]"
                        }`}
                      >
                        {channel.status === 1
                          ? t.tvChannels.live
                          : t.tvChannels.offline}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleCopyUrl(channel.stream_url)}
                          className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4 text-[#71717a]" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(channel)}
                          className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-[#3b82f6]" />
                        </button>
                        <button
                          onClick={() => handleDelete(channel)}
                          className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                          title="Delete"
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
          disabled={loading}
          summary={
            <>
              Showing {total > 0 ? skip + 1 : 0} to{" "}
              {Math.min(skip + TAKE, total)} of {total} channels
            </>
          }
        />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
              <h2 className="text-white text-xl font-bold">
                {editingChannel
                  ? t.tvChannels.editChannel
                  : t.tvChannels.createChannel}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
              >
                <X className="w-5 h-5 text-[#71717a]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Channel Name */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {t.tvChannels.channelName} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
                    formErrors.name ? "border-[#ef4444]" : "border-[#27272a]"
                  } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
                  placeholder="e.g., MOITV News 24"
                />
                {formErrors.name && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className="w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm resize-none"
                  placeholder="Brief description of this channel"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {t.tvChannels.category} *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
                    formErrors.category
                      ? "border-[#ef4444]"
                      : "border-[#27272a]"
                  } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
                  placeholder="e.g., News, Sports, Entertainment"
                />
                {formErrors.category && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.category}
                  </p>
                )}
              </div>

              {/* TV Type */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  TV Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, tv_type: "national" })
                    }
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.tv_type === "national"
                        ? "bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    National
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, tv_type: "international" })
                    }
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.tv_type === "international"
                        ? "bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    International
                  </button>
                </div>
              </div>

              {/* Stream URL */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {t.tvChannels.streamUrl} *
                </label>
                <input
                  type="url"
                  value={formData.stream_url}
                  onChange={(e) =>
                    setFormData({ ...formData, stream_url: e.target.value })
                  }
                  className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
                    formErrors.stream_url
                      ? "border-[#ef4444]"
                      : "border-[#27272a]"
                  } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
                  placeholder="https://stream.moitv.com/news24"
                />
                {formErrors.stream_url && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.stream_url}
                  </p>
                )}
              </div>

              {/* Logo */}
              <ImageUploader
                label={t.tvChannels.thumbnailUrl}
                folder="tv-channels"
                value={formData.logo_url}
                onChange={(url) => setFormData({ ...formData, logo_url: url })}
                defaultTab="device"
              />

              {/* Status */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {t.tvChannels.status}
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 1 })}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.status === 1
                        ? "bg-[#ef4444] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    {t.tvChannels.live}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 0 })}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.status === 0
                        ? "bg-[#71717a] text-white"
                        : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"
                    }`}
                  >
                    {t.tvChannels.offline}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 p-5 sm:p-6 border-t border-[#27272a]">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#27272a] text-white text-sm font-medium hover:bg-[#3f3f46] transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSubmitRequest}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                {editingChannel
                  ? t.tvChannels.updateChannel
                  : t.tvChannels.addChannel}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showSubmitConfirm}
        title={editingChannel ? t.tvChannels.updateChannel : t.tvChannels.addChannel}
        message={
          editingChannel
            ? `Are you sure you want to update "${editingChannel.name}"?`
            : `Are you sure you want to add "${formData.name}" as a new channel?`
        }
        confirmLabel={editingChannel ? t.tvChannels.updateChannel : t.tvChannels.addChannel}
        cancelLabel={t.common.cancel}
        variant="warning"
        loading={isSubmitting}
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitConfirm(false)}
      />

      <ConfirmDialog
        isOpen={!!deletingChannel}
        title={t.tvChannels.deleteChannel}
        message={`${t.tvChannels.deleteChannelConfirm} "${deletingChannel?.name}"?`}
        confirmLabel={t.tvChannels.deleteChannel}
        cancelLabel={t.common.cancel}
        variant="danger"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingChannel(null)}
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
    </>
  );
};

export default TvChannels;
