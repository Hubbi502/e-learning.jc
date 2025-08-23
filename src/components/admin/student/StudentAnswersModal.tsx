import React, { useState, useEffect } from 'react';
import { Student } from './types';

interface StudentAnswersModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

interface StudentWithAnswers extends Student {
  answers: Array<{
    id: string;
    answer: 'A' | 'B' | 'C' | 'D' | null;
    is_correct: boolean | null;
    created_at: string;
    question: {
      id: string;
      question_text: string;
      correct_option: 'A' | 'B' | 'C' | 'D';
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
    };
  }>;
}

export function StudentAnswersModal({ student, isOpen, onClose }: StudentAnswersModalProps) {
  const [studentWithAnswers, setStudentWithAnswers] = useState<StudentWithAnswers | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');

  useEffect(() => {
    if (isOpen && student.id) {
      fetchStudentAnswers();
    }
  }, [isOpen, student.id]);

  const fetchStudentAnswers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/students/${student.id}`);
      if (response.ok) {
        const data = await response.json();
        setStudentWithAnswers(data.student);
      }
    } catch (error) {
      console.error('Error fetching student answers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getOptionText = (question: any, option: 'A' | 'B' | 'C' | 'D') => {
    switch (option) {
      case 'A': return question.option_a;
      case 'B': return question.option_b;
      case 'C': return question.option_c;
      case 'D': return question.option_d;
      default: return '';
    }
  };

  const getFilteredAnswers = () => {
    if (!studentWithAnswers?.answers) return [];
    
    return studentWithAnswers.answers
      .filter(answer => {
        switch (filter) {
          case 'correct':
            return answer.is_correct === true;
          case 'incorrect':
            return answer.is_correct === false && answer.answer !== null;
          case 'unanswered':
            return answer.answer === null;
          default:
            return true;
        }
      })
      .sort((a, b) => a.question.question_text.localeCompare(b.question.question_text)); // Sort by question text for consistent ordering
  };

  const filteredAnswers = getFilteredAnswers();
  const stats = studentWithAnswers?.answers ? {
    total: studentWithAnswers.answers.length,
    correct: studentWithAnswers.answers.filter(a => a.is_correct === true).length,
    incorrect: studentWithAnswers.answers.filter(a => a.is_correct === false && a.answer !== null).length,
    unanswered: studentWithAnswers.answers.filter(a => a.answer === null).length
  } : { total: 0, correct: 0, incorrect: 0, unanswered: 0 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {student.name} - Jawaban Ujian
              </h2>
              <p className="text-sm text-gray-500">
                Melihat semua jawaban dan status benar/salah
              </p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
              title="Close"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-blue-700">Total Soal</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
                  <div className="text-sm text-green-700">Benar</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
                  <div className="text-sm text-red-700">Salah</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.unanswered}</div>
                  <div className="text-sm text-gray-700">Tidak Dijawab</div>
                </div>
              </div>

              {/* Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semua ({stats.total})
                </button>
                <button
                  onClick={() => setFilter('correct')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'correct'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Benar ({stats.correct})
                </button>
                <button
                  onClick={() => setFilter('incorrect')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'incorrect'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Salah ({stats.incorrect})
                </button>
                <button
                  onClick={() => setFilter('unanswered')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'unanswered'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tidak Dijawab ({stats.unanswered})
                </button>
              </div>

              {/* Answers List */}
              {filteredAnswers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Tidak ada jawaban untuk filter ini</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAnswers.map((answer, index) => (
                    <div
                      key={answer.id}
                      className={`border rounded-lg p-4 ${
                        answer.is_correct === true
                          ? 'border-green-200 bg-green-50'
                          : answer.is_correct === false && answer.answer !== null
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Soal #{index + 1}
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {answer.question.question_text}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {answer.is_correct === true && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Benar
                            </span>
                          )}
                          {answer.is_correct === false && answer.answer !== null && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ✗ Salah
                            </span>
                          )}
                          {answer.answer === null && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              - Tidak Dijawab
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Options */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">Pilihan Jawaban:</h5>
                          {(['A', 'B', 'C', 'D'] as const).map(option => {
                            const isCorrect = option === answer.question.correct_option;
                            const isStudentAnswer = option === answer.answer;
                            
                            let optionClasses = 'p-3 rounded-lg text-sm border transition-all ';
                            
                            if (isCorrect && isStudentAnswer) {
                              // Student got it right
                              optionClasses += 'border-green-400 bg-green-100 text-green-900 ring-2 ring-green-200';
                            } else if (isCorrect) {
                              // This is the correct answer
                              optionClasses += 'border-green-300 bg-green-50 text-green-800';
                            } else if (isStudentAnswer) {
                              // Student's wrong answer
                              optionClasses += 'border-red-400 bg-red-100 text-red-900 ring-2 ring-red-200';
                            } else {
                              // Regular option
                              optionClasses += 'border-gray-200 bg-white text-gray-700';
                            }
                            
                            return (
                              <div key={option} className={optionClasses}>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <span className="font-semibold">{option}.</span> {getOptionText(answer.question, option)}
                                  </div>
                                  <div className="flex space-x-1 ml-2">
                                    {isCorrect && (
                                      <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-green-700 bg-green-200 rounded-full">
                                        ✓ Benar
                                      </span>
                                    )}
                                    {isStudentAnswer && !isCorrect && (
                                      <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-red-700 bg-red-200 rounded-full">
                                        ✗ Pilihan Siswa
                                      </span>
                                    )}
                                    {isStudentAnswer && isCorrect && (
                                      <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-green-700 bg-green-200 rounded-full">
                                        ✓ Pilihan Siswa
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Answer Summary */}
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-gray-700">Ringkasan Jawaban:</h5>
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Jawaban Benar:</span>
                              <span className="text-sm font-semibold text-green-600">
                                {answer.question.correct_option}. {getOptionText(answer.question, answer.question.correct_option)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Jawaban Siswa:</span>
                              <span className={`text-sm font-semibold ${
                                answer.answer === null
                                  ? 'text-gray-500'
                                  : answer.is_correct
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}>
                                {answer.answer === null 
                                  ? 'Tidak dijawab' 
                                  : `${answer.answer}. ${getOptionText(answer.question, answer.answer)}`
                                }
                              </span>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <div className="flex items-center justify-center">
                                {answer.is_correct === true && (
                                  <span className="inline-flex items-center px-3 py-1 text-sm font-bold text-green-800 bg-green-200 rounded-full">
                                    ✓ Jawaban Benar
                                  </span>
                                )}
                                {answer.is_correct === false && answer.answer !== null && (
                                  <span className="inline-flex items-center px-3 py-1 text-sm font-bold text-red-800 bg-red-200 rounded-full">
                                    ✗ Jawaban Salah
                                  </span>
                                )}
                                {answer.answer === null && (
                                  <span className="inline-flex items-center px-3 py-1 text-sm font-bold text-gray-800 bg-gray-200 rounded-full">
                                    - Tidak Dijawab
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="inline-flex items-center px-6 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
