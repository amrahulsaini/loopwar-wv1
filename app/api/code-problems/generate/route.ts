import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Database from '../../../../lib/database';
import { SecurityService } from '../../../../lib/security';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is required');
}

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
      return NextResponse.json(
        { error: 'Code problem already exists for this location' },
        { status: 409 }
      );
    }

    // Use base problem data or create default
    let problemTitle = baseProblem?.title || `${subtopic.replace(/-/g, ' ')} Challenge #${sortOrder}`;
    let problemDescription = baseProblem?.description || 'Solve this coding challenge step by step.';
    const problemDifficulty = baseProblem?.difficulty || 'Medium';

    // Format display names if no base problem provided
    if (!baseProblem?.title) {
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

    // Create AI prompt for comprehensive problem generation
    const systemPrompt = `You are an expert coding problem generator. Create a comprehensive coding challenge.

PROBLEM INFO:
📝 Title: "${problemTitle}"
📝 Description: "${problemDescription}"
📝 Difficulty: ${problemDifficulty}
📍 Category: ${category.replace(/-/g, ' ')}
📍 Topic: ${topic.replace(/-/g, ' ')}
📍 Subtopic: ${subtopic.replace(/-/g, ' ')}

Create a detailed coding challenge with:

1. **Enhanced Description (300+ words)**: Comprehensive explanation including:
   - What the problem is asking for
   - Clear input/output format
   - What code needs to be written
   - Real-world context
   - Step-by-step requirements

2. **Technical Constraints**: Realistic limitations and requirements

3. **Detailed Examples**: 2-3 examples with explanations

4. **Progressive Hints**: 5 hints that guide without revealing solution

5. **Test Cases**: 6-8 comprehensive test cases including edge cases

6. **Complexity**: Expected time and space complexity

RESPOND WITH VALID JSON ONLY:
{
  "title": "Clear, descriptive title",
  "description": "Comprehensive 300+ word description explaining exactly what to implement, input/output format, requirements, and context",
  "difficulty": "${problemDifficulty}",
  "constraints": "• Bullet point constraints\\n• Value ranges and limits\\n• Input size limitations\\n• Performance requirements",
  "examples": "Example 1:\\nInput: specific input\\nOutput: expected output\\nExplanation: detailed reasoning\\n\\nExample 2:\\nInput: different input\\nOutput: expected output\\nExplanation: step-by-step logic",
  "hints": ["First hint about approach", "Second hint about data structure", "Third hint about algorithm", "Fourth hint about optimization", "Fifth hint about edge cases"],
  "timeComplexity": "O(n) notation",
  "spaceComplexity": "O(n) notation",
  "testCases": [
    {"input": "test1", "expected": "output1", "explanation": "why this result"},
    {"input": "test2", "expected": "output2", "explanation": "reasoning"},
    {"input": "edge1", "expected": "edge_output1", "explanation": "edge case"},
    {"input": "test3", "expected": "output3", "explanation": "another test"},
    {"input": "edge2", "expected": "edge_output2", "explanation": "boundary case"},
    {"input": "test4", "expected": "output4", "explanation": "complex case"}
  ]
}`;

    console.log('Generating AI problem for:', { problemTitle, category, topic, subtopic });
    
    // Generate with fallback structure
    let generatedProblem: GeneratedProblem;
    
    try {
      // Try AI generation first - using simple fetch for compatibility
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }]
        })
      });
      
      if (response.ok) {
        const aiResult = await response.json();
        const aiText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedText = aiText.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
        
        generatedProblem = JSON.parse(cleanedText);
        console.log('AI generation successful');
      } else {
        throw new Error('AI API failed');
      }
      
    } catch (aiError) {
      console.log('AI generation failed, using fallback:', aiError);
      
      // Fallback to structured problem
      generatedProblem = {
        title: problemTitle,
        description: `${problemDescription}

**Problem Statement:**
You need to implement a solution for this ${subtopic.replace(/-/g, ' ').toLowerCase()} problem. The solution should be efficient, handle edge cases properly, and follow best coding practices.

**Input Format:**
- Clearly defined input parameters
- Input constraints and valid ranges
- Any special formatting requirements

**Output Format:**
- Expected output format and type
- Specific requirements for the return value
- Handle edge cases appropriately

**Requirements:**
- Implement an efficient algorithm
- Consider time and space complexity
- Handle boundary conditions
- Write clean, readable code
- Test your solution thoroughly

**Approach:**
Think step by step about the problem requirements and choose the most appropriate data structures and algorithms for an optimal solution.`,
        difficulty: problemDifficulty as 'Easy' | 'Medium' | 'Hard',
        constraints: `• Input will be valid and within reasonable bounds
• Handle edge cases appropriately  
• Optimize for the expected complexity
• Use efficient data structures and algorithms
• Consider memory usage for large inputs`,
        examples: `Example 1:
Input: sample_input_1
Output: expected_output_1
Explanation: Based on the problem requirements, this input produces this output because...

Example 2:
Input: sample_input_2  
Output: expected_output_2
Explanation: Different scenario showing how the algorithm handles this case...`,
        hints: [
          "Start by understanding the problem requirements and constraints clearly",
          "Consider what data structures would be most efficient for this type of problem",
          "Think about the algorithm approach and its time complexity",
          "Don't forget to handle edge cases and boundary conditions",
          "Test your solution with the provided examples before submitting"
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        testCases: [
          {
            input: "test_input_1",
            expected: "expected_output_1", 
            explanation: "Basic test case"
          },
          {
            input: "test_input_2",
            expected: "expected_output_2",
            explanation: "Different scenario"
          },
          {
            input: "edge_case_input",
            expected: "edge_case_output",
            explanation: "Edge case handling"
          },
          {
            input: "boundary_input",
            expected: "boundary_output", 
            explanation: "Boundary condition test"
          }
        ]
      };
    }

    // Validate and save to database
    console.log('Saving problem to database...');
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

    console.log('Problem saved with ID:', insertResult.insertId);

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
    
    return NextResponse.json(
      { error: 'Failed to generate code problem. Please try again.' },
      { status: 500 }
    );
  }
}