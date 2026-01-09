'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Package,
  Database,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Building2,
  FolderTree,
  MapPin,
  Users,
  CheckSquare,
  BarChart3,
  Target,
  Brain,
  Calculator,
  GitCompare,
  Sparkles,
  FileText,
  Bot,
  Lightbulb,
  Wand2,
  Bell,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';

const navigation = [
  { key: 'dashboard', href: '/', icon: LayoutDashboard },
  { key: 'budget', href: '/budget', icon: DollarSign },
  { key: 'otb', href: '/otb-analysis', icon: TrendingUp },
  { key: 'sku', href: '/sku-proposal', icon: Package },
  { key: 'approvals', href: '/approvals', icon: CheckSquare },
];

const masterDataItems = [
  { key: 'brands', href: '/master-data/brands', icon: Building2 },
  { key: 'categories', href: '/master-data/categories', icon: FolderTree },
  { key: 'locations', href: '/master-data/locations', icon: MapPin },
  { key: 'users', href: '/master-data/users', icon: Users },
];

const analyticsItems = [
  { key: 'overview', href: '/analytics', icon: BarChart3 },
  { key: 'kpiDashboard', href: '/analytics/kpi', icon: Target },
  { key: 'forecast', href: '/analytics/forecast', icon: Brain },
  { key: 'simulator', href: '/analytics/simulator', icon: Calculator },
  { key: 'comparison', href: '/analytics/comparison', icon: GitCompare },
  { key: 'insights', href: '/analytics/insights', icon: Sparkles },
  { key: 'customReport', href: '/analytics/reports', icon: FileText },
];

const aiItems = [
  { key: 'aiAssistant', href: '/ai-assistant', icon: Bot },
  { key: 'suggestions', href: '/ai-suggestions', icon: Lightbulb },
  { key: 'autoPlan', href: '/ai-auto-plan', icon: Wand2 },
  { key: 'predictiveAlerts', href: '/predictive-alerts', icon: Bell },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const tMasterData = useTranslations('masterData');
  const tAnalytics = useTranslations('analytics');
  const tUi = useTranslations('ui');

  const [masterDataOpen, setMasterDataOpen] = useState(
    pathname.startsWith('/master-data')
  );
  const [analyticsOpen, setAnalyticsOpen] = useState(
    pathname.startsWith('/analytics')
  );
  const [aiOpen, setAiOpen] = useState(
    pathname.startsWith('/ai-') || pathname === '/predictive-alerts'
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}>
        {/* Logo */}
        <div className={cn(
          "h-16 flex items-center border-b border-border",
          collapsed ? "px-3 justify-center" : "px-6"
        )}>
          <Link href="/" className="flex items-center">
            {collapsed ? (
              <Image
                src="/logo.svg"
                alt="DAFC"
                width={40}
                height={40}
                priority
                className="object-contain"
                style={{ height: 'auto' }}
              />
            ) : (
              <Image
                src="/logo.svg"
                alt="DAFC"
                width={140}
                height={36}
                priority
                style={{ height: 'auto' }}
              />
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")}>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 relative',
                    collapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2.5',
                    isActive
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:text-white'
                  )}
                >
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
                  )}
                  <item.icon className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground dark:group-hover:text-white'
                  )} />
                  {!collapsed && <span className="flex-1">{t(item.key)}</span>}
                </Link>
              );

              return (
                <li key={item.key}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={10}>
                        {t(item.key)}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    linkContent
                  )}
                </li>
              );
            })}

            {/* Master Data Collapsible */}
            <li>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/master-data/brands"
                      className={cn(
                        'group flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                        pathname.startsWith('/master-data')
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:text-white'
                      )}
                    >
                      <Database className={cn(
                        'h-5 w-5 flex-shrink-0',
                        pathname.startsWith('/master-data') ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground dark:group-hover:text-white'
                      )} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {t('masterData')}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Collapsible open={masterDataOpen} onOpenChange={setMasterDataOpen}>
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        'group flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative',
                        pathname.startsWith('/master-data')
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:text-white'
                      )}
                    >
                      {pathname.startsWith('/master-data') && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
                      )}
                      <Database className={cn(
                        'h-5 w-5 flex-shrink-0',
                        pathname.startsWith('/master-data') ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground dark:group-hover:text-white'
                      )} />
                      <span className="flex-1 text-left">{t('masterData')}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-muted-foreground/70 transition-transform',
                          masterDataOpen && 'rotate-180'
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1 pl-4">
                    {masterDataItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          className={cn(
                            'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                            isActive
                              ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground/80 dark:hover:text-white'
                          )}
                        >
                          <item.icon className={cn('h-4 w-4', isActive ? 'text-primary dark:text-primary-foreground' : 'text-muted-foreground/70 group-hover:text-foreground dark:group-hover:text-white')} />
                          <span>{tMasterData(item.key)}</span>
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </li>

            {/* Analytics Collapsible */}
            <li>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/analytics"
                      className={cn(
                        'group flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                        pathname.startsWith('/analytics')
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:text-white'
                      )}
                    >
                      <BarChart3 className={cn(
                        'h-5 w-5 flex-shrink-0',
                        pathname.startsWith('/analytics') ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground dark:group-hover:text-white'
                      )} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {t('analytics')}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Collapsible open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        'group flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative',
                        pathname.startsWith('/analytics')
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:text-white'
                      )}
                    >
                      {pathname.startsWith('/analytics') && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
                      )}
                      <BarChart3 className={cn(
                        'h-5 w-5 flex-shrink-0',
                        pathname.startsWith('/analytics') ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground dark:group-hover:text-white'
                      )} />
                      <span className="flex-1 text-left">{t('analytics')}</span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-full mr-1">
                        {tUi('new')}
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-muted-foreground/70 transition-transform',
                          analyticsOpen && 'rotate-180'
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1 pl-4">
                    {analyticsItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          className={cn(
                            'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                            isActive
                              ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground/80 dark:hover:text-white'
                          )}
                        >
                          <item.icon className={cn('h-4 w-4', isActive ? 'text-primary dark:text-primary-foreground' : 'text-muted-foreground/70 group-hover:text-foreground dark:group-hover:text-white')} />
                          <span>{tAnalytics(item.key)}</span>
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </li>

            {/* AI Features Collapsible */}
            <li>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/ai-assistant"
                      className={cn(
                        'group flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                        (pathname.startsWith('/ai-') || pathname === '/predictive-alerts')
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:text-white'
                      )}
                    >
                      <Bot className={cn(
                        'h-5 w-5 flex-shrink-0',
                        (pathname.startsWith('/ai-') || pathname === '/predictive-alerts') ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground dark:group-hover:text-white'
                      )} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    AI
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Collapsible open={aiOpen} onOpenChange={setAiOpen}>
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        'group flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative',
                        (pathname.startsWith('/ai-') || pathname === '/predictive-alerts')
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:text-white'
                      )}
                    >
                      {(pathname.startsWith('/ai-') || pathname === '/predictive-alerts') && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
                      )}
                      <Bot className={cn(
                        'h-5 w-5 flex-shrink-0',
                        (pathname.startsWith('/ai-') || pathname === '/predictive-alerts') ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground dark:group-hover:text-white'
                      )} />
                      <span className="flex-1 text-left">AI</span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full mr-1">
                        AI
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-muted-foreground/70 transition-transform',
                          aiOpen && 'rotate-180'
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1 pl-4">
                    {aiItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          className={cn(
                            'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                            isActive
                              ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground/80 dark:hover:text-white'
                          )}
                        >
                          <item.icon className={cn('h-4 w-4', isActive ? 'text-primary dark:text-primary-foreground' : 'text-muted-foreground/70 group-hover:text-foreground dark:group-hover:text-white')} />
                          <span>{t(item.key)}</span>
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </li>
          </ul>
        </nav>

        {/* Collapse Toggle Button */}
        {onToggleCollapse && (
          <div className={cn(
            "border-t border-border p-3",
            collapsed ? "flex justify-center" : ""
          )}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleCollapse}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                    "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    collapsed ? "justify-center w-full" : "w-full"
                  )}
                >
                  {collapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <>
                      <ChevronLeft className="h-5 w-5" />
                      <span>{tUi('collapse')}</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" sideOffset={10}>
                  {tUi('expand')}
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
