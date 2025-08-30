import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/config/prisma';
import { Category } from '@prisma/client';

// GET all materials for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as Category | null;
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // 'published', 'draft', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status && status !== 'all') {
      where.is_published = status === 'published';
    }

    // Get materials with author info
    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
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
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new material
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, description, is_published, author_id } = body;

    // Validate required fields
    if (!title || !content || !category || !author_id) {
      return NextResponse.json(
        { success: false, message: 'Title, content, category, and author_id are required' },
        { status: 400 }
      );
    }

    // Validate category
    if (!Object.values(Category).includes(category)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category' },
        { status: 400 }
      );
    }

    // Check if author exists
    const author = await prisma.adminUser.findUnique({
      where: { id: author_id }
    });

    if (!author) {
      return NextResponse.json(
        { success: false, message: 'Author not found' },
        { status: 404 }
      );
    }

    // Create material
    const material = await prisma.material.create({
      data: {
        title,
        content,
        category,
        description: description || null,
        is_published: is_published || false,
        author_id
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
      message: 'Material created successfully',
      data: material
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
