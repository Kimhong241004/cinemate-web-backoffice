import { useState, useEffect, useCallback } from 'react';
import { Search, Edit, Trash2, X, Check, UserCog } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { creatorService } from '../../api/services/creatorService';
import Pagination from '../components/shared/Pagination';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

interface Creator {
  id: number;
  globalId: string;
  name: string;
  username: string;
  phoneNumber: string;
  email: string;
  subscription: string;
  lastAccess: string;
  registrationDate: string;
  status: 'active' | 'suspended';
  avatar: string;
}

const ITEMS_PER_PAGE = 10;

const Creators = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Creator | null>(null);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [userTypeTarget, setUserTypeTarget] = useState<Creator | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<'creator' | 'regular'>('regular');
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    status: 'active' as 'active' | 'suspended',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCreators = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await creatorService.getCreators({
        page: currentPage,
        take: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
      });
      setCreators(
        res.data.map((c, index) => ({
          id: (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
          globalId: c.global_id,
          name: c.name || '—',
          username: c.username,
          phoneNumber: c.phone_number || '',
          email: c.email,
          subscription: '—',
          lastAccess: formatDate(c.last_login),
          registrationDate: formatDate(c.created_at),
          status: c.status === 1 ? 'active' : 'suspended',
          avatar: c.profile_url || '',
        }))
      );
      setTotal(res.total ?? res.data.length);
    } catch {
      showToast('Failed to load creators', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    const delay = searchQuery ? 300 : 0;
    const timer = setTimeout(fetchCreators, delay);
    return () => clearTimeout(timer);
  }, [fetchCreators]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const startEntry = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, total);

  const handleOpenEditModal = (creator: Creator) => {
    setEditingCreator(creator);
    setFormData({ status: creator.status });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCreator(null);
  };

  const handleSubmitRequest = () => {
    if (!editingCreator) return;
    setShowSubmitConfirm(true);
  };

  const handleSubmit = async () => {
    if (!editingCreator) return;
    setIsSubmitting(true);
    try {
      await creatorService.updateStatus(editingCreator.globalId, formData.status === 'active' ? 1 : 0);
      showToast(t.creators.creatorUpdatedSuccess, 'success');
      setShowSubmitConfirm(false);
      handleCloseModal();
      fetchCreators();
    } catch {
      showToast('Failed to update creator', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenUserTypeModal = (creator: Creator) => {
    setUserTypeTarget(creator);
    setSelectedUserType('regular');
    setShowUserTypeModal(true);
  };

  const handleUserTypeConfirm = async () => {
    if (!userTypeTarget) return;
    setIsSubmitting(true);
    try {
      await creatorService.updateUserType(userTypeTarget.globalId, selectedUserType);
      showToast(`User type updated to "${selectedUserType}" successfully`, 'success');
      setShowUserTypeModal(false);
      setUserTypeTarget(null);
      fetchCreators();
    } catch {
      showToast('Failed to update user type', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await creatorService.deleteCreator(deleteTarget.globalId);
      showToast(t.creators.creatorDeletedSuccess, 'success');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchCreators();
    } catch {
      showToast('Failed to delete creator', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{t.creators.title}</h1>
            <p className="text-[#71717a] text-sm">{t.creators.subtitle}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder={t.creators.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] text-white placeholder:text-[#52525b] pl-4 pr-10 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
        </div>

        {/* Table */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#0a0a0a]">
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">#</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.creators.creatorName}</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">Phone</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">Email</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">Subscription</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">Last Access</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">Registration Date</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.creators.status}</th>
                <th className="px-4 py-4 text-center text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.creators.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
                      <p className="text-[#71717a] text-sm">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : creators.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <p className="text-[#71717a] text-sm">{t.creators.noCreatorsFound}</p>
                  </td>
                </tr>
              ) : (
                creators.map((creator) => (
                  <tr key={creator.globalId} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                    {/* # */}
                    <td className="px-4 py-3.5 text-white text-sm whitespace-nowrap">{creator.id}</td>

                    {/* Avatar + Name */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[#27272a] flex items-center justify-center">
                          {creator.avatar ? (
                            <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-sm font-bold uppercase">{creator.name?.charAt(0) || creator.username?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{creator.name}</p>
                          <p className="text-[#71717a] text-xs">{creator.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-white text-sm font-medium">{creator.phoneNumber}</p>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-white text-sm">{creator.email}</p>
                    </td>

                    {/* Subscription */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {/* <span className="inline-flex px-3 py-1.5 bg-[#27272a] text-[#71717a] text-xs rounded-full font-medium">—</span> */}
                    </td>

                    {/* Last Access */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-white text-sm">{creator.lastAccess}</p>
                    </td>

                    {/* Registration Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-white text-sm">{creator.registrationDate}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1.5 text-xs rounded-full font-medium ${
                        creator.status === 'active'
                          ? 'bg-[#22c55e]/20 text-[#22c55e]'
                          : 'bg-[#ef4444]/20 text-[#ef4444]'
                      }`}>
                        {creator.status === 'active' ? t.creators.active : t.creators.suspended}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleOpenEditModal(creator)} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors" title="Edit">
                          <Edit className="w-4 h-4 text-[#3b82f6]" />
                        </button>
                        <button onClick={() => handleOpenUserTypeModal(creator)} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors" title="Adjust User Type">
                          <UserCog className="w-4 h-4 text-[#f97316]" />
                        </button>
                        <button onClick={() => { setDeleteTarget(creator); setShowDeleteConfirm(true); }} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors" title="Delete">
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
          summary={<>Showing {startEntry} to {endEntry} of {total} entries</>}
        />
      </div>

      {/* Edit Modal */}
      {showModal && editingCreator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
              <h2 className="text-white text-xl font-bold">{t.creators.editCreator}</h2>
              <button onClick={handleCloseModal} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors">
                <X className="w-5 h-5 text-[#71717a]" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Creator Info (read-only) */}
              <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-xl border border-[#27272a]">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#27272a] flex items-center justify-center">
                  {editingCreator.avatar ? (
                    <img src={editingCreator.avatar} alt={editingCreator.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-bold uppercase">{editingCreator.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{editingCreator.name}</p>
                  <p className="text-[#71717a] text-xs">{editingCreator.email}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">{t.creators.status}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ status: 'active' })}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.status === 'active' ? 'bg-[#22c55e] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {t.creators.active}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ status: 'suspended' })}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      formData.status === 'suspended' ? 'bg-[#ef4444] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {t.creators.suspended}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 p-5 sm:p-6 border-t border-[#27272a]">
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#27272a] text-white text-sm font-medium hover:bg-[#3f3f46] transition-colors disabled:opacity-50"
              >
                {t.creators.cancel}
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {t.creators.updateCreator}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Type Modal */}
      {showUserTypeModal && userTypeTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
              <h2 className="text-white text-xl font-bold">Adjust User Type</h2>
              <button onClick={() => { setShowUserTypeModal(false); setUserTypeTarget(null); }} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors">
                <X className="w-5 h-5 text-[#71717a]" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-xl border border-[#27272a]">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#27272a] flex items-center justify-center">
                  {userTypeTarget.avatar ? (
                    <img src={userTypeTarget.avatar} alt={userTypeTarget.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-bold uppercase">{userTypeTarget.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{userTypeTarget.name}</p>
                  <p className="text-[#71717a] text-xs">{userTypeTarget.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">User Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUserType('creator')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedUserType === 'creator' ? 'bg-[#f97316] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
                    }`}
                  >
                    Creator
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUserType('regular')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedUserType === 'regular' ? 'bg-[#3b82f6] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
                    }`}
                  >
                    Regular
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 p-5 sm:p-6 border-t border-[#27272a]">
              <button
                onClick={() => { setShowUserTypeModal(false); setUserTypeTarget(null); }}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#27272a] text-white text-sm font-medium hover:bg-[#3f3f46] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUserTypeConfirm}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Update User Type'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showSubmitConfirm}
        title={t.creators.updateCreator}
        message={`Are you sure you want to update "${editingCreator?.name}"?`}
        confirmLabel={t.creators.updateCreator}
        cancelLabel={t.creators.cancel}
        variant="warning"
        loading={isSubmitting}
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitConfirm(false)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-md">
            <div className="p-5 sm:p-6">
              <h2 className="text-white text-xl font-bold mb-2">{t.creators.deleteTitle}</h2>
              <p className="text-[#71717a] text-sm mb-6">{t.creators.deleteCreatorConfirm}</p>
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#27272a] text-white text-sm font-medium hover:bg-[#3f3f46] transition-colors disabled:opacity-50"
                >
                  {t.creators.cancel}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#ef4444] text-white text-sm font-bold hover:bg-[#dc2626] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : t.creators.deleteCreator}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white'
          }`}>
            {toast.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Creators;
