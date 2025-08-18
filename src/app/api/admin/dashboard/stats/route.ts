import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get basic counts
    const [totalQuestions, totalExams, totalStudents, activeExams] = await Promise.all([
      prisma.question.count(),
      prisma.exam.count(),
      prisma.student.count(),
      prisma.exam.count({
        where: {
          is_active: true,
          start_time: { lte: new Date() },
          end_time: { gte: new Date() }
        }
      })
    ]);

    // Get top students
    const studentsWithScores = await prisma.student.findMany({
      include: {
        scores: {
          include: {
            exam: true
          }
        }
      }
    });

    const topStudents = studentsWithScores
      .map(student => {
        if (student.scores.length === 0) return null;
        
        const totalScore = student.scores.reduce((sum, score) => sum + Number(score.percentage), 0);
        const averageScore = totalScore / student.scores.length;
        
        return {
          id: student.id,
          name: student.name,
          class: student.class,
          averageScore,
          totalExams: student.scores.length
        };
      })
      .filter(student => student !== null)
      .sort((a, b) => b!.averageScore - a!.averageScore)
      .slice(0, 5);

    // Get recent activity
    const recentExams = await prisma.exam.findMany({
      take: 3,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        exam_code: true,
        category: true,
        created_at: true
      }
    });

    const recentStudents = await prisma.student.findMany({
      take: 3,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        created_at: true
      }
    });

    const recentQuestions = await prisma.question.findMany({
      take: 2,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        question_text: true,
        created_at: true
      }
    });

    const recentActivity = [
      ...recentExams.map(exam => ({
        id: exam.id,
        type: 'exam' as const,
        message: `New ${exam.category} exam created (${exam.exam_code})`,
        timestamp: exam.created_at.toISOString()
      })),
      ...recentStudents.map(student => ({
        id: student.id,
        type: 'student' as const,
        message: `Student ${student.name} registered`,
        timestamp: student.created_at.toISOString()
      })),
      ...recentQuestions.map(question => ({
        id: question.id,
        type: 'question' as const,
        message: `New question added: ${question.question_text.substring(0, 50)}...`,
        timestamp: question.created_at.toISOString()
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 8);

    return NextResponse.json({
      totalQuestions,
      totalExams,
      totalStudents,
      activeExams,
      topStudents,
      recentActivity
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch dashboard stats" 
      },
      { status: 500 }
    );
  }
}
