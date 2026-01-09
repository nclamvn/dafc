'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  FileText,
  Package,
  DollarSign,
  Upload,
  Search,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

// Icon mapping for server component compatibility
const iconMap: Record<string, LucideIcon> = {
  Plus,
  FileText,
  Package,
  DollarSign,
  Upload,
  Search,
  Settings,
  Users,
};

export type QuickActionIconName = keyof typeof iconMap;

export interface QuickAction {
  href: string;
  icon: QuickActionIconName;
  title: string;
  description: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  description?: string;
}

const colorClasses = {
  default: 'bg-muted/50 text-foreground',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function QuickActions({
  actions,
  title,
  description,
}: QuickActionsProps) {
  const t = useTranslations('dashboard');
  const displayTitle = title || t('quickActions');
  const displayDescription = description || t('commonTasks');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{displayTitle}</CardTitle>
        <CardDescription>{displayDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action) => {
            const Icon = iconMap[action.icon] || Plus;
            const iconColorClass = colorClasses[action.color || 'primary'];

            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors group"
              >
                <div
                  className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110',
                    iconColorClass
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{action.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
