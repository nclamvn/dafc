'use client';

import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GENDER_LABELS } from '@/types';

interface Category {
  id: string;
  name: string;
  code: string;
}

interface LineItem {
  id?: string;
  categoryId: string;
  gender: 'MEN' | 'WOMEN' | 'UNISEX' | 'KIDS';
  plannedUnits: number;
  plannedAmount: number;
  averageRetailPrice: number;
  averageCostPrice: number;
  marginPercent: number;
  sellThruTarget: number;
  weeksOfSupply?: number;
  comments?: string;
}

interface OTBHierarchyTableProps {
  lineItems: LineItem[];
  categories: Category[];
  totalBudget: number;
  isEditable: boolean;
  onLineItemsChange?: (lineItems: LineItem[]) => void;
  onGenerateAI?: () => void;
  isGeneratingAI?: boolean;
}

type GenderKey = 'MEN' | 'WOMEN' | 'UNISEX' | 'KIDS';

export function OTBHierarchyTable({
  lineItems,
  categories,
  totalBudget,
  isEditable,
  onLineItemsChange,
  onGenerateAI,
  isGeneratingAI,
}: OTBHierarchyTableProps) {
  const [expandedGenders, setExpandedGenders] = useState<Set<string>>(
    new Set(['MEN', 'WOMEN', 'UNISEX', 'KIDS'])
  );
  const [newItemGender, setNewItemGender] = useState<GenderKey>('MEN');

  // Group line items by gender
  const groupedItems = useMemo(() => {
    const groups: Record<GenderKey, LineItem[]> = {
      MEN: [],
      WOMEN: [],
      UNISEX: [],
      KIDS: [],
    };

    lineItems.forEach((item) => {
      if (groups[item.gender]) {
        groups[item.gender].push(item);
      }
    });

    return groups;
  }, [lineItems]);

  // Calculate totals
  const totals = useMemo(() => {
    const total = lineItems.reduce(
      (acc, item) => ({
        units: acc.units + item.plannedUnits,
        amount: acc.amount + item.plannedAmount,
        margin:
          lineItems.length > 0
            ? acc.margin + item.marginPercent / lineItems.length
            : 0,
        sellThru:
          lineItems.length > 0
            ? acc.sellThru + item.sellThruTarget / lineItems.length
            : 0,
      }),
      { units: 0, amount: 0, margin: 0, sellThru: 0 }
    );

    return {
      ...total,
      budgetUtilization: totalBudget > 0 ? (total.amount / totalBudget) * 100 : 0,
    };
  }, [lineItems, totalBudget]);

  // Calculate gender subtotals
  const genderTotals = useMemo(() => {
    const result: Record<GenderKey, { units: number; amount: number; avgMargin: number }> = {
      MEN: { units: 0, amount: 0, avgMargin: 0 },
      WOMEN: { units: 0, amount: 0, avgMargin: 0 },
      UNISEX: { units: 0, amount: 0, avgMargin: 0 },
      KIDS: { units: 0, amount: 0, avgMargin: 0 },
    };

    Object.entries(groupedItems).forEach(([gender, items]) => {
      const key = gender as GenderKey;
      result[key] = {
        units: items.reduce((sum, item) => sum + item.plannedUnits, 0),
        amount: items.reduce((sum, item) => sum + item.plannedAmount, 0),
        avgMargin:
          items.length > 0
            ? items.reduce((sum, item) => sum + item.marginPercent, 0) / items.length
            : 0,
      };
    });

    return result;
  }, [groupedItems]);

  const toggleGender = (gender: string) => {
    setExpandedGenders((prev) => {
      const next = new Set(prev);
      if (next.has(gender)) {
        next.delete(gender);
      } else {
        next.add(gender);
      }
      return next;
    });
  };

  const handleAddItem = () => {
    if (!isEditable || !onLineItemsChange) return;

    const newItem: LineItem = {
      categoryId: categories[0]?.id || '',
      gender: newItemGender,
      plannedUnits: 0,
      plannedAmount: 0,
      averageRetailPrice: 0,
      averageCostPrice: 0,
      marginPercent: 50,
      sellThruTarget: 80,
      weeksOfSupply: 8,
    };

    onLineItemsChange([...lineItems, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (!isEditable || !onLineItemsChange) return;
    onLineItemsChange(lineItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof LineItem, value: unknown) => {
    if (!isEditable || !onLineItemsChange) return;

    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate margin if cost and retail price change
    if (field === 'averageRetailPrice' || field === 'averageCostPrice') {
      const retail = field === 'averageRetailPrice' ? value as number : updated[index].averageRetailPrice;
      const cost = field === 'averageCostPrice' ? value as number : updated[index].averageCostPrice;
      if (retail > 0) {
        updated[index].marginPercent = Math.round(((retail - cost) / retail) * 100);
      }
    }

    // Auto-calculate planned amount if units and retail price change
    if (field === 'plannedUnits' || field === 'averageRetailPrice') {
      const units = field === 'plannedUnits' ? value as number : updated[index].plannedUnits;
      const retail =
        field === 'averageRetailPrice' ? value as number : updated[index].averageRetailPrice;
      updated[index].plannedAmount = units * retail;
    }

    onLineItemsChange(updated);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const getItemIndex = (gender: GenderKey, itemIndexInGender: number): number => {
    let count = 0;
    for (const g of ['MEN', 'WOMEN', 'UNISEX', 'KIDS'] as GenderKey[]) {
      if (g === gender) {
        return count + itemIndexInGender;
      }
      count += groupedItems[g].length;
    }
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
        <div className="flex gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Units</p>
            <p className="text-lg font-bold">{totals.units.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-lg font-bold">${totals.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Budget Utilization</p>
            <p
              className={`text-lg font-bold ${
                totals.budgetUtilization > 100 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {totals.budgetUtilization.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg Margin</p>
            <p className="text-lg font-bold">{totals.margin.toFixed(1)}%</p>
          </div>
        </div>
        {isEditable && onGenerateAI && (
          <Button
            variant="outline"
            onClick={onGenerateAI}
            disabled={isGeneratingAI}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isGeneratingAI ? 'Generating...' : 'AI Proposal'}
          </Button>
        )}
      </div>

      {/* Add Item Controls */}
      {isEditable && (
        <div className="flex items-center gap-4">
          <Select
            value={newItemGender}
            onValueChange={(v) => setNewItemGender(v as GenderKey)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEN">Men</SelectItem>
              <SelectItem value="WOMEN">Women</SelectItem>
              <SelectItem value="UNISEX">Unisex</SelectItem>
              <SelectItem value="KIDS">Kids</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Line Item
          </Button>
        </div>
      )}

      {/* Hierarchy Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[200px]">Category</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">ARP</TableHead>
              <TableHead className="text-right">ACP</TableHead>
              <TableHead className="text-right">Margin %</TableHead>
              <TableHead className="text-right">ST Target</TableHead>
              <TableHead className="text-right">WOS</TableHead>
              {isEditable && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(['MEN', 'WOMEN', 'UNISEX', 'KIDS'] as GenderKey[]).map((gender) => {
              const items = groupedItems[gender];
              const isExpanded = expandedGenders.has(gender);
              const genderTotal = genderTotals[gender];

              if (items.length === 0 && !isEditable) return null;

              return (
                <>
                  {/* Gender Row */}
                  <TableRow
                    key={gender}
                    className="bg-muted/30 cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleGender(gender)}
                  >
                    <TableCell>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {GENDER_LABELS[gender as keyof typeof GENDER_LABELS]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ({items.length} items)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {genderTotal.units.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${genderTotal.amount.toLocaleString()}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {genderTotal.avgMargin.toFixed(1)}%
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    {isEditable && <TableCell></TableCell>}
                  </TableRow>

                  {/* Line Item Rows */}
                  {isExpanded &&
                    items.map((item, itemIndex) => {
                      const globalIndex = getItemIndex(gender, itemIndex);
                      return (
                        <TableRow key={`${gender}-${itemIndex}`}>
                          <TableCell></TableCell>
                          <TableCell>
                            {isEditable ? (
                              <Select
                                value={item.categoryId}
                                onValueChange={(v) =>
                                  handleUpdateItem(globalIndex, 'categoryId', v)
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="pl-4">{getCategoryName(item.categoryId)}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditable ? (
                              <Input
                                type="number"
                                value={item.plannedUnits}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    globalIndex,
                                    'plannedUnits',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-24 text-right"
                              />
                            ) : (
                              item.plannedUnits.toLocaleString()
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditable ? (
                              <Input
                                type="number"
                                value={item.plannedAmount}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    globalIndex,
                                    'plannedAmount',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-28 text-right"
                              />
                            ) : (
                              `$${item.plannedAmount.toLocaleString()}`
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditable ? (
                              <Input
                                type="number"
                                step="0.01"
                                value={item.averageRetailPrice}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    globalIndex,
                                    'averageRetailPrice',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-24 text-right"
                              />
                            ) : (
                              `$${item.averageRetailPrice.toFixed(2)}`
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditable ? (
                              <Input
                                type="number"
                                step="0.01"
                                value={item.averageCostPrice}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    globalIndex,
                                    'averageCostPrice',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-24 text-right"
                              />
                            ) : (
                              `$${item.averageCostPrice.toFixed(2)}`
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditable ? (
                              <Input
                                type="number"
                                value={item.marginPercent}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    globalIndex,
                                    'marginPercent',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-20 text-right"
                              />
                            ) : (
                              `${item.marginPercent.toFixed(1)}%`
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditable ? (
                              <Input
                                type="number"
                                value={item.sellThruTarget}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    globalIndex,
                                    'sellThruTarget',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-20 text-right"
                              />
                            ) : (
                              `${item.sellThruTarget.toFixed(1)}%`
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditable ? (
                              <Input
                                type="number"
                                value={item.weeksOfSupply || ''}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    globalIndex,
                                    'weeksOfSupply',
                                    parseInt(e.target.value) || undefined
                                  )
                                }
                                className="w-16 text-right"
                              />
                            ) : (
                              item.weeksOfSupply || '-'
                            )}
                          </TableCell>
                          {isEditable && (
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(globalIndex)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                </>
              );
            })}

            {/* Grand Total Row */}
            <TableRow className="bg-primary/10 font-bold">
              <TableCell></TableCell>
              <TableCell>TOTAL</TableCell>
              <TableCell className="text-right">{totals.units.toLocaleString()}</TableCell>
              <TableCell className="text-right">${totals.amount.toLocaleString()}</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">{totals.margin.toFixed(1)}%</TableCell>
              <TableCell className="text-right">{totals.sellThru.toFixed(1)}%</TableCell>
              <TableCell></TableCell>
              {isEditable && <TableCell></TableCell>}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
