import { useState, useEffect, useCallback } from "react";
import {
  Search,
  X,
  Star,
  UserX,
  UserCheck,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { usePageParam } from "../../hooks/usePageParam";
import { userService, UserFromApi } from "../../../api/services/userService";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import Pagination from "../../components/shared/Pagination";
import StatusFilterDropdown from "../../components/shared/FilterDropdown/StatusFilterDropdown";
import { TableContainer, TableHead, Th, TableBody, TableRow, Td } from "../../components/shared/Table/Table";

const ITEMS_PER_PAGE = 10;

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const UserManagement = () => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = usePageParam();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserFromApi | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "" | "active" | "suspended"
  >("");
  const [userTypeFilter, setUserTypeFilter] = useState<
    "all" | "regular" | "creator"
  >("all");
  const [accountTypeFilter, setAccountTypeFilter] = useState<
    "" | "guest" | "registered"
  >("");

  const [users, setUsers] = useState<UserFromApi[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search input. Skipped when searchQuery already matches
  // debouncedSearch (e.g. on mount) so it doesn't clobber a page number
  // restored from the URL.
  useEffect(() => {
    if (searchQuery === debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Omitting user_type returns every account type, including guests.
      // Creators are excluded here since they're managed on their own page.
      const res = await userService.getUsers({
        page: currentPage,
        take: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
        user_type:
          accountTypeFilter === "registered"
            ? "regular"
            : accountTypeFilter === "guest"
              ? "guest"
              : undefined,
      });
      const usersWithAccountType: UserFromApi[] = res.data
        .filter((user) => user.user_type !== "creator")
        .map((user) => ({
          ...user,
          account_type: user.user_type === "guest" ? "guest" as const : "registered" as const,
        }));

      setUsers(usersWithAccountType);
      setTotal(res.meta.total);
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, accountTypeFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const startEntry = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, total);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSuspendToggle = async (user: UserFromApi) => {
    const newStatus = user.status === 1 ? 0 : 1;
    setIsSubmitting(true);
    try {
      await userService.updateStatus(user.global_id, newStatus);
      const statusText =
        newStatus === 0
          ? t.userManagement.toast.userSuspended
          : t.userManagement.toast.userActivated;
      showToast(`${user.name} ${statusText}`, "success");
      await fetchUsers();
    } catch {
      showToast("Failed to update user status", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpgradeToCreator = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await userService.updateUserType(selectedUser.global_id, "creator");
      showToast(
        `${selectedUser.name} ${t.userManagement.toast.userUpgraded}`,
        "success",
      );
      setShowUpgradeConfirm(false);
      await fetchUsers();
    } catch {
      showToast("Failed to upgrade user", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Client-side status filter only — the API has no status query param.
  // Account type (registered/guest) is filtered server-side, see fetchUsers.
  const filteredUsers = users.filter((user) => {
    if (statusFilter === "active" && user.status !== 1) return false;
    if (statusFilter === "suspended" && user.status !== 0) return false;
    return true;
  });

  const activeFilterCount =
    (statusFilter !== "" ? 1 : 0) + (userTypeFilter !== "all" ? 1 : 0) + (accountTypeFilter !== "" ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold mb-1">
          {t.userManagement.title}
        </h1>
        <p className="text-[#71717a] text-sm">{t.userManagement.subtitle}</p>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t.userManagement.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] text-white placeholder:text-[#52525b] pl-4 pr-10 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <StatusFilterDropdown
            label={t.userManagement.filters.status}
            allLabel={t.userManagement.filters.allStatus}
            selectedValue={statusFilter}
            onSelect={(v) => setStatusFilter(v as typeof statusFilter)}
            options={[
              { value: "active", label: t.userManagement.filters.active },
              { value: "suspended", label: t.userManagement.filters.suspended },
            ]}
          />

          <StatusFilterDropdown
            label="Account Type"
            allLabel="All Types"
            selectedValue={accountTypeFilter}
            onSelect={(v) => {
              setAccountTypeFilter(v as typeof accountTypeFilter);
              setCurrentPage(1);
            }}
            options={[
              { value: "guest", label: "Guest" },
              { value: "registered", label: "Regular" },
            ]}
          />

          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setStatusFilter("");
                setUserTypeFilter("all");
                setAccountTypeFilter("");
                setSearchQuery("");
              }}
              className="px-3 py-2 text-xs text-[#71717a] hover:text-white transition-colors"
            >
              {t.userManagement.clearAllFilters}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <TableContainer>
        <TableHead>
          <Th>{t.userManagement.table.number}</Th>
          <Th>{t.userManagement.table.avatar}</Th>
          <Th>Account Type</Th>
          <Th>{t.userManagement.table.phone}</Th>
          <Th>{t.userManagement.table.email}</Th>
          <Th>{t.userManagement.table.subscription}</Th>
          <Th>{t.userManagement.table.lastAccess}</Th>
          <Th>{t.userManagement.table.registrationDate}</Th>
          <Th>{t.userManagement.table.status}</Th>
          <Th align="center">{t.userManagement.table.actions}</Th>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[#71717a] text-sm">Loading...</p>
                </div>
              </td>
            </tr>
          ) : filteredUsers.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Search className="w-12 h-12 text-[#3f3f46]" />
                  <div>
                    <p className="text-white text-lg font-semibold mb-1">
                      {t.userManagement.emptyState.noUsers}
                    </p>
                    <p className="text-[#71717a] text-sm">
                      {t.userManagement.emptyState.tryAdjusting}
                    </p>
                  </div>
                  {(searchQuery ||
                    statusFilter !== "" ||
                    userTypeFilter !== "all" ||
                    accountTypeFilter !== "") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("");
                        setUserTypeFilter("all");
                        setAccountTypeFilter("");
                      }}
                      className="mt-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-white text-sm rounded-lg transition-colors font-medium"
                    >
                      {t.userManagement.emptyState.clearFilters}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            filteredUsers.map((user, index) => {
              const isGuest = user.account_type === 'guest';
              return (
                <TableRow
                  key={user.global_id}
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUserDetail(true);
                  }}
                >
                  {/* Row Number */}
                  <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>

                  {/* Avatar with Name & Username */}
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[#27272a] flex items-center justify-center">
                        {user.profile_url ? (
                          <img
                            src={user.profile_url}
                            alt={user.name}
                            className={`w-full h-full object-cover ${isGuest ? "opacity-50" : ""}`}
                          />
                        ) : (
                          <span className={`text-sm font-bold uppercase ${isGuest ? "text-[#71717a]" : "text-white"}`}>
                            {isGuest ? "G" : (user.name?.charAt(0) ||
                              user.username?.charAt(0) ||
                              "?")}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isGuest ? "text-[#71717a]" : "text-white"}`}>
                          {isGuest ? "Guest" : (user.name || "—")}
                        </p>
                        <p className={`text-xs ${isGuest ? "text-[#52525b]" : "text-[#71717a]"}`}>
                          {isGuest ? user.global_id : user.username}
                        </p>
                      </div>
                    </div>
                  </Td>

                  {/* Account Type */}
                  <Td>
                    {(() => {
                      const type = user.account_type ?? 'guest';
                      const config = {
                        guest:          { label: 'Guest',          cls: 'bg-[#27272a] text-[#71717a] border border-[#3f3f46]' },
                        registered:     { label: 'Regular',        cls: 'bg-green-500/10 text-green-400 border border-green-500/20' },
                      }[type];
                      return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${config.cls}`}>{config.label}</span>;
                    })()}
                  </Td>

                  {/* Phone Number */}
                  <Td className="font-medium">{user.phone_number}</Td>

                  {/* Email */}
                  <Td>{user.email}</Td>

                  {/* Subscription — placeholder */}
                  <Td>{null}</Td>

                  {/* Last Access */}
                  <Td>{formatDate(user.last_login)}</Td>

                  {/* Registration Date */}
                  <Td>{formatDate(user.created_at)}</Td>

                  {/* Status */}
                  <Td>
                    <span
                      className={`inline-flex px-3 py-1.5 text-xs rounded-full font-medium ${
                        user.status === 1
                          ? "bg-[#27272a] text-white"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {user.status === 1
                        ? t.userManagement.filters.active
                        : t.userManagement.filters.suspended}
                    </span>
                  </Td>

                  {/* Actions */}
                  <Td align="center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      {/* View */}
                      <button
                        className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                        title={t.userManagement.actions.view}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                          setShowUserDetail(true);
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 16 16"
                        >
                          <path
                            d="M0.708337 7.56492C0.652777 7.41525 0.652777 7.2506 0.708337 7.10092C1.24947 5.78883 2.16801 4.66695 3.34752 3.87752C4.52702 3.08809 5.91437 2.66667 7.33367 2.66667C8.75297 2.66667 10.1403 3.08809 11.3198 3.87752C12.4993 4.66695 13.4179 5.78883 13.959 7.10092C14.0146 7.2506 14.0146 7.41525 13.959 7.56492C13.4179 8.87702 12.4993 9.9989 11.3198 10.7883C10.1403 11.5778 8.75297 11.9992 7.33367 11.9992C5.91437 11.9992 4.52702 11.5778 3.34752 10.7883C2.16801 9.9989 1.24947 8.87702 0.708337 7.56492Z"
                            stroke="#6C5CE7"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9.33333 7.33333C9.33333 8.43789 8.43789 9.33333 7.33333 9.33333C6.22876 9.33333 5.33333 8.43789 5.33333 7.33333C5.33333 6.22876 6.22876 5.33333 7.33333 5.33333C8.43789 5.33333 9.33333 6.22876 9.33333 7.33333Z"
                            stroke="#6C5CE7"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      {/* Suspend/Activate */}
                      <button
                        className="p-2 rounded-lg hover:bg-[#27272a] transition-colors disabled:opacity-40"
                        title={
                          user.status === 1
                            ? t.userManagement.actions.suspend
                            : t.userManagement.actions.activate
                        }
                        disabled={isSubmitting}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                          setShowSuspendConfirm(true);
                        }}
                      >
                        {user.status === 1 ? (
                          <UserX className="w-4 h-4 text-[#ef4444]" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-[#22c55e]" />
                        )}
                      </button>

                      {/* Upgrade to Creator */}
                      {/* <button
                        className="p-2 rounded-lg hover:bg-[#27272a] transition-colors disabled:opacity-40"
                        title={t.userManagement.actions.upgrade}
                        disabled={user.user_type === "creator" || isSubmitting}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                          setShowUpgradeConfirm(true);
                        }}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            user.user_type === "creator"
                              ? "text-[#52525b]"
                              : "text-[#08b00e]"
                          }`}
                        />
                      </button> */}
                    </div>
                  </Td>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </TableContainer>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        disabled={isLoading}
        summary={<>{t.userManagement.pagination.showing} {startEntry} {t.userManagement.pagination.to} {endEntry} {t.userManagement.pagination.of} {total} {t.userManagement.pagination.entries}</>}
      />

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">
                {t.userManagement.userDetail.title}
              </h2>
              <button
                onClick={() => setShowUserDetail(false)}
                className="p-2 text-[#71717a] hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#27272a] flex-shrink-0 flex items-center justify-center">
                  {selectedUser.profile_url ? (
                    <img
                      src={selectedUser.profile_url}
                      alt={selectedUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold uppercase">
                      {selectedUser.name?.charAt(0) ||
                        selectedUser.username?.charAt(0) ||
                        "?"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-xl font-bold">
                    {selectedUser.name || "—"}
                  </h3>
                  <p className="text-[#71717a] text-sm mt-0.5">
                    @{selectedUser.username}
                  </p>
                  <p className="text-[#71717a] text-sm mt-0.5">
                    {selectedUser.email}
                  </p>
                  <p className="text-[#71717a] text-sm mt-0.5">
                    {selectedUser.phone_number}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#3b82f6]/20 text-[#3b82f6] capitalize">
                      {selectedUser.user_type}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                        selectedUser.status === 1
                          ? "bg-[#22c55e]/20 text-[#22c55e]"
                          : "bg-[#ef4444]/20 text-[#ef4444]"
                      }`}
                    >
                      {selectedUser.status === 1
                        ? t.userManagement.filters.active
                        : t.userManagement.filters.suspended}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#27272a]">
                <div>
                  <p className="text-[#71717a] text-xs font-medium mb-1">
                    {t.userManagement.userDetail.userId}
                  </p>
                  <p className="text-white text-sm font-semibold font-mono">
                    {selectedUser.global_id}
                  </p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs font-medium mb-1">
                    {t.userManagement.userDetail.registrationDate}
                  </p>
                  <p className="text-white text-sm font-semibold">
                    {formatDate(selectedUser.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs font-medium mb-1">
                    {t.userManagement.userDetail.lastActive}
                  </p>
                  <p className="text-white text-sm font-semibold">
                    {formatDate(selectedUser.last_login)}
                  </p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs font-medium mb-1">
                    {t.userManagement.table.subscription}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#27272a]">
                <button
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowUserDetail(false);
                    setShowSuspendConfirm(true);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors text-sm font-semibold disabled:opacity-40 ${
                    selectedUser.status === 1
                      ? "bg-[#ef4444] hover:bg-[#dc2626]"
                      : "bg-[#22c55e] hover:bg-[#16a34a]"
                  }`}
                >
                  {selectedUser.status === 1
                    ? t.userManagement.userDetail.suspend
                    : t.userManagement.userDetail.activate}
                </button>
               
                {/* Upgrade to Creator button hidden
                {selectedUser.user_type !== "creator" && (
                  <button
                    disabled={isSubmitting}
                    onClick={() => {
                      setShowUserDetail(false);
                      setShowUpgradeConfirm(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-semibold disabled:opacity-40"
                  >
                    <Star className="w-4 h-4" />
                    {t.userManagement.actions.upgrade}
                  </button> 
                )}
                */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade to Creator — confirm (hidden)
      <ConfirmDialog
        isOpen={showUpgradeConfirm && !!selectedUser}
        title={t.userManagement.upgradeModal.title}
        message={
          selectedUser
            ? `This will change ${selectedUser.name || selectedUser.username}'s account from ${selectedUser.user_type} to Creator, granting full creator privileges.`
            : ""
        }
        confirmLabel={t.userManagement.upgradeModal.upgrade}
        cancelLabel={t.userManagement.upgradeModal.cancel}
        variant="warning"
        loading={isSubmitting}
        onConfirm={handleUpgradeToCreator}
        onCancel={() => setShowUpgradeConfirm(false)}
      />
      */}

      {/* Suspend / Activate — confirm */}
      <ConfirmDialog
        isOpen={showSuspendConfirm && !!selectedUser}
        title={
          selectedUser?.status === 1
            ? t.userManagement.userDetail.suspend
            : t.userManagement.userDetail.activate
        }
        message={
          selectedUser
            ? selectedUser.status === 1
              ? `Are you sure you want to suspend ${selectedUser.name || selectedUser.username}? They will lose access immediately.`
              : `Are you sure you want to activate ${selectedUser.name || selectedUser.username}? They will regain full access.`
            : ""
        }
        confirmLabel={
          selectedUser?.status === 1
            ? t.userManagement.userDetail.suspend
            : t.userManagement.userDetail.activate
        }
        cancelLabel={t.common?.cancel ?? "Cancel"}
        variant={selectedUser?.status === 1 ? "danger" : "info"}
        loading={isSubmitting}
        onConfirm={async () => {
          if (selectedUser) await handleSuspendToggle(selectedUser);
          setShowSuspendConfirm(false);
        }}
        onCancel={() => setShowSuspendConfirm(false)}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white text-sm font-medium`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
