'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Target,
  ShoppingCart,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ForecastItem {
  category: string;
  currentDemand: number;
  predictedDemand: number;
  growth: number;
  stockHealth: 'critical' | 'warning' | 'good';
}

// Demo data generator (will be replaced with real API data)
function generateForecastData(): ForecastItem[] {
  return [
    { category: 'Footwear', currentDemand: 4500, predictedDemand: 5200, growth: 15.5, stockHealth: 'warning' },
    { category: 'Apparel', currentDemand: 3200, predictedDemand: 3400, growth: 6.3, stockHealth: 'good' },
    { category: 'Accessories', currentDemand: 1800, predictedDemand: 2100, growth: 16.7, stockHealth: 'critical' },
    { category: 'Bags', currentDemand: 1200, predictedDemand: 1150, growth: -4.2, stockHealth: 'good' },
  ];
}

const stockHealthConfig = {
  critical: { label: 'Low Stock', color: 'text-red-600 bg-red-100', variant: 'destructive' as const },
  warning: { label: 'Monitor', color: 'text-amber-600 bg-amber-100', variant: 'secondary' as const },
  good: { label: 'Healthy', color: 'text-green-600 bg-green-100', variant: 'outline' as const },
};

export function DemandForecastWidget() {
  const forecastData = useMemo(() => generateForecastData(), []);

  const summary = useMemo(() => {
    const totalCurrent = forecastData.reduce((sum, item) => sum + item.currentDemand, 0);
    const totalPredicted = forecastData.reduce((sum, item) => sum + item.predictedDemand, 0);
    const avgGrowth = ((totalPredicted - totalCurrent) / totalCurrent) * 100;
    const criticalCount = forecastData.filter(item => item.stockHealth === 'critical').length;

    return {
      totalPredicted,
      avgGrowth,
      criticalCount,
      accuracy: 94.2,
    };
  }, [forecastData]);

  return (
    <Card className="border-blue-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Demand Forecast</CardTitle>
              <CardDescription className="text-xs">
                Next 30 days prediction
              </CardDescription>
            </div>
          </div>
          {summary.criticalCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {summary.criticalCount} Critical
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Predicted Demand</span>
            </div>
            <p className="text-lg font-bold mt-1">
              {summary.totalPredicted.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              {summary.avgGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className="text-xs text-muted-foreground">Avg Growth</span>
            </div>
            <p className={cn(
              "text-lg font-bold mt-1",
              summary.avgGrowth >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {summary.avgGrowth >= 0 ? '+' : ''}{summary.avgGrowth.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Forecast Accuracy */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Forecast Accuracy</span>
            <span className="font-medium">{summary.accuracy}%</span>
          </div>
          <Progress value={summary.accuracy} className="h-1.5" />
        </div>

        {/* Category Breakdown */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">By Category</p>
          {forecastData.slice(0, 4).map((item) => {
            const healthConfig = stockHealthConfig[item.stockHealth];
            return (
              <div
                key={item.category}
                className="flex items-center justify-between py-1.5 border-b border-muted last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.category}</span>
                  <Badge variant={healthConfig.variant} className="text-[10px] px-1.5 py-0">
                    {healthConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {item.predictedDemand.toLocaleString()}
                  </span>
                  <span className={cn(
                    "text-xs flex items-center",
                    item.growth >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {item.growth >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(item.growth).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Full Analysis Link */}
        <Link href="/analytics/demand">
          <Button variant="outline" size="sm" className="w-full mt-2">
            View Full Analysis
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
