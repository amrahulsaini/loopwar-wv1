'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, XCircle, RotateCcw, Zap, Brain, FileText, CheckSquare } from 'lucide-react';
import './quiz.css';

interface QuizQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'logical_thinking' | 'fill_blanks';
  question: string;
  options?: string[];
  correct_answer: string | boolean | string[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  topic: string;
  subtopic: string;
  sort_order: number;
  questions: QuizQuestion[];
  total_points: number;
  time_limit?: number;
  created_at: string;
  is_ai_generated: boolean;
}

interface UserAnswer {
  questionId: string;
  answer: string | boolean | string[];
  isCorrect: boolean;
  timeTaken: number;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { category, topic, subtopic, sortOrder } = params;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | string[]>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quiz/${category}/${topic}/${subtopic}/${sortOrder}`);
      
      if (response.status === 404) {
        // Quiz not found, show generation option
        setQuiz(null);
      } else if (response.ok) {
        const quizData = await response.json();
        setQuiz(quizData);
        if (quizData.time_limit) {
          setTimeLeft(quizData.time_limit * 60); // Convert minutes to seconds
        }
      } else {
        throw new Error('Failed to fetch quiz');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  }, [category, topic, subtopic, sortOrder]);

  // Fetch quiz data
  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  // Timer effect
  useEffect(() => {
    if (quiz && quiz.time_limit && timeLeft > 0 && !isQuizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz?.time_limit && !isQuizCompleted) {
      handleQuizSubmit();
    }
  }, [timeLeft, quiz, isQuizCompleted]);

  const generateQuizWithAI = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          topic,
          subtopic,
          sortOrder: parseInt(sortOrder as string),
        }),
      });

      if (response.ok) {
        const generatedQuiz = await response.json();
        setQuiz(generatedQuiz);
        if (generatedQuiz.time_limit) {
          setTimeLeft(generatedQuiz.time_limit * 60);
        }
      } else {
        throw new Error('Failed to generate quiz');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (answer: string | boolean | string[]) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const timeTaken = Date.now() - questionStartTime;
    const isCorrect = checkAnswer(currentQuestion, selectedAnswer);

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      isCorrect,
      timeTaken,
    };

    setUserAnswers([...userAnswers, userAnswer]);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      handleQuizSubmit();
    }
  };

  const handleShowExplanation = () => {
    setShowExplanation(true);
  };

  const checkAnswer = (question: QuizQuestion, answer: string | boolean | string[]): boolean => {
    switch (question.type) {
      case 'mcq':
        return answer === question.correct_answer;
      case 'true_false':
        return answer === question.correct_answer;
      case 'fill_blanks':
        if (Array.isArray(answer) && Array.isArray(question.correct_answer)) {
          return JSON.stringify(answer.sort()) === JSON.stringify(question.correct_answer.sort());
        }
        return false;
      case 'logical_thinking':
        return answer === question.correct_answer;
      default:
        return false;
    }
  };

  const handleQuizSubmit = async () => {
    if (!quiz) return;

    setIsQuizCompleted(true);

    // Calculate final score
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    const totalPoints = userAnswers.reduce((total, answer, index) => {
      return total + (answer.isCorrect ? quiz.questions[index]?.points || 0 : 0);
    }, 0);

    // Save quiz result to database
    try {
      await fetch('/api/quiz/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quiz.id,
          userAnswers,
          score: totalPoints,
          totalQuestions: quiz.questions.length,
          correctAnswers,
          timeSpent: quiz.time_limit ? (quiz.time_limit * 60 - timeLeft) : null,
        }),
      });
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer('');
    setShowExplanation(false);
    setIsQuizCompleted(false);
    setQuestionStartTime(Date.now());
    if (quiz?.time_limit) {
      setTimeLeft(quiz.time_limit * 60);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq':
        return <CheckCircle className="quiz-question-type-icon" />;
      case 'true_false':
        return <CheckSquare className="quiz-question-type-icon" />;
      case 'logical_thinking':
        return <Brain className="quiz-question-type-icon" />;
      case 'fill_blanks':
        return <FileText className="quiz-question-type-icon" />;
      default:
        return <CheckCircle className="quiz-question-type-icon" />;
    }
  };

  const renderQuestionContent = (question: QuizQuestion) => {
    switch (question.type) {
      case 'mcq':
        return (
          <div className="quiz-options-grid">
            {question.options?.map((option, index) => (
              <button
                key={index}
                className={`quiz-option ${selectedAnswer === option ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(option)}
                disabled={showExplanation}
              >
                <span className="quiz-option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="quiz-option-text">{option}</span>
              </button>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="quiz-true-false-grid">
            <button
              className={`quiz-tf-option ${selectedAnswer === true ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(true)}
              disabled={showExplanation}
            >
              <CheckCircle className="quiz-tf-icon" />
              True
            </button>
            <button
              className={`quiz-tf-option ${selectedAnswer === false ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(false)}
              disabled={showExplanation}
            >
              <XCircle className="quiz-tf-icon" />
              False
            </button>
          </div>
        );

      case 'fill_blanks':
        const blanks = question.question.split('_____');
        return (
          <div className="quiz-fill-blanks">
            <div className="quiz-question-with-blanks">
              {blanks.map((part, index) => (
                <React.Fragment key={index}>
                  {part}
                  {index < blanks.length - 1 && (
                    <input
                      type="text"
                      className="quiz-blank-input"
                      placeholder={`Blank ${index + 1}`}
                      disabled={showExplanation}
                      onChange={(e) => {
                        const newAnswers = Array.isArray(selectedAnswer) ? [...selectedAnswer] : [];
                        newAnswers[index] = e.target.value;
                        handleAnswerSelect(newAnswers);
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );

      case 'logical_thinking':
        return (
          <div className="quiz-logical-thinking">
            <textarea
              className="quiz-logical-answer"
              placeholder="Enter your logical reasoning and answer here..."
              value={selectedAnswer as string}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              disabled={showExplanation}
              rows={4}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="quiz-loading">
          <div className="quiz-loading-spinner"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <button 
            onClick={() => router.back()} 
            className="quiz-back-button"
          >
            <ArrowLeft className="quiz-back-icon" />
            Back to Topic
          </button>
        </div>

        <div className="quiz-not-found">
          <div className="quiz-not-found-content">
            <Zap className="quiz-not-found-icon" />
            <h2>No Quiz Available</h2>
            <p>There&apos;s no pre-generated quiz for this topic yet. Would you like to generate one using AI?</p>
            
            <button 
              onClick={generateQuizWithAI}
              disabled={isGenerating}
              className="quiz-generate-button"
            >
              {isGenerating ? (
                <>
                  <div className="quiz-loading-spinner small"></div>
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Zap className="quiz-generate-icon" />
                  Generate Quiz with AI
                </>
              )}
            </button>

            <div className="quiz-generation-info">
              <h3>What will be generated?</h3>
              <ul>
                <li>🧠 Multiple Choice Questions</li>
                <li>✅ True/False Questions</li>
                <li>🤔 Logical Thinking Problems</li>
                <li>📝 Fill in the Blanks</li>
                <li>⏱️ Timed challenges</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isQuizCompleted) {
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    const totalPoints = userAnswers.reduce((total, answer, index) => {
      return total + (answer.isCorrect ? quiz.questions[index]?.points || 0 : 0);
    }, 0);
    const percentage = (correctAnswers / quiz.questions.length) * 100;

    return (
      <div className="quiz-container">
        <div className="quiz-results">
          <div className="quiz-results-header">
            <h1>Quiz Completed!</h1>
            <div className="quiz-results-score">
              <div className="quiz-score-circle">
                <span className="quiz-score-percentage">{Math.round(percentage)}%</span>
                <span className="quiz-score-label">Score</span>
              </div>
            </div>
          </div>

          <div className="quiz-results-stats">
            <div className="quiz-stat">
              <span className="quiz-stat-value">{correctAnswers}</span>
              <span className="quiz-stat-label">Correct</span>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat-value">{quiz.questions.length - correctAnswers}</span>
              <span className="quiz-stat-label">Incorrect</span>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat-value">{totalPoints}</span>
              <span className="quiz-stat-label">Points</span>
            </div>
            {quiz.time_limit && (
              <div className="quiz-stat">
                <span className="quiz-stat-value">{formatTime(quiz.time_limit * 60 - timeLeft)}</span>
                <span className="quiz-stat-label">Time</span>
              </div>
            )}
          </div>

          <div className="quiz-results-actions">
            <button onClick={resetQuiz} className="quiz-retry-button">
              <RotateCcw className="quiz-retry-icon" />
              Retry Quiz
            </button>
            <button onClick={() => router.back()} className="quiz-back-button">
              <ArrowLeft className="quiz-back-icon" />
              Back to Topic
            </button>
          </div>

          <div className="quiz-results-review">
            <h3>Review Your Answers</h3>
            <div className="quiz-review-questions">
              {quiz.questions.map((question, index) => {
                const userAnswer = userAnswers[index];
                return (
                  <div key={question.id} className="quiz-review-question">
                    <div className="quiz-review-header">
                      <span className="quiz-review-number">Q{index + 1}</span>
                      {getQuestionTypeIcon(question.type)}
                      <span className={`quiz-review-result ${userAnswer?.isCorrect ? 'correct' : 'incorrect'}`}>
                        {userAnswer?.isCorrect ? <CheckCircle /> : <XCircle />}
                      </span>
                    </div>
                    <p className="quiz-review-question-text">{question.question}</p>
                    <div className="quiz-review-answers">
                      <p><strong>Your Answer:</strong> {String(userAnswer?.answer || 'No answer')}</p>
                      <p><strong>Correct Answer:</strong> {String(question.correct_answer)}</p>
                      {question.explanation && (
                        <p className="quiz-review-explanation"><strong>Explanation:</strong> {question.explanation}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <button 
          onClick={() => router.back()} 
          className="quiz-back-button"
        >
          <ArrowLeft className="quiz-back-icon" />
          Back
        </button>

        <div className="quiz-header-info">
          <h1 className="quiz-title">{quiz.title}</h1>
          <div className="quiz-meta">
            <span className="quiz-category">{category} • {topic} • {subtopic}</span>
            {quiz.is_ai_generated && (
              <span className="quiz-ai-badge">
                <Zap className="quiz-ai-icon" />
                AI Generated
              </span>
            )}
          </div>
        </div>

        {quiz.time_limit && (
          <div className="quiz-timer">
            <Clock className="quiz-timer-icon" />
            <span className={`quiz-timer-text ${timeLeft < 60 ? 'warning' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      <div className="quiz-progress-container">
        <div className="quiz-progress-bar">
          <div 
            className="quiz-progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="quiz-progress-text">
          {currentQuestionIndex + 1} of {quiz.questions.length}
        </span>
      </div>

      <div className="quiz-question-container">
        <div className="quiz-question-header">
          <div className="quiz-question-type">
            {getQuestionTypeIcon(currentQuestion.type)}
            <span className="quiz-question-type-text">
              {currentQuestion.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <div className="quiz-question-difficulty">
            <span className={`quiz-difficulty-badge ${currentQuestion.difficulty}`}>
              {currentQuestion.difficulty}
            </span>
            <span className="quiz-points">{currentQuestion.points} pts</span>
          </div>
        </div>

        <div className="quiz-question-content">
          <h2 className="quiz-question-text">{currentQuestion.question}</h2>
          {renderQuestionContent(currentQuestion)}
        </div>

        {showExplanation && currentQuestion.explanation && (
          <div className="quiz-explanation">
            <h3>Explanation</h3>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="quiz-question-actions">
          {!showExplanation ? (
            <>
              {currentQuestion.explanation && selectedAnswer && (
                <button 
                  onClick={handleShowExplanation}
                  className="quiz-explanation-button"
                >
                  Show Explanation
                </button>
              )}
              <button 
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                className="quiz-next-button"
              >
                {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            </>
          ) : (
            <button 
              onClick={handleNextQuestion}
              className="quiz-next-button"
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
