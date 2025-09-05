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
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const currentProblemId = searchParams.get('current_problem_id');

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing user_id parameter' },
      { status: 400 }
    );
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    try {
      let recommendations: mysql.RowDataPacket[] = [];

      if (currentProblemId) {
        // Get current problem details
        const [currentProblem] = await connection.execute(
          'SELECT p.*, c.name as category_name, t.name as topic_name, s.name as subtopic_name FROM problems p JOIN categories c ON p.category_id = c.id JOIN topics t ON p.topic_id = t.id JOIN subtopics s ON p.subtopic_id = s.id WHERE p.id = ?',
          [currentProblemId]
        );

        if ((currentProblem as mysql.RowDataPacket[]).length > 0) {
          const problem = (currentProblem as mysql.RowDataPacket[])[0];

          // Find similar problems in the same subtopic
          const [similarProblems] = await connection.execute(
            'SELECT p.*, c.name as category_name, t.name as topic_name, s.name as subtopic_name FROM problems p JOIN categories c ON p.category_id = c.id JOIN topics t ON p.topic_id = t.id JOIN subtopics s ON p.subtopic_id = s.id WHERE p.subtopic_id = ? AND p.id != ? AND p.status = "active" ORDER BY p.difficulty LIMIT 5',
            [problem.subtopic_id, currentProblemId]
          );

          // Find problems in related subtopics
          const [relatedProblems] = await connection.execute(
            'SELECT p.*, c.name as category_name, t.name as topic_name, s.name as subtopic_name FROM problems p JOIN categories c ON p.category_id = c.id JOIN topics t ON p.topic_id = t.id JOIN subtopics s ON p.subtopic_id = s.id WHERE p.topic_id = ? AND p.subtopic_id != ? AND p.status = "active" ORDER BY p.difficulty LIMIT 3',
            [problem.topic_id, problem.subtopic_id]
          );

          recommendations = [
            ...(similarProblems as mysql.RowDataPacket[]),
            ...(relatedProblems as mysql.RowDataPacket[])
          ].slice(0, 5);
        }
      } else {
        // General recommendations based on user progress
        const [generalRecs] = await connection.execute(
          'SELECT p.*, c.name as category_name, t.name as topic_name, s.name as subtopic_name FROM problems p JOIN categories c ON p.category_id = c.id JOIN topics t ON p.topic_id = t.id JOIN subtopics s ON p.subtopic_id = s.id WHERE p.status = "active" ORDER BY p.difficulty LIMIT 5'
        );
        recommendations = generalRecs as mysql.RowDataPacket[];
      }

      return NextResponse.json({
        recommendations: recommendations,
        total: recommendations.length
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Study Recommendations API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
