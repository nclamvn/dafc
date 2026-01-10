'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Target,
} from 'lucide-react';

// Format currency helper
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format compact currency
const formatCompactCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value);
};

interface OTBSummaryData {
  totalBudget: number;
  plannedSales: number;
  plannedMarkdowns: number;
  plannedEOMInventory: number;
  bomInventory: number;
  onOrder: number;
  actualSales?: number;
  actualReceipts?: number;
}

interface OTBSummaryProps {
  data: OTBSummaryData;
  period?: string;
  className?: string;
}

export function OTBSummary({ data, period = 'Current Period', className }: OTBSummaryProps) {
  const calculations = useMemo(() => {
    // OTB = Planned Sales + Planned Markdowns + Planned EOM Inventory - BOM Inventory - On Order
    const otb =
      data.plannedSales +
      data.plannedMarkdowns +
      data.plannedEOMInventory -
      data.bomInventory -
      data.onOrder;

    const budgetUtilization = data.totalBudget > 0 ? (otb / data.totalBudget) * 100 : 0;
    const isOverBudget = otb > data.totalBudget;
    const variance = data.totalBudget - otb;

    // Actual vs Planned (if actual data available)
    const salesVariance = data.actualSales
      ? data.actualSales - data.plannedSales
      : 0;
    const salesVariancePercent = data.plannedSales > 0 && data.actualSales
      ? (salesVariance / data.plannedSales) * 100
      : 0;

    // Inventory turnover
    const avgInventory = (data.bomInventory + data.plannedEOMInventory) / 2;
    const turnover = avgInventory > 0 ? data.plannedSales / avgInventory : 0;

    // Weeks of supply
    const weeksOfSupply = data.plannedSales > 0
      ? (data.plannedEOMInventory / (data.plannedSales / 4))
      : 0;

    return {
      otb,
      budgetUtilization,
      isOverBudget,
      variance,
      salesVariance,
      salesVariancePercent,
      turnover,
      weeksOfSupply,
      status: isOverBudget ? 'over' : budgetUtilization < 80 ? 'under' : 'optimal',
    };
  }, [data]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'text-red-600';
      case 'under':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'under':
        return <TrendingDown className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">OTB Summary</CardTitle>
            <CardDescription>{period}</CardDescription>
          </div>
          <Badge variant="outline" className={cn('gap-1', getStatusColor(calculations.status))}>
            {getStatusIcon(calculations.status)}
            {calculations.status === 'over' ? 'Over Budget' :
             calculations.status === 'under' ? 'Under-utilized' : 'On Track'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main OTB Display */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">
              {formatCompactCurrency(calculations.otb)}
            </p>
            <p className="text-sm text-muted-foreground">Open-To-Buy</p>
          </div>
          <div className="text-right">
            <p className={cn(
              'text-lg font-semibold',
              calculations.variance >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {calculations.variance >= 0 ? '+' : ''}{formatCompactCurrency(calculations.variance)}
            </p>
            <p className="text-sm text-muted-foreground">vs Budget</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Budget Utilization</span>
            <span>{calculations.budgetUtilization.toFixed(1)}%</span>
          </div>
          <Progress
            value={Math.min(100, calculations.budgetUtilization)}
            className={cn('h-2', calculations.budgetUtilization > 100 && 'bg-red-100')}
          />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-sm font-medium">{formatCompactCurrency(data.totalBudget)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Planned Sales</p>
              <p className="text-sm font-medium">{formatCompactCurrency(data.plannedSales)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Inventory</p>
              <p className="text-sm font-medium">{formatCompactCurrency(data.bomInventory)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">On Order</p>
              <p className="text-sm font-medium">{formatCompactCurrency(data.onOrder)}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex justify-between text-sm pt-2 border-t">
          <div className="text-center">
            <p className="font-semibold">{calculations.turnover.toFixed(1)}x</p>
            <p className="text-xs text-muted-foreground">Turnover</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{calculations.weeksOfSupply.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">WOS</p>
          </div>
          <div className="text-center">
            <p className={cn(
              'font-semibold',
              data.actualSales && calculations.salesVariancePercent >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {data.actualSales ? `${calculations.salesVariancePercent >= 0 ? '+' : ''}${calculations.salesVariancePercent.toFixed(1)}%` : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">Sales Var.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for lists
export function OTBSummaryCompact({
  otb,
  budget,
  status = 'optimal',
  className,
}: {
  otb: number;
  budget: number;
  status?: 'over' | 'under' | 'optimal';
  className?: string;
}) {
  const utilization = budget > 0 ? (otb / budget) * 100 : 0;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{formatCompactCurrency(otb)}</span>
          <span className="text-xs text-muted-foreground">{utilization.toFixed(0)}%</span>
        </div>
        <Progress
          value={Math.min(100, utilization)}
          className={cn('h-1.5', utilization > 100 && 'bg-red-100')}
        />
      </div>
      {status === 'over' ? (
        <AlertTriangle className="h-4 w-4 text-red-500" />
      ) : status === 'under' ? (
        <TrendingDown className="h-4 w-4 text-yellow-500" />
      ) : (
        <Target className="h-4 w-4 text-green-500" />
      )}
    </div>
  );
}
