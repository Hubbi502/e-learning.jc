import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/config/prisma';
import { Category } from '@prisma/client';

// GET published materials for public access
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as Category | null;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const where: any = {
      is_published: true
    };
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get published materials
    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
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
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.material.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        materials,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching public materials:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
