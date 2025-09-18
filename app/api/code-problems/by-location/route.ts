import { NextRequest, NextResponse } from 'next/server';
import Database from '../../../../lib/database';
import { RowDataPacket } from 'mysql2';

interface CodeProblemRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  topic: string;
  subtopic: string;
  sort_order: number;
  constraints?: string;
  examples?: string;
  hints?: string;
  time_complexity?: string;
  space_complexity?: string;
  test_cases?: string;
  function_templates?: string;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryRow extends RowDataPacket {
  id: number;
  name: string;
}

interface TopicRow extends RowDataPacket {
  id: number;
  name: string;
  category_id: number;
}

interface SubtopicRow extends RowDataPacket {
  id: number;
  name: string;
  topic_id: number;
}

interface ProblemRow extends RowDataPacket {
  id: number;
  problem_name: string;
  problem_description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sort_order: number;
}

interface CodeProblem {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  topic: string;
  subtopic: string;
  sort_order: number;
  constraints?: string;
  examples?: string;
  hints?: string[];
  time_complexity?: string;
  space_complexity?: string;
  test_cases: Array<{
    input: string;
    expected: string;
    explanation?: string;
  }>;
  function_templates?: Record<string, string>;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
  category_name: string;
  topic_name: string;
  subtopic_name: string;
  needs_generation?: boolean;
}

// GET /api/code-problems/by-location
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const topic = searchParams.get('topic');
    const subtopic = searchParams.get('subtopic');
    const sortOrder = searchParams.get('sortOrder');

    if (!category || !topic || !subtopic || !sortOrder) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // First, try to fetch existing code problem
    const codeProblems = await Database.query(
      `SELECT * FROM code_problems 
       WHERE category = ? AND topic = ? AND subtopic = ? AND sort_order = ?`,
      [category, topic, subtopic, parseInt(sortOrder)]
    ) as CodeProblemRow[];

    if (codeProblems && codeProblems.length > 0) {
      const problem = codeProblems[0];
      
      console.log('Raw problem data from DB:', {
        id: problem.id,
        title: problem.title,
        test_cases_raw: problem.test_cases,
        hints_raw: problem.hints
      });
      
      // Parse JSON fields safely with better error handling
      let parsedTestCases: Array<{ input: string; expected: string; explanation?: string }> = [];
      let parsedHints: string[] = [];
      let parsedFunctionTemplates: Record<string, string> = {};
      
      // Parse test_cases
      if (problem.test_cases) {
        try {
          if (typeof problem.test_cases === 'string') {
            parsedTestCases = JSON.parse(problem.test_cases);
          } else if (Array.isArray(problem.test_cases)) {
            parsedTestCases = problem.test_cases;
          }
          console.log('Parsed test cases:', parsedTestCases);
        } catch (e) {
          console.error('Error parsing test_cases:', e, 'Raw value:', problem.test_cases);
          parsedTestCases = [
            { input: "Loading test case...", expected: "Please wait", explanation: "Test cases are being loaded" }
          ];
        }
      } else {
        console.log('No test_cases field found in problem');
        parsedTestCases = [
          { input: "No test cases available", expected: "N/A", explanation: "Test cases not generated yet" }
        ];
      }
      
      // Parse hints
      if (problem.hints) {
        try {
          if (typeof problem.hints === 'string') {
            parsedHints = JSON.parse(problem.hints);
          } else if (Array.isArray(problem.hints)) {
            parsedHints = problem.hints;
          }
        } catch (e) {
          console.error('Error parsing hints:', e, 'Raw value:', problem.hints);
          parsedHints = ["Consider the problem requirements", "Think about edge cases"];
        }
      }

      // Parse function_templates
      if (problem.function_templates) {
        try {
          if (typeof problem.function_templates === 'string') {
            parsedFunctionTemplates = JSON.parse(problem.function_templates);
          } else if (typeof problem.function_templates === 'object') {
            parsedFunctionTemplates = problem.function_templates;
          }
        } catch (e) {
          console.error('Error parsing function_templates:', e, 'Raw value:', problem.function_templates);
          parsedFunctionTemplates = {};
        }
      }
      
      const formattedProblem: CodeProblem = {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        category: problem.category,
        topic: problem.topic,
        subtopic: problem.subtopic,
        sort_order: problem.sort_order,
        constraints: problem.constraints,
        examples: problem.examples,
        hints: parsedHints,
        time_complexity: problem.time_complexity,
        space_complexity: problem.space_complexity,
        test_cases: parsedTestCases,
        function_templates: parsedFunctionTemplates,
        is_ai_generated: problem.is_ai_generated,
        created_at: problem.created_at,
        updated_at: problem.updated_at,
        category_name: problem.category.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        topic_name: problem.topic.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        subtopic_name: problem.subtopic.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      };

      console.log('Formatted problem being returned:', {
        id: formattedProblem.id,
        title: formattedProblem.title,
        testCasesCount: formattedProblem.test_cases.length,
        hintsCount: formattedProblem.hints?.length || 0
      });

      return NextResponse.json(formattedProblem);
    }

    // If no code problem exists, try to fetch from regular problems table
    // First get the category, topic, and subtopic IDs
    const categoriesQuery = await Database.query('SELECT id, name FROM categories') as CategoryRow[];
    const topicsQuery = await Database.query('SELECT id, name, category_id FROM topics') as TopicRow[];
    const subtopicsQuery = await Database.query('SELECT id, name, topic_id FROM subtopics') as SubtopicRow[];
    
    // Find matching category, topic, subtopic by name
    const categoryObj = categoriesQuery.find((cat) => {
      const formattedName = cat.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9-]/g, '');
      return formattedName === category.toLowerCase();
    });

    if (!categoryObj) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const topicObj = topicsQuery.find((top) => {
      const formattedName = top.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9-]/g, '');
      return formattedName === topic.toLowerCase() && top.category_id === categoryObj.id;
    });

    if (!topicObj) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const subtopicObj = subtopicsQuery.find((sub) => {
      const formattedName = sub.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9-]/g, '');
      return formattedName === subtopic.toLowerCase() && sub.topic_id === topicObj.id;
    });

    if (!subtopicObj) {
      return NextResponse.json({ error: 'Subtopic not found' }, { status: 404 });
    }

    // Now fetch the specific problem from problems table
    const problems = await Database.query(
      `SELECT * FROM problems 
       WHERE category_id = ? AND topic_id = ? AND subtopic_id = ? AND sort_order = ? AND status = 'active'`,
      [categoryObj.id, topicObj.id, subtopicObj.id, parseInt(sortOrder)]
    ) as ProblemRow[];

    if (!problems || problems.length === 0) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const baseProblem = problems[0];

    // Return the base problem data that can be used to generate code-specific content
    return NextResponse.json({
      id: baseProblem.id,
      title: baseProblem.problem_name,
      description: baseProblem.problem_description,
      difficulty: baseProblem.difficulty,
      category,
      topic,
      subtopic,
      sort_order: parseInt(sortOrder),
      category_name: categoryObj.name,
      topic_name: topicObj.name,
      subtopic_name: subtopicObj.name,
      // These will be generated by AI
      constraints: null,
      examples: null,
      hints: null,
      time_complexity: null,
      space_complexity: null,
      test_cases: [],
      is_ai_generated: false,
      needs_generation: true // Flag to indicate this needs AI generation
    });

  } catch (error) {
    console.error('Error fetching code problem:', error);
    return NextResponse.json(
      { error: 'Failed to fetch code problem' },
      { status: 500 }
    );
  }
}