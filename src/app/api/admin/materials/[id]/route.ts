import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/config/prisma';
import { Category } from '@prisma/client';

// GET single material
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    if (!material) {
      return NextResponse.json(
        { success: false, message: 'Material not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: material
    });

  } catch (error) {
    console.error('Error fetching material:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update material
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, category, description, is_published } = body;

    // Check if material exists
    const existingMaterial = await prisma.material.findUnique({
      where: { id }
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { success: false, message: 'Material not found' },
        { status: 404 }
      );
    }

    // Validate category if provided
    if (category && !Object.values(Category).includes(category)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category' },
        { status: 400 }
      );
    }

    // Update material
    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(is_published !== undefined && { is_published })
      },
      include: {
        author: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Material updated successfully',
      data: updatedMaterial
    });

  } catch (error) {
    console.error('Error updating material:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE material
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if material exists
    const existingMaterial = await prisma.material.findUnique({
      where: { id }
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { success: false, message: 'Material not found' },
        { status: 404 }
      );
    }

    // Delete material
    await prisma.material.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Material deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
