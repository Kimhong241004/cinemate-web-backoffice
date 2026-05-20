import {
  Search,
  Bell,
  Menu,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useNotification } from "../../context/NotificationContext";
import { useProfile } from "../../context/ProfileContext";
import NotificationPanel from "./NotificationPanel";
import ConfirmDialog from "./ConfirmDialog";

const Navbar = () => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount } = useNotification();
  const { profile } = useProfile();

  const displayName = profile?.username || user?.name || "User";
  const displayEmail = profile?.email || user?.email || "";
  const avatarUrl = profile?.profile_url || null;

  // Listen for sidebar collapse events
  useEffect(() => {
    const handleSidebarCollapse = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      setIsSidebarCollapsed(customEvent.detail);
    };

    document.addEventListener("sidebarCollapse", handleSidebarCollapse);
    return () =>
      document.removeEventListener("sidebarCollapse", handleSidebarCollapse);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLanguageDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationPanel(false);
      }
    };

    if (showUserDropdown || showLanguageDropdown || showNotificationPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown, showLanguageDropdown, showNotificationPanel]);

  return (
    <header
      className={`
      fixed top-0 left-0 right-0 bg-[rgba(113,113,123,0.1)] z-10 transition-all duration-300
      ${isSidebarCollapsed ? "lg:left-[80px]" : "lg:left-[255px]"}
    `}
    >
      <div className="relative pb-[16px] pt-[15px] px-4 sm:px-6 lg:px-[20px]">
        <div
          aria-hidden="true"
          className="absolute border-[rgba(255,255,255,0.05)] border-b border-solid inset-0 pointer-events-none bg-[#0d0d0d]"
        />

        <div className="h-[49px] flex items-center justify-between relative gap-2 sm:gap-4">
          {/* Left Section - Mobile Menu + Search */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-white hover:bg-[rgba(255,255,255,0.05)] rounded-full transition-colors size-[36px] sm:size-[40px] flex items-center justify-center"
              onClick={() => {
                document.dispatchEvent(new CustomEvent("toggleSidebar"));
              }}
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Search - Icon only on mobile, full bar on md+ */}
            <button className="md:hidden bg-[rgba(255,255,255,0.05)] relative rounded-full size-[36px] sm:size-[40px] flex items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-full"
              />
              <Search className="size-[18px] text-[#71717B]" />
            </button>

            {/* Search - Full bar on md+ */}
            <div className="hidden md:block bg-[rgba(255,255,255,0.05)] h-[45.195px] rounded-full w-[180px] lg:w-[236.5px] relative">
              <div className="flex items-center justify-between px-[16px] py-[8px] h-full">
                <input
                  type="text"
                  placeholder={t.navbar.search}
                  className="flex-1 bg-transparent text-white placeholder:text-[#71717b] text-[16px] font-['Open_Sans'] font-normal focus:outline-none"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                />
                <Search className="size-[18px] flex-shrink-0 text-[#71717B]" />
              </div>
              <div
                aria-hidden="true"
                className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-full"
              />
            </div>
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-[12px] flex-shrink-0">
            {/* Brightness Toggle - Hidden on mobile */}
            {/* <button className="hidden md:flex bg-[rgba(255,255,255,0.05)] relative rounded-full size-[40px] items-center justify-center">
              <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-full" />
              <Sun className="size-[18px] text-[#f97316]" />
            </button> */}

            {/* Language Selector - Hidden on mobile */}
            <div className="hidden md:block relative" ref={languageDropdownRef}>
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex bg-[rgba(255,255,255,0.05)] relative rounded-full size-[40px] items-center justify-center hover:bg-[rgba(255,255,255,0.08)] transition-colors"
              >
                <div
                  aria-hidden="true"
                  className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-full"
                />
                <span
                  className="text-[14px] leading-[14px] text-center text-white font-['Open_Sans'] font-normal"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {language === "km" ? "🇰🇭" : "🇬🇧"}
                </span>
              </button>

              {/* Language Dropdown */}
              {showLanguageDropdown && (
                <div className="absolute top-[50px] right-0 w-[160px] bg-[#18181b] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-xl overflow-hidden z-20">
                  <button
                    onClick={() => {
                      setLanguage("km");
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      language === "km"
                        ? "bg-[rgba(255,255,255,0.05)] text-white"
                        : "text-[#d4d4d8] hover:bg-[rgba(255,255,255,0.05)]"
                    }`}
                  >
                    <span className="text-lg">🇰🇭</span>
                    <span>ភាសាខ្មែរ</span>
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("en");
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      language === "en"
                        ? "bg-[rgba(255,255,255,0.05)] text-white"
                        : "text-[#d4d4d8] hover:bg-[rgba(255,255,255,0.05)]"
                    }`}
                  >
                    <span className="text-lg">🇬🇧</span>
                    <span>English</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications - Hidden on mobile */}
            <div className="hidden md:block relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                className="flex bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] border-solid rounded-full size-[40px] relative items-center justify-center hover:bg-[rgba(255,255,255,0.08)] transition-colors"
              >
                <Bell className="size-[18px] text-[#D4D4D8]" />
                {unreadCount > 0 && (
                  <div
                    className="absolute left-[26px] rounded-full size-[8px] top-[4px]"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, rgb(231, 0, 11) 0%, rgb(231, 33, 11) 7.1429%, rgb(232, 49, 10) 14.286%, rgb(232, 62, 10) 21.429%, rgb(232, 73, 9) 28.571%, rgb(232, 82, 9) 35.714%, rgb(232, 91, 8) 42.857%, rgb(232, 100, 7) 50%, rgb(232, 107, 7) 57.143%, rgb(232, 115, 6) 64.286%, rgb(231, 122, 5) 71.429%, rgb(231, 130, 4) 78.571%, rgb(230, 136, 2) 85.714%, rgb(229, 143, 1) 92.857%, rgb(228, 150, 0) 100%)",
                    }}
                  />
                )}
              </button>

              {/* Notification Panel */}
              {showNotificationPanel && (
                <NotificationPanel
                  onClose={() => setShowNotificationPanel(false)}
                />
              )}
            </div>

            {/* User Profile - Avatar only on mobile, full on lg+ */}
            <button
              className="bg-[rgba(255,255,255,0.05)] relative rounded-full h-[40px] sm:h-[45px] md:h-[50px] flex items-center gap-[8px] px-[4px] sm:px-[8px] md:px-[13px] hover:bg-[rgba(255,255,255,0.08)] transition-colors"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div
                aria-hidden="true"
                className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-full"
              />
              <div className="bg-[#27272a] rounded-full size-[32px] sm:size-[36px] overflow-hidden flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="hidden lg:flex flex-col items-start min-w-[81.547px]">
                <p
                  className="text-white text-[14px] leading-[20px] font-['Open_Sans'] font-bold text-left whitespace-nowrap"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {displayName}
                </p>
                <p
                  className="text-[#71717b] text-[12px] leading-[16px] font-['Open_Sans'] font-normal text-left whitespace-nowrap"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {user?.role || "Admin"}
                </p>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div
                ref={dropdownRef}
                className="absolute top-[65px] sm:top-[72px] right-2 sm:right-4 w-[200px] sm:w-[222px] bg-[#18181b] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] overflow-hidden z-20"
              >
                {/* User Info Header */}
                <div className="border-b border-[rgba(255,255,255,0.1)] px-4 py-4">
                  <p className="text-white text-sm font-bold mb-0.5">
                    {displayName}
                  </p>
                  <p className="text-[#71717b] text-xs">{displayEmail}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {/* Profile */}
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[#d4d4d8] text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                    onClick={() => {
                      navigate("/profile-settings");
                      setShowUserDropdown(false);
                    }}
                  >
                    <UserIcon className="w-4 h-4 text-[#71717B]" />
                    <span>{t.navbar.profile}</span>
                  </button>

                  {/* Settings */}
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[#d4d4d8] text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                    onClick={() => {
                      navigate("/settings");
                      setShowUserDropdown(false);
                    }}
                  >
                    <SettingsIcon className="w-4 h-4 text-[#71717B]" />
                    <span>{t.navbar.settings}</span>
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-[rgba(255,255,255,0.1)] my-1.5 mx-4"></div>

                  {/* Logout */}
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowLogoutConfirm(true);
                    }}
                  >
                    <LogOut className="w-4 h-4 text-[#f97316]" />
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, rgb(231, 0, 11) 0%, rgb(231, 33, 11) 7.1429%, rgb(232, 49, 10) 14.286%, rgb(232, 62, 10) 21.429%, rgb(232, 73, 9) 28.571%, rgb(232, 82, 9) 35.714%, rgb(232, 91, 8) 42.857%, rgb(232, 100, 7) 50%, rgb(232, 107, 7) 57.143%, rgb(232, 115, 6) 64.286%, rgb(231, 122, 5) 71.429%, rgb(231, 130, 4) 78.571%, rgb(230, 136, 2) 85.714%, rgb(229, 143, 1) 92.857%, rgb(228, 150, 0) 100%)",
                      }}
                    >
                      {t.navbar.logout}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Log out"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Log out"
        cancelLabel="Stay"
        variant="warning"
        onConfirm={() => {
          logout();
          setShowLogoutConfirm(false);
          navigate("/login");
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </header>
  );
};

export default Navbar;
