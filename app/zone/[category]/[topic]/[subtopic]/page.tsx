'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Code,
  Play,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import Logo from '../../../../components/Logo';
import LoadingSpinner from '../../../../components/LoadingSpinner';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  solved: boolean;
  timeSpent?: number;
  lastAttempt?: string;
}

type PracticeMode = 'learn' | 'mcq' | 'code';

export default function SubtopicPracticePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [activeMode, setActiveMode] = useState<PracticeMode>('learn');
  const [problems, setProblems] = useState<Problem[]>([]);
  
  // URL parameters
  const category = params.category as string;
  const topic = params.topic as string;
  const subtopic = params.subtopic as string;

  // Format display names (reverse the URL formatting)
  const formatDisplayName = (urlName: string) => {
    return urlName
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
      .replace(/and/g, '&') // Replace 'and' back to '&'
      .split('')
      .map((char, index) => index === 0 ? char.toUpperCase() : char)
      .join('');
  };

  const categoryDisplay = formatDisplayName(category);
  const topicDisplay = formatDisplayName(topic);
  const subtopicDisplay = formatDisplayName(subtopic);

  // Mock problems data (will be fetched from API later)
  const getMockProblems = useCallback((): Problem[] => [
    {
      id: 1,
      title: `${subtopicDisplay} - Basic Implementation`,
      difficulty: 'Easy',
      description: `Learn the fundamentals of ${subtopicDisplay} with step-by-step guidance.`,
      solved: false
    },
    {
      id: 2,
      title: `${subtopicDisplay} - Intermediate Challenge`,
      difficulty: 'Medium', 
      description: `Apply ${subtopicDisplay} concepts to solve real-world problems.`,
      solved: false
    },
    {
      id: 3,
      title: `${subtopicDisplay} - Advanced Optimization`,
      difficulty: 'Hard',
      description: `Master advanced ${subtopicDisplay} techniques and optimizations.`,
      solved: false
    }
  ], [subtopicDisplay]);

  useEffect(() => {
    const fetchUserAndProblems = async () => {
      try {
        // Fetch user session
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

        // TODO: Fetch problems from API based on category/topic/subtopic
        // For now, use mock data
        setProblems(getMockProblems());
        
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndProblems();
  }, [category, topic, subtopic, router, getMockProblems]);

  const handleModeChange = (mode: PracticeMode) => {
    setActiveMode(mode);
    console.log(`🎯 Switched to ${mode} mode for ${subtopicDisplay}`);
  };

  const handleProblemClick = (problemId: number) => {
    const practiceUrl = `/zone/${category}/${topic}/${subtopic}/${activeMode}/${problemId}`;
    console.log(`🚀 Starting ${activeMode} practice for problem ${problemId}`);
    router.push(practiceUrl);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#22c55e';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getModeIcon = (mode: PracticeMode) => {
    switch (mode) {
      case 'learn': return <BookOpen size={20} />;
      case 'mcq': return <HelpCircle size={20} />;
      case 'code': return <Code size={20} />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <header className="main-header">
        <div className="container">
          <div className="header-content">
            <Link href="/zone" className="logo-link">
              <Logo />
            </Link>
            
            <div className="header-center">
              <div className="breadcrumb">
                <Link href="/zone" className="breadcrumb-link">Zone</Link>
                <span className="breadcrumb-separator">→</span>
                <span className="breadcrumb-item">{categoryDisplay}</span>
                <span className="breadcrumb-separator">→</span>
                <span className="breadcrumb-item">{topicDisplay}</span>
                <span className="breadcrumb-separator">→</span>
                <span className="breadcrumb-current">{subtopicDisplay}</span>
              </div>
            </div>

            <div className="header-user">
              <span className="username">@{username}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="practice-main">
        <div className="container">
          {/* Back Button */}
          <div className="practice-header">
            <Link href="/zone" className="back-btn">
              <ArrowLeft size={20} />
              <span>Back to Zone</span>
            </Link>
          </div>

          {/* Practice Title */}
          <div className="practice-title-section">
            <h1 className="practice-title">{subtopicDisplay}</h1>
            <p className="practice-subtitle">
              Master {subtopicDisplay} through interactive learning, quizzes, and coding challenges
            </p>
            <div className="practice-path">
              <span className="path-category">{categoryDisplay}</span>
              <span className="path-separator">•</span>
              <span className="path-topic">{topicDisplay}</span>
            </div>
          </div>

          {/* Practice Mode Selector */}
          <div className="mode-selector">
            <h2 className="mode-title">Choose Your Practice Mode</h2>
            <div className="mode-buttons">
              <button
                className={`mode-btn ${activeMode === 'learn' ? 'active' : ''}`}
                onClick={() => handleModeChange('learn')}
              >
                <div className="mode-icon learn">{getModeIcon('learn')}</div>
                <div className="mode-content">
                  <h3>Learn</h3>
                  <p>Step-by-step tutorials and explanations</p>
                </div>
              </button>

              <button
                className={`mode-btn ${activeMode === 'mcq' ? 'active' : ''}`}
                onClick={() => handleModeChange('mcq')}
              >
                <div className="mode-icon mcq">{getModeIcon('mcq')}</div>
                <div className="mode-content">
                  <h3>MCQ</h3>
                  <p>Multiple choice questions and quizzes</p>
                </div>
              </button>

              <button
                className={`mode-btn ${activeMode === 'code' ? 'active' : ''}`}
                onClick={() => handleModeChange('code')}
              >
                <div className="mode-icon code">{getModeIcon('code')}</div>
                <div className="mode-content">
                  <h3>Code</h3>
                  <p>Hands-on coding challenges and problems</p>
                </div>
              </button>
            </div>
          </div>

          {/* Problems List */}
          <div className="problems-section">
            <div className="problems-header">
              <h2 className="problems-title">
                {activeMode.toUpperCase()} Problems ({problems.length})
              </h2>
              <div className="problems-stats">
                <div className="stat">
                  <CheckCircle2 size={16} />
                  <span>0 Solved</span>
                </div>
                <div className="stat">
                  <Target size={16} />
                  <span>{problems.length} Total</span>
                </div>
              </div>
            </div>

            <div className="problems-grid">
              {problems.map((problem) => (
                <div 
                  key={problem.id} 
                  className="problem-card"
                  onClick={() => handleProblemClick(problem.id)}
                >
                  <div className="problem-header">
                    <h3 className="problem-title">{problem.title}</h3>
                    <div 
                      className="problem-difficulty"
                      style={{ color: getDifficultyColor(problem.difficulty) }}
                    >
                      {problem.difficulty}
                    </div>
                  </div>

                  <p className="problem-description">{problem.description}</p>

                  <div className="problem-footer">
                    <div className="problem-status">
                      {problem.solved ? (
                        <div className="status-solved">
                          <CheckCircle2 size={16} />
                          <span>Solved</span>
                        </div>
                      ) : (
                        <div className="status-unsolved">
                          <Clock size={16} />
                          <span>Not Started</span>
                        </div>
                      )}
                    </div>

                    <button className="start-problem-btn">
                      <Play size={16} />
                      <span>Start {activeMode}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coming Soon Message for empty state */}
            {problems.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <TrendingUp size={48} />
                </div>
                <h3>Problems Coming Soon!</h3>
                <p>We&apos;re working hard to add {activeMode} problems for {subtopicDisplay}.</p>
                <p>Check back soon for exciting challenges!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
