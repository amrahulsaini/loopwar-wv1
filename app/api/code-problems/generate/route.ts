import { NextRequest, NextResponse } from 'next/server';
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
    
    console.log('Request data received:', { category, topic, subtopic, sortOrder, baseProblem });

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
- Base Title: "${problemTitle}"
- Base Description: "${problemDescription}"
- Difficulty: ${problemDifficulty}
- Category: ${category.replace(/-/g, ' ')}
- Topic: ${topic.replace(/-/g, ' ')}
- Subtopic: ${subtopic.replace(/-/g, ' ')}

CRITICAL INSTRUCTIONS:
1. USE THE PROVIDED BASE TITLE "${problemTitle}" as the foundation for your problem
2. Expand on the BASE DESCRIPTION "${problemDescription}" to create a comprehensive problem
3. Generate a problem specifically related to "${subtopic.replace(/-/g, ' ')}" topic
4. If the base title suggests a specific algorithm/concept, build upon that exact concept
5. Make the problem title similar or related to "${problemTitle}"

CRITICAL: TEST CASES MUST BE REALISTIC AND SPECIFIC
- Never use empty strings, blank inputs, or generic placeholders
- Always include proper variable names: "nums = [1,2,3]", "target = 5", "s = \"example\""
- Generate 6 diverse test cases covering:
  * Basic functionality (2-3 cases)
  * Edge cases (empty arrays, single elements, boundaries)
  * Complex scenarios (large inputs, special patterns)
- Each test case requires: concrete input, expected output, clear explanation
- Use realistic data that developers would actually test with

Example GOOD test cases for array problems:
{"input": "nums = [2,7,11,15], target = 9", "expected": "[0,1]", "explanation": "nums[0] + nums[1] = 2 + 7 = 9"}
{"input": "nums = [3,2,4], target = 6", "expected": "[1,2]", "explanation": "nums[1] + nums[2] = 2 + 4 = 6"}
{"input": "nums = [], target = 0", "expected": "[]", "explanation": "Empty array returns empty result"}

Example GOOD test cases for string problems:
{"input": "s = \"racecar\"", "expected": "true", "explanation": "String reads same forwards and backwards"}
{"input": "s = \"hello\"", "expected": "false", "explanation": "String is not a palindrome"}

REQUIREMENTS:
1. **Title**: Use or adapt "${problemTitle}" (make it closely related to this title)
2. **Description**: Comprehensive problem statement (200-400 words) based on "${problemDescription}" explaining:
   - Problem context and real-world application
   - Detailed input/output specifications
   - Multiple examples with step-by-step explanations
   - Edge cases and special scenarios to consider
   - Algorithm approach hints and complexity considerations
3. **Examples**: 2-3 examples for user understanding
4. **Test Cases**: 6 hidden test cases for code validation
5. **Constraints**: Realistic technical limits
6. **Hints**: 4 helpful hints about the solution approach

RESPOND WITH VALID JSON ONLY - no markdown formatting:
{
  "title": "Use or adapt the provided title: ${problemTitle}",
  "description": "Expand on: ${problemDescription}. Create comprehensive 200-400 word description with context, examples, and approach hints.",
  "difficulty": "${problemDifficulty}",
  "constraints": "Create realistic technical constraints with mathematical notation",
  "examples": "Provide 2-3 concrete examples with step-by-step explanations",
  "hints": ["Generate 4 helpful hints for ${subtopic.replace(/-/g, ' ')} related to ${problemTitle}"],
  "timeComplexity": "Appropriate complexity for this algorithm",
  "spaceComplexity": "Appropriate space complexity",
  "testCases": [
    {"input": "nums = [actual array], target = actual_number", "expected": "[actual result]", "explanation": "Clear step-by-step explanation"},
    {"input": "nums = [different array], target = different_number", "expected": "[different result]", "explanation": "Another clear explanation"},
    {"input": "nums = [edge case like empty or single element]", "expected": "[appropriate result]", "explanation": "Edge case explanation"},
    {"input": "nums = [complex case]", "expected": "[complex result]", "explanation": "Complex scenario explanation"},
    {"input": "nums = [boundary case]", "expected": "[boundary result]", "explanation": "Boundary condition explanation"},
    {"input": "nums = [stress test case]", "expected": "[stress result]", "explanation": "Performance test explanation"}
  ]
}

Generate a problem specifically based on "${problemTitle}" and "${problemDescription}" for ${subtopic.replace(/-/g, ' ')} topic.`;

    console.log('Generating AI problem for:', { problemTitle, category, topic, subtopic });
    console.log('API Key available:', !!apiKey, 'Length:', apiKey?.length);
    
    // Generate with fallback structure
    let generatedProblem: GeneratedProblem;
    
    try {
      // Try AI generation first - using simple fetch for compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }]
        })
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const aiResult = await response.json();
        const aiText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedText = aiText.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
        
        generatedProblem = JSON.parse(cleanedText);
        console.log('AI generation successful');
      } else {
        const errorText = await response.text();
        console.log('AI API failed with status:', response.status, 'Response:', errorText);
        throw new Error(`AI API failed with status ${response.status}: ${errorText}`);
      }
      
    } catch (aiError) {
      if (aiError instanceof Error && aiError.name === 'AbortError') {
        console.log('AI generation timed out, using fallback');
      } else {
        console.log('AI generation failed, using fallback:', aiError);
      }
      
      // Create topic-specific fallback problems with real examples
      const fallbackProblems = {
        'arrays': {
          title: "Two Sum",
          description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\\n\\nThis is one of the most fundamental problems in computer science and appears frequently in technical interviews at major tech companies. The problem tests your understanding of hash tables, array manipulation, and optimization techniques.\\n\\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.\\n\\nFor example, if nums = [2, 7, 11, 15] and target = 9, you should return [0, 1] because nums[0] + nums[1] = 2 + 7 = 9.\\n\\nConsider multiple approaches: the brute force O(n²) solution that checks all possible pairs, or the optimized O(n) solution using a hash map to store previously seen values and their indices.",
          testCases: [
            { input: "[2,7,11,15], 9", expected: "[0,1]", explanation: "2 + 7 = 9" },
            { input: "[3,2,4], 6", expected: "[1,2]", explanation: "2 + 4 = 6" },
            { input: "[3,3], 6", expected: "[0,1]", explanation: "3 + 3 = 6" },
            { input: "[1,2,3,4,5], 8", expected: "[2,4]", explanation: "3 + 5 = 8" },
            { input: "[-1,-2,-3,-4,-5], -8", expected: "[2,4]", explanation: "-3 + (-5) = -8" },
            { input: "[0,4,3,0], 0", expected: "[0,3]", explanation: "0 + 0 = 0" }
          ]
        },
        'array-fundamentals': {
          title: "Contains Duplicate",
          description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.\\n\\nThis problem tests your understanding of array traversal, data structures for tracking seen elements, and optimization techniques. It's a fundamental problem that appears in many coding interviews and real-world applications.\\n\\nYou can solve this using different approaches: sorting the array first, using a hash set to track seen elements, or comparing array length with set length.\\n\\nFor example, if nums = [1,2,3,1], return true because 1 appears twice. If nums = [1,2,3,4], return false because all elements are distinct.",
          testCases: [
            { input: "[1,2,3,1]", expected: "true", explanation: "1 appears twice" },
            { input: "[1,2,3,4]", expected: "false", explanation: "All elements are distinct" },
            { input: "[1,1,1,3,3,4,3,2,4,2]", expected: "true", explanation: "Multiple duplicates" },
            { input: "[]", expected: "false", explanation: "Empty array has no duplicates" },
            { input: "[1]", expected: "false", explanation: "Single element cannot duplicate" },
            { input: "[1,2,1]", expected: "true", explanation: "1 appears at positions 0 and 2" }
          ]
        },
        'sorting': {
          title: "Merge Sorted Arrays",
          description: "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order. Merge nums1 and nums2 into a single array sorted in non-decreasing order, storing the result in nums1.\\n\\nThis problem is essential for understanding merge operations and is a building block for more complex algorithms like merge sort. It's commonly used in database operations, file merging, and distributed systems.\\n\\nThe key insight is to use a two-pointer approach, comparing elements from both arrays and placing the smaller element in the correct position. Since nums1 has extra space at the end, you should work backwards to avoid overwriting elements.\\n\\nFor example, if nums1 = [1,2,3,0,0,0] with m=3 and nums2 = [2,5,6] with n=3, the result should be [1,2,2,3,5,6].",
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
          description: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.\\n\\nThis problem is fundamental for understanding binary search algorithms and is widely used in database indexing, search engines, and data structures. The key requirement is to achieve O(log n) runtime complexity.\\n\\nBinary search works by repeatedly dividing the search space in half, comparing the target with the middle element, and eliminating half of the remaining elements. This logarithmic approach is much more efficient than linear search for sorted arrays.\\n\\nFor example, in array [1,3,5,6] searching for target 5 returns index 2, while searching for target 2 returns index 1 (where it should be inserted).",
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
          description: "You are climbing a staircase with n steps. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?\\n\\nThis is a classic dynamic programming problem that introduces the concept of overlapping subproblems and optimal substructure. It's mathematically equivalent to the Fibonacci sequence and appears in many real-world optimization scenarios.\\n\\nThe key insight is that the number of ways to reach step n equals the sum of ways to reach step (n-1) and step (n-2), since you can arrive at step n from either of these positions.\\n\\nFor example, for n=3 stairs, there are 3 distinct ways: (1+1+1), (1+2), and (2+1). This problem teaches the foundation of dynamic programming thinking.",
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
      
      if (subtopic.includes('fundamentals') || subtopic.includes('duplicate') || subtopic.includes('basic')) {
        selectedFallback = fallbackProblems['array-fundamentals'];
      } else if (subtopic.includes('sort') || subtopic.includes('merge')) {
        selectedFallback = fallbackProblems['sorting'];
      } else if (subtopic.includes('search') || subtopic.includes('binary') || subtopic.includes('find')) {
        selectedFallback = fallbackProblems['binary-search'];
      } else if (subtopic.includes('dynamic') || subtopic.includes('dp') || subtopic.includes('climbing') || subtopic.includes('fibonacci')) {
        selectedFallback = fallbackProblems['dynamic-programming'];
      } else if (subtopic.includes('array') || subtopic.includes('sum') || subtopic.includes('pair') || subtopic.includes('target')) {
        selectedFallback = fallbackProblems['arrays'];
      }
      
      console.log(`Using fallback problem: ${selectedFallback.title} for subtopic: ${subtopic}`);
      
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

    // Validate generated problem data
    if (!generatedProblem.title || typeof generatedProblem.title !== 'string') {
      throw new Error('Generated problem missing valid title');
    }
    if (!generatedProblem.description || typeof generatedProblem.description !== 'string') {
      throw new Error('Generated problem missing valid description');
    }
    if (!generatedProblem.difficulty || !['Easy', 'Medium', 'Hard'].includes(generatedProblem.difficulty)) {
      generatedProblem.difficulty = 'Medium'; // Default fallback
    }
    if (!Array.isArray(generatedProblem.hints)) {
      generatedProblem.hints = ["Consider the problem requirements", "Think about edge cases", "Optimize your solution", "Test with different inputs"];
    }
    if (!Array.isArray(generatedProblem.testCases)) {
      generatedProblem.testCases = [
        { input: "sample input", expected: "sample output", explanation: "sample explanation" }
      ];
    }

    // Validate and save to database
    console.log('Saving problem to database...');
    
    // Prepare the data for insertion
    const insertData = [
      String(generatedProblem.title).trim(),
      String(generatedProblem.description).trim(),
      String(generatedProblem.difficulty),
      String(category),
      String(topic),
      String(subtopic),
      Number(sortOrder),
      String(generatedProblem.constraints || '').trim(),
      String(generatedProblem.examples || '').trim(),
      JSON.stringify(generatedProblem.hints || []),
      String(generatedProblem.timeComplexity || 'O(n)').trim(),
      String(generatedProblem.spaceComplexity || 'O(1)').trim(),
      JSON.stringify(generatedProblem.testCases || []),
      Boolean(true)
    ];
    
    console.log('Insert data types and values:', insertData.map((val, idx) => ({
      index: idx,
      type: typeof val,
      value: typeof val === 'string' ? val.substring(0, 100) + (val.length > 100 ? '...' : '') : val
    })));
    
    const insertResult = await Database.query(
      `INSERT INTO code_problems (
        title, description, difficulty, category, topic, subtopic, sort_order,
        constraints, examples, hints, time_complexity, space_complexity, test_cases, is_ai_generated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      insertData
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