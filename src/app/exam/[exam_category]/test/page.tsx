"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Sun, Moon, Clock, BookOpen, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Flag, User, Trophy, Eye } from 'lucide-react';

interface Question {
  id: string;
  questionNumber: number;
  question_text: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  categories: string[];
}

interface StudentData {
  student: {
    id: string;
    name: string;
    class: string;
    exam_code: string;
    category: string;
  };
  exam: {
    id: string;
    exam_code: string;
    category: string;
    duration: number;
    start_time: string | null;
    end_time: string | null;
  };
}

export default function ExamTestPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.exam_category as string;

  const [isDark, setIsDark] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set<number>());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toggleTheme = () => setIsDark(!isDark);

  // Load student data and questions on component mount
  useEffect(() => {
    const loadExamData = async () => {
      try {
        // Get student data from localStorage
        const storedData = localStorage.getItem('studentData');
        if (!storedData) {
          router.push(`/exam/${category}`);
          return;
        }

        const data: StudentData = JSON.parse(storedData);
        setStudentData(data);

        // Set timer based on exam duration
        setTimeLeft(data.exam.duration * 60); // Convert minutes to seconds

        // Fetch questions
        const response = await fetch(`/api/student/questions/${data.student.category}`);
        const questionsData = await response.json();

        if (questionsData.success) {
          setQuestions(questionsData.questions);
          setExamStarted(true);
        } else {
          setError(questionsData.message);
        }
      } catch (error) {
        console.error('Error loading exam data:', error);
        setError('Failed to load exam data');
      } finally {
        setLoading(false);
      }
    };

    loadExamData();
  }, [category, router]);

  // Timer countdown
  useEffect(() => {
    if (examStarted && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleFlagQuestion = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const handleSubmitExam = async () => {
    if (!studentData || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Prepare answers in the format expected by the API
      const formattedAnswers = questions.map(question => ({
        questionId: question.id,
        selectedOption: answers[question.id] || 'A' // Default to A if no answer selected
      }));

      const response = await fetch('/api/student/submit-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentData.student.id,
          examCode: studentData.student.exam_code,
          answers: formattedAnswers
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowResults(true);
        // Store results for display
        localStorage.setItem('examResults', JSON.stringify(result.result));
        // Clear student data
        localStorage.removeItem('studentData');
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Submit exam error:', error);
      setError('Failed to submit exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getProgressPercentage = () => {
    return (getAnsweredCount() / questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/exam/${category}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const results = JSON.parse(localStorage.getItem('examResults') || '{}');
    return <ExamResults results={results} isDark={isDark} toggleTheme={toggleTheme} />;
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      
      {/* Header */}
      <div className={`sticky top-0 z-50 backdrop-blur-lg border-b ${
        isDark 
          ? 'bg-slate-900/90 border-purple-500/20' 
          : 'bg-white/90 border-blue-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          
          {/* Desktop and Tablet Layout */}
          <div className="hidden sm:flex items-center justify-between">
            
            {/* Logo and Info */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className={`text-lg lg:text-xl font-bold ${
                isDark ? 'text-purple-300' : 'text-blue-600'
              }`}>
                <span className="text-xl lg:text-2xl mr-1 lg:mr-2">学</span>
                LearnJP
              </div>
              <div className={`text-xs lg:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} hidden md:block`}>
                {studentData?.student.name} - {studentData?.student.class}
              </div>
            </div>

            {/* Timer and Progress */}
            <div className="flex items-center space-x-3 lg:space-x-6">
              <div className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-xl ${
                timeLeft < 300 
                  ? 'bg-red-500/20 text-red-600' 
                  : isDark 
                    ? 'bg-purple-800/30 text-purple-300' 
                    : 'bg-blue-100 text-blue-600'
              }`}>
                <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="font-mono font-semibold text-sm lg:text-base">
                  {formatTime(timeLeft)}
                </span>
              </div>

              <div className={`text-xs lg:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} hidden lg:block`}>
                {getAnsweredCount()}/{questions.length} answered
              </div>

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  isDark 
                    ? 'bg-purple-800 text-yellow-300 hover:bg-purple-700' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden">
            {/* Top Row - Logo and Theme Toggle */}
            <div className="flex items-center justify-between mb-3">
              <div className={`text-lg font-bold ${
                isDark ? 'text-purple-300' : 'text-blue-600'
              }`}>
                <span className="text-xl mr-1">学</span>
                LearnJP
              </div>
              
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isDark 
                    ? 'bg-purple-800 text-yellow-300' 
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>

            {/* Second Row - Student Info and Timer */}
            <div className="flex items-center justify-between mb-3">
              <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} truncate flex-1 mr-3`}>
                {studentData?.student.name} - {studentData?.student.class}
              </div>
              
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                timeLeft < 300 
                  ? 'bg-red-500/20 text-red-600' 
                  : isDark 
                    ? 'bg-purple-800/30 text-purple-300' 
                    : 'bg-blue-100 text-blue-600'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold text-sm">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Third Row - Progress Info */}
            <div className="flex items-center justify-center">
              <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {getAnsweredCount()}/{questions.length} questions answered
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 sm:mt-4">
            <div className={`w-full bg-gray-200 rounded-full h-1.5 sm:h-2 ${
              isDark ? 'bg-slate-700' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  isDark ? 'bg-purple-500' : 'bg-blue-500'
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Question Panel */}
          <div className="lg:col-span-3 order-1">
            {currentQ && (
              <QuestionContent 
                question={currentQ}
                selectedAnswer={answers[currentQ.id]}
                onAnswerSelect={handleAnswerSelect}
                isDark={isDark}
                questionNumber={currentQuestion + 1}
                totalQuestions={questions.length}
                isFlagged={flaggedQuestions.has(currentQuestion)}
                onFlag={handleFlagQuestion}
              />
            )}
          </div>

          {/* Navigation Panel */}
          <div className="lg:col-span-1 order-2 lg:order-2">
            <NavigationPanel 
              questions={questions}
              answers={answers}
              currentQuestion={currentQuestion}
              onQuestionSelect={setCurrentQuestion}
              flaggedQuestions={flaggedQuestions}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              currentQuestion === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDark
                  ? 'bg-purple-700 text-white hover:bg-purple-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Previous</span>
          </button>

          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Submit Exam</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isDark
                    ? 'bg-purple-700 text-white hover:bg-purple-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <span className="text-sm sm:text-base">Next</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Question Content Component
function QuestionContent({ 
  question, 
  selectedAnswer, 
  onAnswerSelect, 
  isDark, 
  questionNumber, 
  totalQuestions,
  isFlagged,
  onFlag 
}: {
  question: Question;
  selectedAnswer: string;
  onAnswerSelect: (questionId: string, optionId: string) => void;
  isDark: boolean;
  questionNumber: number;
  totalQuestions: number;
  isFlagged: boolean;
  onFlag: () => void;
}) {
  return (
    <div className={`backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border ${
      isDark 
        ? 'bg-slate-800/30 border-purple-500/20' 
        : 'bg-white/80 border-blue-200/50'
    }`}>
      
      {/* Question Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className={`text-xs sm:text-sm font-medium ${
          isDark ? 'text-purple-300' : 'text-blue-600'
        }`}>
          Question {questionNumber} of {totalQuestions}
        </div>
        
        <button
          onClick={onFlag}
          className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${
            isFlagged
              ? 'bg-yellow-500 text-white'
              : isDark
                ? 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Question Text */}
      <div className={`text-lg sm:text-xl font-semibold mb-6 sm:mb-8 leading-relaxed ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {question.question_text}
      </div>

      {/* Options */}
      <div className="space-y-3 sm:space-y-4">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onAnswerSelect(question.id, option.id)}
            className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedAnswer === option.id
                ? isDark
                  ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                  : 'border-blue-500 bg-blue-50 text-blue-900'
                : isDark
                  ? 'border-slate-600 bg-slate-700/30 text-gray-300 hover:border-purple-400 active:bg-slate-600/40'
                  : 'border-gray-200 bg-white/50 text-gray-700 hover:border-blue-300 active:bg-blue-50/70'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedAnswer === option.id
                  ? isDark
                    ? 'border-purple-400 bg-purple-500'
                    : 'border-blue-500 bg-blue-500'
                  : isDark
                    ? 'border-slate-500'
                    : 'border-gray-300'
              }`}>
                {selectedAnswer === option.id && (
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-sm sm:text-base">{option.id}.</span>
                <span className="ml-2 text-sm sm:text-base break-words">{option.text}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Navigation Panel Component
function NavigationPanel({
  questions,
  answers,
  currentQuestion,
  onQuestionSelect,
  flaggedQuestions,
  isDark
}: {
  questions: Question[];
  answers: Record<string, string>;
  currentQuestion: number;
  onQuestionSelect: (index: number) => void;
  flaggedQuestions: Set<number>;
  isDark: boolean;
}) {
  return (
    <div className={`backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border ${
      isDark 
        ? 'bg-slate-800/30 border-purple-500/20' 
        : 'bg-white/80 border-blue-200/50'
    }`}>
      
      <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        Question Navigator
      </h3>

      <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-5 gap-1.5 sm:gap-2">
        {questions.map((question, index) => {
          const isAnswered = answers[question.id];
          const isCurrent = index === currentQuestion;
          const isFlagged = flaggedQuestions.has(index);

          return (
            <button
              key={question.id}
              onClick={() => onQuestionSelect(index)}
              className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 ${
                isCurrent
                  ? isDark
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : isAnswered
                    ? isDark
                      ? 'bg-green-600 text-white'
                      : 'bg-green-500 text-white'
                    : isDark
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 active:bg-slate-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-300'
              }`}
            >
              {index + 1}
              {isFlagged && (
                <Flag className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${
            isDark ? 'bg-slate-700' : 'bg-gray-200'
          }`}></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Not answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <Flag className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Flagged</span>
        </div>
      </div>
    </div>
  );
}

// Exam Results Component
function ExamResults({ 
  results, 
  isDark, 
  toggleTheme 
}: { 
  results: any; 
  isDark: boolean; 
  toggleTheme: () => void; 
}) {
  const router = useRouter();

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-green-50 via-white to-blue-50'
    }`}>
      
      {/* Header */}
      <div className={`backdrop-blur-lg border-b ${
        isDark 
          ? 'bg-slate-900/90 border-purple-500/20' 
          : 'bg-white/90 border-green-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className={`text-xl font-bold ${
              isDark ? 'text-purple-300' : 'text-green-600'
            }`}>
              <span className="text-2xl mr-2">学</span>
              LearnJP
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                isDark 
                  ? 'bg-purple-800 text-yellow-300 hover:bg-purple-700' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          
          {/* Success Icon */}
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 ${
            results.passed
              ? 'bg-green-500'
              : 'bg-red-500'
          }`}>
            {results.passed ? (
              <Trophy className="w-12 h-12 text-white" />
            ) : (
              <AlertCircle className="w-12 h-12 text-white" />
            )}
          </div>

          {/* Results */}
          <h1 className={`text-4xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Exam {results.passed ? 'Completed!' : 'Submitted'}
          </h1>

          <p className={`text-xl mb-8 ${
            results.passed
              ? 'text-green-600'
              : 'text-red-600'
          }`}>
            {results.passed ? 'Congratulations! You passed the exam.' : 'Unfortunately, you did not pass this time.'}
          </p>

          {/* Score Display */}
          <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl border mb-8 ${
            isDark 
              ? 'bg-slate-800/30 border-purple-500/20' 
              : 'bg-white/80 border-green-200/50'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  isDark ? 'text-purple-300' : 'text-blue-600'
                }`}>
                  {results.score}
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Correct Answers
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  isDark ? 'text-purple-300' : 'text-blue-600'
                }`}>
                  {results.totalQuestions}
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Questions
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  results.passed ? 'text-green-500' : 'text-red-500'
                }`}>
                  {results.percentage}%
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Final Score
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => router.push('/')}
            className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 ${
              results.passed
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
