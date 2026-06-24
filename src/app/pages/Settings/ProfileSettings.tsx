import { useState, useRef, useEffect } from 'react';
import { Camera, Save, X, Loader2, Lock, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useProfile } from '../../context/ProfileContext';
import { profileService } from '../../../api/services/profileService';

const ProfileSettings = () => {
  const { t } = useLanguage();
  const { profile, profileLoading, refreshProfile } = useProfile();

  // ── Edit mode ──────────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Avatar ─────────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // ── Password ───────────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Populate fields from context when profile loads
  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setEmail(profile.email);
      setAvatarPreview(profile.profile_url);
    }
  }, [profile]);

  const handleEdit = () => {
    setProfileMsg(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      setUsername(profile.username);
      setEmail(profile.email);
      setAvatarPreview(profile.profile_url);
      setAvatarFile(null);
    }
    setProfileMsg(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setProfileMsg(null);
    try {
      await profileService.updateProfile({ username, email });
      if (avatarFile) {
        const updated = await profileService.uploadAvatar(avatarFile);
        if (updated.profile_url) setAvatarPreview(updated.profile_url);
        setAvatarFile(null);
      }
      refreshProfile();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setProfileMsg({ type: 'error', text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEditing) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      return;
    }

    // If not in edit mode, upload immediately
    setIsUploadingAvatar(true);
    setProfileMsg(null);
    try {
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
      const updated = await profileService.uploadAvatar(file);
      if (updated.profile_url) setAvatarPreview(updated.profile_url);
      refreshProfile();
      setProfileMsg({ type: 'success', text: 'Avatar updated.' });
    } catch (err: unknown) {
      setAvatarPreview(profile?.profile_url ?? null);
      const msg = err instanceof Error ? err.message : 'Failed to upload avatar.';
      setProfileMsg({ type: 'error', text: msg });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'All password fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    setIsChangingPassword(true);
    setPasswordMsg(null);
    try {
      const res = await profileService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });
      setPasswordMsg({ type: 'success', text: res.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password.';
      setPasswordMsg({ type: 'error', text: msg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatLastLogin = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const StatusBanner = ({ msg }: { msg: { type: 'success' | 'error'; text: string } }) => (
    <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
      msg.type === 'success'
        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
        : 'bg-red-500/10 border border-red-500/30 text-red-400'
    }`}>
      {msg.text}
    </div>
  );

  const inputClass = `w-full bg-[#0a0a0a] border border-[#27272a] text-white px-4 py-2.5 rounded-lg
    focus:outline-none focus:border-[#FF2E63] transition-colors placeholder:text-[#52525b] text-sm`;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl sm:text-3xl font-bold">{t.profileSettings.title}</h1>
          <p className="text-[#71717a] text-sm mt-1">{t.profileSettings.managePersonalInfo}</p>
        </div>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            disabled={profileLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] hover:opacity-90 text-white text-sm font-bold rounded-lg transition-opacity self-start sm:self-auto disabled:opacity-60"
          >
            {t.profileSettings.editProfile}
          </button>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] hover:opacity-90 text-white text-sm font-bold rounded-lg transition-opacity flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving…' : t.profileSettings.saveChanges}
            </button>
          </div>
        )}
      </div>

      {profileMsg && <StatusBanner msg={profileMsg} />}

      {/* Profile Picture */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6">
        <h2 className="text-white font-bold mb-4">Profile Picture</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-[#27272a] flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-[#52525b]" />
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-[#6C5CE7] to-[#FF2E63] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="text-white text-sm font-medium mb-1">
              {avatarFile ? avatarFile.name : 'Click the camera icon to change photo'}
            </p>
            <p className="text-[#52525b] text-xs">JPG, PNG or WEBP — max 5 MB</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6">
        <h2 className="text-white font-bold mb-4">{t.profileSettings.personalInfo}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Username */}
          <div>
            <label className="text-[#71717a] text-sm font-medium mb-2 block">Username</label>
            {isEditing ? (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                placeholder="username"
              />
            ) : (
              <p className="text-white py-2.5 text-sm">{profileLoading ? '—' : username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-[#71717a] text-sm font-medium mb-2 block">{t.profileSettings.email}</label>
            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="admin@example.com"
              />
            ) : (
              <p className="text-white py-2.5 text-sm">{profileLoading ? '—' : email}</p>
            )}
          </div>

          {/* Last Login */}
          <div>
            <label className="text-[#71717a] text-sm font-medium mb-2 block">Last Login</label>
            <p className="text-white py-2.5 text-sm">
              {profileLoading ? '—' : profile?.last_login ? formatLastLogin(profile.last_login) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-[#FF2E63]" />
          <h2 className="text-white font-bold">{t.profileSettings.changePassword}</h2>
        </div>

        {passwordMsg && <div className="mb-4"><StatusBanner msg={passwordMsg} /></div>}

        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-[#71717a] text-sm font-medium mb-2 block">{t.profileSettings.currentPassword}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-[#71717a] text-sm font-medium mb-2 block">{t.profileSettings.newPassword}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 8 characters)"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-[#71717a] text-sm font-medium mb-2 block">{t.profileSettings.confirmPassword}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={inputClass}
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="px-5 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] hover:opacity-90 text-white text-sm font-bold rounded-lg transition-opacity flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {isChangingPassword ? 'Updating…' : t.profileSettings.updatePassword}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
