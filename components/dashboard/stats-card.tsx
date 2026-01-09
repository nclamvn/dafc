'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  FileText,
  Package,
  Building2,
  FolderTree,
  MapPin,
  Users,
  BarChart3,
  Target,
  Activity,
  Percent,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';

// Icon mapping for server component compatibility
const iconMap: Record<string, LucideIcon> = {
  DollarSign,
  TrendingUp,
  FileText,
  Package,
  Building2,
  FolderTree,
  MapPin,
  Users,
  BarChart3,
  Target,
  Activity,
  Percent,
  ShoppingCart,
};

export type IconName = keyof typeof iconMap;

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: IconName;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow';
  sparklineData?: number[];
}

const colorClasses = {
  blue: {
    icon: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    trend: 'text-blue-600 dark:text-blue-400',
    sparkline: 'hsl(var(--chart-1))',
  },
  green: {
    icon: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    trend: 'text-green-600 dark:text-green-400',
    sparkline: 'hsl(var(--chart-4))',
  },
  orange: {
    icon: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    trend: 'text-orange-600 dark:text-orange-400',
    sparkline: 'hsl(var(--chart-3))',
  },
  purple: {
    icon: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    trend: 'text-purple-600 dark:text-purple-400',
    sparkline: 'hsl(var(--primary))',
  },
  red: {
    icon: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    trend: 'text-red-600 dark:text-red-400',
    sparkline: 'hsl(var(--chart-5))',
  },
  yellow: {
    icon: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    trend: 'text-yellow-600 dark:text-yellow-400',
    sparkline: 'hsl(var(--chart-3))',
  },
};

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  const stepX = width / (data.length - 1);

  const points = data
    .map((val, i) => {
      const x = i * stepX;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  color = 'blue',
  sparklineData,
}: StatsCardProps) {
  const colors = colorClasses[color];
  const Icon = iconMap[icon] || DollarSign;

  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
      ? TrendingDown
      : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? 'text-green-600 dark:text-green-400'
      : trend.value < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-muted-foreground'
    : '';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{value}</span>
              {trend && TrendIcon && (
                <span className={cn('flex items-center text-xs font-medium', trendColor)}>
                  <TrendIcon className="h-3 w-3 mr-0.5" />
                  {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p className="text-xs text-muted-foreground">{trend.label}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', colors.bg)}>
              <Icon className={cn('h-5 w-5', colors.icon)} />
            </div>
            {sparklineData && (
              <MiniSparkline data={sparklineData} color={colors.sparkline} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
