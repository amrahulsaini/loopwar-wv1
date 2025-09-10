"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Brain,
  Lightbulb,
  Target,
  Award,
  RotateCcw,
  Home,
  ChevronRight,
  Zap
} from 'lucide-react';
import Logo from '../../../../../components/Logo';
import LoadingSpinner from '../../../../../components/LoadingSpinner';
import './QuizMode.module.css';

interface Question {
  id: number;
  type: 'mcq' | 'true_false' | 'logical_thinking' | 'fill_blank';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: Question[];
  timeLimit?: number; // in minutes
  totalPoints: number;
  category: string;
  topic: string;
  subtopic: string;
  isAIGenerated: boolean;
  createdAt: string;
}

interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  answers: { [questionId: number]: any };
}

export default function QuizModePage() {
  const params = useParams();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: any }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [quizState, setQuizState] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URL parameters
  const category = params.category as string;
  const topic = params.topic as string;
  const subtopic = params.subtopic as string;
  const quizId = parseInt(params.quizId as string);

  // Format display names
  const formatDisplayName = (urlName: string) => {
    return urlName
      .replace(/-/g, ' ')
      .replace(/and/g, '&')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const categoryDisplay = formatDisplayName(category);
  const topicDisplay = formatDisplayName(topic);
  const subtopicDisplay = formatDisplayName(subtopic);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user session
        const userResponse = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (!userResponse.ok) {
          router.push('/login');
          return;
        }

        const userData = await userResponse.json();
        setUsername(userData.username);

        // Fetch quiz data
        const quizResponse = await fetch(`/api/quizzes/${quizId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (quizResponse.ok) {
          const quizData = await quizResponse.json();
          if (quizData.success) {
            setQuiz(quizData.quiz);
            if (quizData.quiz.timeLimit) {
              setTimeLeft(quizData.quiz.timeLimit * 60); // Convert minutes to seconds
            }
          } else {
            console.error('Failed to fetch quiz:', quizData.error);
            router.push(`/zone/${category}/${topic}/${subtopic}`);
          }
        } else {
          console.error('Quiz fetch failed');
          router.push(`/zone/${category}/${topic}/${subtopic}`);
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        router.push(`/zone/${category}/${topic}/${subtopic}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [category, topic, subtopic, quizId, router]);

  // Timer effect
  useEffect(() => {
    if (quizState === 'in_progress' && timeLeft > 0 && quiz?.timeLimit) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleQuizSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeLeft, quizState, quiz?.timeLimit]);

  const startQuiz = () => {
    setQuizState('in_progress');
    setQuizStartTime(Date.now());
  };

  const handleAnswerSelect = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!quiz || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000);
      let score = 0;
      let correctAnswers = 0;

      // Calculate score
      quiz.questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (userAnswer !== undefined) {
          const isCorrect = checkAnswer(question, userAnswer);
          if (isCorrect) {
            score += question.points;
            correctAnswers++;
          }
        }
      });

      const percentage = Math.round((score / quiz.totalPoints) * 100);

      const result: QuizResult = {
        score,
        totalPoints: quiz.totalPoints,
        percentage,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        timeTaken,
        answers
      };

      // Submit result to API
      const submitResponse = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          quizId,
          answers,
          score,
          percentage,
          timeTaken,
          category,
          topic,
          subtopic
        }),
      });

      if (submitResponse.ok) {
        const submitData = await submitResponse.json();
        if (submitData.success) {
          console.log('Quiz result saved successfully');
        }
      }

      setQuizResult(result);
      setQuizState('completed');
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkAnswer = (question: Question, userAnswer: any): boolean => {
    if (question.type === 'mcq') {
      return userAnswer === question.correctAnswer;
    } else if (question.type === 'true_false') {
      return userAnswer === question.correctAnswer;
    } else if (question.type === 'logical_thinking') {
      return userAnswer === question.correctAnswer;
    } else if (question.type === 'fill_blank') {
      return userAnswer?.toLowerCase().trim() === question.correctAnswer?.toString().toLowerCase().trim();
    }
    return false;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#22c55e';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq': return <Target size={16} />;
      case 'true_false': return <CheckCircle2 size={16} />;
      case 'logical_thinking': return <Brain size={16} />;
      case 'fill_blank': return <Lightbulb size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <LoadingSpinner global={true} text="Loading quiz..." />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quiz Not Found</h2>
          <p className="text-gray-600 mb-6">The requested quiz could not be found.</p>
          <Link 
            href={`/zone/${category}/${topic}/${subtopic}`}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Practice
          </Link>
        </div>
      </div>
    );
  }

  // Quiz not started screen
  if (quizState === 'not_started') {
    return (
      <div className="quiz-container">
        <header className="quiz-header">
          <div className="container">
            <div className="header-content">
              <div className="header-left">
                <Logo />
                <div className="breadcrumb">
                  <Link href="/zone" className="breadcrumb-link">{categoryDisplay}</Link>
                  <span className="breadcrumb-separator">→</span>
                  <Link href={`/zone/${category}`} className="breadcrumb-link">{topicDisplay}</Link>
                  <span className="breadcrumb-separator">→</span>
                  <Link href={`/zone/${category}/${topic}`} className="breadcrumb-link">{subtopicDisplay}</Link>
                  <span className="breadcrumb-separator">→</span>
                  <span className="breadcrumb-current">Quiz</span>
                </div>
              </div>
              <div className="header-right">
                <Link href={`/zone/${category}/${topic}/${subtopic}`} className="header-back-btn">
                  <ArrowLeft size={20} />
                </Link>
                <div className="user-info">
                  <span className="username">@{username}</span>
                  <button
                    className="profile-btn"
                    onClick={() => router.push(`/profiles/${username}`)}
                  >
                    <div className="profile-avatar">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="quiz-main">
          <div className="container">
            <div className="quiz-intro">
              <div className="quiz-intro-header">
                <h1 className="quiz-title">{quiz.title}</h1>
                <div className="quiz-meta">
                  <div className="quiz-difficulty" style={{ color: getDifficultyColor(quiz.difficulty) }}>
                    {quiz.difficulty}
                  </div>
                  {quiz.isAIGenerated && (
                    <div className="ai-badge">
                      <Zap size={14} />
                      AI Generated
                    </div>
                  )}
                </div>
              </div>

              <p className="quiz-description">{quiz.description}</p>

              <div className="quiz-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Target />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{quiz.questions.length}</div>
                    <div className="stat-label">Questions</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <Award />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{quiz.totalPoints}</div>
                    <div className="stat-label">Points</div>
                  </div>
                </div>

                {quiz.timeLimit && (
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Clock />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{quiz.timeLimit}</div>
                      <div className="stat-label">Minutes</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="question-types">
                <h3>Question Types:</h3>
                <div className="type-tags">
                  {Array.from(new Set(quiz.questions.map(q => q.type))).map(type => (
                    <div key={type} className="type-tag">
                      {getQuestionTypeIcon(type)}
                      {type === 'mcq' ? 'Multiple Choice' : 
                       type === 'true_false' ? 'True/False' : 
                       type === 'logical_thinking' ? 'Logical Thinking' : 
                       'Fill in the Blank'}
                    </div>
                  ))}
                </div>
              </div>

              <div className="quiz-actions">
                <button className="start-quiz-btn" onClick={startQuiz}>
                  <Target size={20} />
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Quiz completed screen
  if (quizState === 'completed' && quizResult) {
    return (
      <div className="quiz-container">
        <header className="quiz-header">
          <div className="container">
            <div className="header-content">
              <div className="header-left">
                <Logo />
                <div className="breadcrumb">
                  <Link href="/zone" className="breadcrumb-link">{categoryDisplay}</Link>
                  <span className="breadcrumb-separator">→</span>
                  <Link href={`/zone/${category}`} className="breadcrumb-link">{topicDisplay}</Link>
                  <span className="breadcrumb-separator">→</span>
                  <Link href={`/zone/${category}/${topic}`} className="breadcrumb-link">{subtopicDisplay}</Link>
                  <span className="breadcrumb-separator">→</span>
                  <span className="breadcrumb-current">Results</span>
                </div>
              </div>
              <div className="header-right">
                <div className="user-info">
                  <span className="username">@{username}</span>
                  <button
                    className="profile-btn"
                    onClick={() => router.push(`/profiles/${username}`)}
                  >
                    <div className="profile-avatar">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="quiz-main">
          <div className="container">
            <div className="quiz-results">
              <div className="results-header">
                <div className="results-icon">
                  {quizResult.percentage >= 80 ? (
                    <Award className="success-icon" />
                  ) : quizResult.percentage >= 60 ? (
                    <CheckCircle2 className="good-icon" />
                  ) : (
                    <AlertCircle className="needs-improvement-icon" />
                  )}
                </div>
                <h1 className="results-title">Quiz Completed!</h1>
                <div className="score-display">
                  <span className="score-percentage">{quizResult.percentage}%</span>
                  <span className="score-fraction">
                    ({quizResult.score} / {quizResult.totalPoints} points)
                  </span>
                </div>
              </div>

              <div className="results-stats">
                <div className="stat-card">
                  <div className="stat-value">{quizResult.correctAnswers}</div>
                  <div className="stat-label">Correct Answers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{quizResult.totalQuestions}</div>
                  <div className="stat-label">Total Questions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{formatTime(quizResult.timeTaken)}</div>
                  <div className="stat-label">Time Taken</div>
                </div>
              </div>

              <div className="results-actions">
                <Link 
                  href={`/zone/${category}/${topic}/${subtopic}`}
                  className="action-btn primary"
                >
                  <Home size={20} />
                  Back to Practice
                </Link>
                <button 
                  className="action-btn secondary"
                  onClick={() => {
                    setQuizState('not_started');
                    setCurrentQuestionIndex(0);
                    setAnswers({});
                    setQuizResult(null);
                    if (quiz.timeLimit) {
                      setTimeLeft(quiz.timeLimit * 60);
                    }
                  }}
                >
                  <RotateCcw size={20} />
                  Retake Quiz
                </button>
              </div>

              <div className="question-review">
                <h3>Question Review</h3>
                <div className="review-list">
                  {quiz.questions.map((question, index) => {
                    const userAnswer = answers[question.id];
                    const isCorrect = checkAnswer(question, userAnswer);
                    
                    return (
                      <div key={question.id} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <div className="review-header">
                          <span className="question-number">Q{index + 1}</span>
                          <div className="review-status">
                            {isCorrect ? (
                              <CheckCircle2 className="status-icon correct" />
                            ) : (
                              <XCircle className="status-icon incorrect" />
                            )}
                          </div>
                        </div>
                        <div className="review-content">
                          <p className="review-question">{question.question}</p>
                          <div className="review-answers">
                            <div className="answer-row">
                              <span className="answer-label">Your answer:</span>
                              <span className={`answer-value ${isCorrect ? 'correct' : 'incorrect'}`}>
                                {userAnswer !== undefined ? userAnswer.toString() : 'No answer'}
                              </span>
                            </div>
                            {!isCorrect && (
                              <div className="answer-row">
                                <span className="answer-label">Correct answer:</span>
                                <span className="answer-value correct">
                                  {question.correctAnswer.toString()}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="explanation">{question.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Quiz in progress
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-container">
      <header className="quiz-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <Logo />
              <div className="quiz-progress-info">
                <span className="progress-text">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
                {quiz.timeLimit && (
                  <div className="timer">
                    <Clock size={16} />
                    {formatTime(timeLeft)}
                  </div>
                )}
              </div>
            </div>
            <div className="header-right">
              <div className="user-info">
                <span className="username">@{username}</span>
                <button
                  className="profile-btn"
                  onClick={() => router.push(`/profiles/${username}`)}
                >
                  <div className="profile-avatar">
                    {username.charAt(0).toUpperCase()}
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </header>

      <main className="quiz-main">
        <div className="container">
          <div className="question-container">
            <div className="question-header">
              <div className="question-meta">
                <div className="question-type">
                  {getQuestionTypeIcon(currentQuestion.type)}
                  {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 
                   currentQuestion.type === 'true_false' ? 'True/False' : 
                   currentQuestion.type === 'logical_thinking' ? 'Logical Thinking' : 
                   'Fill in the Blank'}
                </div>
                <div className="question-points">{currentQuestion.points} pts</div>
              </div>
            </div>

            <div className="question-content">
              <h2 className="question-text">{currentQuestion.question}</h2>

              <div className="answer-section">
                {currentQuestion.type === 'mcq' && currentQuestion.options && (
                  <div className="mcq-options">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        className={`option-btn ${answers[currentQuestion.id] === index ? 'selected' : ''}`}
                        onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                      >
                        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                        <span className="option-text">{option}</span>
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'true_false' && (
                  <div className="true-false-options">
                    <button
                      className={`tf-btn ${answers[currentQuestion.id] === true ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(currentQuestion.id, true)}
                    >
                      <CheckCircle2 size={20} />
                      True
                    </button>
                    <button
                      className={`tf-btn ${answers[currentQuestion.id] === false ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(currentQuestion.id, false)}
                    >
                      <XCircle size={20} />
                      False
                    </button>
                  </div>
                )}

                {currentQuestion.type === 'logical_thinking' && currentQuestion.options && (
                  <div className="logical-options">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        className={`logical-btn ${answers[currentQuestion.id] === index ? 'selected' : ''}`}
                        onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                      >
                        <Brain size={16} />
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'fill_blank' && (
                  <div className="fill-blank-input">
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                      className="blank-input"
                    />
                  </div>
                )}
              </div>

              {showExplanation && (
                <div className="explanation-section">
                  <h4>Explanation:</h4>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}
            </div>

            <div className="question-actions">
              <div className="nav-buttons">
                <button
                  className="nav-btn secondary"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </button>

                <button
                  className="explanation-btn"
                  onClick={() => setShowExplanation(!showExplanation)}
                >
                  <Lightbulb size={16} />
                  {showExplanation ? 'Hide' : 'Show'} Explanation
                </button>

                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <button
                    className="nav-btn primary"
                    onClick={handleQuizSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                ) : (
                  <button
                    className="nav-btn primary"
                    onClick={handleNextQuestion}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
