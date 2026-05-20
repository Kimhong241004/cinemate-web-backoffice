import { LayoutDashboard, Users, FileText, TrendingUp, Eye, Heart, CreditCard, UserPlus, Video, DollarSign, Zap, Radio } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
    {
      icon: Video,
      label: t.dashboard.activeCreators,
      value: '3,847',
      change: '+6.8%',
      positive: true,
    },
    {
      icon: FileText,
      label: t.dashboard.stats.contentLibrary,
      value: '12,458',
      change: '+8.2%',
      positive: true,
    },
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
        <button className="px-4 py-2.5 bg-gradient-to-r from-[#ef4444] to-[#f97316] hover:opacity-90 text-white text-sm font-bold rounded-lg transition-opacity self-start sm:self-auto">
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ef4444]/20 to-[#f97316]/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#f97316]" />
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
