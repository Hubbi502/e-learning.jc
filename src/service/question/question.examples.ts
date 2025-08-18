// Example usage of the question service with validation

import questionService from "./question";
import { Category, Option } from "@prisma/client";

// Example: Creating a question
async function createQuestionExample() {
  const questionData = {
    category: Category.Gengo,
    question_text: "What is the meaning of 'arigatou gozaimasu'?",
    option_a: "Good morning",
    option_b: "Thank you very much",
    option_c: "Good evening",
    option_d: "You're welcome",
    correct_option: Option.B
  };

  const result = await questionService.create(questionData);
  
  if (result.success) {
    console.log("Question created:", result.data);
  } else {
    console.error("Error creating question:", result.error);
  }
}

// Example: Getting questions with filtering and pagination
async function getQuestionsExample() {
  const result = await questionService.getAll({
    filter: {
      category: Category.Gengo,
      question_text: "arigatou"
    },
    skip: 0,
    take: 10,
    orderBy: { created_at: 'desc' },
    includeAnswers: false
  });

  if (result.success) {
    console.log("Questions:", result.data);
    console.log("Pagination:", result.pagination);
  } else {
    console.error("Error fetching questions:", result.error);
  }
}

// Example: Updating a question
async function updateQuestionExample(questionId: string) {
  const updateData = {
    question_text: "What does 'arigatou gozaimasu' mean?",
    option_a: "Good morning",
    option_b: "Thank you very much",
    option_c: "Good night",
    option_d: "Excuse me"
  };

  const result = await questionService.update(questionId, updateData);
  
  if (result.success) {
    console.log("Question updated:", result.data);
  } else {
    console.error("Error updating question:", result.error);
  }
}

// Example: Getting random questions for an exam
async function getRandomQuestionsExample() {
  const result = await questionService.getRandomQuestions({
    category: Category.Gengo,
    count: 10
  });

  if (result.success) {
    console.log("Random questions for exam:", result.data);
  } else {
    console.error("Error getting random questions:", result.error);
  }
}

// Example: Searching questions
async function searchQuestionsExample() {
  const result = await questionService.searchQuestions("arigatou", {
    category: Category.Gengo,
    skip: 0,
    take: 5
  });

  if (result.success) {
    console.log("Search results:", result.data);
    console.log("Pagination:", result.pagination);
  } else {
    console.error("Error searching questions:", result.error);
  }
}

// Example: Getting question statistics
async function getStatisticsExample() {
  const result = await questionService.getStatistics();
  
  if (result.success) {
    console.log("Question statistics:", result.data);
  } else {
    console.error("Error getting statistics:", result.error);
  }
}

// Example: Validation error handling
async function validationErrorExample() {
  // This will fail validation
  const invalidData = {
    category: "InvalidCategory", // Invalid enum value
    question_text: "Hi", // Too short (min 10 characters)
    option_a: "", // Empty string
    option_b: "B",
    option_c: "C",
    option_d: "D",
    correct_option: "Z" // Invalid option
  };

  const result = await questionService.create(invalidData);
  
  if (!result.success) {
    console.log("Validation error (expected):", result.error);
  }
}

export {
  createQuestionExample,
  getQuestionsExample,
  updateQuestionExample,
  getRandomQuestionsExample,
  searchQuestionsExample,
  getStatisticsExample,
  validationErrorExample
};
