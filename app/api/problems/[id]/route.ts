import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const problemId = id;
    
    if (!problemId) {
      return NextResponse.json(
        { error: 'Problem ID is required' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      // Fetch problem with category, topic, and subtopic information
      const [problemRows] = await connection.execute(`
        SELECT 
          p.id,
          p.title,
          p.description,
          p.difficulty,
          p.solution_hints,
          p.time_complexity,
          p.space_complexity,
          p.tags,
          c.name as category_name,
          c.description as category_description,
          t.name as topic_name,
          t.description as topic_description,
          t.difficulty_level as topic_difficulty,
          s.name as subtopic_name,
          s.description as subtopic_description
        FROM problems p
        LEFT JOIN subtopics s ON p.subtopic_id = s.id
        LEFT JOIN topics t ON s.topic_id = t.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE p.id = ? AND p.is_active = TRUE
      `, [problemId]);

      if ((problemRows as mysql.RowDataPacket[]).length === 0) {
        return NextResponse.json(
          { error: 'Problem not found' },
          { status: 404 }
        );
      }

      const problem = (problemRows as mysql.RowDataPacket[])[0];

      // Fetch related problems in the same subtopic for recommendations
      const [relatedProblems] = await connection.execute(`
        SELECT id, title, difficulty
        FROM problems 
        WHERE subtopic_id = (
          SELECT subtopic_id FROM problems WHERE id = ?
        ) AND id != ? AND is_active = TRUE
        LIMIT 5
      `, [problemId, problemId]);

      // Fetch prerequisites (problems from prerequisite topics)
      const [prerequisites] = await connection.execute(`
        SELECT DISTINCT
          p.id,
          p.title,
          t.name as topic_name,
          s.name as subtopic_name
        FROM problems p
        JOIN subtopics s ON p.subtopic_id = s.id
        JOIN topics t ON s.topic_id = t.id
        WHERE t.sort_order < (
          SELECT t2.sort_order 
          FROM problems p2
          JOIN subtopics s2 ON p2.subtopic_id = s2.id
          JOIN topics t2 ON s2.topic_id = t2.id
          WHERE p2.id = ?
        )
        ORDER BY t.sort_order DESC, s.sort_order DESC
        LIMIT 3
      `, [problemId]);

      // Parse tags if they exist
      let parsedTags = [];
      if (problem.tags) {
        try {
          parsedTags = JSON.parse(problem.tags);
        } catch (e) {
          parsedTags = [];
        }
      }

      const responseData = {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        solutionHints: problem.solution_hints,
        timeComplexity: problem.time_complexity,
        spaceComplexity: problem.space_complexity,
        tags: parsedTags,
        category: {
          name: problem.category_name,
          description: problem.category_description
        },
        topic: {
          name: problem.topic_name,
          description: problem.topic_description,
          difficulty: problem.topic_difficulty
        },
        subtopic: {
          name: problem.subtopic_name,
          description: problem.subtopic_description
        },
        relatedProblems: relatedProblems,
        prerequisites: prerequisites
      };

      return NextResponse.json(responseData);

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Problem API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
