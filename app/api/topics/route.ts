import { NextRequest, NextResponse } from 'next/server';

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

    // � RETURN FALLBACK DATA (DSA Topics)
    const categories = [
      {
        name: 'DSA Core',
        icon: 'Workflow',
        description: 'Fundamental Data Structures and Algorithms',
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
      }
    ];

    return NextResponse.json({ 
      categories,
      message: 'Topics loaded successfully (using fallback data)',
      user: user.username 
    });
    
  } catch (error) {
    console.error('Topics API error:', error);
    return NextResponse.json(
      { error: 'Failed to load topics' }, 
      { status: 500 }
    );
  }
}
