import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Get all categories with their topics and subtopics
      const [categories] = await connection.execute(`
        SELECT
          c.id as category_id,
          c.name as category_name,
          c.description as category_description,
          t.id as topic_id,
          t.name as topic_name,
          t.description as topic_description,
          t.difficulty_level,
          s.id as subtopic_id,
          s.name as subtopic_name,
          s.description as subtopic_description,
          COUNT(p.id) as problem_count
        FROM categories c
        LEFT JOIN topics t ON c.id = t.category_id AND t.is_active = TRUE
        LEFT JOIN subtopics s ON t.id = s.topic_id AND s.is_active = TRUE
        LEFT JOIN problems p ON s.id = p.subtopic_id AND p.status = 'active'
        WHERE c.is_active = TRUE
        GROUP BY c.id, c.name, c.description, t.id, t.name, t.description, t.difficulty_level, s.id, s.name, s.description
        ORDER BY c.sort_order, c.name, t.sort_order, t.name, s.sort_order, s.name
      `);

      // Get problem statistics
      const [stats] = await connection.execute(`
        SELECT
          COUNT(DISTINCT p.id) as total_problems,
          COUNT(DISTINCT c.id) as total_categories,
          COUNT(DISTINCT t.id) as total_topics,
          COUNT(DISTINCT s.id) as total_subtopics
        FROM problems p
        JOIN categories c ON p.category_id = c.id
        JOIN topics t ON p.topic_id = t.id
        JOIN subtopics s ON p.subtopic_id = s.id
        WHERE p.status = 'active' AND c.is_active = TRUE AND t.is_active = TRUE AND s.is_active = TRUE
      `);

      // Organize data hierarchically
      const organizedData: {
        stats: mysql.RowDataPacket;
        categories: Array<{
          id: number;
          name: string;
          description: string;
          topics: Array<{
            id: number;
            name: string;
            description: string;
            difficulty_level: string;
            subtopics: Array<{
              id: number;
              name: string;
              description: string;
              problem_count: number;
            }>;
          }>;
        }>;
      } = {
        stats: (stats as mysql.RowDataPacket[])[0],
        categories: []
      };

      const categoryMap = new Map();

      for (const row of categories as mysql.RowDataPacket[]) {
        if (!categoryMap.has(row.category_id)) {
          categoryMap.set(row.category_id, {
            id: row.category_id,
            name: row.category_name,
            description: row.category_description,
            topics: []
          });
        }

        const category = categoryMap.get(row.category_id)!;

        if (row.topic_id && !category.topics.find((t: { id: number }) => t.id === row.topic_id)) {
          category.topics.push({
            id: row.topic_id,
            name: row.topic_name,
            description: row.topic_description,
            difficulty_level: row.difficulty_level,
            subtopics: []
          });
        }

        if (row.topic_id && row.subtopic_id) {
          const topic = category.topics.find((t: { id: number }) => t.id === row.topic_id);
          if (topic && !topic.subtopics.find((s: { id: number }) => s.id === row.subtopic_id)) {
            topic.subtopics.push({
              id: row.subtopic_id,
              name: row.subtopic_name,
              description: row.subtopic_description,
              problem_count: row.problem_count
            });
          }
        }
      }

      organizedData.categories = Array.from(categoryMap.values());

      return NextResponse.json(organizedData);

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Database API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
