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

    // Convert URL format to database format
    const formatUrlToDbName = (urlName: string) => {
      // Handle special cases first
      const specialCases: { [key: string]: string } = {
        'core-dsa': 'Core DSA',
        'arrays-and-matrices': 'Arrays and Matrices',
        'core-array-operations-and-their-time-complexity': 'Array Fundamentals'
      };

      if (specialCases[urlName]) {
        return specialCases[urlName];
      }

      // Default conversion
      return urlName
        .replace(/-/g, ' ')
        .replace(/and/g, '&')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const categoryName = formatUrlToDbName(category);
    const topicName = formatUrlToDbName(topic);
    const subtopicName = formatUrlToDbName(subtopic);

    console.log('Searching for:', { categoryName, topicName, subtopicName, sortOrder });

    // First, get the IDs for category, topic, and subtopic
    const categoryData = await Database.query(
      'SELECT id FROM categories WHERE name = ?',
      [categoryName]
    ) as { id: number }[];

    console.log('Category found:', categoryData);

    const topicData = await Database.query(
      'SELECT id FROM topics WHERE name = ? AND category_id = ?',
      [topicName, categoryData[0]?.id]
    ) as { id: number }[];

    console.log('Topic found:', topicData);

    const subtopicData = await Database.query(
      'SELECT id FROM subtopics WHERE name = ? AND topic_id = ?',
      [subtopicName, topicData[0]?.id]
    ) as { id: number }[];

    console.log('Subtopic found:', subtopicData);

    if (!categoryData.length || !topicData.length || !subtopicData.length) {
      console.log('Missing data:', { 
        categoryFound: categoryData.length > 0, 
        topicFound: topicData.length > 0, 
        subtopicFound: subtopicData.length > 0 
      });
      return NextResponse.json(
        { 
          error: 'Category, topic, or subtopic not found',
          details: {
            category: categoryName,
            topic: topicName,
            subtopic: subtopicName,
            categoryFound: categoryData.length > 0,
            topicFound: topicData.length > 0,
            subtopicFound: subtopicData.length > 0
          }
        },
        { status: 404 }
      );
    }

    // Get problems for this subtopic ordered by sort_order
    const problems = await Database.query(`
      SELECT 
        id,
        problem_name as title,
        problem_description as description,
        difficulty,
        sort_order
      FROM problems 
      WHERE subtopic_id = ? AND sort_order = ? AND status = 'active'
    `, [subtopicData[0].id, parseInt(sortOrder)]) as {
      id: number;
      title: string;
      description: string;
      difficulty: string;
      sort_order: number;
    }[];

    console.log('Problems found:', problems.length);

    if (!problems.length) {
      return NextResponse.json(
        { 
          error: 'Problem not found for the specified sort order',
          details: {
            subtopicId: subtopicData[0].id,
            sortOrder: sortOrder,
            searchedSortOrder: parseInt(sortOrder)
          }
        },
        { status: 404 }
      );
    }

    const problem = problems[0];
    
    return NextResponse.json({
      id: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      sortOrder: problem.sort_order
    });

  } catch (error) {
    console.error('Error fetching problem by location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
