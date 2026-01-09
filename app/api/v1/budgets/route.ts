import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { mockBudgets } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');
    const brandId = searchParams.get('brandId');
    const locationId = searchParams.get('locationId');
    const status = searchParams.get('status');

    let budgets;

    try {
      const where = {
        ...(seasonId && { seasonId }),
        ...(brandId && { brandId }),
        ...(locationId && { locationId }),
        ...(status && { status: status as 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REVISED' | 'REJECTED' }),
      };

      budgets = await prisma.budgetAllocation.findMany({
        where,
        include: {
          season: true,
          brand: true,
          location: true,
          createdBy: { select: { id: true, name: true, email: true } },
          approvedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: [{ createdAt: 'desc' }],
      });
    } catch (dbError) {
      console.error('Database error, using mock data:', dbError);
      // Use mock data when database is unavailable
      budgets = mockBudgets.filter(b => {
        if (seasonId && b.seasonId !== seasonId) return false;
        if (brandId && b.brandId !== brandId) return false;
        if (locationId && b.locationId !== locationId) return false;
        if (status && b.status !== status) return false;
        return true;
      });
    }

    // Calculate summary
    const summary = {
      totalBudget: budgets.reduce((sum, b) => sum + Number(b.totalBudget), 0),
      approvedBudget: budgets
        .filter((b) => b.status === 'APPROVED')
        .reduce((sum, b) => sum + Number(b.totalBudget), 0),
      pendingBudget: budgets
        .filter((b) => ['SUBMITTED', 'UNDER_REVIEW'].includes(b.status))
        .reduce((sum, b) => sum + Number(b.totalBudget), 0),
      count: budgets.length,
    };

    return NextResponse.json({
      success: true,
      data: budgets,
      summary,
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budgets' },
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
    const {
      seasonId,
      brandId,
      locationId,
      totalBudget,
      seasonalBudget,
      replenishmentBudget,
      currency,
      comments,
      assumptions,
    } = body;

    // Check if budget already exists for this combination
    const existing = await prisma.budgetAllocation.findFirst({
      where: {
        seasonId,
        brandId,
        locationId,
        status: { notIn: ['REJECTED'] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Budget already exists for this season/brand/location' },
        { status: 400 }
      );
    }

    const budget = await prisma.budgetAllocation.create({
      data: {
        seasonId,
        brandId,
        locationId,
        totalBudget,
        seasonalBudget,
        replenishmentBudget,
        currency: currency || 'USD',
        comments,
        assumptions,
        status: 'DRAFT',
        version: 1,
        createdById: session.user.id,
      },
      include: {
        season: true,
        brand: true,
        location: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: budget,
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
