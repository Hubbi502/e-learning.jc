import { Category } from "@prisma/client";
import prisma from "@/config/prisma";

/**
 * Generate a unique exam code based on category and year
 * Format: GNG-2025-001 for Gengo, BNK-2025-001 for Bunka
 */
export async function generateExamCode(category: Category): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = category === 'Gengo' ? 'GNG' : 'BNK';
  
  // Get the count of exams for this category in the current year
  const examCount = await prisma.exam.count({
    where: {
      category,
      created_at: {
        gte: new Date(currentYear, 0, 1), // Start of year
        lt: new Date(currentYear + 1, 0, 1), // Start of next year
      }
    }
  });
  
  // Generate the next sequential number (zero-padded to 3 digits)
  const sequenceNumber = (examCount + 1).toString().padStart(3, '0');
  
  // Format: PREFIX-YEAR-SEQUENCE
  const examCode = `${prefix}-${currentYear}-${sequenceNumber}`;
  
  // Check if this code already exists (safety check)
  const existingExam = await prisma.exam.findUnique({
    where: { exam_code: examCode }
  });
  
  if (existingExam) {
    // If it exists, increment and try again
    const nextSequence = (examCount + 2).toString().padStart(3, '0');
    return `${prefix}-${currentYear}-${nextSequence}`;
  }
  
  return examCode;
}

/**
 * Validate exam code format
 */
export function validateExamCode(examCode: string): boolean {
  const examCodeRegex = /^(GNG|BNK)-\d{4}-\d{3}$/;
  return examCodeRegex.test(examCode);
}

/**
 * Parse exam code to extract category and year
 */
export function parseExamCode(examCode: string): { category: Category; year: number; sequence: number } | null {
  if (!validateExamCode(examCode)) {
    return null;
  }
  
  const parts = examCode.split('-');
  const prefix = parts[0];
  const year = parseInt(parts[1]);
  const sequence = parseInt(parts[2]);
  
  const category: Category = prefix === 'GNG' ? 'Gengo' : 'Bunka';
  
  return { category, year, sequence };
}
