import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import {
  StatsCard,
  BudgetChart,
  OTBTrendsChart,
  ActivityFeed,
  QuickActions,
  AIInsightsWidget,
  PendingApprovals,
  ProactiveAlertsWidget,
  DemandForecastWidget,
} from '@/components/dashboard';
import type { ActivityItem, QuickAction, AIInsight, PendingApproval } from '@/components/dashboard';

// Demo data for the enhanced dashboard
function getDashboardData() {
  const stats = {
    brandsCount: 5,
    categoriesCount: 12,
    locationsCount: 8,
    usersCount: 24,
    currentSeason: { id: 'demo', name: 'Spring/Summer 2025', code: 'SS25', isCurrent: true },
    totalBudget: 15000000,
    budgetUtilized: 8500000,
    pendingApprovals: 7,
    activePlans: 12,
  };

  const budgetChartData = [
    { name: 'Nike', allocated: 5000000, utilized: 3200000 },
    { name: 'Adidas', allocated: 4000000, utilized: 2100000 },
    { name: 'Puma', allocated: 3000000, utilized: 1800000 },
    { name: 'Reebok', allocated: 2000000, utilized: 900000 },
    { name: 'NB', allocated: 1000000, utilized: 500000 },
  ];

  const otbTrendsData = [
    { month: 'Jan', planned: 1200000, actual: 1100000, forecast: 1150000 },
    { month: 'Feb', planned: 1400000, actual: 1350000, forecast: 1380000 },
    { month: 'Mar', planned: 1600000, actual: 1550000, forecast: 1580000 },
    { month: 'Apr', planned: 1800000, actual: 1750000, forecast: 1780000 },
    { month: 'May', planned: 2000000, actual: 1900000, forecast: 1950000 },
    { month: 'Jun', planned: 2200000, actual: 0, forecast: 2150000 },
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'budget',
      action: 'Budget Approved',
      description: 'Nike SS25 budget approved by Finance Head',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'success',
      user: 'John Smith',
      link: '/budgets',
    },
    {
      id: '2',
      type: 'otb',
      action: 'OTB Plan Submitted',
      description: 'Adidas SS25 V2 plan submitted for review',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'pending',
      user: 'Jane Doe',
      link: '/otb-plans',
    },
    {
      id: '3',
      type: 'sku',
      action: 'SKU Validation Complete',
      description: '245 SKUs validated, 3 warnings found',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      status: 'warning',
      user: 'Mike Johnson',
      link: '/sku-proposals',
    },
    {
      id: '4',
      type: 'approval',
      action: 'Workflow Step Approved',
      description: 'Puma SS25 budget passed Brand Manager review',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      status: 'success',
      user: 'Sarah Wilson',
    },
    {
      id: '5',
      type: 'system',
      action: 'SLA Warning',
      description: 'Reebok OTB plan approaching deadline',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      status: 'warning',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      href: '/budgets/new',
      icon: 'Plus',
      title: 'Create Budget',
      description: 'Start a new budget allocation',
      color: 'primary',
    },
    {
      href: '/otb-plans/new',
      icon: 'FileText',
      title: 'New OTB Plan',
      description: 'Create open-to-buy plan',
      color: 'secondary',
    },
    {
      href: '/sku-proposals/upload',
      icon: 'Package',
      title: 'Upload SKUs',
      description: 'Import SKU proposal file',
      color: 'success',
    },
    {
      href: '/approvals',
      icon: 'DollarSign',
      title: 'Review Approvals',
      description: 'View pending items',
      color: 'warning',
    },
  ];

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'trend',
      title: 'Strong Footwear Demand',
      description: 'Running shoes category showing 23% higher demand vs last season based on historical patterns.',
      impact: 'high',
      metric: {
        label: 'Projected Growth',
        value: '+23%',
        change: 23,
      },
      actionUrl: '/otb-plans?category=footwear',
    },
    {
      id: '2',
      type: 'anomaly',
      title: 'Budget Utilization Gap',
      description: 'Nike SS25 budget is only 64% utilized with 45 days remaining in the planning cycle.',
      impact: 'medium',
      metric: {
        label: 'Utilization Rate',
        value: '64%',
        change: -12,
      },
      actionUrl: '/budgets/nike-ss25',
    },
    {
      id: '3',
      type: 'recommendation',
      title: 'Size Curve Optimization',
      description: 'Consider adjusting size distribution for Women\'s Apparel - S/M sizes are consistently understocked.',
      impact: 'medium',
      actionUrl: '/otb-plans?analysis=sizing',
    },
    {
      id: '4',
      type: 'forecast',
      title: 'Q2 Revenue Projection',
      description: 'Based on current OTB plans and historical performance, Q2 is projected to exceed targets.',
      metric: {
        label: 'vs Target',
        value: '+8.5%',
        change: 8.5,
      },
    },
  ];

  const pendingApprovals: PendingApproval[] = [
    {
      id: '1',
      type: 'budget',
      title: 'Adidas SS25 Budget',
      description: 'Q1 allocation request',
      submittedBy: { name: 'Jane Doe' },
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      priority: 'high',
      amount: 4000000,
      href: '/budgets/adidas-ss25',
    },
    {
      id: '2',
      type: 'otb',
      title: 'Puma OTB V2',
      description: 'Revised plan after feedback',
      submittedBy: { name: 'Mike Johnson' },
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      priority: 'medium',
      amount: 2500000,
      href: '/otb-plans/puma-v2',
    },
    {
      id: '3',
      type: 'sku',
      title: 'Nike SKU Batch #42',
      description: '156 SKUs pending approval',
      submittedBy: { name: 'Sarah Wilson' },
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      priority: 'low',
      href: '/sku-proposals/nike-batch-42',
    },
  ];

  return {
    stats,
    budgetChartData,
    otbTrendsData,
    activities,
    quickActions,
    aiInsights,
    pendingApprovals,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const t = await getTranslations('dashboard');
  const data = getDashboardData();
  const { stats } = data;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('welcome', { name: session?.user?.name?.split(' ')[0] || 'User' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('overview')}
          </p>
        </div>
        {stats.currentSeason && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            {stats.currentSeason.name}
          </Badge>
        )}
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('totalBudget')}
          value={formatCurrency(stats.totalBudget)}
          description={t('currentSeasonAllocation')}
          icon="DollarSign"
          color="green"
          trend={{ value: 12, label: t('vsLastSeason') }}
          sparklineData={[10, 12, 11, 14, 13, 15, 15]}
        />
        <StatsCard
          title={t('budgetUtilized')}
          value={formatCurrency(stats.budgetUtilized)}
          description={`${Math.round((stats.budgetUtilized / stats.totalBudget) * 100)}% ${t('ofTotal')}`}
          icon="TrendingUp"
          color="blue"
          trend={{ value: 8, label: t('thisMonth') }}
          sparklineData={[5, 6, 7, 7.5, 8, 8.2, 8.5]}
        />
        <StatsCard
          title={t('pendingApprovals')}
          value={stats.pendingApprovals}
          description={t('itemsAwaitingReview')}
          icon="FileText"
          color="orange"
          trend={{ value: -15, label: t('vsYesterday') }}
        />
        <StatsCard
          title={t('activePlans')}
          value={stats.activePlans}
          description={t('otbPlansInProgress')}
          icon="Package"
          color="purple"
          sparklineData={[8, 9, 10, 10, 11, 12, 12]}
        />
      </div>

      {/* Master Data Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title={t('totalBrands')}
          value={stats.brandsCount}
          description={t('activeBrands')}
          icon="Building2"
          color="blue"
        />
        <StatsCard
          title={t('categories')}
          value={stats.categoriesCount}
          description={t('productCategories')}
          icon="FolderTree"
          color="green"
        />
        <StatsCard
          title={t('locations')}
          value={stats.locationsCount}
          description={t('salesLocations')}
          icon="MapPin"
          color="orange"
        />
        <StatsCard
          title={t('users')}
          value={stats.usersCount}
          description={t('activeUsers')}
          icon="Users"
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BudgetChart data={data.budgetChartData} />
        <OTBTrendsChart data={data.otbTrendsData} />
      </div>

      {/* Alerts & Forecast Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProactiveAlertsWidget />
        <DemandForecastWidget />
      </div>

      {/* Insights & Activity Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AIInsightsWidget insights={data.aiInsights} />
        <ActivityFeed activities={data.activities} maxHeight="350px" />
      </div>

      {/* Quick Actions */}
      <QuickActions actions={data.quickActions} />

      {/* Pending Approvals */}
      <PendingApprovals
        approvals={data.pendingApprovals}
        viewAllHref="/approvals"
      />
    </div>
  );
}
