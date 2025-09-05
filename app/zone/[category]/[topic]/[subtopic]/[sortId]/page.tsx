"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Code,
  Database,
  Play
} from 'lucide-react';
import Logo from '../../../../../components/Logo';
import LoadingSpinner from '../../../../../components/LoadingSpinner';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  solved: boolean;
  sortOrder?: number;
}

type PracticeMode = 'learn' | 'mcq' | 'code';

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [username, setUsername] = useState('');
  const [activeMode, setActiveMode] = useState<PracticeMode>('learn');

  const category = params.category as string;
  const topic = params.topic as string;
  const subtopic = params.subtopic as string;
  const sortId = params.sortId as string;

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

        // Fetch problem by sortOrder within the subtopic
        const problemResponse = await fetch(`/api/admin/problems?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}&subtopic=${encodeURIComponent(subtopic)}&sortOrder=${encodeURIComponent(sortId)}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (problemResponse.ok) {
          const problemsData = await problemResponse.json();
          if (problemsData.success && problemsData.problems.length > 0) {
            setProblem(problemsData.problems[0]);
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
  }, [category, topic, subtopic, sortId, router]);

  const handleModeChange = (mode: PracticeMode) => {
    setActiveMode(mode);
  };

  const handleStartPractice = () => {
    const practiceUrl = `/zone/${category}/${topic}/${subtopic}/${activeMode}/${problem?.id}`;
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
                <span className="breadcrumb-current">Problem #{sortId}</span>
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

      <main className="problem-main">
        <div className="container">
          <div className="problem-content">
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

            <div className="practice-section">
              <h2 className="practice-title">Choose Your Practice Mode</h2>
              <div className="mode-selector">
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

              <div className="practice-actions">
                <button className="start-practice-btn" onClick={handleStartPractice}>
                  <Play size={20} />
                  <span>Start {activeMode.toUpperCase()} Practice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
