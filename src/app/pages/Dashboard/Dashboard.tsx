import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Eye, Heart, CreditCard, UserPlus, DollarSign, Zap, Radio, Ticket, Users2, MoreVertical } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { dashboardService, type DashboardOverviewResponse } from '../../../api/services/dashboardService';

const EMPTY_OVERVIEW: DashboardOverviewResponse = {
  stats: {
    total_user: 0,
    active_subscription: 0,
    new_signups: 0,
    total_views: 0,
    total_revenue: 0,
    movie_purchase: 0,
    total_rooms: 0,
    engagement: 0,
  },
  popular_movies: [],
  sales_and_views: {
    sale_by_month: 0,
    revenue_by_month: 0,
    sale_by_year: 0,
    revenue_by_year: 0,
    monthly: [],
  },
  recent_activity: {
    new_user_register: '',
    user_registered_created: '',
    content_published: '',
    content_published_created: '',
    subscription_upgrade: '',
    subscription_upgrade_created: '',
    payment_received: '',
    payment_received_created: '',
  },
  subscription_overview: { premium_users: 0, standard_users: 0 },
  revenue_overview: { revenue_today: 0, revenue_this_week: 0, revenue_this_month: 0, average_revenue_a_user: 0 },
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatMonthLabel = (month: string) => {
  const idx = parseInt(month.split('-')[1] ?? '', 10) - 1;
  return MONTH_LABELS[idx] ?? month;
};

const numberFormatter = new Intl.NumberFormat('en-US');
const formatNumber = (n: number) => numberFormatter.format(n);

const wholeCurrencyFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const formatWholeCurrency = (n: number) => `$${wholeCurrencyFormatter.format(n)}`;

const decimalCurrencyFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatDecimalCurrency = (n: number) => `$${decimalCurrencyFormatter.format(n)}`;

const formatCompactNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
};

const formatCompactCurrency = (value: number) => `$${formatCompactNumber(value)}`;

const ProgressRing = ({ percent, color }: { percent: number; color: string }) => {
  const size = 64;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;
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

  const [overview, setOverview] = useState<DashboardOverviewResponse>(EMPTY_OVERVIEW);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await dashboardService.getOverview();
        if (!cancelled) setOverview(data);
      } catch {
        if (!cancelled) setError('Failed to load dashboard overview');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { stats: apiStats, popular_movies, sales_and_views, recent_activity, subscription_overview, revenue_overview } = overview;

  const stats = [
    {
      icon: Users,
      label: t.dashboard.stats.totalUsers,
      value: formatNumber(apiStats.total_user),
      change: '+12.5%',
      positive: true,
    },
    {
      icon: CreditCard,
      label: t.dashboard.activeSubscriptions,
      value: formatNumber(apiStats.active_subscription),
      change: '+18.4%',
      positive: true,
    },
    {
      icon: UserPlus,
      label: t.dashboard.newSignups,
      value: formatNumber(apiStats.new_signups),
      change: '+24.1%',
      positive: true,
    },
    {
      icon: Eye,
      label: t.dashboard.stats.totalViews,
      value: formatCompactNumber(apiStats.total_views),
      change: '+15.3%',
      positive: true,
    },
    {
      icon: DollarSign,
      label: t.dashboard.revenueMTD,
      value: formatCompactCurrency(apiStats.total_revenue),
      change: '+21.7%',
      positive: true,
    },
    {
      icon: Ticket,
      label: 'Movie Purchases',
      value: formatNumber(apiStats.movie_purchase),
      change: '+9.6%',
      positive: true,
    },
    {
      icon: Users2,
      label: 'Total Rooms',
      value: formatNumber(apiStats.total_rooms),
      change: '+50%',
      positive: true,
    },
    {
      icon: Heart,
      label: t.dashboard.stats.engagement,
      value: `${apiStats.engagement}%`,
      change: '-2.1%',
      positive: false,
    },
  ];

  const popularMoviesData = [...popular_movies].sort((a, b) => b.total_views - a.total_views);

  const chartMonths = sales_and_views.monthly;
  const chartMax = Math.max(1, ...chartMonths.flatMap((m) => [m.sales, m.views]));
  const yAxisTicks = [chartMax, Math.round((chartMax * 2) / 3), Math.round(chartMax / 3), 0];

  const monthlyRingPercent = sales_and_views.sale_by_year > 0
    ? (sales_and_views.sale_by_month / sales_and_views.sale_by_year) * 100
    : 0;

  const recentActivityItems = [
    {
      action: `${t.dashboard.recentActivity.newUserRegistered}: ${recent_activity.new_user_register}`,
      time: recent_activity.user_registered_created,
    },
    {
      action: `${t.dashboard.recentActivity.contentPublished}: ${recent_activity.content_published}`,
      time: recent_activity.content_published_created,
    },
    {
      action: `${t.dashboard.recentActivity.subscriptionUpgraded}: ${recent_activity.subscription_upgrade}`,
      time: recent_activity.subscription_upgrade_created,
    },
    {
      action: `${t.dashboard.recentActivity.paymentReceived}: ${recent_activity.payment_received}`,
      time: recent_activity.payment_received_created,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl sm:text-3xl font-bold">{t.dashboard.title}</h1>
          <p className="text-[#71717a] text-sm mt-1">
            {t.dashboard.welcome}
            {isLoading && <span className="ml-2 text-xs text-[#52525b]">Loading…</span>}
            {error && <span className="ml-2 text-xs text-red-500">{error}</span>}
          </p>
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
          {popularMoviesData.length === 0 && !isLoading && (
            <p className="text-[#71717a] text-sm">No data available</p>
          )}
          {popularMoviesData.map((movie) => (
            <div key={movie.movie_global_id} className="flex items-center gap-3">
              <img src={movie.poster_url} alt={movie.movie_title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate">{movie.movie_title}</p>
                <p className="text-[#71717a] text-xs">Purchased: {formatNumber(movie.total_movie_purchases)}</p>
              </div>
              <p className="text-white text-sm font-bold flex-shrink-0 flex items-center gap-1.5">
                {formatCompactNumber(movie.total_views)}
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
            {yAxisTicks.map((tick, i) => <span key={i}>{tick}</span>)}
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 h-48 border-l border-b border-[#27272a] pl-3">
            {chartMonths.map(({ month, sales, views }) => (
              <div key={month} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-end gap-1 h-40 w-full justify-center">
                  <div
                    className="w-2.5 sm:w-3 rounded-t-sm bg-[#3b82f6]"
                    style={{ height: `${(sales / chartMax) * 100}%` }}
                  />
                  <div
                    className="w-2.5 sm:w-3 rounded-t-sm bg-[#a855f7]"
                    style={{ height: `${(views / chartMax) * 100}%` }}
                  />
                </div>
                <span className="text-[#71717a] text-xs">{formatMonthLabel(month)}</span>
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
            <ProgressRing percent={monthlyRingPercent} color="#3b82f6" />
            <div>
              <p className="text-[#71717a] text-sm font-medium">Monthly</p>
              <p className="text-white text-2xl font-bold">{formatNumber(sales_and_views.sale_by_month)}</p>
              <p className="text-xs mt-0.5 text-[#71717a]">{formatDecimalCurrency(sales_and_views.revenue_by_month)} revenue</p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:border-l sm:border-[#27272a] sm:pl-6">
            <ProgressRing percent={100} color="#a855f7" />
            <div>
              <p className="text-[#71717a] text-sm font-medium">Yearly</p>
              <p className="text-white text-2xl font-bold">{formatNumber(sales_and_views.sale_by_year)}</p>
              <p className="text-xs mt-0.5 text-[#71717a]">{formatDecimalCurrency(sales_and_views.revenue_by_year)} revenue</p>
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
            {recentActivityItems.map((activity, idx) => (
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
            <p className="text-white text-xl font-bold">{formatNumber(subscription_overview.premium_users)}</p>
            <p className="text-green-500 text-xs mt-1">+892 {t.dashboard.thisWeekSuffix}</p>
          </div>
          <div className="p-4 bg-[#0a0a0a] rounded-lg">
            <p className="text-[#71717a] text-xs mb-1">{t.dashboard.standardUsers}</p>
            <p className="text-white text-xl font-bold">{formatNumber(subscription_overview.standard_users)}</p>
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
              <span className="text-white font-bold">{formatWholeCurrency(revenue_overview.revenue_today)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
              <span className="text-[#71717a] text-sm">{t.dashboard.thisWeek}</span>
              <span className="text-white font-bold">{formatWholeCurrency(revenue_overview.revenue_this_week)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
              <span className="text-[#71717a] text-sm">{t.dashboard.thisMonth}</span>
              <span className="text-white font-bold">{formatWholeCurrency(revenue_overview.revenue_this_month)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
              <span className="text-[#71717a] text-sm">{t.dashboard.avgRevenuePerUser}</span>
              <span className="text-white font-bold">{formatDecimalCurrency(revenue_overview.average_revenue_a_user)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
