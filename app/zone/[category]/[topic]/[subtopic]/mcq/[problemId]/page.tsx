"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Database
} from 'lucide-react';
import Logo from '../../../../../../components/Logo';
import LoadingSpinner from '../../../../../../components/LoadingSpinner';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  solved: boolean;
}

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function MCQProblemPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [username, setUsername] = useState('');
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const category = params.category as string;
  const topic = params.topic as string;
  const subtopic = params.subtopic as string;
  const problemId = params.problemId as string;

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
    const fetchData = async () => {
      try {
        const userResponse = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUsername(userData.username);
        } else {
          router.push('/login');
          return;
        }

        const problemResponse = await fetch(`/api/admin/problems/${problemId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (problemResponse.ok) {
          const problemData = await problemResponse.json();
          if (problemData.success) {
            setProblem(problemData.problem);
            // Generate sample MCQ questions based on the problem
            generateMCQQuestions(problemData.problem);
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [problemId, router]);

  const generateMCQQuestions = (problem: Problem) => {
    // This is a placeholder - in real implementation, you'd fetch from database
    const sampleQuestions: MCQQuestion[] = [
      {
        id: 1,
        question: `What is the main goal when solving "${problem.title}"?`,
        options: [
          "To write the most complex code possible",
          "To solve the problem efficiently and correctly",
          "To use as many variables as possible",
          "To make the code as long as possible"
        ],
        correctAnswer: 1,
        explanation: "The main goal is to solve the problem efficiently and correctly, following best practices."
      },
      {
        id: 2,
        question: `What difficulty level is "${problem.title}"?`,
        options: [
          "Very Easy",
          problem.difficulty,
          "Expert Level",
          "Beginner Level"
        ],
        correctAnswer: 1,
        explanation: `This problem is rated as ${problem.difficulty} difficulty.`
      },
      {
        id: 3,
        question: "What should you consider first when approaching this problem?",
        options: [
          "The programming language syntax",
          "Understanding the problem requirements",
          "Writing the code immediately",
          "Choosing variable names"
        ],
        correctAnswer: 1,
        explanation: "Always start by understanding the problem requirements before writing any code."
      }
    ];

    setQuestions(sampleQuestions);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const question = questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#22c55e';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Database size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Problem Not Found</h2>
          <p className="text-gray-600 mb-4">The requested problem could not be found.</p>
          <Link href={`/zone/${category}/${topic}/${subtopic}`} className="text-blue-600 hover:underline">
            ← Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <>
      <header className="main-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <Link href={`/zone/${category}/${topic}/${subtopic}`} className="logo-link">
                <Logo />
              </Link>
            </div>

            <div className="header-center">
              <div className="breadcrumb">
                <Link href="/zone" className="breadcrumb-link">Zone</Link>
                <span className="breadcrumb-separator">→</span>
                <span className="breadcrumb-link">{categoryDisplay}</span>
                <span className="breadcrumb-separator">→</span>
                <span className="breadcrumb-link">{topicDisplay}</span>
                <span className="breadcrumb-separator">→</span>
                <Link href={`/zone/${category}/${topic}/${subtopic}`} className="breadcrumb-link">
                  {subtopicDisplay}
                </Link>
                <span className="breadcrumb-separator">→</span>
                <span className="breadcrumb-current">MCQ</span>
              </div>
            </div>

            <div className="header-right">
              <Link href={`/zone/${category}/${topic}/${subtopic}`} className="header-back-btn" title="Back to Problems">
                <ArrowLeft size={20} />
              </Link>
              <div className="user-info">
                <span className="username">@{username}</span>
                <button
                  className="profile-btn"
                  onClick={() => router.push(`/profiles/${username}`)}
                  aria-label="View Profile"
                  title={`Go to ${username}'s profile`}
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

      <main className="mcq-main">
        <div className="container">
          <div className="mcq-content">
            <div className="problem-header">
              <div
                className="problem-difficulty"
                style={{ color: getDifficultyColor(problem.difficulty) }}
              >
                {problem.difficulty}
              </div>
              <h1 className="problem-title">{problem.title}</h1>
              <p className="problem-description">{problem.description}</p>
            </div>

            <div className="quiz-section">
              <div className="quiz-header">
                <div className="progress-info">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>Score: {score}/{currentQuestion + (showResult ? 1 : 0)}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              {question && (
                <div className="question-card">
                  <h3 className="question-text">{question.question}</h3>

                  <div className="options">
                    {question.options.map((option, index) => (
                      <button
                        key={index}
                        className={`option-btn ${
                          selectedAnswer === index ? 'selected' : ''
                        } ${
                          showResult ? (
                            index === question.correctAnswer ? 'correct' :
                            selectedAnswer === index ? 'incorrect' : ''
                          ) : ''
                        }`}
                        onClick={() => !showResult && handleAnswerSelect(index)}
                        disabled={showResult}
                      >
                        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                        <span className="option-text">{option}</span>
                        {showResult && index === question.correctAnswer && (
                          <CheckCircle2 size={16} className="correct-icon" />
                        )}
                        {showResult && selectedAnswer === index && index !== question.correctAnswer && (
                          <XCircle size={16} className="incorrect-icon" />
                        )}
                      </button>
                    ))}
                  </div>

                  {showResult && (
                    <div className="result-section">
                      <div className="explanation">
                        <h4>Explanation:</h4>
                        <p>{question.explanation}</p>
                      </div>

                      {currentQuestion < questions.length - 1 ? (
                        <button className="next-btn" onClick={handleNextQuestion}>
                          Next Question
                        </button>
                      ) : (
                        <div className="quiz-complete">
                          <h3>Quiz Complete!</h3>
                          <p>Your final score: {score}/{questions.length}</p>
                          <div className="completion-actions">
                            <Link href={`/zone/${category}/${topic}/${subtopic}`} className="back-btn">
                              Back to Problems
                            </Link>
                            <button className="retry-btn" onClick={() => {
                              setCurrentQuestion(0);
                              setSelectedAnswer(null);
                              setShowResult(false);
                              setScore(0);
                            }}>
                              Retry Quiz
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!showResult && selectedAnswer !== null && (
                    <button className="submit-btn" onClick={handleSubmitAnswer}>
                      Submit Answer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
