import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const topic = searchParams.get('topic');
    const subtopic = searchParams.get('subtopic');
    const limit = parseInt(searchParams.get('limit') || '10');

    const connection = await mysql.createConnection(dbConfig);

    try {
      let query = `
        SELECT 
          p.id,
          p.title,
          p.description,
          p.difficulty,
          p.time_complexity,
          p.space_complexity,
          c.name as category_name,
          t.name as topic_name,
          s.name as subtopic_name
        FROM problems p
        LEFT JOIN subtopics s ON p.subtopic_id = s.id
        LEFT JOIN topics t ON s.topic_id = t.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE p.is_active = TRUE
      `;
      
      const params: string[] = [];

      if (category) {
        query += ` AND c.name = ?`;
        params.push(category);
      }

      if (topic) {
        query += ` AND t.name = ?`;
        params.push(topic);
      }

      if (subtopic) {
        query += ` AND s.name = ?`;
        params.push(subtopic);
      }

      query += ` ORDER BY p.id ASC LIMIT ?`;
      params.push(limit.toString());

      const [problems] = await connection.execute(query, params);

      return NextResponse.json({
        problems: problems,
        count: (problems as mysql.RowDataPacket[]).length
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Problems API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create sample problems if none exist
export async function POST() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Check if problems already exist
      const [existingProblems] = await connection.execute(
        'SELECT COUNT(*) as count FROM problems WHERE is_active = TRUE'
      );

      const count = (existingProblems as mysql.RowDataPacket[])[0].count;
      
      if (count > 0) {
        return NextResponse.json({
          message: `${count} problems already exist`,
          created: false
        });
      }

      // Create sample problems for the learning workspace
      const sampleProblems = [
        {
          title: "Core Array Operations & Their Time Complexity",
          description: "Learn fundamental array operations like insertion, deletion, search, and update. Understand their time and space complexities.",
          difficulty: "Easy",
          time_complexity: "O(1) to O(n)",
          space_complexity: "O(1)",
          solution_hints: "Start by understanding how arrays are stored in memory. Practice basic operations and analyze their complexities.",
          subtopic_id: 1 // Array Fundamentals
        },
        {
          title: "Two Pointer Technique for Array Problems",
          description: "Master the two-pointer technique for solving array problems efficiently. Learn when and how to use this powerful approach.",
          difficulty: "Medium",
          time_complexity: "O(n)",
          space_complexity: "O(1)",
          solution_hints: "Use two pointers moving from opposite ends or at different speeds. Consider the problem constraints.",
          subtopic_id: 2 // Two Pointers
        },
        {
          title: "String Pattern Matching with KMP Algorithm",
          description: "Understand the Knuth-Morris-Pratt algorithm for efficient string pattern matching. Learn to build the failure function.",
          difficulty: "Hard",
          time_complexity: "O(n + m)",
          space_complexity: "O(m)",
          solution_hints: "Build the failure function first. Understand how it helps avoid redundant comparisons.",
          subtopic_id: 3 // Pattern Matching
        }
      ];

      for (const problem of sampleProblems) {
        await connection.execute(`
          INSERT INTO problems (title, description, difficulty, time_complexity, space_complexity, solution_hints, subtopic_id, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
        `, [
          problem.title,
          problem.description,
          problem.difficulty,
          problem.time_complexity,
          problem.space_complexity,
          problem.solution_hints,
          problem.subtopic_id
        ]);
      }

      return NextResponse.json({
        message: `Created ${sampleProblems.length} sample problems`,
        created: true
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Create Problems API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
