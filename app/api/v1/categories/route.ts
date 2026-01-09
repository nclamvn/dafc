import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { categorySchema } from '@/lib/validations/category';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const categories = await prisma.category.findMany({
      where,
      include: {
        subcategories: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { subcategories: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    const existingCategory = await prisma.category.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category code already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        code: validatedData.code,
        description: validatedData.description || null,
        isActive: validatedData.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    if (error && typeof error === 'object' && 'errors' in error) {
      return NextResponse.json(
        { success: false, error: 'Validation failed' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
