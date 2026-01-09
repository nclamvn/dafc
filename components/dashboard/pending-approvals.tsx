'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';
import { Clock, FileText, DollarSign, Package, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PendingApproval {
  id: string;
  type: 'budget' | 'otb' | 'sku';
  title: string;
  description: string;
  submittedBy: {
    name: string;
    avatar?: string;
  };
  submittedAt: Date;
  priority?: 'high' | 'medium' | 'low';
  amount?: number;
  href: string;
}

interface PendingApprovalsProps {
  approvals: PendingApproval[];
  viewAllHref?: string;
}

const typeIcons = {
  budget: DollarSign,
  otb: FileText,
  sku: Package,
};

const priorityColors = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function PendingApprovals({ approvals, viewAllHref }: PendingApprovalsProps) {
  const t = useTranslations('dashboard');
  const tNav = useTranslations('navigation');

  const typeLabels: Record<string, string> = {
    budget: tNav('budget'),
    otb: tNav('otb'),
    sku: tNav('sku'),
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {t('pendingApprovals')}
              {approvals.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {approvals.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{t('itemsWaitingReview')}</CardDescription>
          </div>
          {viewAllHref && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={viewAllHref}>
                {t('viewAll')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {approvals.map((approval) => {
              const Icon = typeIcons[approval.type];

              return (
                <Link
                  key={approval.id}
                  href={approval.href}
                  className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{approval.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {approval.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {typeLabels[approval.type]}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">
                              {getInitials(approval.submittedBy.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {approval.submittedBy.name}
                          </span>
                        </div>
                        {approval.amount !== undefined && (
                          <span className="text-sm font-semibold text-primary">
                            {formatCurrency(approval.amount)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(approval.submittedAt, { addSuffix: true })}
                        </span>
                        {approval.priority && (
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              priorityColors[approval.priority]
                            )}
                          >
                            {approval.priority} priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            {approvals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('noPendingApprovals')}</p>
                <p className="text-xs">{t('allCaughtUp')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
