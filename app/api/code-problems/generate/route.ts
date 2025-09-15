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
    const systemPrompt = `You are a LeetCode-style coding problem generator. Create a specific, well-defined coding problem.

PROBLEM CONTEXT:
📝 Base Title: "${problemTitle}"
📝 Base Description: "${problemDescription}"
📝 Difficulty: ${problemDifficulty}
📍 Topic: ${subtopic.replace(/-/g, ' ')}

Create a SPECIFIC coding problem like LeetCode problems. NOT generic templates.

CRITICAL: NEVER use generic placeholders like:
❌ "test_input_1", "sample_data", "input_array", "example_value"
❌ "arr = [a, b, c]", "nums = [x, y, z]"
❌ "n = some_number", "target = some_value"

ALWAYS use concrete, realistic data:
✅ "nums = [2,7,11,15]", "target = 9"
✅ "s = \"hello world\"", "k = 3"
✅ "matrix = [[1,2,3],[4,5,6]]"

REQUIREMENTS:
1. **Title**: Clear, specific problem name (e.g., "Two Sum", "Reverse Linked List")
2. **Description**: Specific problem statement (100-200 words) explaining:
   - Exactly what the function should do
   - Input format and constraints  
   - Output format
   - One clear example in the description with REAL data
3. **Examples**: 3 concrete examples with actual realistic values
4. **Constraints**: Realistic technical limits (proper mathematical notation)
5. **Test Cases**: 6 specific test cases with real inputs/outputs
6. **Hints**: 4 helpful hints about the solution approach

RESPOND WITH VALID JSON ONLY:
{
  "title": "Specific Problem Name",
  "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.\\n\\nExample: Input: nums = [2,7,11,15], target = 9\\nOutput: [0,1]\\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
  "difficulty": "${problemDifficulty}",
  "constraints": "• 2 ≤ nums.length ≤ 10^4\\n• -10^9 ≤ nums[i] ≤ 10^9\\n• -10^9 ≤ target ≤ 10^9\\n• Only one valid answer exists",
  "examples": "Example 1:\\nInput: nums = [2,7,11,15], target = 9\\nOutput: [0,1]\\nExplanation: nums[0] + nums[1] = 2 + 7 = 9\\n\\nExample 2:\\nInput: nums = [3,2,4], target = 6\\nOutput: [1,2]\\nExplanation: nums[1] + nums[2] = 2 + 4 = 6\\n\\nExample 3:\\nInput: nums = [3,3], target = 6\\nOutput: [0,1]\\nExplanation: nums[0] + nums[1] = 3 + 3 = 6",
  "hints": ["Think about what data structure can help you find complements quickly", "A hash map can store values and their indices", "For each number, check if its complement exists in the hash map", "Remember to handle the case where the same value appears multiple times"],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)",
  "testCases": [
    {"input": "[2,7,11,15], 9", "expected": "[0,1]", "explanation": "2 + 7 = 9"},
    {"input": "[3,2,4], 6", "expected": "[1,2]", "explanation": "2 + 4 = 6"},
    {"input": "[3,3], 6", "expected": "[0,1]", "explanation": "3 + 3 = 6"},
    {"input": "[1,2,3,4,5], 8", "expected": "[2,4]", "explanation": "3 + 5 = 8"},
    {"input": "[-1,-2,-3,-4,-5], -8", "expected": "[2,4]", "explanation": "-3 + (-5) = -8"},
    {"input": "[0,4,3,0], 0", "expected": "[0,3]", "explanation": "0 + 0 = 0"}
  ]
}

Generate a REAL, SPECIFIC coding problem related to ${subtopic.replace(/-/g, ' ')} with concrete examples and test cases.`;

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
      
      // Create topic-specific fallback problems with real examples
      const fallbackProblems = {
        'arrays': {
          title: "Two Sum",
          description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
          testCases: [
            { input: "[2,7,11,15], 9", expected: "[0,1]", explanation: "2 + 7 = 9" },
            { input: "[3,2,4], 6", expected: "[1,2]", explanation: "2 + 4 = 6" },
            { input: "[3,3], 6", expected: "[0,1]", explanation: "3 + 3 = 6" },
            { input: "[1,2,3,4,5], 8", expected: "[2,4]", explanation: "3 + 5 = 8" },
            { input: "[-1,-2,-3,-4,-5], -8", expected: "[2,4]", explanation: "-3 + (-5) = -8" },
            { input: "[0,4,3,0], 0", expected: "[0,3]", explanation: "0 + 0 = 0" }
          ]
        },
        'sorting': {
          title: "Merge Sorted Arrays",
          description: `You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.

Merge nums1 and nums2 into a single array sorted in non-decreasing order. The final sorted array should not be returned by the function, but instead be stored inside the array nums1.

Example:
Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
Output: [1,2,2,3,5,6]
Explanation: The arrays we are merging are [1,2,3] and [2,5,6].`,
          testCases: [
            { input: "[1,2,3,0,0,0], 3, [2,5,6], 3", expected: "[1,2,2,3,5,6]", explanation: "Merge [1,2,3] and [2,5,6]" },
            { input: "[1], 1, [], 0", expected: "[1]", explanation: "nums2 is empty" },
            { input: "[0], 0, [1], 1", expected: "[1]", explanation: "nums1 is effectively empty" },
            { input: "[4,5,6,0,0,0], 3, [1,2,3], 3", expected: "[1,2,3,4,5,6]", explanation: "nums2 elements are smaller" },
            { input: "[1,3,5,0,0,0], 3, [2,4,6], 3", expected: "[1,2,3,4,5,6]", explanation: "Interleaved elements" },
            { input: "[2,0], 1, [1], 1", expected: "[1,2]", explanation: "Single elements from each" }
          ]
        },
        'binary-search': {
          title: "Search Insert Position",
          description: `Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

You must write an algorithm with O(log n) runtime complexity.

Example:
Input: nums = [1,3,5,6], target = 5
Output: 2
Explanation: Target 5 is found at index 2.`,
          testCases: [
            { input: "[1,3,5,6], 5", expected: "2", explanation: "Target found at index 2" },
            { input: "[1,3,5,6], 2", expected: "1", explanation: "Insert at position 1" },
            { input: "[1,3,5,6], 7", expected: "4", explanation: "Insert at end" },
            { input: "[1,3,5,6], 0", expected: "0", explanation: "Insert at beginning" },
            { input: "[1], 1", expected: "0", explanation: "Single element found" },
            { input: "[1], 2", expected: "1", explanation: "Insert after single element" }
          ]
        },
        'dynamic-programming': {
          title: "Climbing Stairs",
          description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

Example:
Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top: 1+1+1, 1+2, 2+1.`,
          testCases: [
            { input: "2", expected: "2", explanation: "1+1 or 2" },
            { input: "3", expected: "3", explanation: "1+1+1, 1+2, or 2+1" },
            { input: "4", expected: "5", explanation: "Five distinct combinations" },
            { input: "5", expected: "8", explanation: "Eight distinct combinations" },
            { input: "1", expected: "1", explanation: "Only one way for single step" },
            { input: "6", expected: "13", explanation: "Thirteen distinct combinations" }
          ]
        }
      };

      // Determine which fallback to use based on subtopic
      let selectedFallback = fallbackProblems['arrays']; // default
      if (subtopic.includes('sort')) selectedFallback = fallbackProblems['sorting'];
      else if (subtopic.includes('search') || subtopic.includes('binary')) selectedFallback = fallbackProblems['binary-search'];
      else if (subtopic.includes('dynamic') || subtopic.includes('dp')) selectedFallback = fallbackProblems['dynamic-programming'];
      
      // Fallback to structured problem
      generatedProblem = {
        title: selectedFallback.title,
        description: selectedFallback.description,
        difficulty: problemDifficulty as 'Easy' | 'Medium' | 'Hard',
        constraints: `• 1 ≤ array.length ≤ 10^4
• -10^9 ≤ array[i] ≤ 10^9
• Follow-up: Can you solve it with O(log n) complexity?
• Handle all edge cases appropriately`,
        examples: `Example 1:
Input: ${selectedFallback.testCases[0].input}
Output: ${selectedFallback.testCases[0].expected}
Explanation: ${selectedFallback.testCases[0].explanation}

Example 2:
Input: ${selectedFallback.testCases[1].input}
Output: ${selectedFallback.testCases[1].expected}
Explanation: ${selectedFallback.testCases[1].explanation}

Example 3:
Input: ${selectedFallback.testCases[2].input}
Output: ${selectedFallback.testCases[2].expected}
Explanation: ${selectedFallback.testCases[2].explanation}`,
        hints: [
          "Consider the most efficient approach for this type of problem",
          "Think about what data structures would help optimize the solution", 
          "Look for patterns in the input that can guide your algorithm",
          "Don't forget to handle edge cases like empty inputs"
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)", 
        testCases: selectedFallback.testCases
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