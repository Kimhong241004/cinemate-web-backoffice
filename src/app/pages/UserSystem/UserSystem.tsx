import { useState, useEffect } from "react";
import Pagination from "../../components/shared/Pagination";
import StatusFilterDropdown from "../../components/shared/StatusFilterDropdown";
import {
  Plus,
  Edit,
  Ban,
  Trash2,
  Search,
  // ChevronLeft and ChevronRight removed — using Pagination component
  X,
  User,
  Mail,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lock,
  Eye,
  EyeOff,
  Settings,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { adminService, AdminFromApi } from "../../../api/services/adminService";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import ImageUploader from "../../components/shared/ImageUploader";

interface SystemUser {
  id: number;
  global_id: string;
  username: string;
  email: string;
  password?: string;
  profile_url: string | null;
  last_login: string;
  total_logins: number;
  status: number;
  role?: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  role: string;
  profile_url: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const UserSystem = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [banUser, setBanUser] = useState<SystemUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<SystemUser | null>(null);

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    role: "Admin",
    profile_url: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((toast) => toast.id !== id)),
      3000,
    );
  };

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const skip = (currentPage - 1) * 10;
      const response = await adminService.getAdmins(skip, 10);
      setUsers(response.data);
      setTotalUsers(response.total);
    } catch (error) {
      showToast((error as Error).message || "Failed to fetch admins", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [currentPage]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      !selectedStatus || user.status === parseInt(selectedStatus);
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    let isValid = true;

    if (!formData.username.trim()) {
      errors.username = t.userSystem.name + " is required";
      isValid = false;
    }
    if (!formData.email.trim()) {
      errors.email = t.userSystem.email + " is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }

    if (!editUser && !formData.password.trim()) {
      errors.password = t.userSystem.password + " is required";
      isValid = false;
    } else if (formData.password.trim() && formData.password.length < 8) {
      errors.password = t.userSystem.minimumChars;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "Admin",
      profile_url: "",
    });
    setFormErrors({});
    setShowPassword(false);
  };

  const handleAddUser = async () => {
    if (!validateForm()) {
      showToast(t.userSystem.fixFormErrors, "error");
      return;
    }

    try {
      setIsSaving(true);
      await adminService.createAdmin({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        profile_url: formData.profile_url || undefined,
        status: 1,
      });
      showToast(
        `"${formData.username}" ${t.userSystem.addedSuccess}`,
        "success",
      );
      setShowAddModal(false);
      resetForm();
      setCurrentPage(1);
      await fetchAdmins();
    } catch (error) {
      showToast((error as Error).message || "Failed to create admin", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = (user: SystemUser) => {
    setEditUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role || "Admin",
      profile_url: user.profile_url || "",
    });
  };

  const handleUpdateUser = async () => {
    if (!validateForm() || !editUser) {
      showToast(t.userSystem.fixFormErrors, "error");
      return;
    }

    try {
      setIsSaving(true);
      await adminService.updateAdmin(editUser.global_id, {
        username: formData.username,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
        ...(formData.profile_url && { profile_url: formData.profile_url }),
      });
      showToast(
        `"${formData.username}" ${t.userSystem.updatedSuccess}`,
        "success",
      );
      setEditUser(null);
      resetForm();
      await fetchAdmins();
    } catch (error) {
      showToast((error as Error).message || "Failed to update admin", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBanUser = (user: SystemUser) => {
    setBanUser(user);
  };

  const handleBanConfirm = async () => {
    if (!banUser) return;
    try {
      setIsSaving(true);
      const newStatus = banUser.status === 1 ? 0 : 1;
      await adminService.updateAdmin(banUser.global_id, { status: newStatus });
      showToast(
        `"${banUser.username}" ${newStatus === 0 ? t.userSystem.bannedSuccess : t.userSystem.unbannedSuccess}`,
        "success",
      );
      setBanUser(null);
      await fetchAdmins();
    } catch (error) {
      showToast(
        (error as Error).message || "Failed to update admin status",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = (user: SystemUser) => {
    setDeleteUser(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;
    try {
      setIsSaving(true);
      await adminService.deleteAdmin(deleteUser.global_id);
      showToast(
        `"${deleteUser.username}" ${t.userSystem.deletedSuccess}`,
        "success",
      );
      setDeleteUser(null);
      await fetchAdmins();
    } catch (error) {
      showToast((error as Error).message || "Failed to delete admin", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const StatusBadge = ({ status }: { status: number }) => {
    const isActive = status === 1;
    return (
      <span
        className={`inline-flex px-3 py-1 text-xs rounded-full border ${
          isActive
            ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20"
            : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20"
        }`}
      >
        {isActive ? t.userSystem.active : t.userSystem.banned}
      </span>
    );
  };

  const getRoleBadgeColor = (role: string) => {
    return "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20";
  };

  const handlePermissionToggle = (
    role: "Admin" | "Editor" | "Poster",
    permission: keyof RolePermissions,
  ) => {
    // Not used for admin API
  };

  const handleSavePermissions = () => {
    // Not used for admin API
  };

  const handleResetPermissions = () => {
    // Not used for admin API
  };

  const getRoleLabel = (role: string) => {
    return t.userSystem.admin;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 shadow-lg animate-slide-up min-w-[300px]"
          >
            {toast.type === "success" && (
              <CheckCircle className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
            )}
            {toast.type === "error" && (
              <XCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />
            )}
            {toast.type === "info" && (
              <AlertCircle className="w-5 h-5 text-[#3b82f6] flex-shrink-0" />
            )}
            <p className="text-white text-sm flex-1">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
            {t.userSystem.title}
          </h1>
          <p className="text-[#71717a] text-sm">{t.userSystem.subtitle}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>{t.userSystem.addUser}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <input
            type="text"
            placeholder={t.userSystem.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white placeholder-[#71717a] text-sm focus:outline-none focus:border-[#3b82f6]"
          />
        </div>

        {/* Status Filter */}
        <StatusFilterDropdown
          label={t.userSystem.status}
          allLabel={t.userSystem.allStatus}
          selectedValue={selectedStatus}
          onSelect={setSelectedStatus}
          options={[
            { value: "1", label: t.userSystem.active },
            { value: "0", label: t.userSystem.banned },
          ]}
        />
      </div>

      {/* Table */}
      <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272a] bg-[#0a0a0a]">
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {t.userSystem.number}
              </th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {t.userSystem.profileImage}
              </th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {t.userSystem.email}
              </th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                Username
              </th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                Role
              </th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {t.userSystem.joinDate}
              </th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {t.userSystem.status}
              </th>
              <th className="px-4 py-4 text-center text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {t.userSystem.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#71717a] text-sm">
                      {t.userSystem.loading || "Loading..."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <User className="w-12 h-12 text-[#71717a] mx-auto mb-3" />
                  <p className="text-white text-sm font-medium">
                    {t.userSystem.noFound}
                  </p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr
                  key={user.global_id}
                  className="hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                >
                  <td className="px-4 py-3.5 text-white text-sm whitespace-nowrap">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[#27272a] flex items-center justify-center">
                      {user.profile_url ? (
                        <img
                          src={user.profile_url}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#3f3f46]">
                          <User className="w-5 h-5 text-[#71717a]" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="text-white text-sm">{user.email}</p>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="text-white text-sm">{user.username}</p>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs rounded-full border bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20">
                      {user.role || "Admin"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="text-white text-sm">
                      {new Date(user.last_login).toLocaleDateString()}
                    </p>
                    <p className="text-[#71717a] text-xs">
                      {new Date(user.last_login).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                      >
                        <Edit className="w-4 h-4 text-[#6C5CE7]" />
                      </button>
                      <button
                        onClick={() => handleBanUser(user)}
                        className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                      >
                        <Ban
                          className={`w-4 h-4 ${user.status === 1 ? "text-[#f59e0b]" : "text-[#22c55e]"}`}
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
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
        summary={<>{t.userSystem.showing} {(currentPage - 1) * itemsPerPage + 1} {t.userSystem.to} {Math.min(currentPage * itemsPerPage, totalUsers)} {t.userSystem.of} {totalUsers} {t.userSystem.entries}</>}
      />

      {/* Add/Edit User Modal */}
      {(showAddModal || editUser) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
              <h2 className="text-white text-xl font-bold">
                {editUser ? t.userSystem.editUser : t.userSystem.addNewUser}
              </h2>
              <button
                onClick={() => {
                  editUser ? setEditUser(null) : setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#71717a]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Image */}
              <ImageUploader
                label={t.userSystem.profileImage}
                folder="admins"
                value={formData.profile_url}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, profile_url: url }))
                }
                defaultTab="device"
                previewShape="circle"
              />

              {/* Username */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Username"
                    className="w-full pl-11 pr-4 py-2.5 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-white placeholder-[#71717a] text-sm focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
                {formErrors.username && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.username as string}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {t.userSystem.emailAddress} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder={t.userSystem.email}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-white placeholder-[#71717a] text-sm focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.email as string}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {t.userSystem.password} {!editUser && "*"}
                  {editUser && (
                    <span className="text-[#71717a] font-normal ml-1">
                      ({t.userSystem.keepCurrentPassword})
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={t.userSystem.password}
                    className="w-full pl-11 pr-11 py-2.5 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-white placeholder-[#71717a] text-sm focus:outline-none focus:border-[#3b82f6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-[#ef4444] text-xs mt-1">
                    {formErrors.password as string}
                  </p>
                )}
                <p className="text-[#71717a] text-xs mt-2">
                  {t.userSystem.minimumChars}
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Role *
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-2.5 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-[#3b82f6] appearance-none cursor-pointer"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-6 border-t border-[#27272a]">
              <button
                onClick={() => {
                  editUser ? setEditUser(null) : setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2.5 bg-[#27272a] text-white text-sm font-medium rounded-xl hover:bg-[#3f3f46] transition-colors order-2 sm:order-1"
              >
                {t.userSystem.cancel}
              </button>
              <button
                onClick={editUser ? handleUpdateUser : handleAddUser}
                disabled={isSaving}
                className="px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving
                  ? "..."
                  : editUser
                    ? t.userSystem.updateUser
                    : t.userSystem.addUser}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!banUser}
        title={
          banUser?.status === 1
            ? t.userSystem.banUserTitle
            : t.userSystem.unbanUserTitle
        }
        message={
          banUser?.status === 1
            ? `${t.userSystem.banConfirmStart} "${banUser.username}"? ${t.userSystem.banMsg}`
            : `${t.userSystem.unbanConfirmStart} "${banUser?.username}"? ${t.userSystem.unbanMsg}`
        }
        confirmLabel={
          banUser?.status === 1 ? t.userSystem.yesBan : t.userSystem.yesUnban
        }
        cancelLabel={t.userSystem.cancel}
        variant={banUser?.status === 1 ? "warning" : "info"}
        loading={isSaving}
        onConfirm={handleBanConfirm}
        onCancel={() => setBanUser(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteUser}
        title={t.userSystem.deleteUserTitle}
        message={`${t.userSystem.deleteConfirmStart} "${deleteUser?.username}"? ${t.userSystem.deleteConfirmEnd}`}
        confirmLabel={t.userSystem.yesDelete}
        cancelLabel={t.userSystem.cancel}
        variant="danger"
        loading={isSaving}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteUser(null)}
      />

      {/* Role Permissions Configuration Modal - TODO: Integrate when API is ready */}
      {false && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
              <div>
                <h2 className="text-white text-xl font-bold mb-1">
                  {t.userSystem.rolePermissionsConfig}
                </h2>
                <p className="text-[#71717a] text-sm">
                  {t.userSystem.rolePermissionsSubtitle}
                </p>
              </div>
              <button className="p-2 hover:bg-[#27272a] rounded-lg transition-colors">
                <X className="w-5 h-5 text-[#71717a]" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Permission Labels */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
                  <div className="hidden md:block"></div>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      t.userSystem.permCreate,
                      t.userSystem.permEdit,
                      t.userSystem.permDelete,
                      t.userSystem.permBan,
                      t.userSystem.permPassword,
                    ].map((label) => (
                      <div
                        key={label}
                        className="text-[#71717a] text-xs font-bold uppercase tracking-wider text-center"
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Roles - TODO: Update with API data */}
                {[
                  {
                    role: "Admin",
                    color: "#ef4444",
                    access: t.userSystem.adminAccess,
                  },
                  {
                    role: "Editor",
                    color: "#3b82f6",
                    access: t.userSystem.editorAccess,
                  },
                  {
                    role: "Viewer",
                    color: "#a1a1aa",
                    access: t.userSystem.posterAccess,
                  },
                ].map(({ role, color, access }) => (
                  <div
                    key={role}
                    className="bg-[#0a0a0a] rounded-xl border border-[#27272a] p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `${color}1a`,
                            border: `1px solid ${color}33`,
                          }}
                        >
                          <Shield className="w-5 h-5" style={{ color }} />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{role}</h3>
                          <p className="text-[#71717a] text-xs">{access}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-3">
                        {[
                          "canCreate",
                          "canEdit",
                          "canDelete",
                          "canBan",
                          "canManagePasswords",
                        ].map((perm) => (
                          <div key={perm} className="flex justify-center">
                            <button className="w-12 h-6 rounded-full transition-colors relative bg-[#27272a]">
                              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform translate-x-0.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-6 border-t border-[#27272a]">
              <button className="px-4 py-2.5 bg-[#27272a] text-white text-sm font-medium rounded-xl hover:bg-[#3f3f46] transition-colors">
                {t.userSystem.resetToDefault}
              </button>
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button className="px-4 py-2.5 bg-[#27272a] text-white text-sm font-medium rounded-xl hover:bg-[#3f3f46] transition-colors">
                  {t.userSystem.cancel}
                </button>
                <button className="px-4 py-2.5 bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
                  {t.userSystem.saveChanges}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSystem;
