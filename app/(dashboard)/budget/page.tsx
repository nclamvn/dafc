'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Send,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { BudgetAllocation, Season, Brand, BUDGET_STATUS_LABELS } from '@/types';

interface BudgetWithRelations extends Omit<BudgetAllocation, 'season' | 'brand' | 'location' | 'createdBy'> {
  season: Season;
  brand: Brand;
  location: { id: string; name: string; code: string };
  createdBy: { id: string; name: string; email: string };
}

export default function BudgetPage() {
  const router = useRouter();
  const t = useTranslations('pages.budget');
  const tCommon = useTranslations('common');
  const tFilters = useTranslations('filters');
  const tBudget = useTranslations('budget');
  const [budgets, setBudgets] = useState<BudgetWithRelations[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState<BudgetWithRelations | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState({
    totalBudget: 0,
    approvedBudget: 0,
    pendingBudget: 0,
    count: 0,
  });

  // Filters
  const [seasonFilter, setSeasonFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch budgets with filters
      const params = new URLSearchParams();
      if (seasonFilter !== 'all') params.append('seasonId', seasonFilter);
      if (brandFilter !== 'all') params.append('brandId', brandFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const [budgetsRes, seasonsRes, brandsRes] = await Promise.all([
        fetch(`/api/v1/budgets?${params.toString()}`),
        fetch('/api/v1/seasons'),
        fetch('/api/v1/brands'),
      ]);

      const budgetsData = await budgetsRes.json();
      const seasonsData = await seasonsRes.json();
      const brandsData = await brandsRes.json();

      if (budgetsData.success) {
        setBudgets(budgetsData.data);
        setSummary(budgetsData.summary);
      }
      if (seasonsData.success) setSeasons(seasonsData.data);
      if (brandsData.success) setBrands(brandsData.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error(t('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [seasonFilter, brandFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!selectedBudget) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/budgets/${selectedBudget.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        toast.success(t('deleteSuccess'));
        setIsDeleteOpen(false);
        fetchData();
      } else {
        toast.error(result.error || t('deleteError'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(tCommon('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (budget: BudgetWithRelations) => {
    try {
      const response = await fetch(`/api/v1/budgets/${budget.id}/submit`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        toast.success(t('submitSuccess'));
        fetchData();
      } else {
        toast.error(result.error || t('submitError'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(tCommon('error'));
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      REVISED: 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge variant="secondary" className={colors[status]}>
        {BUDGET_STATUS_LABELS[status as keyof typeof BUDGET_STATUS_LABELS] || status}
      </Badge>
    );
  };

  const columns: ColumnDef<BudgetWithRelations>[] = [
    {
      id: 'season',
      accessorFn: (row) => row.season.code,
      header: t('columnSeason'),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.season.code}</span>
      ),
    },
    {
      id: 'brand',
      accessorFn: (row) => row.brand.name,
      header: t('columnBrand'),
      cell: ({ row }) => row.original.brand.name,
    },
    {
      id: 'location',
      accessorFn: (row) => row.location.name,
      header: t('columnLocation'),
      cell: ({ row }) => row.original.location.name,
    },
    {
      accessorKey: 'totalBudget',
      header: t('columnTotalBudget'),
      cell: ({ row }) => (
        <span className="font-medium">
          ${Number(row.original.totalBudget).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('columnStatus'),
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'version',
      header: t('columnVersion'),
      cell: ({ row }) => `v${row.original.version}`,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const budget = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/budget/${budget.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                {tCommon('view')}
              </DropdownMenuItem>
              {['DRAFT', 'REJECTED'].includes(budget.status) && (
                <>
                  <DropdownMenuItem onClick={() => router.push(`/budget/${budget.id}?edit=true`)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {tCommon('edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSubmit(budget)}>
                    <Send className="mr-2 h-4 w-4" />
                    {tCommon('submit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedBudget(budget);
                      setIsDeleteOpen(true);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {tCommon('delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
      >
        <Link href="/budget/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('createBudget')}
          </Button>
        </Link>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('totalBudgetCard')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('allocations', { count: summary.count })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('approved')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary.approvedBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('ofTotal', { percent: ((summary.approvedBudget / summary.totalBudget) * 100 || 0).toFixed(1) })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('pending')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${summary.pendingBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t('awaitingApproval')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('draft')}</CardTitle>
            <XCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              ${(
                summary.totalBudget -
                summary.approvedBudget -
                summary.pendingBudget
              ).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t('notSubmitted')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={seasonFilter} onValueChange={setSeasonFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('columnSeason')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tFilters('allSeasons')}</SelectItem>
            {seasons.map((season) => (
              <SelectItem key={season.id} value={season.id}>
                {season.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('columnBrand')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tFilters('allBrands')}</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('columnStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tFilters('allStatuses')}</SelectItem>
            <SelectItem value="DRAFT">{tBudget('draft')}</SelectItem>
            <SelectItem value="SUBMITTED">{tBudget('submitted')}</SelectItem>
            <SelectItem value="UNDER_REVIEW">{tBudget('underReview')}</SelectItem>
            <SelectItem value="APPROVED">{tBudget('approved')}</SelectItem>
            <SelectItem value="REJECTED">{tBudget('rejected')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={budgets}
        searchKey="brand"
        searchPlaceholder={t('searchPlaceholder')}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t('deleteBudget')}
        description={t('deleteConfirm', {
          brand: selectedBudget?.brand?.name || '',
          season: selectedBudget?.season?.code || '',
        })}
        confirmText={tCommon('delete')}
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}
