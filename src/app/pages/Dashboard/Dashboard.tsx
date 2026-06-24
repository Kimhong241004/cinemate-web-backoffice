import { LayoutDashboard, Users, FileText, TrendingUp, Eye, Heart, CreditCard, UserPlus, Video, DollarSign, Zap, Radio, Ticket, Users2, MoreVertical } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const salesViewsData = [
  { month: 'Jan', sales: 18, views: 28 },
  { month: 'Feb', sales: 5,  views: 12 },
  { month: 'Mar', sales: 62, views: 45 },
  { month: 'Apr', sales: 12, views: 20 },
  { month: 'May', sales: 35, views: 30 },
  { month: 'Jun', sales: 25, views: 18 },
  { month: 'Jul', sales: 28, views: 48 },
  { month: 'Aug', sales: 12, views: 8  },
  { month: 'Sep', sales: 38, views: 25 },
];
const SALES_VIEWS_MAX = 60;
const Y_AXIS_TICKS = [60, 40, 20, 0];

const popularMoviesData = [
  { title: 'War Zone',           purchased: 258, views: 1_200_000, poster: 'https://picsum.photos/seed/pm1/80/80' },
  { title: 'Shadow Protocol',    purchased: 169, views: 890_000,   poster: 'https://picsum.photos/seed/pm2/80/80' },
  { title: 'Midnight Rain',      purchased: 268, views: 2_400_000, poster: 'https://picsum.photos/seed/pm3/80/80' },
  { title: 'Cyber Punk 2099',    purchased: 859, views: 3_800_000, poster: 'https://picsum.photos/seed/pm4/80/80' },
  { title: 'Love in Phnom Penh', purchased: 328, views: 1_600_000, poster: 'https://picsum.photos/seed/pm5/80/80' },
  { title: 'Desert Storm',       purchased: 982, views: 4_100_000, poster: 'https://picsum.photos/seed/pm6/80/80' },
].sort((a, b) => b.views - a.views);

const formatCompactNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
};

const ProgressRing = ({ percent, color }: { percent: number; color: string }) => {
  const size = 64;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90 flex-shrink-0">
      <circle stroke="#27272a" fill="transparent" strokeWidth={stroke} r={radius} cx={size / 2} cy={size / 2} />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
};

const Dashboard = () => {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Users,
      label: t.dashboard.stats.totalUsers,
      value: '245,892',
      change: '+12.5%',
      positive: true,
    },
    {
      icon: CreditCard,
      label: t.dashboard.activeSubscriptions,
      value: '18,247',
      change: '+18.4%',
      positive: true,
    },
    {
      icon: UserPlus,
      label: t.dashboard.newSignups,
      value: '1,234',
      change: '+24.1%',
      positive: true,
    },

    // hidden Active Creators
    /*{ 
      icon: Video,
      label: t.dashboard.activeCreators,
      value: '3,847',
      change: '+6.8%',
      positive: true,
    }, */

    // hidden Content Library
    /*{
      icon: FileText,
      label: t.dashboard.stats.contentLibrary,
      value: '12,458',
      change: '+8.2%',
      positive: true,
    }, */
    {
      icon: Eye,
      label: t.dashboard.stats.totalViews,
      value: '3.2M',
      change: '+15.3%',
      positive: true,
    },
    {
      icon: DollarSign,
      label: t.dashboard.revenueMTD,
      value: '$324.6K',
      change: '+21.7%',
      positive: true,
    },
    {
      icon: Ticket,
      label: 'Movie Purchases',
      value: '8,492',
      change: '+9.6%',
      positive: true,
    },
    {
      icon: Users2,
      label: 'Total Rooms',
      value: '3',
      change: '+50%',
      positive: true,
    },
    {
      icon: Heart,
      label: t.dashboard.stats.engagement,
      value: '68.4%',
      change: '-2.1%',
      positive: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl sm:text-3xl font-bold">{t.dashboard.title}</h1>
          <p className="text-[#71717a] text-sm mt-1">{t.dashboard.welcome}</p>
        </div>
        <button className="px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] hover:opacity-90 text-white text-sm font-bold rounded-lg transition-opacity self-start sm:self-auto">
          {t.dashboard.generateReport}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6 hover:border-[#3f3f46] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C5CE7]/20 to-[#FF2E63]/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#FF2E63]" />
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-md ${
                    stat.positive
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="text-[#71717a] text-xs sm:text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-white text-xl sm:text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Popular Movies + Sales & Views */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Popular Movies */}
      <div className="lg:col-span-1 bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Popular Movies</h3>
          <MoreVertical className="w-4 h-4 text-[#71717a]" />
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {popularMoviesData.map((movie) => (
            <div key={movie.title} className="flex items-center gap-3">
              <img src={movie.poster} alt={movie.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate">{movie.title}</p>
                <p className="text-[#71717a] text-xs">Purchased: {movie.purchased}</p>
              </div>
              <p className="text-white text-sm font-bold flex-shrink-0 flex items-center gap-1.5">
                {formatCompactNumber(movie.views)}
                <Eye className="w-4 h-4 text-[#FF2E63]" />
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sales & Views */}
      <div className="lg:col-span-2 bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold">Sales & Views</h3>
          <MoreVertical className="w-4 h-4 text-[#71717a]" />
        </div>

        {/* Bar chart */}
        <div className="flex gap-3">
          <div className="flex flex-col justify-between text-[#71717a] text-xs h-48 pb-6">
            {Y_AXIS_TICKS.map((tick) => <span key={tick}>{tick}</span>)}
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 h-48 border-l border-b border-[#27272a] pl-3">
            {salesViewsData.map(({ month, sales, views }) => (
              <div key={month} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-end gap-1 h-40 w-full justify-center">
                  <div
                    className="w-2.5 sm:w-3 rounded-t-sm bg-[#3b82f6]"
                    style={{ height: `${(sales / SALES_VIEWS_MAX) * 100}%` }}
                  />
                  <div
                    className="w-2.5 sm:w-3 rounded-t-sm bg-[#a855f7]"
                    style={{ height: `${(views / SALES_VIEWS_MAX) * 100}%` }}
                  />
                </div>
                <span className="text-[#71717a] text-xs">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3">
          <span className="flex items-center gap-2 text-[#a1a1aa] text-xs">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" /> Sales
          </span>
          <span className="flex items-center gap-2 text-[#a1a1aa] text-xs">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#a855f7]" /> Views
          </span>
        </div>

        {/* Monthly / Yearly summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#27272a]">
          <div className="flex items-center gap-4">
            <ProgressRing percent={70} color="#3b82f6" />
            <div>
              <p className="text-[#71717a] text-sm font-medium">Monthly</p>
              <p className="text-white text-2xl font-bold">65,127</p>
              <p className="text-xs mt-0.5"><span className="text-green-500 font-semibold">16.5%</span> <span className="text-[#71717a]">55.21 USD</span></p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:border-l sm:border-[#27272a] sm:pl-6">
            <ProgressRing percent={75} color="#a855f7" />
            <div>
              <p className="text-[#71717a] text-sm font-medium">Yearly</p>
              <p className="text-white text-2xl font-bold">984,246</p>
              <p className="text-xs mt-0.5"><span className="text-green-500 font-semibold">24.9%</span> <span className="text-[#71717a]">267.35 USD</span></p>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-[#27272a]">
          <h2 className="text-white text-lg font-bold">{t.dashboard.recentActivity.title}</h2>
        </div>
        <div className="p-5 sm:p-6">
          <div className="space-y-4">
            {[
              { action: t.dashboard.recentActivity.newUserRegistered, time: `5 ${t.dashboard.recentActivity.minutesAgo}`, type: 'user' },
              { action: t.dashboard.recentActivity.contentPublished, time: `12 ${t.dashboard.recentActivity.minutesAgo}`, type: 'content' },
              { action: t.dashboard.recentActivity.subscriptionUpgraded, time: `1 ${t.dashboard.recentActivity.hourAgo}`, type: 'subscription' },
              { action: t.dashboard.recentActivity.paymentReceived, time: `2 ${t.dashboard.recentActivity.hoursAgo}`, type: 'payment' },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#27272a] last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center flex-shrink-0">
                    <LayoutDashboard className="w-4 h-4 text-[#71717a]" />
                  </div>
                  <p className="text-white text-sm">{activity.action}</p>
                </div>
                <span className="text-[#71717a] text-xs sm:text-sm pl-11 sm:pl-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6">
        <h3 className="text-white font-bold mb-4">{t.dashboard.subscriptionOverview}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#0a0a0a] rounded-lg">
            <p className="text-[#71717a] text-xs mb-1">{t.dashboard.premiumUsers}</p>
            <p className="text-white text-xl font-bold">12,458</p>
            <p className="text-green-500 text-xs mt-1">+892 {t.dashboard.thisWeekSuffix}</p>
          </div>
          <div className="p-4 bg-[#0a0a0a] rounded-lg">
            <p className="text-[#71717a] text-xs mb-1">{t.dashboard.standardUsers}</p>
            <p className="text-white text-xl font-bold">5,789</p>
            <p className="text-green-500 text-xs mt-1">+234 {t.dashboard.thisWeekSuffix}</p>
          </div>
          <div className="p-4 bg-[#0a0a0a] rounded-lg">
            <p className="text-[#71717a] text-xs mb-1">{t.dashboard.trialUsers}</p>
            <p className="text-white text-xl font-bold">2,847</p>
            <p className="text-orange-500 text-xs mt-1">48{t.dashboard.convertRate}</p>
          </div>
          <div className="p-4 bg-[#0a0a0a] rounded-lg">
            <p className="text-[#71717a] text-xs mb-1">{t.dashboard.churnRate}</p>
            <p className="text-white text-xl font-bold">2.3%</p>
            <p className="text-green-500 text-xs mt-1">-0.4% {t.dashboard.vsLastMonth}</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">{t.dashboard.conversionMetrics}</h3>
            <Zap className="w-5 h-5 text-[#f97316]" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] text-sm">{t.dashboard.visitorToSignup}</span>
              <span className="text-white font-semibold">12.4%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] text-sm">{t.dashboard.trialToPaid}</span>
              <span className="text-white font-semibold">48.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] text-sm">{t.dashboard.upgradeRate}</span>
              <span className="text-white font-semibold">18.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] text-sm">{t.dashboard.retention90d}</span>
              <span className="text-white font-semibold">82.5%</span>
            </div>
          </div>
        </div>

        {/* Creator Stats - hidden
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">{t.dashboard.creatorStats}</h3>
            <Video className="w-5 h-5 text-[#f97316]" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] text-sm">{t.dashboard.activeThisWeek}</span>
              <span className="text-white font-semibold">2,847</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] text-sm">{t.dashboard.newCreators}</span>
              <span className="text-white font-semibold">124</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] text-sm">{t.dashboard.avgContentPerCreator}</span>
              <span className="text-white font-semibold">3.2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] text-sm">{t.dashboard.topEarner}</span>
              <span className="text-white font-semibold">$8.4K</span>
            </div>
          </div>
        </div>
        */}

        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">{t.dashboard.systemHealth}</h3>
            <Radio className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] text-sm">{t.dashboard.uptime}</span>
              <span className="text-green-500 font-semibold">99.98%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] text-sm">{t.dashboard.avgResponseTime}</span>
              <span className="text-green-500 font-semibold">142ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] text-sm">{t.dashboard.errorRate}</span>
              <span className="text-green-500 font-semibold">0.02%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] text-sm">{t.dashboard.cdnBandwidth}</span>
              <span className="text-white font-semibold">2.4 TB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Content - hidden
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6">
          <h3 className="text-white font-bold mb-4">{t.dashboard.topContent}</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#27272a] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-[#27272a] rounded-lg flex-shrink-0"></div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{t.dashboard.contentTitle} {item}</p>
                    <p className="text-[#71717a] text-xs">1.{item}M {t.dashboard.views}</p>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
        */}

        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6">
          <h3 className="text-white font-bold mb-4">{t.dashboard.revenueOverview}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
              <span className="text-[#71717a] text-sm">{t.dashboard.today}</span>
              <span className="text-white font-bold">$12,458</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
              <span className="text-[#71717a] text-sm">{t.dashboard.thisWeek}</span>
              <span className="text-white font-bold">$84,239</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
              <span className="text-[#71717a] text-sm">{t.dashboard.thisMonth}</span>
              <span className="text-white font-bold">$324,589</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
              <span className="text-[#71717a] text-sm">{t.dashboard.avgRevenuePerUser}</span>
              <span className="text-white font-bold">$17.78</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
