import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/config/prisma';

// GET single published material for public access
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const material = await prisma.material.findFirst({
      where: { 
        id,
        is_published: true 
      },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        description: true,
        created_at: true,
        updated_at: true,
        author: {
          select: {
            email: true
          }
        }
      }
    });

    if (!material) {
      return NextResponse.json(
        { success: false, message: 'Material not found or not published' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: material
    });

  } catch (error) {
    console.error('Error fetching public material:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
