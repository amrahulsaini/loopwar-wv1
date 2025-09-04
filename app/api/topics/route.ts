import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../lib/database';

// Validate user session
// Simple cookie-based validation (no database needed)
async function validateUserSession(request: NextRequest): Promise<{ username: string } | null> {
  const cookies = request.headers.get('cookie') || '';
  const sessionToken = cookies.split(';')
    .find(c => c.trim().startsWith('sessionToken='))
    ?.split('=')[1];
    
  const username = cookies.split(';')
    .find(c => c.trim().startsWith('username='))
    ?.split('=')[1];
    
  if (!sessionToken || !username) {
    return null;
  }
  
  // Return user info from cookies (no database call needed)
  return { username: decodeURIComponent(username) };
}

// Fetch topics data from database
async function fetchTopicsFromDatabase() {
  try {
    // Query to get all categories with their topics and subtopics
    const categoriesResult = await Database.query(`
      SELECT 
        c.id as category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.description as category_description,
        t.id as topic_id,
        t.name as topic_name,
        t.description as topic_description,
        t.total_problems,
        t.difficulty_level,
        t.sort_order as topic_sort_order,
        s.id as subtopic_id,
        s.name as subtopic_name,
        s.sort_order as subtopic_sort_order
      FROM categories c
      LEFT JOIN topics t ON c.id = t.category_id
      LEFT JOIN subtopics s ON t.id = s.topic_id
      WHERE c.is_active = 1 AND (t.is_active = 1 OR t.is_active IS NULL) AND (s.is_active = 1 OR s.is_active IS NULL)
      ORDER BY c.sort_order, t.sort_order, s.sort_order
    `);
    
    // Process the results to group by categories and topics
    const categoriesMap = new Map();
    
    // Type definition for database row
    interface DatabaseRow {
      category_id: number;
      category_name: string;
      category_icon: string;
      category_description: string;
      topic_id: number | null;
      topic_name: string | null;
      topic_description: string | null;
      total_problems: number | null;
      difficulty_level: string | null;
      topic_sort_order: number | null;
      subtopic_id: number | null;
      subtopic_name: string | null;
      subtopic_sort_order: number | null;
    }
    
    (categoriesResult as DatabaseRow[]).forEach(row => {
      const categoryKey = row.category_id;
      const topicKey = row.topic_id;
      
      if (!categoriesMap.has(categoryKey)) {
        categoriesMap.set(categoryKey, {
          name: row.category_name,
          icon: row.category_icon,
          description: row.category_description,
          topics: new Map()
        });
      }
      
      const category = categoriesMap.get(categoryKey);
      
      if (row.topic_id && !category.topics.has(topicKey)) {
        category.topics.set(topicKey, {
          name: row.topic_name,
          description: row.topic_description,
          problems: row.total_problems || 0,
          completed: 0, // This would come from user progress data
          difficulty: row.difficulty_level,
          subtopics: []
        });
      }
      
      if (row.subtopic_id && category.topics.has(topicKey)) {
        const topic = category.topics.get(topicKey);
        topic.subtopics.push(row.subtopic_name);
      }
    });
    
    // Convert maps to arrays
    const categories = Array.from(categoriesMap.values()).map(category => ({
      ...category,
      topics: Array.from(category.topics.values())
    }));
    
    return categories;
    
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // 🔒 SECURITY: Validate user session
    const user = await validateUserSession(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized access. Please login first.' }, 
        { status: 401 }
      );
    }

    // Try to fetch data from database first
    let categories = await fetchTopicsFromDatabase();
    
    // If database fails, use fallback data
    if (!categories) {
      console.log('Database unavailable, using fallback data');
      categories = getFallbackCategories();
    }

    return NextResponse.json({ 
      categories,
      message: categories ? 'Topics loaded successfully from database' : 'Topics loaded from fallback data',
      user: user.username 
    });
    
  } catch (error) {
    console.error('Topics API error:', error);
    
    // Return fallback data on any error
    const fallbackCategories = getFallbackCategories();
    return NextResponse.json({ 
      categories: fallbackCategories,
      message: 'Topics loaded from fallback data (error occurred)',
      user: 'guest' 
    });
  }
}

// Fallback data function for when database is not available
function getFallbackCategories() {
  return [
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
          subtopics: ['Array Fundamentals', 'Subarray Problems', 'Matrix Operations', 'Array Rotations', 'Prefix and Suffix Arrays']
        },
        {
          name: 'Strings and Pattern Matching',
          problems: 45,
          completed: 0,
          difficulty: 'Beginner',
          subtopics: ['String Basics', 'Palindromes', 'KMP Algorithm', 'String Hashing', 'Anagrams and Permutations']
        },
        {
          name: 'Hash Tables and Maps',
          problems: 40,
          completed: 0,
          difficulty: 'Intermediate',
          subtopics: ['Hash Map Basics', 'Frequency Counting', 'Hash Set Operations', 'Two Sum Variants', 'Custom Hash Functions']
        },
        {
          name: 'Sorting and Searching',
          problems: 50,
          completed: 0,
          difficulty: 'Intermediate',
          subtopics: ['Basic Sorting Algorithms', 'Binary Search Fundamentals', 'Binary Search Variants', 'Custom Comparators', 'Search in Rotated Arrays']
        },
        {
          name: 'Two Pointers and Sliding Window',
          problems: 35,
          completed: 0,
          difficulty: 'Intermediate',
          subtopics: ['Two Pointers Technique', 'Fast and Slow Pointers', 'Fixed Window Size', 'Variable Window Size', 'Multiple Pointers']
        },
        {
          name: 'Stacks and Queues',
          problems: 45,
          completed: 0,
          difficulty: 'Beginner',
          subtopics: ['Stack Fundamentals', 'Monotonic Stack', 'Queue Operations', 'Priority Queues', 'Expression Evaluation']
        },
        {
          name: 'Linked Lists',
          problems: 38,
          completed: 0,
          difficulty: 'Beginner',
          subtopics: ['Singly Linked Lists', 'Doubly Linked Lists', 'Cycle Detection', 'List Reversal', 'Merge Operations']
        },
        {
          name: 'Trees and Binary Trees',
          problems: 70,
          completed: 0,
          difficulty: 'Intermediate',
          subtopics: ['Tree Traversals', 'Tree Construction', 'Tree Properties', 'Lowest Common Ancestor', 'Tree Views and Paths']
        },
        {
          name: 'Binary Search Trees and Heaps',
          problems: 42,
          completed: 0,
          difficulty: 'Intermediate',
          subtopics: ['BST Operations', 'BST Validation', 'Heap Implementation', 'Heap Sort', 'Balanced Trees']
        },
        {
          name: 'Graphs and Graph Algorithms',
          problems: 85,
          completed: 0,
          difficulty: 'Advanced',
          subtopics: ['Graph Representation', 'DFS and BFS', 'Shortest Path Algorithms', 'Minimum Spanning Tree', 'Topological Sorting']
        },
        {
          name: 'Dynamic Programming',
          problems: 90,
          completed: 0,
          difficulty: 'Advanced',
          subtopics: ['1D Dynamic Programming', '2D Dynamic Programming', 'Knapsack Problems', 'LCS and LIS', 'Tree DP']
        },
        {
          name: 'Greedy Algorithms',
          problems: 35,
          completed: 0,
          difficulty: 'Advanced',
          subtopics: ['Greedy Choice Strategy', 'Activity Selection', 'Interval Problems', 'Huffman Coding', 'Fractional Knapsack']
        },
        {
          name: 'Backtracking and Recursion',
          problems: 48,
          completed: 0,
          difficulty: 'Advanced',
          subtopics: ['Recursion Fundamentals', 'Permutations and Combinations', 'N-Queens Problem', 'Sudoku Solver', 'Subset Generation']
        },
        {
          name: 'Bit Manipulation',
          problems: 25,
          completed: 0,
          difficulty: 'Intermediate',
          subtopics: ['Bitwise Operations', 'Bit Masking', 'XOR Properties', 'Single Number Problems', 'Bit Counting']
        },
        {
          name: 'Advanced Data Structures',
          problems: 30,
          completed: 0,
          difficulty: 'Advanced',
          subtopics: ['Trie (Prefix Tree)', 'Segment Tree', 'Binary Indexed Tree', 'Disjoint Set Union', 'Sparse Table']
        }
      ]
    }
  ];
}
