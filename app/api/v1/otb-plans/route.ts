import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { otbPlanCreateSchema } from '@/lib/validations/otb';
import { mockOTBPlans } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get('budgetId');
    const seasonId = searchParams.get('seasonId');
    const brandId = searchParams.get('brandId');
    const status = searchParams.get('status');

    let plansWithSummary;

    try {
      const where: Record<string, unknown> = {};

      if (budgetId) where.budgetId = budgetId;
      if (status) where.status = status;

      if (seasonId || brandId) {
        where.budget = {};
        if (seasonId) (where.budget as Record<string, unknown>).seasonId = seasonId;
        if (brandId) (where.budget as Record<string, unknown>).brandId = brandId;
      }

      const plans = await prisma.oTBPlan.findMany({
        where,
        include: {
          budget: {
            include: {
              season: true,
              brand: true,
              location: true,
            },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          lineItems: {
            include: {
              category: true,
            },
            orderBy: [{ gender: 'asc' }, { category: { name: 'asc' } }],
          },
          _count: {
            select: { lineItems: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Calculate summary for each plan
      plansWithSummary = plans.map((plan) => {
        const totalPlannedUnits = plan.lineItems.reduce(
          (sum, item) => sum + (item.userUnits || 0),
          0
        );
        const totalPlannedAmount = plan.lineItems.reduce(
          (sum, item) => sum + Number(item.userBuyValue),
          0
        );
        const avgBuyPct =
          plan.lineItems.length > 0
            ? plan.lineItems.reduce((sum, item) => sum + Number(item.userBuyPct), 0) /
              plan.lineItems.length
            : 0;

        return {
          ...plan,
          summary: {
            totalPlannedUnits,
            totalPlannedAmount,
            avgBuyPct,
            itemCount: plan._count.lineItems,
          },
        };
      });
    } catch (dbError) {
      console.error('Database error, using mock data:', dbError);
      // Use mock data when database is unavailable
      const filteredPlans = mockOTBPlans.filter(p => {
        if (budgetId && p.budgetId !== budgetId) return false;
        if (status && p.status !== status) return false;
        if (seasonId && p.budget?.season?.id !== seasonId) return false;
        if (brandId && p.budget?.brand?.id !== brandId) return false;
        return true;
      });

      plansWithSummary = filteredPlans.map(plan => ({
        ...plan,
        _count: { lineItems: plan.lineItems?.length || 0 },
        summary: {
          totalPlannedUnits: plan.totalPlannedQty || 0,
          totalPlannedAmount: plan.totalPlannedAmount || 0,
          avgMargin: plan.avgMargin || 0,
          itemCount: plan.lineItems?.length || 0,
        },
      }));
    }

    return NextResponse.json({
      success: true,
      data: plansWithSummary,
    });
  } catch (error) {
    console.error('Error fetching OTB plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch OTB plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = otbPlanCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { budgetId, name, versionType } = validation.data;

    // Check if budget exists and is approved
    const budget = await prisma.budgetAllocation.findUnique({
      where: { id: budgetId },
      include: {
        season: true,
        brand: true,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    if (budget.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Budget must be approved before creating OTB plan' },
        { status: 400 }
      );
    }

    // Get version number
    const existingPlans = await prisma.oTBPlan.count({
      where: { budgetId },
    });

    const plan = await prisma.oTBPlan.create({
      data: {
        budgetId,
        seasonId: budget.seasonId,
        brandId: budget.brandId,
        versionName: name,
        versionType,
        version: existingPlans + 1,
        totalOTBValue: 0,
        status: 'DRAFT',
        createdById: session.user.id,
      },
      include: {
        budget: {
          include: {
            season: true,
            brand: true,
            location: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        lineItems: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Error creating OTB plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create OTB plan' },
      { status: 500 }
    );
  }
}
