import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Type definitions
interface DatabaseRow {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_description: string;
  topic_id: number;
  topic_name: string;
  topic_description: string;
  total_problems: number;
  difficulty_level: string;
  subtopic_id: number;
  subtopic_name: string;
}

interface UserRow {
  username: string;
}

// Database connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Validate user session
async function validateUserSession(request: NextRequest): Promise<UserRow | null> {
  const cookies = request.headers.get('cookie') || '';
  const sessionToken = cookies.split(';')
    .find(c => c.trim().startsWith('sessionToken='))
    ?.split('=')[1];
    
  if (!sessionToken) {
    return null;
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT username FROM users WHERE session_token = ? AND is_verified = true',
      [sessionToken]
    );
    await connection.end();
    
    const userRows = rows as UserRow[];
    return userRows.length > 0 ? userRows[0] : null;
  } catch (error) {
    console.error('Session validation error:', error);
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

    // 🗄️ DATABASE: Fetch categories, topics, and subtopics from database
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // Fetch categories with their topics and subtopics
      const [categoriesResult] = await connection.execute(`
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
          s.id as subtopic_id,
          s.name as subtopic_name
        FROM categories c
        LEFT JOIN topics t ON c.id = t.category_id AND t.is_active = TRUE
        LEFT JOIN subtopics s ON t.id = s.topic_id AND s.is_active = TRUE
        WHERE c.is_active = TRUE
        ORDER BY c.sort_order, t.sort_order, s.sort_order
      `);

      // Transform database results into the expected format
      const categoriesMap = new Map();
      
      const dbRows = categoriesResult as DatabaseRow[];
      dbRows.forEach((row) => {
        const { 
          category_id, category_name, category_icon, category_description,
          topic_id, topic_name, topic_description, total_problems, difficulty_level,
          subtopic_id, subtopic_name 
        } = row;

        // Initialize category if not exists
        if (!categoriesMap.has(category_id)) {
          categoriesMap.set(category_id, {
            name: category_name,
            icon: category_icon,
            description: category_description,
            topics: new Map()
          });
        }

        const category = categoriesMap.get(category_id);

        // Initialize topic if not exists and topic_id is not null
        if (topic_id && !category.topics.has(topic_id)) {
          category.topics.set(topic_id, {
            name: topic_name,
            description: topic_description,
            problems: total_problems || 0,
            completed: 0, // TODO: Calculate from user_progress table
            difficulty: difficulty_level,
            subtopics: []
          });
        }

        // Add subtopic if exists
        if (topic_id && subtopic_id && subtopic_name) {
          const topic = category.topics.get(topic_id);
          if (!topic.subtopics.includes(subtopic_name)) {
            topic.subtopics.push(subtopic_name);
          }
        }
      });

      // Convert Maps to Arrays for JSON response
      const categories = Array.from(categoriesMap.values()).map(category => ({
        name: category.name,
        icon: category.icon,
        description: category.description,
        topics: Array.from(category.topics.values())
      }));

      await connection.end();

      return NextResponse.json({ 
        categories,
        message: 'Topics loaded securely from database',
        user: user.username 
      });
      
    } catch (dbError) {
      await connection.end();
      throw dbError;
    }
    
  } catch (error) {
    console.error('Topics API error:', error);
    return NextResponse.json(
      { error: 'Failed to load topics from database' }, 
      { status: 500 }
    );
  }
}
