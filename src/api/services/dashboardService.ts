import { apiClient } from '../clients/apiClient';

export interface DashboardStats {
  total_user: number;
  active_subscription: number;
  new_signups: number;
  total_views: number;
  total_revenue: number;
  movie_purchase: number;
  total_rooms: number;
  engagement: number;
}

export interface DashboardPopularMovie {
  movie_global_id: string;
  movie_title: string;
  poster_url: string;
  total_movie_purchases: number;
  total_views: number;
}

export interface DashboardMonthlySalesView {
  month: string;
  sales: number;
  revenue: number;
  views: number;
}

export interface DashboardSalesAndViews {
  sale_by_month: number;
  revenue_by_month: number;
  sale_by_year: number;
  revenue_by_year: number;
  monthly: DashboardMonthlySalesView[];
}

export interface DashboardRecentActivity {
  new_user_register: string;
  user_registered_created: string;
  content_published: string;
  content_published_created: string;
  subscription_upgrade: string;
  subscription_upgrade_created: string;
  payment_received: string;
  payment_received_created: string;
}

export interface DashboardSubscriptionOverview {
  premium_users: number;
  standard_users: number;
}

export interface DashboardRevenueOverview {
  revenue_today: number;
  revenue_this_week: number;
  revenue_this_month: number;
  average_revenue_a_user: number;
}

export interface DashboardOverviewResponse {
  stats: DashboardStats;
  popular_movies: DashboardPopularMovie[];
  sales_and_views: DashboardSalesAndViews;
  recent_activity: DashboardRecentActivity;
  subscription_overview: DashboardSubscriptionOverview;
  revenue_overview: DashboardRevenueOverview;
}

export const dashboardService = {
  getOverview: () => apiClient<DashboardOverviewResponse>('/v1/dashboard/overview'),
};
