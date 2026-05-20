import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Camera,
  Lock,
  Save,
  Settings2,
  CreditCard,
  Globe,
  HardDrive,
  Tv,
  TriangleAlert,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { profileService } from "../../api/services/profileService";
import { settingService } from "../../api/services/settingService";
import { useProfile } from "../context/ProfileContext";

type Tab = "profile" | "security" | "configuration";

// ── Reusable primitives ────────────────────────────────────────────────────────

const Toggle = ({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
      enabled ? "bg-gradient-to-r from-[#ef4444] to-[#f97316]" : "bg-[#3f3f46]"
    }`}
  >
    <div
      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
        enabled ? "translate-x-[26px]" : "translate-x-0.5"
      }`}
    />
  </button>
);

const Field = ({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-white text-sm font-medium mb-1.5">
      {label}
      {required && <span className="text-[#f97316] ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-[#52525b] text-xs mt-1.5">{hint}</p>}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#27272a] rounded-lg text-white text-sm
      focus:outline-none focus:border-[#f97316] transition-colors placeholder-[#52525b]
      disabled:text-[#52525b] disabled:cursor-not-allowed ${props.className ?? ""}`}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
    <select
      {...props}
      className={`w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#27272a] rounded-lg text-white text-sm
        focus:outline-none focus:border-[#f97316] transition-colors appearance-none cursor-pointer ${props.className ?? ""}`}
    />
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b] pointer-events-none" />
  </div>
);

const SectionCard = ({
  icon: Icon,
  iconColor = "text-[#f97316]",
  title,
  description,
  children,
  badge,
}: {
  icon: React.ElementType;
  iconColor?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: string;
}) => (
  <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
    <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#27272a] flex items-center justify-center">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-white font-semibold text-sm">{title}</h2>
          <p className="text-[#71717a] text-xs mt-0.5">{description}</p>
        </div>
      </div>
      {badge && (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20">
          {badge}
        </span>
      )}
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

const ToggleRow = ({
  label,
  description,
  enabled,
  onChange,
  warn,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  warn?: boolean;
}) => (
  <div className="flex items-center justify-between py-1">
    <div>
      <p
        className={`text-sm font-medium ${warn ? "text-amber-400" : "text-white"}`}
      >
        {label}
      </p>
      <p className="text-[#71717a] text-xs mt-0.5">{description}</p>
    </div>
    <Toggle enabled={enabled} onChange={onChange} />
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const Settings = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // ── Profile state ──────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    profileService
      .getProfile()
      .then((profile) => {
        setUsername(profile.username);
        setEmail(profile.email);
        if (profile.profile_url) setAvatarPreview(profile.profile_url);
      })
      .catch(() => {
        setStatusMsg({ type: "error", text: "Failed to load profile." });
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    try {
      await profileService.updateProfile({ username, email });
      if (avatarFile) {
        const updated = await profileService.uploadAvatar(avatarFile);
        if (updated.profile_url) setAvatarPreview(updated.profile_url);
        setAvatarFile(null);
      }
      setStatusMsg({ type: "success", text: "Profile updated successfully." });
      refreshProfile();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update profile.";
      setStatusMsg({ type: "error", text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Security state ─────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [securityMsg, setSecurityMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityMsg({
        type: "error",
        text: "All password fields are required.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityMsg({
        type: "error",
        text: "New password and confirmation do not match.",
      });
      return;
    }
    setIsChangingPassword(true);
    setSecurityMsg(null);
    try {
      const res = await profileService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });
      setSecurityMsg({ type: "success", text: res.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to change password.";
      setSecurityMsg({ type: "error", text: msg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ── Configuration: Bakong KHQR ─────────────────────────────────────────────
  const [bakongLoading, setBakongLoading] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [khqrMerchantName, setKhqrMerchantName] = useState("");
  const [khqrMerchantCity, setKhqrMerchantCity] = useState("");
  const [khqrMerchantId, setKhqrMerchantId] = useState("");
  const [khqrCurrency, setKhqrCurrency] = useState("KHR");
  const [khqrEnabled, setKhqrEnabled] = useState(true);
  const [khqrSandbox, setKhqrSandbox] = useState(false);

  useEffect(() => {
    settingService
      .getBakong()
      .then((s) => {
        setKhqrMerchantName(s.merchantName);
        setKhqrMerchantCity(s.merchantCity);
        setKhqrMerchantId(s.merchantId);
        setKhqrCurrency(s.currency);
      })
      .catch(() => {
        setConfigMsg({
          type: "error",
          text: "Failed to load Bakong settings.",
        });
      })
      .finally(() => setBakongLoading(false));
  }, []);

  const handleSaveConfiguration = async () => {
    setIsSavingConfig(true);
    setConfigMsg(null);
    try {
      await settingService.updateBakong({
        merchantName: khqrMerchantName,
        merchantCity: khqrMerchantCity,
        merchantId: khqrMerchantId,
        currency: khqrCurrency,
      });
      setConfigMsg({
        type: "success",
        text: "Bakong settings saved successfully.",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save settings.";
      setConfigMsg({ type: "error", text: msg });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // ── Configuration: API ─────────────────────────────────────────────────────
  const [apiBaseUrl, setApiBaseUrl] = useState("https://api-dev.moi-tv.net");
  const [apiTimeout, setApiTimeout] = useState("30");
  const [apiVersion, setApiVersion] = useState("v1");

  // ── Configuration: Subscription ───────────────────────────────────────────
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [trialDays, setTrialDays] = useState("7");
  const [gracePeriodDays, setGracePeriodDays] = useState("3");
  const [autoRenew, setAutoRenew] = useState(true);

  // ── Configuration: Upload / Content ───────────────────────────────────────
  const [maxVideoSizeMb, setMaxVideoSizeMb] = useState("2048");
  const [maxImageSizeMb, setMaxImageSizeMb] = useState("10");
  const [allowedVideoFormats, setAllowedVideoFormats] = useState("mp4,mkv,mov");
  const [cdnEnabled, setCdnEnabled] = useState(true);

  // ── Configuration: App ────────────────────────────────────────────────────
  const [appName, setAppName] = useState("MOI TV");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");

  // ── Tabs & action buttons ──────────────────────────────────────────────────
  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: "Profile Information" },
    { key: "security", label: "Security" },
    { key: "configuration", label: "Configuration" },
  ];

  const actionButton = () => {
    if (activeTab === "profile")
      return (
        <button
          onClick={handleSaveProfile}
          disabled={isSaving || profileLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
      );
    if (activeTab === "security")
      return (
        <button
          onClick={handleChangePassword}
          disabled={isChangingPassword}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isChangingPassword ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          {isChangingPassword ? "Updating…" : "Update Password"}
        </button>
      );
    return (
      <button
        onClick={handleSaveConfiguration}
        disabled={isSavingConfig || bakongLoading}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSavingConfig ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Settings2 className="w-4 h-4" />
        )}
        {isSavingConfig ? "Saving…" : "Save Configuration"}
      </button>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#27272a] text-[#71717a] hover:text-white hover:border-[#3f3f46] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold">Profile Settings</h1>
            <p className="text-[#71717a] text-sm">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actionButton()}
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-[#27272a] text-white rounded-lg font-semibold hover:border-[#3f3f46] transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#27272a] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? "text-[#f97316]"
                : "text-[#71717a] hover:text-white"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ef4444] to-[#f97316] rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ────────────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-5">
          {statusMsg && (
            <div
              className={`px-4 py-3 rounded-lg text-sm font-medium ${
                statusMsg.type === "success"
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              {statusMsg.text}
            </div>
          )}
          <div>
            <h2 className="text-white font-semibold mb-3">Profile Picture</h2>
            <div className="flex items-center gap-5">
              {/* Avatar preview */}
              <div className="relative flex-shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover bg-[#27272a]"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#27272a] flex items-center justify-center text-[#52525b] text-2xl font-bold select-none">
                    {username.charAt(0).toUpperCase() || "A"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-br from-[#ef4444] to-[#f97316] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

              {/* Upload info */}
              <div className="flex-1">
                <p className="text-white text-sm font-medium mb-1">
                  {avatarFile ? avatarFile.name : "No image selected"}
                </p>
                <p className="text-[#52525b] text-xs mb-3">
                  JPG, PNG or WEBP — max 5 MB
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-[#27272a] text-white text-xs font-medium rounded-lg hover:border-[#3f3f46] transition-colors"
                >
                  Choose Photo
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <Field label="Username" required>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              disabled={profileLoading}
            />
          </Field>

          <Field label="Email Address" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={profileLoading}
            />
          </Field>

          <Field
            label="Role"
            hint="Contact system administrator to change your role"
          >
            <Input value="Super Admin" disabled />
          </Field>
        </div>
      )}

      {/* ── Security Tab ───────────────────────────────────────────────────── */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#f97316]" />
              <h2 className="text-white font-semibold">Change Password</h2>
            </div>
            {securityMsg && (
              <div
                className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  securityMsg.type === "success"
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {securityMsg.text}
              </div>
            )}
            <Field label="Current Password" required>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </Field>
            <Field label="New Password" required>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 8 characters)"
              />
            </Field>
            <Field label="Confirm New Password" required>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </Field>
          </div>

          {/* <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#27272a] flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#f97316]" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">
                    Two-Factor Authentication
                  </p>
                  <p className="text-[#71717a] text-xs mt-0.5">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <Toggle enabled={twoFactor} onChange={setTwoFactor} />
            </div>
          </div> */}
        </div>
      )}

      {/* ── Configuration Tab ──────────────────────────────────────────────── */}
      {activeTab === "configuration" && (
        <div className="space-y-4">
          {/* Bakong KHQR */}
          <SectionCard
            icon={CreditCard}
            title="Bakong KHQR Payment"
            description="National Bank of Cambodia digital payment gateway"
            badge="NBC"
          >
            {configMsg && (
              <div
                className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  configMsg.type === "success"
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {configMsg.text}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Merchant Name" required>
                <Input
                  value={khqrMerchantName}
                  onChange={(e) => setKhqrMerchantName(e.target.value)}
                  placeholder="Your business name"
                  disabled={bakongLoading}
                />
              </Field>
              <Field label="Merchant City" required>
                <Input
                  value={khqrMerchantCity}
                  onChange={(e) => setKhqrMerchantCity(e.target.value)}
                  placeholder="e.g. Phnom Penh"
                  disabled={bakongLoading}
                />
              </Field>
              <Field label="Merchant ID" hint="Provided by your bank or NBC">
                <Input
                  value={khqrMerchantId}
                  onChange={(e) => setKhqrMerchantId(e.target.value)}
                  placeholder="e.g. socheat_khoeun@bkrt"
                  disabled={bakongLoading}
                />
              </Field>
              <Field label="Currency">
                <Select
                  value={khqrCurrency}
                  onChange={(e) => setKhqrCurrency(e.target.value)}
                  disabled={bakongLoading}
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="KHR">KHR — Cambodian Riel</option>
                </Select>
              </Field>
            </div>
            {/* <div className="border-t border-[#27272a] pt-4 space-y-3">
              <ToggleRow
                label="Enable Bakong KHQR"
                description="Accept payments via Bakong KHQR on checkout"
                enabled={khqrEnabled}
                onChange={setKhqrEnabled}
              />
              <ToggleRow
                label="Sandbox / Test Mode"
                description="Use NBC sandbox environment — no real transactions"
                enabled={khqrSandbox}
                onChange={setKhqrSandbox}
                warn
              />
            </div> */}
          </SectionCard>

          {/* API Configuration */}
          {/* <SectionCard
            icon={Globe}
            title="API Configuration"
            description="Backend API connection and request settings"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="API Base URL"
                required
                hint="Do not include a trailing slash"
              >
                <Input
                  value={apiBaseUrl}
                  onChange={(e) => setApiBaseUrl(e.target.value)}
                  placeholder="https://api.example.com"
                />
              </Field>
              <Field label="API Version">
                <Select
                  value={apiVersion}
                  onChange={(e) => setApiVersion(e.target.value)}
                >
                  <option value="v1">v1</option>
                  <option value="v2">v2</option>
                </Select>
              </Field>
              <Field
                label="Request Timeout (seconds)"
                hint="Maximum wait before a request is cancelled"
              >
                <Input
                  type="number"
                  min="5"
                  max="120"
                  value={apiTimeout}
                  onChange={(e) => setApiTimeout(e.target.value)}
                  placeholder="30"
                />
              </Field>
            </div>
          </SectionCard> */}

          {/* Subscription Settings */}
          {/* <SectionCard
            icon={Tv}
            title="Subscription & Billing"
            description="Default behaviour for plans, trials, and renewals"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Default Currency">
                <Select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="KHR">KHR — Cambodian Riel</option>
                  <option value="THB">THB — Thai Baht</option>
                </Select>
              </Field>
              <Field
                label="Free Trial Period (days)"
                hint="Set to 0 to disable"
              >
                <Input
                  type="number"
                  min="0"
                  max="90"
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  placeholder="7"
                />
              </Field>
              <Field
                label="Grace Period (days)"
                hint="Days allowed after expiry before access cut-off"
              >
                <Input
                  type="number"
                  min="0"
                  max="30"
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(e.target.value)}
                  placeholder="3"
                />
              </Field>
            </div>
            <div className="border-t border-[#27272a] pt-4">
              <ToggleRow
                label="Auto-Renew by Default"
                description="New subscriptions will auto-renew unless cancelled"
                enabled={autoRenew}
                onChange={setAutoRenew}
              />
            </div>
          </SectionCard> */}

          {/* Upload & Content */}
          {/* <SectionCard
            icon={HardDrive}
            title="Upload & Content"
            description="File size limits, formats, and CDN delivery"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Max Video Upload Size (MB)"
                hint="Recommended: 2048 MB (2 GB)"
              >
                <Input
                  type="number"
                  min="100"
                  value={maxVideoSizeMb}
                  onChange={(e) => setMaxVideoSizeMb(e.target.value)}
                  placeholder="2048"
                />
              </Field>
              <Field label="Max Image Upload Size (MB)">
                <Input
                  type="number"
                  min="1"
                  value={maxImageSizeMb}
                  onChange={(e) => setMaxImageSizeMb(e.target.value)}
                  placeholder="10"
                />
              </Field>
              <Field
                label="Allowed Video Formats"
                hint="Comma-separated file extensions"
              >
                <Input
                  value={allowedVideoFormats}
                  onChange={(e) => setAllowedVideoFormats(e.target.value)}
                  placeholder="mp4,mkv,mov"
                />
              </Field>
            </div>
            <div className="border-t border-[#27272a] pt-4">
              <ToggleRow
                label="CDN Delivery"
                description="Serve media through the CDN for faster global playback"
                enabled={cdnEnabled}
                onChange={setCdnEnabled}
              />
            </div>
          </SectionCard> */}

          {/* App Settings */}
          {/* <SectionCard
            icon={Settings2}
            title="Application Settings"
            description="Global settings that affect all users of the platform"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Application Name">
                <Input
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="MOI TV"
                />
              </Field>
              <Field
                label="Max Login Attempts"
                hint="Account is temporarily locked after this many failures"
              >
                <Input
                  type="number"
                  min="3"
                  max="20"
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(e.target.value)}
                  placeholder="5"
                />
              </Field>
            </div>
            <div className="border-t border-[#27272a] pt-4 space-y-3">
              <ToggleRow
                label="User Registration"
                description="Allow new users to sign up on the platform"
                enabled={registrationEnabled}
                onChange={setRegistrationEnabled}
              />
              <ToggleRow
                label="Maintenance Mode"
                description="Take the platform offline for all non-admin users"
                enabled={maintenanceMode}
                onChange={setMaintenanceMode}
                warn
              />
            </div>
          </SectionCard> */}

          {/* Danger notice when maintenance mode is on */}
          {maintenanceMode && (
            <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <TriangleAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-400 text-sm">
                Maintenance mode is <strong>ON</strong> — the platform is
                currently inaccessible to regular users. Remember to save and
                disable it once maintenance is complete.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;
