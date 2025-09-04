'use client';

import { useState, useEffect } from 'react';
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
        { 
          name: 'SQL Basics', 
          problems: 20, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Joins & Subqueries', 
          problems: 25, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Indexing & Optimization', 
          problems: 15, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'NoSQL Databases', 
          problems: 18, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Database Design', 
          problems: 12, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    },
    {
      name: 'OS & Shell',
      icon: 'TerminalSquare',
      topics: [
        { 
          name: 'Process Management', 
          problems: 15, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Memory Management', 
          problems: 12, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'File Systems', 
          problems: 10, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Shell Scripting', 
          problems: 18, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'System Calls', 
          problems: 14, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    },
    {
      name: 'Networking & Concurrency',
      icon: 'Network',
      topics: [
        { 
          name: 'TCP/IP & Protocols', 
          problems: 16, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Threading & Synchronization', 
          problems: 20, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Socket Programming', 
          problems: 14, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Load Balancing', 
          problems: 8, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Distributed Systems', 
          problems: 12, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    },
    {
      name: 'Software Engineering',
      icon: 'Code2',
      topics: [
        { 
          name: 'Design Patterns', 
          problems: 18, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'System Design', 
          problems: 22, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Object-Oriented Programming', 
          problems: 16, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Testing & Debugging', 
          problems: 14, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Version Control', 
          problems: 10, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    },
    {
      name: 'Problem Solving',
      icon: 'Bug',
      topics: [
        { 
          name: 'Logical Reasoning', 
          problems: 25, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Mathematical Problems', 
          problems: 30, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Pattern Recognition', 
          problems: 20, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Optimization Problems', 
          problems: 18, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Brain Teasers', 
          problems: 15, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    },
    {
      name: 'Backend Development',
      icon: 'Server',
      topics: [
        { 
          name: 'RESTful APIs', 
          problems: 20, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Authentication & Authorization', 
          problems: 18, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Microservices', 
          problems: 15, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Caching Strategies', 
          problems: 12, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Message Queues', 
          problems: 14, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    },
    {
      name: 'Machine Learning',
      icon: 'Bot',
      topics: [
        { 
          name: 'Supervised Learning', 
          problems: 25, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Unsupervised Learning', 
          problems: 20, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Neural Networks', 
          problems: 18, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Feature Engineering', 
          problems: 15, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Model Evaluation', 
          problems: 12, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    }
  ];

  // Load topics from secure API
  const loadTopics = async () => {
    try {
      setLoadingTopics(true);
      setTopicsError(null);
      
      const response = await fetch('/api/topics', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated
          console.log('❌ Unauthorized access to topics, redirecting to login');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to load topics: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Topics loaded securely for user:', data.user);
      
      // Use database data if available, otherwise use fallback data
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      } else {
        // Fallback to static data if database is empty
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
  };
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
        { 
          name: 'SQL Basics', 
          problems: 20, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Joins & Subqueries', 
          problems: 25, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Indexing & Optimization', 
          problems: 15, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'NoSQL Databases', 
          problems: 18, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Database Design', 
          problems: 12, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    },
    {
      name: 'OS & Shell',
      icon: 'TerminalSquare',
      topics: [
        { 
          name: 'Process Management', 
          problems: 15, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Memory Management', 
          problems: 12, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'File Systems', 
          problems: 10, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Shell Scripting', 
          problems: 18, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'System Calls', 
          problems: 14, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    },
    {
      name: 'Networking & Concurrency',
      icon: 'Network',
      topics: [
        { 
          name: 'TCP/IP & Protocols', 
          problems: 16, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Threading & Synchronization', 
          problems: 20, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Socket Programming', 
          problems: 14, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Load Balancing', 
          problems: 8, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Distributed Systems', 
          problems: 12, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    },
    {
      name: 'Software Engineering',
      icon: 'Code2',
      topics: [
        { 
          name: 'Design Patterns', 
          problems: 18, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'System Design', 
          problems: 22, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Object-Oriented Programming', 
          problems: 16, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Testing & Debugging', 
          problems: 14, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Version Control', 
          problems: 10, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    },
    {
      name: 'Problem Solving',
      icon: 'Bug',
      topics: [
        { 
          name: 'Logical Reasoning', 
          problems: 25, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Mathematical Problems', 
          problems: 30, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Pattern Recognition', 
          problems: 20, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Optimization Problems', 
          problems: 18, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Brain Teasers', 
          problems: 15, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    },
    {
      name: 'Backend Development',
      icon: 'Server',
      topics: [
        { 
          name: 'RESTful APIs', 
          problems: 20, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Authentication & Authorization', 
          problems: 18, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Microservices', 
          problems: 15, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Caching Strategies', 
          problems: 12, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Message Queues', 
          problems: 14, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    },
    {
      name: 'Machine Learning',
      icon: 'Bot',
      topics: [
        { 
          name: 'Supervised Learning', 
          problems: 25, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Unsupervised Learning', 
          problems: 20, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Neural Networks', 
          problems: 18, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Feature Engineering', 
          problems: 15, 
          completed: 0,
          subtopics: ['Data to be added soon']
        },
        { 
          name: 'Model Evaluation', 
          problems: 12, 
          completed: 0,
          subtopics: ['Data to be added soon']
        }
      ]
    }
  ];
        { name: 'TCP/IP Protocol', problems: 12, completed: 0 },
        { name: 'HTTP/HTTPS', problems: 15, completed: 0 },
        { name: 'Multithreading', problems: 20, completed: 0 },
        { name: 'Synchronization', problems: 18, completed: 0 },
        { name: 'Socket Programming', problems: 10, completed: 0 }
      ]
    },
    {
      name: 'Programming Languages',
      icon: 'Code2',
      topics: [
        { name: 'Python Advanced', problems: 25, completed: 0 },
        { name: 'JavaScript/TypeScript', problems: 30, completed: 0 },
        { name: 'Java Core', problems: 28, completed: 0 },
        { name: 'C++ STL', problems: 22, completed: 0 },
        { name: 'Go Fundamentals', problems: 15, completed: 0 }
      ]
    },
    {
      name: 'Debugging & Optimization',
      icon: 'Bug',
      topics: [
        { name: 'Code Profiling', problems: 8, completed: 0 },
        { name: 'Memory Debugging', problems: 10, completed: 0 },
        { name: 'Performance Optimization', problems: 12, completed: 0 },
        { name: 'Testing Strategies', problems: 15, completed: 0 },
        { name: 'Static Analysis', problems: 6, completed: 0 }
      ]
    },
    {
      name: 'System Design',
      icon: 'Server',
      topics: [
        { name: 'Scalability Patterns', problems: 15, completed: 0 },
        { name: 'Load Balancing', problems: 8, completed: 0 },
        { name: 'Caching Strategies', problems: 12, completed: 0 },
        { name: 'Microservices', problems: 10, completed: 0 },
        { name: 'Database Sharding', problems: 6, completed: 0 }
      ]
    },
    {
      name: 'AI & ML',
      icon: 'Bot',
      topics: [
        { name: 'Machine Learning Basics', problems: 20, completed: 0 },
        { name: 'Neural Networks', problems: 15, completed: 0 },
        { name: 'Natural Language Processing', problems: 12, completed: 0 },
        { name: 'Computer Vision', problems: 10, completed: 0 },
        { name: 'Deep Learning', problems: 18, completed: 0 }
      ]
    }
  ];

  // Authentication check and load topics on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Small delay to ensure cookies are set from login
      setTimeout(async () => {
        const sessionToken = getCookie('sessionToken');
        const savedUsername = getCookie('username');
        const isVerified = getCookie('isVerified');
        
        console.log('🔍 Zone auth check:', { 
          hasToken: !!sessionToken, 
          hasUsername: !!savedUsername, 
          isVerified 
        });
        
        if (!sessionToken || !savedUsername) {
          console.log('❌ Missing auth credentials, redirecting to login');
          window.location.href = '/login';
          return;
        }
        
        if (isVerified === 'false') {
          console.log('❌ User not verified, redirecting to verification');
          window.location.href = '/verify';
          return;
        }
        
        console.log('✅ User authenticated:', savedUsername);
        setUsername(savedUsername);
        setIsLoading(false);
        
        // 🔒 Load topics securely after authentication
        await loadTopics();
      }, 100); // Small delay to ensure cookies are set
    }
  }, []);

  // Cookie utility functions
  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  // Removed unused clearSession function

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

  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);

  // Function to render Lucide icons based on icon name
  const renderIcon = (iconName: string, size: number = 20) => {
    const icons: { [key: string]: React.ComponentType<{ size?: number }> } = {
      Workflow,
      Database,
      TerminalSquare,
      Network,
      Code2,
      Bug,
      Server,
      Bot
    };
    
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent size={size} /> : null;
  };

  return (
    <>
      <header className="zone-header">{` `}
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
                    {loadingTopics ? (
                      <LoadingSpinner size="medium" text="Loading topics..." />
                    ) : topicsError ? (
                      <div className="error-message">
                        <p>{topicsError}</p>
                        <button onClick={loadTopics} className="retry-btn">
                          Try Again
                        </button>
                      </div>
                    ) : (
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
                    )}
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
