import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { categorySchema } from '@/lib/validations/category';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (validatedData.code !== existingCategory.code) {
      const codeExists = await prisma.category.findUnique({
        where: { code: validatedData.code },
      });

      if (codeExists) {
        return NextResponse.json(
          { success: false, error: 'Category code already exists' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
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
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Category deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
