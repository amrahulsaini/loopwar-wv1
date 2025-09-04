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
  const [selectedCategory, setSelectedCategory] = useState('Core DSA');

  // 🔒 SECURE: Topics now loaded from protected API endpoint
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  // Fallback data for when database is not yet populated
  const getFallbackCategories = (): CategoryData[] => [
    {
      name: 'Core DSA',
      icon: 'Workflow',
      topics: [
        { 
          name: 'Arrays and Matrices', 
          problems: 65, 
          completed: 0,
          subtopics: ['Array Fundamentals', 'Subarray Problems', 'Matrix Operations', 'Array Rotations', 'Prefix and Suffix Arrays']
        },
        { 
          name: 'Strings and Pattern Matching', 
          problems: 45, 
          completed: 0,
          subtopics: ['String Basics', 'Palindromes', 'KMP Algorithm', 'String Hashing', 'Anagrams and Permutations']
        },
        { 
          name: 'Hash Tables and Maps', 
          problems: 40, 
          completed: 0,
          subtopics: ['Hash Map Basics', 'Frequency Counting', 'Hash Set Operations', 'Two Sum Variants', 'Custom Hash Functions']
        },
        { 
          name: 'Sorting and Searching', 
          problems: 50, 
          completed: 0,
          subtopics: ['Basic Sorting Algorithms', 'Binary Search Fundamentals', 'Binary Search Variants', 'Custom Comparators', 'Search in Rotated Arrays']
        },
        { 
          name: 'Two Pointers and Sliding Window', 
          problems: 35, 
          completed: 0,
          subtopics: ['Two Pointers Technique', 'Fast and Slow Pointers', 'Fixed Window Size', 'Variable Window Size', 'Multiple Pointers']
        },
        { 
          name: 'Stacks and Queues', 
          problems: 45, 
          completed: 0,
          subtopics: ['Stack Fundamentals', 'Monotonic Stack', 'Queue Operations', 'Priority Queues', 'Expression Evaluation']
        },
        { 
          name: 'Linked Lists', 
          problems: 38, 
          completed: 0,
          subtopics: ['Singly Linked Lists', 'Doubly Linked Lists', 'Cycle Detection', 'List Reversal', 'Merge Operations']
        },
        { 
          name: 'Trees and Binary Trees', 
          problems: 70, 
          completed: 0,
          subtopics: ['Tree Traversals', 'Tree Construction', 'Tree Properties', 'Lowest Common Ancestor', 'Tree Views and Paths']
        },
        { 
          name: 'Binary Search Trees and Heaps', 
          problems: 42, 
          completed: 0,
          subtopics: ['BST Operations', 'BST Validation', 'Heap Implementation', 'Heap Sort', 'Balanced Trees']
        },
        { 
          name: 'Graphs and Graph Algorithms', 
          problems: 85, 
          completed: 0,
          subtopics: ['Graph Representation', 'DFS and BFS', 'Shortest Path Algorithms', 'Minimum Spanning Tree', 'Topological Sorting']
        },
        { 
          name: 'Dynamic Programming', 
          problems: 90, 
          completed: 0,
          subtopics: ['1D Dynamic Programming', '2D Dynamic Programming', 'Knapsack Problems', 'LCS and LIS', 'Tree DP']
        },
        { 
          name: 'Greedy Algorithms', 
          problems: 35, 
          completed: 0,
          subtopics: ['Greedy Choice Strategy', 'Activity Selection', 'Interval Problems', 'Huffman Coding', 'Fractional Knapsack']
        },
        { 
          name: 'Backtracking and Recursion', 
          problems: 48, 
          completed: 0,
          subtopics: ['Recursion Fundamentals', 'Permutations and Combinations', 'N-Queens Problem', 'Sudoku Solver', 'Subset Generation']
        },
        { 
          name: 'Bit Manipulation', 
          problems: 25, 
          completed: 0,
          subtopics: ['Bitwise Operations', 'Bit Masking', 'XOR Properties', 'Single Number Problems', 'Bit Counting']
        },
        { 
          name: 'Advanced Data Structures', 
          problems: 30, 
          completed: 0,
          subtopics: ['Trie (Prefix Tree)', 'Segment Tree', 'Binary Indexed Tree', 'Disjoint Set Union', 'Sparse Table']
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
        { name: 'TCP/IP & Protocols', problems: 16, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Threading & Synchronization', problems: 20, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Socket Programming', problems: 14, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Load Balancing', problems: 8, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Distributed Systems', problems: 12, completed: 0, subtopics: ['Data to be added soon'] }
      ]
    },
    {
      name: 'Software Engineering',
      icon: 'Code2',
      topics: [
        { name: 'Design Patterns', problems: 18, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'System Design', problems: 22, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Object-Oriented Programming', problems: 16, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Testing & Debugging', problems: 14, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Version Control', problems: 10, completed: 0, subtopics: ['Data to be added soon'] }
      ]
    },
    {
      name: 'Problem Solving',
      icon: 'Bug',
      topics: [
        { name: 'Logical Reasoning', problems: 25, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Mathematical Problems', problems: 30, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Pattern Recognition', problems: 20, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Optimization Problems', problems: 18, completed: 0, subtopics: ['Data to be added soon'] },
        { name: 'Brain Teasers', problems: 15, completed: 0, subtopics: ['Data to be added soon'] }
      ]
    },
    {
      name: 'Backend Development',
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

  // Load topics from secure API
  const loadTopics = useCallback(async () => {
    try {
      setLoadingTopics(true);
      setTopicsError(null);
      
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
      setTopicsError('Using offline data. Database connection failed.');
    } finally {
      setLoadingTopics(false);
    }
  }, []); // Empty dependency array for useCallback

  // Load user session
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
  }, [loadTopics]); // Add loadTopics as dependency

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);

  if (isLoading || loadingTopics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <Logo />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Zone</h1>
                <p className="text-gray-600">Welcome back, {username}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profiles"
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {topicsError && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{topicsError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <section className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'questions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Practice Questions
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reports'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Progress Reports
                </button>
              </nav>
            </div>

            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Categories Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category) => {
                        const IconComponent = getIconComponent(category.icon);
                        return (
                          <button
                            key={category.name}
                            onClick={() => setSelectedCategory(category.name)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                              selectedCategory === category.name
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <IconComponent className="h-5 w-5" />
                            <span className="text-sm font-medium">{category.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Topics Content */}
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">{selectedCategory}</h2>
                      <p className="text-gray-600 mt-1">
                        {selectedCategoryData?.topics.length || 0} topics available
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCategoryData?.topics.map((topic, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-medium text-gray-900">{topic.name}</h3>
                              <span className="text-sm text-gray-500">{topic.problems} problems</span>
                            </div>
                            <div className="mb-3">
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{topic.completed}/{topic.problems}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${topic.problems > 0 ? (topic.completed / topic.problems) * 100 : 0}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                            {topic.subtopics && topic.subtopics.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-500 mb-2">Subtopics:</p>
                                <div className="flex flex-wrap gap-1">
                                  {topic.subtopics.slice(0, 3).map((subtopic, subIndex) => (
                                    <span
                                      key={subIndex}
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        subtopic === 'Data to be added soon' 
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {subtopic}
                                    </span>
                                  ))}
                                  {topic.subtopics.length > 3 && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                      +{topic.subtopics.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Progress Reports</h2>
                <div className="text-center py-12">
                  <p className="text-gray-500">Progress tracking features will be available soon.</p>
                  <p className="text-sm text-gray-400 mt-2">Start solving problems to see your detailed progress reports!</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
