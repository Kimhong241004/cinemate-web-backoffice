import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  Check,
  Upload,
  Link,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import Pagination from "../../components/shared/Pagination";
import { authorService } from "../../../api/services/authorService";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import StatusFilterDropdown from "../../components/shared/FilterDropdown/StatusFilterDropdown";
import { TableContainer, TableHead, Th, TableBody, TableRow, Td, TableMessageRow } from "../../components/shared/Table/Table";

interface Author {
  id: number;
  global_id: string;
  name: string;
  profile: string;
  moviesCount: number;
  status: "active" | "inactive";
  createdDate: string;
}

const ITEMS_PER_PAGE = 10;

const Author = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [authors, setAuthors] = useState<Author[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [viewAuthor, setViewAuthor] = useState<Author | null>(null);
  const [deleteAuthor, setDeleteAuthor] = useState<Author | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    profile_url: "",
    profile_file: null as File | null,
    status: "active" as "active" | "inactive",
  });
  const [imageTab, setImageTab] = useState<"url" | "device">("device");
  const [filePreview, setFilePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formErrors, setFormErrors] = useState({ name: "" });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAuthors = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const statusParam =
        selectedStatus === "active" ? 1 : selectedStatus === "inactive" ? 0 : undefined;
      const res = await authorService.getAuthors({
        skip: (currentPage - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
        status: statusParam,
      });
      setAuthors(
        res.data.map((a) => ({
          id: a.id,
          global_id: a.global_id,
          name: a.name,
          profile: a.profile_url,
          moviesCount: a.movie_total,
          status: a.status === 1 ? "active" : "inactive",
          createdDate: a.created_at.split("T")[0],
        })),
      );
      setTotal(res.total);
    } catch {
      showToast("Failed to load authors", "error");
    } finally {
      setIsLoadingData(false);
    }
  }, [currentPage, searchQuery, selectedStatus]);

  useEffect(() => {
    const delay = searchQuery ? 300 : 0;
    const timer = setTimeout(fetchAuthors, delay);
    return () => clearTimeout(timer);
  }, [fetchAuthors]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const resetForm = () => {
    setFormData({ name: "", profile_url: "", profile_file: null, status: "active" });
    setFormErrors({ name: "" });
    setImageTab("device");
    setFilePreview("");
  };

  const validateForm = () => {
    const errors = { name: "" };
    let isValid = true;
    if (!formData.name.trim()) {
      errors.name = t.author.authorNameRequired;
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast(t.author.selectImageFile, "error");
      return;
    }
    setFormData((p) => ({ ...p, profile_file: file, profile_url: "" }));
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitRequest = () => {
    if (!validateForm()) {
      showToast(t.author.fixErrors, "error");
      return;
    }
    setShowSubmitConfirm(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const statusNum = formData.status === "active" ? 1 : 0;
      const payload = {
        name: formData.name,
        status: statusNum,
        ...(formData.profile_file
          ? { profile_file: formData.profile_file }
          : formData.profile_url
          ? { profile_url: formData.profile_url }
          : {}),
      };
      if (editingAuthor) {
        await authorService.updateAuthor(editingAuthor.global_id, payload);
        showToast(t.author.updateSuccess, "success");
      } else {
        await authorService.createAuthor(payload);
        showToast(t.author.createSuccess, "success");
      }
      setShowSubmitConfirm(false);
      handleCloseModal();
      fetchAuthors();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = (author?: Author) => {
    if (author) {
      setEditingAuthor(author);
      setFormData({ name: author.name, profile_url: author.profile, profile_file: null, status: author.status });
      setFilePreview("");
      setImageTab("device");
    } else {
      resetForm();
      setEditingAuthor(null);
    }
    setFormErrors({ name: "" });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAuthor(null);
    resetForm();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAuthor) return;
    setIsSubmitting(true);
    try {
      await authorService.deleteAuthor(deleteAuthor.global_id);
      showToast(t.author.deleteSuccess, "success");
      setDeleteAuthor(null);
      fetchAuthors();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEntry = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, total);

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{t.author.title}</h1>
            <p className="text-[#71717a] text-sm">{t.author.subtitle}</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {t.author.addAuthor}
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t.author.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181b] text-white placeholder:text-[#52525b] pl-4 pr-10 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
          </div>

          <StatusFilterDropdown
            label={t.author.status}
            allLabel={t.author.allStatus}
            selectedValue={selectedStatus}
            onSelect={setSelectedStatus}
            options={[
              { value: "active", label: t.author.active },
              { value: "inactive", label: t.author.inactive },
            ]}
          />
        </div>

        {/* Table */}
        <TableContainer>
          <TableHead>
            <Th>{t.author.number}</Th>
            <Th>{t.author.image}</Th>
            <Th>{t.author.authorName}</Th>
            <Th>{t.author.moviesCount}</Th>
            <Th>{t.author.status}</Th>
            <Th align="center">{t.author.actions}</Th>
          </TableHead>
          <TableBody>
            {isLoadingData ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#71717a] text-sm">Loading...</p>
                  </div>
                </td>
              </tr>
            ) : authors.length === 0 ? (
              <TableMessageRow colSpan={6}>{t.author.noFound}</TableMessageRow>
            ) : (
              authors.map((author, index) => (
                <TableRow key={author.id}>
                  <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>
                  <Td>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#27272a] flex items-center justify-center">
                      {author.profile ? (
                        <img src={author.profile} alt={author.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold uppercase">{author.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                  </Td>
                  <Td className="font-medium">{author.name}</Td>
                  <Td>{author.moviesCount}</Td>
                  <Td>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      author.status === "active"
                        ? "bg-[#22c55e]/20 text-[#22c55e]"
                        : "bg-[#71717a]/20 text-[#71717a]"
                    }`}>
                      {author.status === "active" ? t.author.active : t.author.inactive}
                    </span>
                  </Td>
                  <Td align="center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => setViewAuthor(author)} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"><Eye className="w-4 h-4 text-[#6C5CE7]" /></button>
                      <button onClick={() => handleOpenModal(author)} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"><Edit className="w-4 h-4 text-[#6C5CE7]" /></button>
                      <button onClick={() => setDeleteAuthor(author)} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"><Trash2 className="w-4 h-4 text-[#ef4444]" /></button>
                    </div>
                  </Td>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableContainer>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          summary={<>{t.author.showing} {startEntry} {t.author.to} {endEntry} {t.author.of} {total} {t.author.entries}</>}
        />
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">{editingAuthor ? t.author.editAuthor : t.author.addAuthor}</h2>
              <button onClick={handleCloseModal} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile Image */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {t.author.profileImage}{!editingAuthor && " *"}
                </label>

                {/* Preview */}
                {(filePreview || formData.profile_url) && (
                  <div className="relative mb-3 inline-flex">
                    <img
                      src={filePreview || formData.profile_url}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border border-[#27272a]"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <button
                      type="button"
                      onClick={() => { setFilePreview(""); setFormData((p) => ({ ...p, profile_file: null, profile_url: "" })); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#ef4444] rounded-full flex items-center justify-center hover:bg-[#dc2626] transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex bg-[#0a0a0a] border border-[#27272a] rounded-lg p-1 mb-3 w-fit gap-1">
                  <button type="button" onClick={() => setImageTab("device")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${imageTab === "device" ? "bg-[#27272a] text-white" : "text-[#71717a] hover:text-white"}`}>
                    <Upload className="w-3.5 h-3.5" /> Device
                  </button>
                  <button type="button" onClick={() => setImageTab("url")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${imageTab === "url" ? "bg-[#27272a] text-white" : "text-[#71717a] hover:text-white"}`}>
                    <Link className="w-3.5 h-3.5" /> URL
                  </button>
                </div>

                {imageTab === "device" ? (
                  <>
                    <input ref={fileInputRef} type="file" accept="image/*"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                      className="hidden"
                    />
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#27272a] text-[#71717a] hover:border-[#3f3f46] hover:text-white hover:bg-[#27272a]/50 transition-colors text-sm font-medium">
                      <Upload className="w-4 h-4" /> Choose file
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.profile_url}
                      onChange={(e) => setFormData((p) => ({ ...p, profile_url: e.target.value, profile_file: null }))}
                      onKeyDown={(e) => { if (e.key === "Enter") { setFilePreview(""); } }}
                      placeholder="https://example.com/image.png"
                      className="flex-1 bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-3 py-2 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
                    />
                    <button type="button"
                      onClick={() => setFilePreview("")}
                      className="px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-white text-xs font-medium rounded-lg transition-colors">
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">{t.author.authorName} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${formErrors.name ? "border-[#ef4444]" : "border-[#27272a]"} focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
                  placeholder={t.author.authorNamePlaceholder}
                />
                {formErrors.name && <p className="text-[#ef4444] text-xs mt-1">{formErrors.name}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">{t.author.status}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({ ...formData, status: "active" })} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${formData.status === "active" ? "bg-[#22c55e] text-white" : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"}`}>{t.author.active}</button>
                  <button type="button" onClick={() => setFormData({ ...formData, status: "inactive" })} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${formData.status === "inactive" ? "bg-[#71717a] text-white" : "bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]"}`}>{t.author.inactive}</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
                <button onClick={handleCloseModal} disabled={isSubmitting} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#27272a] text-white text-sm hover:bg-[#3f3f46] transition-colors disabled:opacity-50">{t.author.cancel}</button>
                <button onClick={handleSubmitRequest} disabled={isSubmitting} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                  {editingAuthor ? t.author.editAuthor : t.author.addAuthor}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">{t.author.viewAuthor}</h2>
              <button onClick={() => setViewAuthor(null)} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"><X className="w-5 h-5 text-white" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-[#27272a]">
                  <img src={viewAuthor.profile} alt={viewAuthor.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[#71717a] text-xs mb-1">{t.author.authorName}</p>
                  <p className="text-white text-sm">{viewAuthor.name}</p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs mb-1">{t.author.moviesCount}</p>
                  <p className="text-white text-sm">{viewAuthor.moviesCount}</p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs mb-1">{t.author.status}</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${viewAuthor.status === "active" ? "bg-[#22c55e] text-white" : "bg-[#71717a] text-white"}`}>
                    {viewAuthor.status === "active" ? t.author.active : t.author.inactive}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
                <button onClick={() => setViewAuthor(null)} className="px-4 py-2 rounded-lg bg-[#27272a] text-white text-sm hover:bg-[#3f3f46] transition-colors">{t.author.cancel}</button>
                <button onClick={() => { handleOpenModal(viewAuthor); setViewAuthor(null); }} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white text-sm font-medium hover:opacity-90 transition-opacity">{t.author.editAuthor}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showSubmitConfirm}
        title={editingAuthor ? t.author.editAuthor : t.author.addAuthor}
        message={
          editingAuthor
            ? `Are you sure you want to update "${editingAuthor.name}"?`
            : `Are you sure you want to add "${formData.name}" as a new author?`
        }
        confirmLabel={editingAuthor ? t.author.editAuthor : t.author.addAuthor}
        cancelLabel={t.author.cancel}
        variant="warning"
        loading={isSubmitting}
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitConfirm(false)}
      />

      <ConfirmDialog
        isOpen={!!deleteAuthor}
        title={t.author.deleteAuthor}
        message={`${t.author.deleteConfirmStart} "${deleteAuthor?.name}"? ${t.author.deleteConfirmEnd}`}
        confirmLabel={t.author.deleteAuthor}
        cancelLabel={t.author.cancel}
        variant="danger"
        loading={isSubmitting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteAuthor(null)}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${toast.type === "success" ? "bg-[#22c55e] text-white" : "bg-[#ef4444] text-white"}`}>
            {toast.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Author;
