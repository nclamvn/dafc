'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'forecast';
  title: string;
  description: string;
  impact?: 'high' | 'medium' | 'low';
  metric?: {
    label: string;
    value: string;
    change?: number;
  };
  actionUrl?: string;
}

interface AIInsightsWidgetProps {
  insights: AIInsight[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const typeIcons = {
  trend: TrendingUp,
  anomaly: AlertTriangle,
  recommendation: Lightbulb,
  forecast: TrendingDown,
};

const typeColors = {
  trend: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  anomaly: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  recommendation: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  forecast: 'text-green-600 bg-green-100 dark:bg-green-900/30',
};

const impactBadgeVariants = {
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
} as const;

export function AIInsightsWidget({
  insights,
  isLoading,
  onRefresh,
}: AIInsightsWidgetProps) {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{t('aiInsights')}</CardTitle>
              <CardDescription className="text-xs">{t('poweredByAI')}</CardDescription>
            </div>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              {tCommon('refresh')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-4">
              {insights.map((insight) => {
                const Icon = typeIcons[insight.type];
                const colorClass = typeColors[insight.type];

                return (
                  <div
                    key={insight.id}
                    className={cn(
                      'p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors',
                      insight.actionUrl && 'cursor-pointer'
                    )}
                    onClick={() => {
                      if (insight.actionUrl) {
                        window.location.href = insight.actionUrl;
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{insight.title}</p>
                          {insight.impact && (
                            <Badge variant={impactBadgeVariants[insight.impact]} className="shrink-0 text-xs">
                              {insight.impact}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {insight.description}
                        </p>
                        {insight.metric && (
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-xs text-muted-foreground">
                              {insight.metric.label}
                            </span>
                            <span className="text-sm font-semibold flex items-center gap-1">
                              {insight.metric.value}
                              {insight.metric.change !== undefined && (
                                <span
                                  className={cn(
                                    'text-xs',
                                    insight.metric.change > 0
                                      ? 'text-green-600'
                                      : insight.metric.change < 0
                                      ? 'text-red-600'
                                      : 'text-muted-foreground'
                                  )}
                                >
                                  ({insight.metric.change > 0 ? '+' : ''}
                                  {insight.metric.change}%)
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {insight.actionUrl && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                            <span>{t('viewDetails')}</span>
                            <ChevronRight className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {insights.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('noInsights')}</p>
                  <p className="text-xs">{t('checkBackLater')}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
