import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/config/prisma';
import { Category } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Helper function to handle Prisma errors
function handlePrismaError(error: unknown) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P1001') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database connection failed. Please try again later.',
          error: 'Connection timeout'
        },
        { status: 503 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Material not found' },
        { status: 404 }
      );
    }
  }
  
  console.error('Database error:', error);
  return NextResponse.json(
    { 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    },
    { status: 500 }
  );
}

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
    return handlePrismaError(error);
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
    return handlePrismaError(error);
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
    return handlePrismaError(error);
  }
}
