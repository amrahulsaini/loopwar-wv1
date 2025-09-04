import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/database';
import { SecurityService } from '../../../../lib/security';
import { RowDataPacket } from 'mysql2';

// GET - Fetch all categories, topics, and subtopics for admin
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch all categories
    const categories = await Database.query(
      'SELECT id, name FROM categories ORDER BY name'
    ) as RowDataPacket[];

    // Fetch all topics with their category IDs
    const topics = await Database.query(
      'SELECT id, name, category_id FROM topics ORDER BY name'
    ) as RowDataPacket[];

    // Fetch all subtopics with their topic IDs
    const subtopics = await Database.query(
      'SELECT id, name, topic_id FROM subtopics ORDER BY name'
    ) as RowDataPacket[];

    return NextResponse.json({
      success: true,
      categories: categories,
      topics: topics,
      subtopics: subtopics
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch categories data',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
