import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";
import { Category } from "@prisma/client";

// GET all students
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as Category | null;
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // 'submitted', 'in-progress', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { class: { contains: search, mode: 'insensitive' } },
        { exam_code: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status === 'submitted') {
      where.is_submitted = true;
    } else if (status === 'in-progress') {
      where.is_submitted = false;
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          scores: {
            include: {
              exam: {
                select: {
                  id: true,
                  category: true,
                  created_at: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.student.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get students error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch students" 
      },
      { status: 500 }
    );
  }
}
