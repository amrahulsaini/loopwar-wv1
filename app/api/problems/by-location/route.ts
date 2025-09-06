import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const topic = searchParams.get('topic');
    const subtopic = searchParams.get('subtopic');
    const sortOrder = searchParams.get('sortOrder');

    if (!category || !topic || !subtopic || !sortOrder) {
      return NextResponse.json(
        { error: 'Missing required parameters: category, topic, subtopic, sortOrder' },
        { status: 400 }
      );
    }

    // First, get the IDs for category, topic, and subtopic
    const categoryData = await Database.query(
      'SELECT id FROM categories WHERE url_name = ?',
      [category]
    ) as { id: number }[];

    const topicData = await Database.query(
      'SELECT id FROM topics WHERE url_name = ? AND category_id = ?',
      [topic, categoryData[0]?.id]
    ) as { id: number }[];

    const subtopicData = await Database.query(
      'SELECT id FROM subtopics WHERE url_name = ? AND topic_id = ?',
      [subtopic, topicData[0]?.id]
    ) as { id: number }[];

    if (!categoryData.length || !topicData.length || !subtopicData.length) {
      return NextResponse.json(
        { error: 'Category, topic, or subtopic not found' },
        { status: 404 }
      );
    }

    // Get problems for this subtopic ordered by sort_order or created_at
    const problems = await Database.query(`
      SELECT 
        id,
        title,
        description,
        difficulty,
        hints,
        time_complexity,
        space_complexity,
        problem_statement,
        examples
      FROM problems 
      WHERE subtopic_id = ? 
      ORDER BY id ASC
      LIMIT 1 OFFSET ?
    `, [subtopicData[0].id, parseInt(sortOrder) - 1]) as {
      id: number;
      title: string;
      description: string;
      difficulty: string;
      hints: string;
      time_complexity: string;
      space_complexity: string;
      problem_statement: string;
      examples: string;
    }[];

    if (!problems.length) {
      return NextResponse.json(
        { error: 'Problem not found for the specified sort order' },
        { status: 404 }
      );
    }

    const problem = problems[0];
    
    return NextResponse.json({
      id: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      hints: problem.hints,
      complexity: problem.time_complexity,
      problemStatement: problem.problem_statement,
      examples: problem.examples
    });

  } catch (error) {
    console.error('Error fetching problem by location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
