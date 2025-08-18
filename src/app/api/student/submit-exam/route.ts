import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prisma";
import { Option } from "@prisma/client";

interface SubmitExamData {
  studentId: string;
  examCode: string;
  answers: Array<{
    questionId: string;
    selectedOption: 'A' | 'B' | 'C' | 'D';
  }>;
  violations?: number;
  autoSubmitted?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { studentId, examCode, answers, violations = 0, autoSubmitted = false }: SubmitExamData = await request.json();

    // Validasi input
    if (!studentId || !examCode || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Student ID, exam code, and answers are required" 
        },
        { status: 400 }
      );
    }

    // Cek student
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Student not found" 
        },
        { status: 404 }
      );
    }

    if (student.exam_code !== examCode) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid exam code for this student" 
        },
        { status: 400 }
      );
    }

    if (student.is_submitted) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Exam already submitted" 
        },
        { status: 400 }
      );
    }

    // Cek exam
    const exam = await prisma.exam.findUnique({
      where: { exam_code: examCode }
    });

    if (!exam) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Exam not found" 
        },
        { status: 404 }
      );
    }

    // Get all questions with their correct answers
    const questionIds = answers.map(a => a.questionId);
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        question_categories: {
          some: {
            category: student.category
          }
        }
      },
      include: {
        question_categories: true
      }
    });

    if (questions.length !== answers.length) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Some questions not found or invalid for this category" 
        },
        { status: 400 }
      );
    }

    // Calculate score
    let correctAnswers = 0;
    interface AnswerData {
        student_id: string;
        question_id: string;
        answer: Option;
        is_correct: boolean;
    }

    const answerData: AnswerData[] = [];

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      const isCorrect = question.correct_option === answer.selectedOption;
      if (isCorrect) correctAnswers++;

      answerData.push({
        student_id: studentId,
        question_id: answer.questionId,
        answer: answer.selectedOption as Option,
        is_correct: isCorrect
      });
    }

    const totalQuestions = questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Insert answers
      await tx.answer.createMany({
        data: answerData
      });

      // Insert score
      const score = await tx.score.create({
        data: {
          student_id: studentId,
          exam_id: exam.id,
          score: correctAnswers,
          total_questions: totalQuestions,
          percentage: percentage
        }
      });

      // Update student as submitted with violations count
      const updatedStudent = await tx.student.update({
        where: { id: studentId },
        data: {
          is_submitted: true,
          violations: violations
        }
      });

      return { score, updatedStudent };
    });

    return NextResponse.json({
      success: true,
      message: autoSubmitted 
        ? "Exam auto-submitted due to violations!" 
        : "Exam submitted successfully!",
      result: {
        score: correctAnswers,
        totalQuestions: totalQuestions,
        percentage: percentage,
        passed: percentage >= 70, // Assuming 70% is passing grade
        violations: violations,
        autoSubmitted: autoSubmitted,
        student: result.updatedStudent
      }
    });

  } catch (error) {
    console.error("Submit exam error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
