import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Database from '../../../../lib/database';
import { SecurityService } from '../../../../lib/security';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey
});

interface TestCase {
  input: string;
  expected: string;
  explanation?: string;
}

interface GeneratedProblem {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  constraints: string;
  examples: string;
  hints: string[];
  timeComplexity: string;
  spaceComplexity: string;
  testCases: TestCase[];
}

interface CodeProblemExistsRow extends RowDataPacket {
  id: number;
}

// POST /api/code-problems/generate
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, topic, subtopic, sortOrder, baseProblem } = await request.json();

    if (!category || !topic || !subtopic || typeof sortOrder !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if code problem already exists
    const existingProblem = await Database.query(
      `SELECT id FROM code_problems 
       WHERE category = ? AND topic = ? AND subtopic = ? AND sort_order = ?`,
      [category, topic, subtopic, sortOrder]
    ) as CodeProblemExistsRow[];

    if (existingProblem && existingProblem.length > 0) {
      return NextResponse.json({ error: 'Code problem already exists for this location' }, { status: 409 });
    }

    // If no base problem provided, try to fetch from problems table
    let problemTitle = '';
    let problemDescription = '';
    let problemDifficulty = 'Medium';

    if (baseProblem) {
      problemTitle = baseProblem.title;
      problemDescription = baseProblem.description;
      problemDifficulty = baseProblem.difficulty;
    } else {
      // Fetch from problems table as fallback
      const formatDisplayName = (urlName: string) => {
        return urlName
          .replace(/-/g, ' ')
          .replace(/and/g, '&')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      const subtopicDisplay = formatDisplayName(subtopic);

      problemTitle = `${subtopicDisplay} Challenge #${sortOrder}`;
      problemDescription = `Solve this ${subtopicDisplay.toLowerCase()} problem step by step.`;
    }

    // Create AI prompt for code-specific content generation based on existing problem
    const systemPrompt = `You are an expert coding problem generator. I have an existing problem that needs to be converted into a comprehensive coding challenge.

EXISTING PROBLEM:
📝 Title: "${problemTitle}"
📝 Description: "${problemDescription}"
📝 Difficulty: ${problemDifficulty}

CONTEXT:
📍 Category: ${category.replace(/-/g, ' ')}
📍 Topic: ${topic.replace(/-/g, ' ')}
📍 Subtopic: ${subtopic.replace(/-/g, ' ')}
📍 Problem Number: #${sortOrder}

TASK: Convert this existing problem into a comprehensive coding challenge with:
1. Clear technical constraints
2. Comprehensive test cases with edge cases
3. Progressive hints that guide without giving away the solution
4. Realistic time and space complexity expectations
5. Detailed examples with explanations

The problem should maintain the core concept from the original description while adding the necessary technical details for a coding challenge.

OUTPUT FORMAT (JSON):
{
  "title": "${problemTitle}",
  "description": "Enhanced technical description with clear input/output format based on original",
  "difficulty": "${problemDifficulty}",
  "constraints": "Technical constraints in bullet points",
  "examples": "2-3 detailed examples with clear input/output format",
  "hints": ["progressive hint 1", "progressive hint 2", "progressive hint 3", "progressive hint 4"],
  "timeComplexity": "Expected optimal time complexity",
  "spaceComplexity": "Expected space complexity", 
  "testCases": [
    {
      "input": "exact input format for testing",
      "expected": "exact expected output",
      "explanation": "why this output is correct"
    }
  ]
}

REQUIREMENTS:
- Keep the original problem concept and title
- Make the description more technical and precise for coding
- Include at least 4-5 test cases covering normal and edge cases
- Hints should progressively guide toward the solution approach
- Constraints should be realistic and testable
- Examples should clearly show input/output format
- Test cases should be executable and comprehensive

Based on the original problem "${problemTitle}" with description "${problemDescription}", generate the enhanced coding challenge:`;

    // Generate AI response
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: systemPrompt
    });

    let response = result.text || '';
    
    // Clean up response to extract JSON
    response = response.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    
    let generatedProblem: GeneratedProblem;
    
    try {
      generatedProblem = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback to a structured problem based on original data
      generatedProblem = {
        title: problemTitle,
        description: `${problemDescription}\n\nImplement a solution that efficiently handles the given requirements.`,
        difficulty: problemDifficulty as 'Easy' | 'Medium' | 'Hard',
        constraints: `• Input will be valid and within reasonable bounds\n• Handle edge cases appropriately\n• Optimize for the expected complexity`,
        examples: `Example 1:\nInput: sample_input\nOutput: sample_output\nExplanation: Based on the problem requirements`,
        hints: [
          'Analyze the problem requirements carefully',
          'Consider the most efficient approach for this type of problem',
          'Think about edge cases and how to handle them',
          'Optimize your solution step by step'
        ],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [
          {
            input: 'test_input_1',
            expected: 'expected_output_1',
            explanation: 'Basic test case for the problem'
          },
          {
            input: 'test_input_2', 
            expected: 'expected_output_2',
            explanation: 'Edge case test'
          }
        ]
      };
    }

    // Validate and save to database
    const insertResult = await Database.query(
      `INSERT INTO code_problems (
        title, description, difficulty, category, topic, subtopic, sort_order,
        constraints, examples, hints, time_complexity, space_complexity, test_cases, is_ai_generated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generatedProblem.title,
        generatedProblem.description,
        generatedProblem.difficulty,
        category,
        topic,
        subtopic,
        sortOrder,
        generatedProblem.constraints,
        generatedProblem.examples,
        JSON.stringify(generatedProblem.hints),
        generatedProblem.timeComplexity,
        generatedProblem.spaceComplexity,
        JSON.stringify(generatedProblem.testCases),
        true
      ]
    ) as ResultSetHeader;

    // Format display names
    const formatDisplayName = (urlName: string) => {
      return urlName
        .replace(/-/g, ' ')
        .replace(/and/g, '&')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Return the generated problem with additional metadata
    const responseData = {
      id: insertResult.insertId,
      ...generatedProblem,
      category,
      topic,
      subtopic,
      sort_order: sortOrder,
      category_name: formatDisplayName(category),
      topic_name: formatDisplayName(topic),
      subtopic_name: formatDisplayName(subtopic),
      is_ai_generated: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error generating code problem:', error);
    
    // Provide fallback response
    return NextResponse.json(
      { error: 'Failed to generate code problem. Please try again.' },
      { status: 500 }
    );
  }
}