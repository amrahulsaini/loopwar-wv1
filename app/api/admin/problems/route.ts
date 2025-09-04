import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/database';
import { RowDataPacket } from 'mysql2';

interface ProblemRequest {
  category_id: number;
  topic_id: number;
  subtopic_id: number;
  problem_name: string;
  problem_description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sort_order?: number;
}

// GET - Fetch problems for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subtopicId = searchParams.get('subtopic_id');
    const categoryId = searchParams.get('category_id');
    const topicId = searchParams.get('topic_id');
    
    // Handle name-based queries (for frontend subtopic pages)
    const categoryParam = searchParams.get('category');
    const topicParam = searchParams.get('topic');
    const subtopicParam = searchParams.get('subtopic');

    let query = `
      SELECT 
        p.id,
        p.problem_name,
        p.problem_description,
        p.difficulty,
        p.sort_order,
        p.created_at,
        p.created_by,
        p.status,
        c.name as category_name,
        t.name as topic_name,
        s.name as subtopic_name
      FROM problems p
      JOIN categories c ON p.category_id = c.id
      JOIN topics t ON p.topic_id = t.id
      JOIN subtopics s ON p.subtopic_id = s.id
      WHERE p.status = 'active'
    `;

    const queryParams: (string | number)[] = [];

    // Handle ID-based queries (for admin panel)
    if (subtopicId) {
      query += ' AND p.subtopic_id = ?';
      queryParams.push(subtopicId);
    }

    if (categoryId) {
      query += ' AND p.category_id = ?';
      queryParams.push(categoryId);
    }

    if (topicId) {
      query += ' AND p.topic_id = ?';
      queryParams.push(topicId);
    }

    // Handle name-based queries (for frontend subtopic pages)
    if (subtopicParam && topicParam && categoryParam) {
      // Instead of converting names, let's find the IDs first
      console.log('URL params received:', { categoryParam, topicParam, subtopicParam });
      
      // First get all categories/topics/subtopics to find matching IDs
      const categoriesQuery = await Database.query('SELECT id, name FROM categories') as RowDataPacket[];
      const topicsQuery = await Database.query('SELECT id, name, category_id FROM topics') as RowDataPacket[];
      const subtopicsQuery = await Database.query('SELECT id, name, topic_id FROM subtopics') as RowDataPacket[];
      
      console.log('Database categories:', categoriesQuery);
      console.log('Database topics:', topicsQuery);
      console.log('Database subtopics:', subtopicsQuery);
      
      // Find category by URL format (now using hyphens)
      const categoryObj = categoriesQuery.find((cat) => {
        const dbNameFormatted = (cat as {name: string, id: number}).name.toLowerCase()
          .replace(/\s+/g, '-')  // Replace spaces with hyphens
          .replace(/&/g, 'and')  // Replace & with 'and'
          .replace(/[^a-z0-9-]/g, '');  // Remove special characters except hyphens
        console.log(`Comparing "${dbNameFormatted}" with "${categoryParam.toLowerCase()}"`);
        return dbNameFormatted === categoryParam.toLowerCase();
      }) as {name: string, id: number} | undefined;
      
      if (categoryObj) {
        console.log('Found category:', categoryObj);
        
        // Find topic in this category
        const topicObj = topicsQuery.find((top) => {
          const dbNameFormatted = (top as {name: string, category_id: number, id: number}).name.toLowerCase()
            .replace(/\s+/g, '-')  // Replace spaces with hyphens
            .replace(/&/g, 'and')  // Replace & with 'and'
            .replace(/[^a-z0-9-]/g, '');  // Remove special characters except hyphens
          const categoryId = (top as {name: string, category_id: number, id: number}).category_id;
          console.log(`Comparing topic "${dbNameFormatted}" with "${topicParam.toLowerCase()}" for category ${categoryId}`);
          return dbNameFormatted === topicParam.toLowerCase() && categoryId === categoryObj.id;
        }) as {name: string, category_id: number, id: number} | undefined;
        
        if (topicObj) {
          console.log('Found topic:', topicObj);
          
          // Find subtopic in this topic
          const subtopicObj = subtopicsQuery.find((sub) => {
            const dbNameFormatted = (sub as {name: string, topic_id: number, id: number}).name.toLowerCase()
              .replace(/\s+/g, '-')  // Replace spaces with hyphens
              .replace(/&/g, 'and')  // Replace & with 'and'
              .replace(/[^a-z0-9-]/g, '');  // Remove special characters except hyphens
            const topicId = (sub as {name: string, topic_id: number, id: number}).topic_id;
            console.log(`Comparing subtopic "${dbNameFormatted}" with "${subtopicParam.toLowerCase()}" for topic ${topicId}`);
            return dbNameFormatted === subtopicParam.toLowerCase() && topicId === topicObj.id;
          }) as {name: string, topic_id: number, id: number} | undefined;
          
          if (subtopicObj) {
            console.log('Found subtopic:', subtopicObj);
            // Use IDs for the query
            query += ' AND p.category_id = ? AND p.topic_id = ? AND p.subtopic_id = ?';
            queryParams.push(categoryObj.id, topicObj.id, subtopicObj.id);
          } else {
            console.log('Subtopic not found');
            // Return empty result if subtopic doesn't exist
            return NextResponse.json({
              success: true,
              problems: [],
              total: 0
            });
          }
        } else {
          console.log('Topic not found');
          return NextResponse.json({
            success: true,
            problems: [],
            total: 0
          });
        }
      } else {
        console.log('Category not found');
        return NextResponse.json({
          success: true,
          problems: [],
          total: 0
        });
      }
    } else if (topicParam && categoryParam) {
      // Similar logic for topic-only queries
      const categoriesQuery = await Database.query('SELECT id, name FROM categories') as RowDataPacket[];
      const topicsQuery = await Database.query('SELECT id, name, category_id FROM topics') as RowDataPacket[];
      
      const categoryObj = categoriesQuery.find((cat) => 
        (cat as {name: string, id: number}).name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/&/g, 'and')
          .replace(/[^a-z0-9-]/g, '') === categoryParam.toLowerCase()
      ) as {name: string, id: number} | undefined;
      
      if (categoryObj) {
        const topicObj = topicsQuery.find((top) => 
          (top as {name: string, category_id: number, id: number}).name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9-]/g, '') === topicParam.toLowerCase() && 
          (top as {name: string, category_id: number, id: number}).category_id === categoryObj.id
        ) as {name: string, category_id: number, id: number} | undefined;
        
        if (topicObj) {
          query += ' AND p.category_id = ? AND p.topic_id = ?';
          queryParams.push(categoryObj.id, topicObj.id);
        } else {
          return NextResponse.json({
            success: true,
            problems: [],
            total: 0
          });
        }
      } else {
        return NextResponse.json({
          success: true,
          problems: [],
          total: 0
        });
      }
    } else if (categoryParam) {
      const categoriesQuery = await Database.query('SELECT id, name FROM categories') as RowDataPacket[];
      
      const categoryObj = categoriesQuery.find((cat) => 
        (cat as {name: string, id: number}).name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/&/g, 'and')
          .replace(/[^a-z0-9-]/g, '') === categoryParam.toLowerCase()
      ) as {name: string, id: number} | undefined;
      
      if (categoryObj) {
        query += ' AND p.category_id = ?';
        queryParams.push(categoryObj.id);
      } else {
        return NextResponse.json({
          success: true,
          problems: [],
          total: 0
        });
      }
    }

    // Add ordering - sort by sort_order first, then by created_at
    query += ' ORDER BY p.sort_order ASC, p.created_at DESC';

    console.log('Final query:', query);
    console.log('Query params:', queryParams);

    const rows = await Database.query(query, queryParams) as RowDataPacket[];

    console.log('Query result count:', rows.length);
    if (rows.length > 0) {
      console.log('Sample result:', rows[0]);
    }

    return NextResponse.json({
      success: true,
      problems: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch problems',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST - Add new problem
export async function POST(request: NextRequest) {
  try {
    const body: ProblemRequest = await request.json();
    
    const {
      category_id,
      topic_id,
      subtopic_id,
      problem_name,
      problem_description,
      difficulty,
      sort_order
    } = body;

    // Validate required fields
    if (!category_id || !topic_id || !subtopic_id || !problem_name || !problem_description) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate difficulty
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return NextResponse.json(
        { success: false, message: 'Invalid difficulty level' },
        { status: 400 }
      );
    }

    // Check if subtopic exists
    const subtopicCheck = await Database.query(
      'SELECT id FROM subtopics WHERE id = ? AND topic_id = ?',
      [subtopic_id, topic_id]
    ) as RowDataPacket[];

    if (subtopicCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid subtopic or topic combination' },
        { status: 400 }
      );
    }

    // Determine sort_order
    let finalSortOrder = sort_order;
    if (!sort_order) {
      // Get the next available sort_order for this subtopic
      const maxSortQuery = await Database.query(
        'SELECT MAX(sort_order) as max_order FROM problems WHERE subtopic_id = ?',
        [subtopic_id]
      ) as RowDataPacket[];
      
      const maxOrder = maxSortQuery[0]?.max_order || 0;
      finalSortOrder = maxOrder + 1;
    } else {
      // If sort_order is specified, shift existing problems to make room
      await Database.query(
        'UPDATE problems SET sort_order = sort_order + 1 WHERE subtopic_id = ? AND sort_order >= ?',
        [subtopic_id, sort_order]
      );
    }

    // Insert new problem
    const result = await Database.query(
      `INSERT INTO problems 
       (category_id, topic_id, subtopic_id, problem_name, problem_description, difficulty, sort_order, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, topic_id, subtopic_id, problem_name, problem_description, difficulty, finalSortOrder, 'admin']
    );

    const insertResult = result as { insertId: number };
    const problemId = insertResult.insertId;

    // Fetch the created problem with related data
    const createdProblem = await Database.query(
      `SELECT 
        p.id,
        p.problem_name,
        p.problem_description,
        p.difficulty,
        p.sort_order,
        p.created_at,
        c.name as category_name,
        t.name as topic_name,
        s.name as subtopic_name
       FROM problems p
       JOIN categories c ON p.category_id = c.id
       JOIN topics t ON p.topic_id = t.id
       JOIN subtopics s ON p.subtopic_id = s.id
       WHERE p.id = ?`,
      [problemId]
    ) as RowDataPacket[];

    return NextResponse.json({
      success: true,
      message: 'Problem added successfully',
      problem: createdProblem[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to add problem',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing problem
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      category_id,
      topic_id,
      subtopic_id,
      problem_name,
      problem_description,
      difficulty,
      sort_order
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Problem ID is required' },
        { status: 400 }
      );
    }

    // If sort_order is being updated, handle reordering
    if (sort_order !== undefined) {
      // Get current problem details
      const currentProblem = await Database.query(
        'SELECT sort_order, subtopic_id FROM problems WHERE id = ?',
        [id]
      ) as RowDataPacket[];

      if (currentProblem.length > 0) {
        const oldOrder = currentProblem[0].sort_order;
        const currentSubtopicId = currentProblem[0].subtopic_id;

        // If the sort order is changing
        if (oldOrder !== sort_order) {
          if (sort_order > oldOrder) {
            // Moving down: shift problems up
            await Database.query(
              'UPDATE problems SET sort_order = sort_order - 1 WHERE subtopic_id = ? AND sort_order > ? AND sort_order <= ?',
              [currentSubtopicId, oldOrder, sort_order]
            );
          } else {
            // Moving up: shift problems down
            await Database.query(
              'UPDATE problems SET sort_order = sort_order + 1 WHERE subtopic_id = ? AND sort_order >= ? AND sort_order < ?',
              [currentSubtopicId, sort_order, oldOrder]
            );
          }
        }
      }

      // Update problem with new sort_order
      await Database.query(
        `UPDATE problems 
         SET category_id = ?, topic_id = ?, subtopic_id = ?, 
             problem_name = ?, problem_description = ?, difficulty = ?, sort_order = ?
         WHERE id = ?`,
        [category_id, topic_id, subtopic_id, problem_name, problem_description, difficulty, sort_order, id]
      );
    } else {
      // Update problem without changing sort_order
      await Database.query(
        `UPDATE problems 
         SET category_id = ?, topic_id = ?, subtopic_id = ?, 
             problem_name = ?, problem_description = ?, difficulty = ?
         WHERE id = ?`,
        [category_id, topic_id, subtopic_id, problem_name, problem_description, difficulty, id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Problem updated successfully'
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update problem',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete problem
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('id');

    if (!problemId) {
      return NextResponse.json(
        { success: false, message: 'Problem ID is required' },
        { status: 400 }
      );
    }

    // Soft delete - mark as inactive instead of actual deletion
    await Database.query(
      'UPDATE problems SET status = ? WHERE id = ?',
      ['inactive', problemId]
    );

    return NextResponse.json({
      success: true,
      message: 'Problem deleted successfully'
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete problem',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
