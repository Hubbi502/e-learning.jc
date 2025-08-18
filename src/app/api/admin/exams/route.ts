import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";
import { Category } from "@prisma/client";
import { generateExamCode } from "@/utils/examCodeGenerator";

// GET all exams
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as Category | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    
    if (category) {
      where.category = category;
    }

    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        include: {
          _count: {
            select: {
              scores: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.exam.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      exams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get exams error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch exams" 
      },
      { status: 500 }
    );
  }
}

// POST create new exam
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category,
      duration,
      start_time,
      end_time
    } = body;

    // Basic validation
    if (!category || !duration) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Category and duration are required" 
        },
        { status: 400 }
      );
    }

    // Validate category
    if (!Object.values(Category).includes(category)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid category" 
        },
        { status: 400 }
      );
    }

    // Validate duration
    if (duration < 1 || duration > 180) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Duration must be between 1 and 180 minutes" 
        },
        { status: 400 }
      );
    }

    // Validate times if provided
    if (start_time && end_time) {
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { 
            success: false, 
            message: "End time must be after start time" 
          },
          { status: 400 }
        );
      }
    }

    // Generate unique exam code
    const examCode = await generateExamCode(category);

    const examData: any = {
      exam_code: examCode,
      category,
      duration
    };

    if (start_time) {
      examData.start_time = new Date(start_time);
    }

    if (end_time) {
      examData.end_time = new Date(end_time);
    }

    const exam = await prisma.exam.create({
      data: examData,
      include: {
        _count: {
          select: {
            scores: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Exam created successfully",
      exam
    });

  } catch (error) {
    console.error("Create exam error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create exam" 
      },
      { status: 500 }
    );
  }
}
