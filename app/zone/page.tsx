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
  difficulty?: string;
  description?: string;
}

interface CategoryData {
  name: string;
  icon: string; // This will be the Lucide icon name       
  topics: TopicData[];
  description?: string;
}

export default function ZonePage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);        
  const [activeTab, setActiveTab] = useState('questions'); 
  const [selectedCategory, setSelectedCategory] = useState('Core DSA');
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [selectedSubtopic, setSelectedSubtopic] = useState<{topic: string, subtopic: string} | null>(null);

  // Enhanced DSA Categories with your new structure
  const getFallbackCategories = (): CategoryData[] => [
    {
      name: 'Core DSA',
      icon: 'Workflow',
      description: 'Fundamental Data Structures and Algorithms',
      topics: [
        {
          name: 'Arrays and Matrices',
          problems: 65,
          completed: 0,
          difficulty: 'Beginner',
          description: 'Array operations, matrix problems, and 2D array techniques',
          subtopics: ['Array Fundamentals', 'Subarray Problems', 'Matrix Operations', 'Array Rotations', 'Prefix and Suffix Arrays']
        },
        {
          name: 'Strings and Pattern Matching',
          problems: 45,
          completed: 0,
          difficulty: 'Beginner',
          description: 'String manipulation, pattern matching algorithms, and text processing',
          subtopics: ['String Basics', 'Palindromes', 'KMP Algorithm', 'String Hashing', 'Anagrams and Permutations']
        },
        {
          name: 'Hash Tables and Maps',
          problems: 40,
          completed: 0,
          difficulty: 'Intermediate',
          description: 'Hash-based data structures, frequency counting, and fast lookups',
          subtopics: ['Hash Map Basics', 'Frequency Counting', 'Hash Set Operations', 'Two Sum Variants', 'Custom Hash Functions']
        },
        {
          name: 'Sorting and Searching',
          problems: 50,
          completed: 0,
          difficulty: 'Intermediate',
          description: 'Sorting algorithms, binary search, and search optimizations',
          subtopics: ['Basic Sorting Algorithms', 'Binary Search Fundamentals', 'Binary Search Variants', 'Custom Comparators', 'Search in Rotated Arrays']
        },
        {
          name: 'Two Pointers and Sliding Window',
          problems: 35,
          completed: 0,
          difficulty: 'Intermediate',
          description: 'Efficient array traversal techniques and window-based algorithms',
          subtopics: ['Two Pointers Technique', 'Fast and Slow Pointers', 'Fixed Window Size', 'Variable Window Size', 'Multiple Pointers']
        },
        {
          name: 'Stacks and Queues',
          problems: 45,
          completed: 0,
          difficulty: 'Beginner',
          description: 'Linear data structures and their advanced applications',
          subtopics: ['Stack Fundamentals', 'Monotonic Stack', 'Queue Operations', 'Priority Queues', 'Expression Evaluation']
        },
        {
          name: 'Linked Lists',
          problems: 38,
          completed: 0,
          difficulty: 'Beginner',
          description: 'Dynamic linear data structures and pointer manipulation',
          subtopics: ['Singly Linked Lists', 'Doubly Linked Lists', 'Cycle Detection', 'List Reversal', 'Merge Operations']
        },
        {
          name: 'Trees and Binary Trees',
          problems: 70,
          completed: 0,
          difficulty: 'Intermediate',
          description: 'Tree structures, traversals, and tree-based algorithms',
          subtopics: ['Tree Traversals', 'Tree Construction', 'Tree Properties', 'Lowest Common Ancestor', 'Tree Views and Paths']
        },
        {
          name: 'Binary Search Trees and Heaps',
          problems: 42,
          completed: 0,
          difficulty: 'Intermediate',
          description: 'Self-balancing trees and priority queue implementations',
          subtopics: ['BST Operations', 'BST Validation', 'Heap Implementation', 'Heap Sort', 'Balanced Trees']
        },
        {
          name: 'Graphs and Graph Algorithms',
          problems: 85,
          completed: 0,
          difficulty: 'Advanced',
          description: 'Graph representations, traversals, and advanced graph algorithms',
          subtopics: ['Graph Representation', 'DFS and BFS', 'Shortest Path Algorithms', 'Minimum Spanning Tree', 'Topological Sorting']
        },
        {
          name: 'Dynamic Programming',
          problems: 90,
          completed: 0,
          difficulty: 'Advanced',
          description: 'Optimization problems, memoization, and DP patterns',
          subtopics: ['1D Dynamic Programming', '2D Dynamic Programming', 'Knapsack Problems', 'LCS and LIS', 'Tree DP']
        },
        {
          name: 'Greedy Algorithms',
          problems: 35,
          completed: 0,
          difficulty: 'Advanced',
          description: 'Greedy choice strategies and optimization problems',
          subtopics: ['Greedy Choice Strategy', 'Activity Selection', 'Interval Problems', 'Huffman Coding', 'Fractional Knapsack']
        },
        {
          name: 'Backtracking and Recursion',
          problems: 48,
          completed: 0,
          difficulty: 'Advanced',
          description: 'Recursive problem solving and exhaustive search techniques',
          subtopics: ['Recursion Fundamentals', 'Permutations and Combinations', 'N-Queens Problem', 'Sudoku Solver', 'Subset Generation']
        },
        {
          name: 'Bit Manipulation',
          problems: 25,
          completed: 0,
          difficulty: 'Intermediate',
          description: 'Bitwise operations and bit-level problem solving',
          subtopics: ['Bitwise Operations', 'Bit Masking', 'XOR Properties', 'Single Number Problems', 'Bit Counting']
        },
        {
          name: 'Advanced Data Structures',
          problems: 30,
          completed: 0,
          difficulty: 'Advanced',
          description: 'Specialized data structures for complex problems',
          subtopics: ['Trie (Prefix Tree)', 'Segment Tree', 'Binary Indexed Tree', 'Disjoint Set Union', 'Sparse Table']
        }
      ]
    },
    {
      name: 'Databases',
      icon: 'Database',
      description: 'SQL, NoSQL, database design, optimization, and data management',
      topics: [
        { 
          name: 'SQL Basics', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Beginner',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'Database Design', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Intermediate',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'NoSQL Databases', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Advanced',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        }
      ]
    },
    {
      name: 'OS & Shell',
      icon: 'Terminal',
      description: 'Operating systems, shell scripting, command line tools, and system administration',
      topics: [
        { 
          name: 'Operating System Basics', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Intermediate',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'Shell Scripting', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Beginner',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'System Administration', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Advanced',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        }
      ]
    },
    {
      name: 'Networking & Concurrency',
      icon: 'Network',
      description: 'Network protocols, distributed systems, multithreading, and concurrent programming',
      topics: [
        { 
          name: 'Network Protocols', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Intermediate',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'Multithreading', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Advanced',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'Distributed Systems', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Advanced',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        }
      ]
    },
    {
      name: 'Programming Languages',
      icon: 'Code2',
      description: 'Language-specific concepts, paradigms, and advanced programming techniques',
      topics: [
        { 
          name: 'JavaScript Advanced', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Intermediate',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'Python Advanced', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Intermediate',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'Java Advanced', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Intermediate',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        }
      ]
    },
    {
      name: 'Debugging & Optimization',
      icon: 'Bug',
      description: 'Performance tuning, profiling, debugging techniques, and optimization strategies',
      topics: [
        { 
          name: 'Code Profiling', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Advanced',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'Memory Debugging', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Advanced',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'Performance Optimization', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Intermediate',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        }
      ]
    },
    {
      name: 'System Design',
      icon: 'Server',
      description: 'Scalable system architecture, design patterns, and distributed systems',
      topics: [
        { 
          name: 'RESTful APIs', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Intermediate',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'Authentication & Authorization', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Advanced',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'Microservices', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Advanced',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        }
      ]
    },
    {
      name: 'AI & ML',
      icon: 'Bot',
      description: 'Machine learning algorithms, AI concepts, and deep learning fundamentals',
      topics: [
        { 
          name: 'Supervised Learning', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Intermediate',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'Unsupervised Learning', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Advanced',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        },
        { 
          name: 'Neural Networks', 
          problems: 0, 
          completed: 0, 
          difficulty: 'Advanced',
          description: 'Data to be added yet',
          subtopics: ['Data to be added yet']
        }
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

  // Handler functions for subtopic interactions
  const toggleTopicExpansion = (topicName: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicName)) {
        newSet.delete(topicName);
      } else {
        newSet.add(topicName);
      }
      return newSet;
    });
  };

  const handleSubtopicClick = (topicName: string, subtopicName: string) => {
    setSelectedSubtopic({ topic: topicName, subtopic: subtopicName });
    console.log(`🎯 Selected subtopic: ${subtopicName} from ${topicName}`);
    // TODO: Navigate to subtopic practice page
    // This is where you can add navigation to specific subtopic content
  };

  const handleTopicStart = (topicName: string) => {
    console.log(`🚀 Starting practice for topic: ${topicName}`);
    // TODO: Navigate to topic overview page
    // This is where you can add navigation to topic content
  };

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
                                  <div className="subtopics-header">
                                    <p className="subtopics-label">Subtopics ({topic.subtopics.length}):</p>
                                    <button 
                                      className="expand-btn"
                                      onClick={() => toggleTopicExpansion(topic.name)}
                                    >
                                      {expandedTopics.has(topic.name) ? '▼ Collapse' : '▶ View All'}
                                    </button>
                                  </div>
                                  
                                  <div className="subtopics-list">
                                    {/* Always show first 3 subtopics */}
                                    {topic.subtopics.slice(0, expandedTopics.has(topic.name) ? topic.subtopics.length : 3).map((subtopic, index) => (
                                      <button 
                                        key={index} 
                                        className={`subtopic-tag clickable ${
                                          selectedSubtopic?.topic === topic.name && selectedSubtopic?.subtopic === subtopic 
                                            ? 'selected' : ''
                                        }`}
                                        onClick={() => handleSubtopicClick(topic.name, subtopic)}
                                        title={`Click to practice: ${subtopic}`}
                                      >
                                        <span className="subtopic-icon">📚</span>
                                        <span className="subtopic-name">{subtopic}</span>
                                        <span className="subtopic-arrow">→</span>
                                      </button>
                                    ))}
                                    
                                    {/* Show count if collapsed and there are more */}
                                    {!expandedTopics.has(topic.name) && topic.subtopics.length > 3 && (
                                      <button 
                                        className="subtopic-more-btn"
                                        onClick={() => toggleTopicExpansion(topic.name)}
                                      >
                                        <span className="more-icon">+</span>
                                        <span>{topic.subtopics.length - 3} more subtopics</span>
                                        <span className="expand-hint">Click to expand</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="topic-actions">
                                <button 
                                  className="start-topic-btn primary"
                                  onClick={() => handleTopicStart(topic.name)}
                                >
                                  🚀 Start Topic Practice
                                </button>
                                {selectedSubtopic?.topic === topic.name && (
                                  <button className="start-subtopic-btn secondary">
                                    📚 Practice: {selectedSubtopic.subtopic}
                                  </button>
                                )}
                              </div>
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
