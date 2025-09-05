import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const topic = searchParams.get('topic');
    const subtopic = searchParams.get('subtopic');
    const sortOrder = searchParams.get('sortOrder');

    if (!category || !topic || !subtopic || !sortOrder) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const db = await connection;

    // Fetch problem by sort order
    const [rows] = await db.execute(`
      SELECT 
        p.*,
        c.name as category_name,
        t.name as topic_name,
        st.name as subtopic_name
      FROM problems p
      JOIN categories c ON p.category_id = c.id
      JOIN topics t ON p.topic_id = t.id
      JOIN subtopics st ON p.subtopic_id = st.id
      WHERE c.slug = ? 
        AND t.slug = ? 
        AND st.slug = ? 
        AND p.sort_order = ?
      LIMIT 1
    `, [category, topic, subtopic, parseInt(sortOrder)]);

    const problems = rows as Array<{
      id: number;
      title: string;
      description: string;
      difficulty: string;
      category_name: string;
      topic_name: string;
      subtopic_name: string;
      [key: string]: unknown;
    }>;

    if (problems.length === 0) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      problem: problems[0]
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
