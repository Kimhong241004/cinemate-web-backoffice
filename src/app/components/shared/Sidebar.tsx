import {
  LayoutDashboard,
  FileText,
  Users,
  Tv,
  Radio,
  Clapperboard,
  Film,
  User,
  CreditCard,
  Ticket,
  DollarSign,
  Settings,
  X,
  ChevronsLeft,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

// Custom cinema hall icon (screen + audience seating view)
const HallIcon = ({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {/* Screen */}
    <path d="M3 5h18" strokeWidth={strokeWidth + 0.5} />
    {/* Stage/screen area */}
    <path d="M5 5v3" />
    <path d="M19 5v3" />
    <path d="M5 8 Q12 10 19 8" />
    {/* Row 1 seats */}
    <circle cx="8"  cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="13" r="1" fill="currentColor" stroke="none" />
    {/* Row 2 seats */}
    <circle cx="6"  cy="17" r="1" fill="currentColor" stroke="none" />
    <circle cx="10" cy="17" r="1" fill="currentColor" stroke="none" />
    <circle cx="14" cy="17" r="1" fill="currentColor" stroke="none" />
    <circle cx="18" cy="17" r="1" fill="currentColor" stroke="none" />
    {/* Row 3 seats */}
    <circle cx="5"  cy="21" r="1" fill="currentColor" stroke="none" />
    <circle cx="9"  cy="21" r="1" fill="currentColor" stroke="none" />
    <circle cx="13" cy="21" r="1" fill="currentColor" stroke="none" />
    <circle cx="17" cy="21" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const LogoSide = new URL('../../../assets/images/LogoSide.png', import.meta.url).href;

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  // Listen for toggle event from Navbar
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    document.addEventListener('toggleSidebar', handleToggle);
    return () => document.removeEventListener('toggleSidebar', handleToggle);
  }, []);

  // Dispatch collapse state changes
  useEffect(() => {
    document.dispatchEvent(new CustomEvent('sidebarCollapse', { detail: isCollapsed }));
  }, [isCollapsed]);

  const menuSections = [
    {
      title: t.sidebar.sections.overview,
      items: [
        { icon: LayoutDashboard, label: t.sidebar.menu.dashboard, path: '/' },
      ],
    },

     {
      title: t.sidebar.sections.content,
      items: [
        // hiden Content Library
        /* { icon: FileText, label: t.sidebar.menu.contentLibrary, path: '/content-library' }, */

        { icon: Users, label: t.sidebar.menu.userManagement, path: '/user-management' },
      ],
    },

   // hidden Content Managment 
   /* {
      title: t.sidebar.sections.contentManagement,
      items: [
        { icon: Tv, label: t.sidebar.menu.tvChannels, path: '/tv-channels' },
        { icon: Radio, label: t.sidebar.menu.radio, path: '/radio' },
        { icon: Clapperboard, label: t.sidebar.menu.creators, path: '/creators' },
      ],
    }, */

    {
      title: t.sidebar.sections.pages,
      items: [
        { icon: Film, label: t.sidebar.menu.movies, path: '/movies' },
        { icon: User, label: t.sidebar.menu.author, path: '/author' },
      ],
    },
    {
      title: t.sidebar.sections.party,
      items: [
        { icon: HallIcon, label: t.sidebar.menu.rooms, path: '/rooms' },
      ],
    },
    {
      title: t.sidebar.sections.financial,
      items: [
        { icon: CreditCard, label: t.sidebar.menu.transactions, path: '/transactions' },
        { icon: Ticket, label: t.sidebar.menu.promoCodes, path: '/promo-codes' },
        { icon: DollarSign, label: t.sidebar.menu.subscriptions, path: '/subscriptions' },
      ],
    },
    {
      title: t.sidebar.sections.system,
      items: [
        { icon: Users, label: t.sidebar.menu.userSystem, path: '/user-system' },
        { icon: Settings, label: t.sidebar.menu.settings, path: '/settings' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen bg-[#0a0a0a] border-r border-[#18181b] overflow-y-auto z-50 transition-all duration-300 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-[80px]' : 'lg:w-[255px]'}
        w-[255px]
      `}>
        {/* Close Button (Mobile) */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-white hover:bg-[rgba(255,255,255,0.1)] rounded-lg z-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Collapse Toggle Button (Desktop) */}
        <button
          className="hidden lg:flex absolute top-6 -right-3 w-6 h-6 bg-[#0a0a0a] border border-[#27272a] rounded-full items-center justify-center z-50 hover:border-[#3f3f46] transition-colors shadow-lg"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-[#71717a]" /> : <ChevronsLeft className="w-3.5 h-3.5 text-[#71717a]" />}
        </button>

        {/* Logo - Sticky Header */}
        <div className="sticky top-0 p-4 flex items-center justify-center border-b border-[#18181b] bg-[#0a0a0a] z-10">
          <img src={LogoSide} alt="Cinemate" className={`object-contain transition-all ${isCollapsed ? 'w-10 h-10' : 'h-12 w-auto max-w-[180px]'}`} />
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-3 pb-3">
          {menuSections.map((section, idx) => (
            <div key={idx} className="mb-5">
              {/* Section Header */}
              {!isCollapsed && (
                <div className="mb-2 px-2">
                  <h3 className="text-[#52525b] text-[10px] font-bold tracking-wider uppercase mb-2">
                    {section.title}
                  </h3>
                </div>
              )}

              {/* Menu Items */}
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      title={isCollapsed ? item.label : ''}
                      className={`
                        relative flex items-center rounded-xl transition-all
                        ${isCollapsed ? 'justify-center px-3 py-2.5' : 'gap-3 px-3 py-2.5'}
                        ${active
                          ? 'bg-[#18181b] text-white'
                          : 'text-[#71717a] hover:bg-[#18181b] hover:text-white'
                        }
                      `}
                    >
                      {active && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                          style={{
                            background: 'linear-gradient(180deg, #6C5CE7 0%, #FF2E63 100%)',
                          }}
                        />
                      )}
                      <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={active ? 2 : 1.5} />
                      {!isCollapsed && (
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer - Sticky Bottom */}
        {!isCollapsed && (
          <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-[#18181b]">
            <div className="py-3 px-4">
              <p className="text-[#52525b] text-[10px] text-center leading-tight">
                {t.sidebar.footer}
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
