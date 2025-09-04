'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Workflow,
  Database,
  TerminalSquare,
  Network,
  Code2,
  Bug,
  Server,
  Bot,
  LogOut,
  Settings
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner'; 
import Logo from '../components/Logo';

interface TopicData {
  name: string;
  problems: number;
  completed: number;
  subtopics?: string[];
}

interface CategoryData {
  name: string;
  icon: string; // This will be the Lucide icon name       
  topics: TopicData[];
}

export default function ZonePage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);        
  const [activeTab, setActiveTab] = useState('questions'); 
  const [selectedCategory, setSelectedCategory] = useState('DSA Core');
  const [categories, setCategories] = useState<CategoryData[]>([]);

  // Enhanced DSA Categories with your new structure
  const getFallbackCategories = (): CategoryData[] => [
    {
      name: 'DSA Core',
      icon: 'Workflow',
      topics: [
        {
          name: 'Arrays & Strings',
          problems: 45,
          completed: 0,
          subtopics: ['Array Basics', 'Two Pointers', 'Sliding Window', 'String Manipulation', 'Prefix Sum']
        },
        {
          name: 'Linked Lists',
          problems: 30,
          completed: 0,
          subtopics: ['Singly Linked Lists', 'Doubly Linked Lists', 'Circular Linked Lists', 'Fast & Slow Pointers', 'Reversal Techniques']
        },
        {
          name: 'Stacks & Queues',
          problems: 25,
          completed: 0,
          subtopics: ['Stack Operations', 'Queue Operations', 'Monotonic Stack', 'Priority Queue', 'Deque']
        },
        {
          name: 'Hash Tables',
          problems: 35,
          completed: 0,
          subtopics: ['Hash Map Basics', 'Hash Set Operations', 'Collision Handling', 'Design Problems', 'Frequency Counting']
        },
        {
          name: 'Trees',
          problems: 50,
          completed: 0,
          subtopics: ['Binary Trees', 'Binary Search Trees', 'Tree Traversals', 'Tree Construction', 'Path Problems']
        },
        {
          name: 'Heaps',
          problems: 20,
          completed: 0,
          subtopics: ['Min Heap', 'Max Heap', 'Heap Sort', 'Top K Problems', 'Merge K Sorted']
        },
        {
          name: 'Graphs',
          problems: 40,
          completed: 0,
          subtopics: ['Graph Representation', 'DFS & BFS', 'Shortest Path', 'Minimum Spanning Tree', 'Topological Sort']
        },
        {
          name: 'Dynamic Programming',
          problems: 55,
          completed: 0,
          subtopics: ['1D DP', '2D DP', 'Knapsack Problems', 'LCS & LIS', 'Tree DP']
        },
        {
          name: 'Searching & Sorting',
          problems: 30,
          completed: 0,
          subtopics: ['Binary Search', 'Linear Search', 'Quick Sort', 'Merge Sort', 'Custom Sorting']
        },
        {
          name: 'Recursion & Backtracking',
          problems: 35,
          completed: 0,
          subtopics: ['Basic Recursion', 'Backtracking', 'Permutations', 'Combinations', 'N-Queens']
        },
        {
          name: 'Greedy Algorithms',
          problems: 25,
          completed: 0,
          subtopics: ['Activity Selection', 'Huffman Coding', 'Fractional Knapsack', 'Job Scheduling', 'Minimum Coins']
        },
        {
          name: 'Bit Manipulation',
          problems: 20,
          completed: 0,
          subtopics: ['Bitwise Operations', 'Bit Masking', 'Power of Two', 'Single Number', 'Subset Generation']
        },
        {
          name: 'Mathematical Algorithms',
          problems: 25,
          completed: 0,
          subtopics: ['Number Theory', 'Modular Arithmetic', 'Prime Numbers', 'GCD & LCM', 'Fast Exponentiation']
        },
        {
          name: 'Advanced Data Structures',
          problems: 30,
          completed: 0,
          subtopics: ['Trie', 'Segment Tree', 'Fenwick Tree', 'Disjoint Set Union', 'LRU Cache']
        },
        {
          name: 'String Algorithms',
          problems: 25,
          completed: 0,
          subtopics: ['Pattern Matching', 'KMP Algorithm', 'Rabin-Karp', 'Z Algorithm', 'Suffix Array']
        }
      ]
    },
    {
      name: 'Databases',
      icon: 'Database',
      topics: [
        { name: 'SQL Basics', problems: 20, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Joins & Subqueries', problems: 25, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Indexing & Optimization', problems: 15, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'NoSQL Databases', problems: 18, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Database Design', problems: 12, completed: 0, subtopics: ['Data to be added soon'] }
      ]
    },
    {
      name: 'OS & Shell',
      icon: 'TerminalSquare',
      topics: [
        { name: 'Process Management', problems: 15, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Memory Management', problems: 12, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'File Systems', problems: 10, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Shell Scripting', problems: 18, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'System Calls', problems: 14, completed: 0, subtopics: ['Data to be added soon'] }
      ]
    },
    {
      name: 'Networking & Concurrency',
      icon: 'Network',
      topics: [
        { name: 'TCP/IP Protocol', problems: 12, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'HTTP/HTTPS', problems: 15, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Multithreading', problems: 20, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Synchronization', problems: 18, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Socket Programming', problems: 10, completed: 0, subtopics: ['Data to be added soon'] }
      ]
    },
    {
      name: 'Programming Languages',
      icon: 'Code2',
      topics: [
        { name: 'Python Advanced', problems: 25, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'JavaScript/TypeScript', problems: 30, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Java Core', problems: 28, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'C++ STL', problems: 22, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Go Fundamentals', problems: 15, completed: 0, subtopics: ['Data to be added soon'] }
      ]
    },
    {
      name: 'Debugging & Optimization',
      icon: 'Bug',
      topics: [
        { name: 'Code Profiling', problems: 8, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Memory Debugging', problems: 10, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Performance Optimization', problems: 12, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Testing Strategies', problems: 15, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Static Analysis', problems: 6, completed: 0, subtopics: ['Data to be added soon'] }
      ]
    },
    {
      name: 'System Design',
      icon: 'Server',
      topics: [
        { name: 'RESTful APIs', problems: 20, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Authentication & Authorization', problems: 18, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Microservices', problems: 15, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Caching Strategies', problems: 12, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Message Queues', problems: 14, completed: 0, subtopics: ['Data to be added soon'] }
      ]
    },
    {
      name: 'Machine Learning',
      icon: 'Bot',
      topics: [
        { name: 'Supervised Learning', problems: 25, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Unsupervised Learning', problems: 20, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Neural Networks', problems: 18, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Feature Engineering', problems: 15, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Model Evaluation', problems: 12, completed: 0, subtopics: ['Data to be added soon'] }
      ]
    }
  ];

  // Load topics from API or use fallback
  const loadTopics = useCallback(async () => {
    try {
      const response = await fetch('/api/topics', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Unauthorized access to topics, redirecting to login');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to load topics: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Topics loaded securely for user:', data.user);
      
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      } else {
        console.log('📝 Using fallback data - database appears to be empty');
        setCategories(getFallbackCategories());
      }
      
    } catch (error) {
      console.error('❌ Error loading topics:', error);
      console.log('📝 Using fallback data due to error');
      setCategories(getFallbackCategories());
    }
  }, []);

  // Authentication check on mount
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
        } else {
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        window.location.href = '/login';
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsername();
    loadTopics();
  }, [loadTopics]);

  const handleLogout = () => {
    // Clear ALL authentication cookies
    document.cookie = 'sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'isVerified=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('🚪 Logged out - all cookies cleared');

    // Redirect to home
    window.location.href = '/';
  };

  const handleSettingsClick = () => {
    // Navigate to user settings page
    window.location.href = `/profiles/${username}/settings`;
  };

  const handleProfileClick = () => {
    // Navigate to user profile page
    window.location.href = `/profiles/${username}`;
  };

  // Get icon component by name
  const getIconComponent = (iconName: string): LucideIcon => {
    const iconMap: { [key: string]: LucideIcon } = {
      Workflow,
      Database,
      TerminalSquare,
      Network,
      Code2,
      Bug,
      Server,
      Bot,
    };
    return iconMap[iconName] || Workflow;
  };

  // Function to render Lucide icons based on icon name
  const renderIcon = (iconName: string, size: number = 20) => {
    const IconComponent = getIconComponent(iconName);
    return <IconComponent size={size} />;
  };

  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);

  return (
    <>
      <header className="zone-header">
        <div className="container">
          <Link href="/" className="logo-link" aria-label="LoopWar.dev Home">
            <Logo size={55} showText={false} />
          </Link>
          <nav className="zone-nav">
            <button
              className={`nav-btn ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              Questions
            </button>
            <button
              className={`nav-btn loopai-btn ${activeTab === 'loopai' ? 'active' : ''}`}
              onClick={() => setActiveTab('loopai')}
            >
              <span className="loopai-text">LoopAI</span>
              <div className="loopai-border-animation"></div>
            </button>
            <button
              className={`nav-btn ${activeTab === 'contest' ? 'active' : ''}`}
              onClick={() => setActiveTab('contest')}
            >
              Contest
            </button>
            <button
              className={`nav-btn ${activeTab === 'allranks' ? 'active' : ''}`}
              onClick={() => setActiveTab('allranks')}
            >
              AllRanks
            </button>
            <button
              className={`nav-btn ${activeTab === 'report' ? 'active' : ''}`}
              onClick={() => setActiveTab('report')}
            >
              Report
            </button>
          </nav>
          <div className="header-actions">
            <button
              className="action-btn settings-btn"
              onClick={handleSettingsClick}
              aria-label="Settings"
              title="User Settings"
            >
              <Settings size={20} />
            </button>
            <button
              className="action-btn logout-btn"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
            <button
              className="profile-btn"
              onClick={handleProfileClick}
              aria-label="View Profile"
              title={`Go to ${username}'s profile`}
            >
              <div className="profile-avatar default-avatar">
                {username.charAt(0).toUpperCase()}
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="zone-main">
        <div className="container">
          {isLoading ? (
            <LoadingSpinner size="large" text="Loading your zone..." />
          ) : (
            <>
              {/* Tab Content */}
              <section className="zone-content">
                {activeTab === 'questions' && (
                  <div className="questions-content">
                    <div className="questions-layout">
                      {/* Categories Sidebar */}
                      <div className="categories-sidebar">
                        <h3>Categories</h3>
                        <div className="categories-list">
                          {categories.map((category) => (
                            <button
                              key={category.name}
                              className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                              onClick={() => setSelectedCategory(category.name)}
                            >
                              <span className="category-icon">{renderIcon(category.icon)}</span>
                              <span className="category-name">{category.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Topics Content */}
                      <div className="topics-content">
                        <div className="topics-header">
                          <h2>{renderIcon(selectedCategoryData?.icon || '', 24)} {selectedCategory}</h2>
                          <p>{selectedCategoryData?.topics.length} topics available</p>
                        </div>

                        <div className="topics-grid">
                          {selectedCategoryData?.topics.map((topic) => (
                            <div key={topic.name} className="topic-card">
                              <div className="topic-header">
                                <h4>{topic.name}</h4>
                                <div className="topic-stats">
                                  <span className="completed">{topic.completed}</span>
                                  <span className="separator">/</span>
                                  <span className="total">{topic.problems}</span>
                                </div>
                              </div>

                              <div className="progress-bar">
                                <div
                                  className="progress-fill"
                                  style={{ width: `${(topic.completed / topic.problems) * 100}%` }}
                                ></div>
                              </div>

                              {topic.subtopics && (
                                <div className="subtopics">
                                  <p className="subtopics-label">Key areas:</p>
                                  <div className="subtopics-list">
                                    {topic.subtopics.slice(0, 3).map((subtopic, index) => (
                                      <span key={index} className="subtopic-tag">
                                        {subtopic}
                                      </span>
                                    ))}
                                    {topic.subtopics.length > 3 && (
                                      <span className="subtopic-more">
                                        +{topic.subtopics.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              <button className="start-topic-btn">
                                Start Practice
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'loopai' && (
                  <div className="tab-content">
                    <div className="loopai-container">
                      <div className="loopai-header">
                        <h2>🤖 LoopAI - Your Coding Assistant</h2>
                        <p>Get instant help with coding problems, explanations, and personalized guidance</p>
                      </div>

                      <div className="loopai-features">
                        <div className="feature-card">
                          <div className="feature-icon">💡</div>
                          <h3>Problem Hints</h3>
                          <p>Get strategic hints without spoiling the solution</p>
                          <button className="btn-secondary" disabled>Coming Soon</button>
                        </div>

                        <div className="feature-card">
                          <div className="feature-icon">🔍</div>
                          <h3>Code Review</h3>
                          <p>Get your solutions reviewed and optimized</p>
                          <button className="btn-secondary" disabled>Coming Soon</button>
                        </div>

                        <div className="feature-card">
                          <div className="feature-icon">📚</div>
                          <h3>Concept Explanation</h3>
                          <p>Learn algorithms and data structures with AI guidance</p>
                          <button className="btn-secondary" disabled>Coming Soon</button>
                        </div>

                        <div className="feature-card">
                          <div className="feature-icon">🎯</div>
                          <h3>Personalized Learning</h3>
                          <p>Get custom practice recommendations based on your progress</p>
                          <button className="btn-secondary" disabled>Coming Soon</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'contest' && (
                  <div className="tab-content">
                    <div className="contest-container">
                      <h2>🏆 Contests</h2>
                      <div className="contest-grid">
                        <div className="contest-card upcoming">
                          <div className="contest-status">Upcoming</div>
                          <h3>Weekly Challenge #1</h3>
                          <p>Starts in 2 days, 14 hours</p>
                          <div className="contest-details">
                            <span>Duration: 2 hours</span>
                            <span>Problems: 4</span>
                            <span>Participants: 1,250+</span>
                          </div>
                          <button className="btn-primary" disabled>Register (Coming Soon)</button>
                        </div>

                        <div className="contest-card past">
                          <div className="contest-status">Past</div>
                          <h3>Algorithm Showdown</h3>
                          <p>Completed 1 week ago</p>
                          <div className="contest-details">
                            <span>Duration: 3 hours</span>
                            <span>Problems: 5</span>
                            <span>Participants: 2,100</span>
                          </div>
                          <button className="btn-secondary" disabled>View Results (Coming Soon)</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'allranks' && (
                  <div className="tab-content">
                    <div className="ranks-container">
                      <h2>📊 All Ranks</h2>
                      <div className="leaderboard">
                        <div className="leaderboard-header">
                          <h3>Global Leaderboard</h3>
                          <p>Top performers this month</p>
                        </div>

                        <div className="leaderboard-list">
                          <div className="rank-item">
                            <div className="rank-position">1</div>
                            <div className="rank-info">
                              <span className="rank-name">CodeMaster2024</span>
                              <span className="rank-points">2,847 points</span>
                            </div>
                            <div className="rank-badge gold">🥇</div>
                          </div>

                          <div className="rank-item">
                            <div className="rank-position">2</div>
                            <div className="rank-info">
                              <span className="rank-name">AlgoNinja</span>
                              <span className="rank-points">2,642 points</span>
                            </div>
                            <div className="rank-badge silver">🥈</div>
                          </div>

                          <div className="rank-item">
                            <div className="rank-position">3</div>
                            <div className="rank-info">
                              <span className="rank-name">DevExplorer</span>
                              <span className="rank-points">2,401 points</span>
                            </div>
                            <div className="rank-badge bronze">🥉</div>
                          </div>

                          <div className="rank-item your-rank">
                            <div className="rank-position">--</div>
                            <div className="rank-info">
                              <span className="rank-name">{username} (You)</span>
                              <span className="rank-points">0 points</span>
                            </div>
                            <div className="rank-badge">🔰</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'report' && (
                  <div className="tab-content">
                    <div className="report-container">
                      <h2>📋 Report</h2>
                      <div className="report-grid">
                        <div className="report-card">
                          <h3>Progress Report</h3>
                          <div className="stats-list">
                            <div className="stat-item">
                              <span className="stat-label">Problems Solved</span>
                              <span className="stat-value">0</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Current Streak</span>
                              <span className="stat-value">0 days</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Best Streak</span>
                              <span className="stat-value">0 days</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Total Points</span>
                              <span className="stat-value">0</span>
                            </div>
                          </div>
                        </div>

                        <div className="report-card">
                          <h3>Skill Distribution</h3>
                          <div className="skill-chart">
                            <p className="chart-placeholder">📊 Skills chart will appear here once you start solving problems</p>
                          </div>
                        </div>

                        <div className="report-card">
                          <h3>Recent Activity</h3>
                          <div className="activity-list">
                            <p className="activity-placeholder">No recent activity. Start solving problems to see your progress!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
