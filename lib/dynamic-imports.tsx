// lib/dynamic-imports.tsx
// Centralized dynamic imports for code splitting
// Use these exports instead of direct imports for heavy components

import dynamic from 'next/dynamic';

// =====================================================
// LOADING SKELETONS
// =====================================================

const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded-lg"></div>
  </div>
);

const TableSkeleton = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-10 bg-gray-200 rounded"></div>
    <div className="h-10 bg-gray-100 rounded"></div>
    <div className="h-10 bg-gray-200 rounded"></div>
    <div className="h-10 bg-gray-100 rounded"></div>
    <div className="h-10 bg-gray-200 rounded"></div>
  </div>
);

const FormSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
    <div className="h-12 bg-gray-100 rounded"></div>
    <div className="h-12 bg-gray-100 rounded"></div>
    <div className="h-12 bg-gray-100 rounded"></div>
    <div className="h-10 bg-gray-200 rounded w-1/4"></div>
  </div>
);

const PanelSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
      <div className="h-4 bg-gray-100 rounded w-2/3"></div>
    </div>
  </div>
);

// =====================================================
// CHART COMPONENTS (Heavy - recharts library)
// =====================================================

export const BudgetCharts = dynamic(
  () => import('@/components/budget/budget-charts').then(mod => mod.BudgetCharts),
  {
    loading: ChartSkeleton,
    ssr: false,
  }
);

export const BudgetChart = dynamic(
  () => import('@/components/dashboard/budget-chart').then(mod => mod.BudgetChart),
  {
    loading: ChartSkeleton,
    ssr: false,
  }
);

export const OTBTrendsChart = dynamic(
  () => import('@/components/dashboard/otb-trends-chart').then(mod => mod.OTBTrendsChart),
  {
    loading: ChartSkeleton,
    ssr: false,
  }
);

export const ForecastChart = dynamic(
  () => import('@/components/charts/forecast-chart').then(mod => mod.ForecastChart),
  {
    loading: ChartSkeleton,
    ssr: false,
  }
);

export const RadarChart = dynamic(
  () => import('@/components/charts/radar-chart').then(mod => mod.RadarChart),
  {
    loading: ChartSkeleton,
    ssr: false,
  }
);

export const GaugeChart = dynamic(
  () => import('@/components/charts/gauge-chart').then(mod => mod.GaugeChart),
  {
    loading: ChartSkeleton,
    ssr: false,
  }
);

export const WaterfallChart = dynamic(
  () => import('@/components/charts/waterfall-chart').then(mod => mod.WaterfallChart),
  {
    loading: ChartSkeleton,
    ssr: false,
  }
);

export const Heatmap = dynamic(
  () => import('@/components/charts/heatmap').then(mod => mod.Heatmap),
  {
    loading: ChartSkeleton,
    ssr: false,
  }
);

// =====================================================
// OTB COMPONENTS
// =====================================================

export const OTBCalculator = dynamic(
  () => import('@/components/otb/otb-calculator').then(mod => mod.OTBCalculator),
  {
    loading: FormSkeleton,
    ssr: false,
  }
);

export const OTBHierarchyTable = dynamic(
  () => import('@/components/otb/otb-hierarchy-table').then(mod => mod.OTBHierarchyTable),
  {
    loading: TableSkeleton,
  }
);

export const OTBSummary = dynamic(
  () => import('@/components/otb/otb-summary').then(mod => mod.OTBSummary),
  {
    loading: PanelSkeleton,
  }
);

// =====================================================
// EXCEL IMPORT COMPONENTS
// =====================================================

export const ExcelImporter = dynamic(
  () => import('@/components/excel/excel-importer').then(mod => mod.ExcelImporter),
  {
    loading: FormSkeleton,
    ssr: false,
  }
);

export const ImportPreview = dynamic(
  () => import('@/components/excel/import-preview').then(mod => mod.ImportPreview),
  {
    loading: TableSkeleton,
    ssr: false,
  }
);

// =====================================================
// AI COMPONENTS
// =====================================================

export const CopilotPanel = dynamic(
  () => import('@/components/ai/copilot-panel').then(mod => mod.CopilotPanel),
  {
    loading: PanelSkeleton,
  }
);

export const CopilotButton = dynamic(
  () => import('@/components/ai/copilot-button').then(mod => mod.CopilotButton),
  {
    ssr: false,
  }
);

export const AIChatWidget = dynamic(
  () => import('@/components/ai/chat-widget').then(mod => mod.AIChatWidget),
  {
    loading: PanelSkeleton,
    ssr: false,
  }
);

export const AIInsightsWidget = dynamic(
  () => import('@/components/dashboard/ai-insights-widget').then(mod => mod.AIInsightsWidget),
  {
    loading: PanelSkeleton,
  }
);

// =====================================================
// DATA TABLE (Can be large with many rows)
// =====================================================

export const DataTable = dynamic(
  () => import('@/components/shared/data-table').then(mod => mod.DataTable),
  {
    loading: TableSkeleton,
  }
);

export const MobileTable = dynamic(
  () => import('@/components/mobile/mobile-table').then(mod => mod.MobileTable),
  {
    loading: TableSkeleton,
  }
);
