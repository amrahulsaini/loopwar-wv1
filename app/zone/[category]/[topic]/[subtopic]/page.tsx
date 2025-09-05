"use client";

import { useState, useEffect } from 'react';
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
  Database
} from 'lucide-react';
import Logo from '../../../../components/Logo';
import LoadingSpinner from '../../../../components/LoadingSpinner';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  solved: boolean;
  sortOrder?: number;
  timeSpent?: number;
  lastAttempt?: string;
}

interface Subtopic {
  id: number;
  name: string;
  topic_id: number;
}

type PracticeMode = 'learn' | 'mcq' | 'code';

export default function SubtopicPracticePage() {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [lastProblemId, setLastProblemId] = useState<number | null>(null);
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [activeMode, setActiveMode] = useState<PracticeMode>('learn');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [allSubtopics, setAllSubtopics] = useState<Subtopic[]>([]);
  const [showAllProblems, setShowAllProblems] = useState<boolean>(false);
  
  // URL parameters
  const category = params.category as string;
  const topic = params.topic as string;
  const subtopic = params.subtopic as string;

  // Format display names (reverse the URL formatting)
  const formatDisplayName = (urlName: string) => {
    return urlName
      .replace(/-/g, ' ') // Replace hyphens with spaces
      .replace(/and/g, '&') // Replace 'and' back to '&'
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const categoryDisplay = formatDisplayName(category);
  const topicDisplay = formatDisplayName(topic);
  const subtopicDisplay = formatDisplayName(subtopic);

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

        // First validate if this category/topic/subtopic exists in database
        try {
          const categoriesResponse = await fetch('/api/admin/categories', {
            method: 'GET',
            credentials: 'include',
          });

          let isValidPath = false;

          if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            
            if (categoriesData.success) {
              // Format names back from URL format for comparison
              const categoryName = category.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/and/g, '&');
              const topicName = topic.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/and/g, '&');
              const subtopicName = subtopic.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/and/g, '&');

              console.log('URL params:', { category, topic, subtopic });
              console.log('Formatted names:', { categoryName, topicName, subtopicName });

              // Check if category exists (using new hyphen format)
              const categoryObj = categoriesData.categories.find((cat: {name: string, id: number}) => 
                cat.name.toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/&/g, 'and')
                  .replace(/[^a-z0-9-]/g, '') === category.toLowerCase()
              );

              if (categoryObj) {
                console.log('Category found:', categoryObj);
                
                // Check if topic exists in this category
                const topicObj = categoriesData.topics.find((top: {name: string, category_id: number, id: number}) => 
                  top.name.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/&/g, 'and')
                    .replace(/[^a-z0-9-]/g, '') === topic.toLowerCase() && 
                  top.category_id === categoryObj.id
                );

                if (topicObj) {
                  console.log('Topic found:', topicObj);
                  
                  // Check if subtopic exists in this topic
                  const subtopicObj = categoriesData.subtopics.find((sub: Subtopic) => 
                    sub.name.toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/&/g, 'and')
                      .replace(/[^a-z0-9-]/g, '') === subtopic.toLowerCase() && 
                    sub.topic_id === topicObj.id
                  );

                  if (subtopicObj) {
                    console.log('Subtopic found:', subtopicObj);
                    isValidPath = true;

                    // Get all subtopics for this topic
                    const topicSubtopics = categoriesData.subtopics.filter((sub: Subtopic) => 
                      sub.topic_id === topicObj.id
                    );
                    setAllSubtopics(topicSubtopics);
                    console.log('All subtopics for this topic:', topicSubtopics);
                  }
                }
              }

              // If path is not valid, redirect to 404
              if (!isValidPath) {
                console.log('Invalid path, redirecting to 404');
                router.push('/404');
                return;
              }
            }
          }

          // Now fetch actual problems from database
          const problemsResponse = await fetch(`/api/admin/problems?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}&subtopic=${encodeURIComponent(subtopic)}`, {
            method: 'GET',
            credentials: 'include',
          });

          console.log('Fetching problems for:', { category, topic, subtopic });

          if (problemsResponse.ok) {
            const problemsData = await problemsResponse.json();
            console.log('Problems response:', problemsData);
            
            if (problemsData.success) {
              if (problemsData.problems.length > 0) {
                // Convert database problems to frontend format
                const formattedProblems = problemsData.problems.map((p: {
                  id: number;
                  title: string;
                  difficulty: string;
                  description: string;
                  sortOrder: number;
                  category: string;
                  topic: string;
                  subtopic: string;
                }) => ({
                  id: p.id,
                  title: p.title,
                  difficulty: p.difficulty as 'Easy' | 'Medium' | 'Hard',
                  description: p.description,
                  sortOrder: p.sortOrder,
                  solved: false // TODO: Get actual user progress
                }));
                
                // Sort problems by sortOrder
                formattedProblems.sort((a: Problem, b: Problem) => (a.sortOrder || 0) - (b.sortOrder || 0));
                
                setProblems(formattedProblems);
                console.log('Set problems:', formattedProblems);
              } else {
                // No problems found - set empty array (will show "No problems" message)
                setProblems([]);
                console.log('No problems found');
              }
            } else {
              // API error - set empty array
              setProblems([]);
              console.log('API error:', problemsData.message);
            }
          } else {
            // API request failed - set empty array
            setProblems([]);
            console.log('Problems API request failed');
          }
        } catch (error) {
          console.error('Error fetching problems:', error);
          // On error, set empty array (will show "No problems" message)
          setProblems([]);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndProblems();
  }, [category, topic, subtopic, router]);

  const handleModeChange = (mode: PracticeMode) => {
    setActiveMode(mode);
    console.log(`🎯 Switched to ${mode} mode for ${subtopicDisplay}`);
  };

  const handleShowMoreProblems = () => {
    setShowAllProblems(true);
  };

  const displayedProblems = showAllProblems ? problems : problems.slice(0, 9);

  const handleProblemClick = (problemId: number) => {
    setLastProblemId(problemId);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(`lastProblemId-${category}-${topic}-${subtopic}`, String(problemId));
    }
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
            {/* Left - Logo */}
            <div className="header-left">
              <Link href="/zone" className="logo-link">
                <Logo />
              </Link>
            </div>

            {/* Center - Breadcrumb */}
            <div className="header-center">
              <div className="breadcrumb">
                <Link href="/zone" className="breadcrumb-link">Zone</Link>
                <span className="breadcrumb-separator">→</span>
                <span className="breadcrumb-link">{categoryDisplay}</span>
                <span className="breadcrumb-separator">→</span>
                <div className="breadcrumb-dropdown-container">
                  <button
                    className="breadcrumb-dropdown-trigger"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                    onClick={() => setShowDropdown((v) => !v)}
                  >
                    {topicDisplay}
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  {showDropdown && (
                    <div
                      className="breadcrumb-dropdown-menu"
                      onMouseEnter={() => setShowDropdown(true)}
                      onMouseLeave={() => setShowDropdown(false)}
                    >
                      <div className="dropdown-title">Subtopics:</div>
                      {allSubtopics.map((subtopicItem) => {
                        const subtopicUrlName = subtopicItem.name
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/&/g, 'and')
                          .replace(/[^a-z0-9-]/g, '');
                        const isActive = subtopicUrlName === subtopic;
                        
                        return (
                          <Link
                            key={subtopicItem.id}
                            href={`/zone/${category}/${topic}/${subtopicUrlName}`}
                            className={`dropdown-item ${isActive ? 'active' : ''}`}
                            onClick={() => setShowDropdown(false)}
                          >
                            <span className="item-name">{subtopicItem.name}</span>
                            {isActive && <span className="current-indicator">✓</span>}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
                <span className="breadcrumb-separator">→</span>
                <span className="breadcrumb-current">{subtopicDisplay}</span>
              </div>
            </div>

            {/* Right - Back button and User info */}
            <div className="header-right">
              <Link href="/zone" className="header-back-btn" title="Back to Zone">
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

      <main className="practice-main">
        <div className="container">
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

          {/* Subtopics Navigation */}
          {allSubtopics.length > 1 && (
            <div className="subtopics-section">
              <h2 className="subtopics-title">Subtopics ({allSubtopics.length}):</h2>
              <div className="subtopics-grid">
                {allSubtopics.map((subtopicItem) => {
                  const subtopicUrlName = subtopicItem.name
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/&/g, 'and')
                    .replace(/[^a-z0-9-]/g, '');
                  
                  const isActive = subtopicUrlName === subtopic;
                  
                  return (
                    <Link
                      key={subtopicItem.id}
                      href={`/zone/${category}/${topic}/${subtopicUrlName}`}
                      className={`subtopic-card ${isActive ? 'active' : ''}`}
                    >
                      <h3 className="subtopic-name">{subtopicItem.name}</h3>
                      <div className="subtopic-indicator">
                        {isActive ? 'Current' : 'View'}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Problems List */}
          <div className="problems-section">
            <div className="problems-header">
              <h2 className="problems-title">
                {activeMode.toUpperCase()} Problems ({displayedProblems.length}{!showAllProblems && problems.length > 9 ? ` of ${problems.length}` : ''})
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
              {displayedProblems.map((problem, index) => {
                const isLast = lastProblemId === problem.id;
                return (
                  <div
                    key={problem.id}
                    className={`problem-card${isLast ? ' last-active-problem' : ''}`}
                    onClick={() => handleProblemClick(problem.id)}
                    style={isLast ? { border: '2px solid #2563eb', boxShadow: '0 0 8px #2563eb33' } : {}}
                  >
                    <div className="problem-header">
                      <div className="problem-number">#{index + 1}</div>
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
                );
              })}
            </div>

            {/* View More Button */}
            {!showAllProblems && problems.length > 9 && (
              <div className="view-more-section">
                <button className="view-more-btn" onClick={handleShowMoreProblems}>
                  View More Problems ({problems.length - 9} remaining)
                </button>
              </div>
            )}

            {/* No Problems Added Message */}
            {problems.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <Database size={48} />
                </div>
                <h3>No Problems Added Yet</h3>
                <p>No {activeMode} problems have been added for <strong>{subtopicDisplay}</strong> yet.</p>
                <p>Add problems via the admin dashboard to see them here!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
