import { NextRequest, NextResponse } from 'next/server';
import { SecurityService } from '../../../../lib/security';
import { AINotesExtractor } from '../../../../lib/ai-notes-extractor';
import Database from '../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, category, topic, subtopic, sortOrder } = await request.json();

    if (!content || !category || !topic || !subtopic || sortOrder === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user ID
    const userResult = await Database.query(
      'SELECT id FROM users WHERE username = ?',
      [auth.username]
    ) as { id: number }[];

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Extract notes using AINotesExtractor
    await AINotesExtractor.updateLearningNotes(
      userId,
      category,
      topic,
      subtopic,
      sortOrder,
      content,
      '' // userMessage - empty for extraction from AI response only
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error extracting notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
