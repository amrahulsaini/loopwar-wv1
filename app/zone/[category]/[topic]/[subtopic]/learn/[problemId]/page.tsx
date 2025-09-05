"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Database,
  Lightbulb,
  Target,
  Clock
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

interface LearningStep {
  id: number;
  title: string;
  content: string;
  type: 'concept' | 'example' | 'practice' | 'hint';
}

export default function LearnProblemPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [username, setUsername] = useState('');
  const [learningSteps, setLearningSteps] = useState<LearningStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

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
            // Generate learning steps based on the problem
            generateLearningSteps(problemData.problem);
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

  const generateLearningSteps = (problem: Problem) => {
    // This is a placeholder - in real implementation, you'd fetch from database
    const steps: LearningStep[] = [
      {
        id: 1,
        title: 'Understanding the Problem',
        content: `Let's break down "${problem.title}". First, read the problem statement carefully and identify what you're being asked to do.`,
        type: 'concept'
      },
      {
        id: 2,
        title: 'Problem Analysis',
        content: `Key points to consider:\n• What is the input?\n• What is the expected output?\n• What are the constraints?\n• What edge cases should you consider?`,
        type: 'concept'
      },
      {
        id: 3,
        title: 'Example Walkthrough',
        content: `Let's work through a simple example to understand the approach:\n\n${problem.description}`,
        type: 'example'
      },
      {
        id: 4,
        title: 'Solution Approach',
        content: 'Think about the most efficient way to solve this problem. Consider time and space complexity.',
        type: 'practice'
      },
      {
        id: 5,
        title: 'Implementation Tips',
        content: 'Remember to handle edge cases and validate your solution with different inputs.',
        type: 'hint'
      }
    ];

    setLearningSteps(steps);
  };

  const handleStepComplete = (stepId: number) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const handleNextStep = () => {
    if (currentStep < learningSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
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

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'concept': return <BookOpen size={20} />;
      case 'example': return <Lightbulb size={20} />;
      case 'practice': return <Target size={20} />;
      case 'hint': return <CheckCircle2 size={20} />;
      default: return <BookOpen size={20} />;
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

  const currentLearningStep = learningSteps[currentStep];
  const progress = ((currentStep + 1) / learningSteps.length) * 100;

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
                <span className="breadcrumb-current">Learn</span>
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

      <main className="learn-main">
        <div className="container">
          <div className="learn-content">
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

            <div className="learning-section">
              <div className="learning-header">
                <div className="progress-info">
                  <span>Step {currentStep + 1} of {learningSteps.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              {currentLearningStep && (
                <div className="learning-step-card">
                  <div className="step-header">
                    <div className="step-icon">
                      {getStepIcon(currentLearningStep.type)}
                    </div>
                    <h3 className="step-title">{currentLearningStep.title}</h3>
                    <div className="step-type">{currentLearningStep.type}</div>
                  </div>

                  <div className="step-content">
                    <p>{currentLearningStep.content}</p>
                  </div>

                  <div className="step-actions">
                    <button
                      className="step-btn complete-btn"
                      onClick={() => handleStepComplete(currentLearningStep.id)}
                      disabled={completedSteps.has(currentLearningStep.id)}
                    >
                      {completedSteps.has(currentLearningStep.id) ? (
                        <>
                          <CheckCircle2 size={16} />
                          Completed
                        </>
                      ) : (
                        'Mark as Complete'
                      )}
                    </button>

                    <div className="navigation-btns">
                      <button
                        className="nav-btn"
                        onClick={handlePrevStep}
                        disabled={currentStep === 0}
                      >
                        Previous
                      </button>
                      <button
                        className="nav-btn"
                        onClick={handleNextStep}
                        disabled={currentStep === learningSteps.length - 1}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === learningSteps.length - 1 && (
                <div className="learning-complete">
                  <h3>🎉 Learning Complete!</h3>
                  <p>You've completed all the learning steps for this problem.</p>
                  <div className="completion-actions">
                    <Link href={`/zone/${category}/${topic}/${subtopic}`} className="back-btn">
                      Back to Problems
                    </Link>
                    <Link href={`/zone/${category}/${topic}/${subtopic}/mcq/${problemId}`} className="practice-btn">
                      Try MCQ Practice
                    </Link>
                    <Link href={`/zone/${category}/${topic}/${subtopic}/code/${problemId}`} className="practice-btn">
                      Try Coding Challenge
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
