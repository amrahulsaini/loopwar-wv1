import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';
import { AINotesExtractor } from '@/lib/ai-notes-extractor';
import { SecurityService } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const topic = searchParams.get('topic');
    const subtopic = searchParams.get('subtopic');
    const sortOrder = searchParams.get('sortOrder');

    if (!category || !topic || !subtopic || !sortOrder) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Get user ID from database
    const userResult = await Database.query(
      'SELECT id FROM users WHERE username = ?',
      [auth.username]
    ) as { id: number }[];

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Get learning notes
    const notes = await AINotesExtractor.getLearningNotes(
      userId,
      category,
      topic,
      subtopic,
      parseInt(sortOrder)
    );

    return NextResponse.json({ notes });

  } catch (error) {
    console.error('Error fetching learning notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { personalNotes, userHighlights, customTags, noteId } = await request.json();

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    // Update personal notes
    const success = await AINotesExtractor.updatePersonalNotes(
      noteId,
      personalNotes || '',
      userHighlights || [],
      customTags || []
    );

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error updating personal notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
