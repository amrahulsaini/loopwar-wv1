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
  functionTemplates: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
    c: string;
    csharp: string;
    go: string;
    rust: string;
    php: string;
    ruby: string;
  };
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

    const { category, topic, subtopic, sortOrder, baseProblem, isRegeneration } = await request.json();
    
    console.log('Request data received:', { category, topic, subtopic, sortOrder, baseProblem, isRegeneration });

    if (!category || !topic || !subtopic || typeof sortOrder !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user ID from database using username
    let userId: number | null = null;
    if (auth.username) {
      try {
        const userRows = await Database.query(
          'SELECT id FROM users WHERE username = ?',
          [auth.username]
        ) as Array<{ id: number }>;
        
        if (userRows.length > 0) {
          userId = userRows[0].id;
          console.log('Found user ID:', userId, 'for username:', auth.username);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    }

    // Check if code problem already exists and find next available sort order
    let finalSortOrder = sortOrder;
    if (!isRegeneration) {
      // For new problems, find the next available sort order
      const existingProblems = await Database.query(
        `SELECT sort_order FROM code_problems 
         WHERE category = ? AND topic = ? AND subtopic = ? 
         ORDER BY sort_order DESC`,
        [category, topic, subtopic]
      ) as Array<{ sort_order: number }>;

      if (existingProblems && existingProblems.length > 0) {
        // Find the highest sort order and increment
        const maxSortOrder = Math.max(...existingProblems.map(p => p.sort_order));
        finalSortOrder = maxSortOrder + 1;
        console.log(`Found existing problems, using next sort order: ${finalSortOrder}`);
      }
    } else {
      // For regeneration, check if the specific problem exists
      const existingProblem = await Database.query(
        `SELECT id FROM code_problems 
         WHERE category = ? AND topic = ? AND subtopic = ? AND sort_order = ?`,
        [category, topic, subtopic, sortOrder]
      ) as CodeProblemExistsRow[];

      if (existingProblem && existingProblem.length > 0) {
        console.log(`Regenerating existing problem at sort order: ${sortOrder}`);
      }
    }

    // Use base problem data or create default
    let problemTitle = baseProblem?.title || `${subtopic.replace(/-/g, ' ')} Challenge #${finalSortOrder}`;
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
      problemTitle = `${subtopicDisplay} Challenge #${finalSortOrder}`;
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
7. **Function Templates**: Generate function-only templates for each language (NO main/print/input statements)

FUNCTION TEMPLATE REQUIREMENTS:
- Only include the function signature and stub
- Use appropriate parameter names and return types based on the problem
- Body should contain "// TODO: implement" or language equivalent
- NO main(), input(), print(), console.log(), or test code
- The hidden test runner will call these functions directly

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
  ],
  "functionTemplates": {
    "javascript": "function solutionName(param1, param2) {\n    // TODO: implement\n    return null;\n}",
    "python": "def solution_name(param1, param2):\n    # TODO: implement\n    pass",
    "java": "public class Solution {\n    public ReturnType solutionName(ParamType param1, ParamType param2) {\n        // TODO: implement\n        return null;\n    }\n}",
    "cpp": "class Solution {\npublic:\n    ReturnType solutionName(ParamType param1, ParamType param2) {\n        // TODO: implement\n        return ReturnType();\n    }\n};",
    "c": "ReturnType solution_name(ParamType param1, ParamType param2) {\n    // TODO: implement\n    return 0;\n}",
    "csharp": "public class Solution {\n    public ReturnType SolutionName(ParamType param1, ParamType param2) {\n        // TODO: implement\n        return default(ReturnType);\n    }\n}",
    "go": "func solutionName(param1 ParamType, param2 ParamType) ReturnType {\n    // TODO: implement\n    return ReturnType{}\n}",
    "rust": "impl Solution {\n    pub fn solution_name(param1: ParamType, param2: ParamType) -> ReturnType {\n        // TODO: implement\n        ReturnType::new()\n    }\n}",
    "php": "function solutionName($param1, $param2) {\n    // TODO: implement\n    return null;\n}",
    "ruby": "def solution_name(param1, param2)\n    # TODO: implement\n    nil\nend"
  }
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
        
        // Enhanced JSON cleaning function
        function cleanJsonString(jsonStr: string): string {
          // Remove code block markers
          let cleaned = jsonStr
            .replace(/```json\s*/g, '')
            .replace(/```\s*$/g, '')
            .trim();
          
          // Replace problematic characters and sequences
          cleaned = cleaned
            // Remove all control characters
            .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
            // Remove unicode control chars
            .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
            // Convert actual newlines/tabs to escaped versions
            .replace(/\r\n/g, '\\n')
            .replace(/\r/g, '\\n')   
            .replace(/\n/g, '\\n')   
            .replace(/\t/g, '\\t')   
            // Remove any trailing commas before closing braces/brackets
            .replace(/,(\s*[}\]])/g, '$1')
            // Remove any extra whitespace
            .replace(/\s+/g, ' ')
            .trim();
          
          return cleaned;
        }
        
        const cleanedText = cleanJsonString(aiText);
        console.log('Cleaned AI text (first 500 chars):', cleanedText.substring(0, 500));
        
        try {
          generatedProblem = JSON.parse(cleanedText);
          console.log('AI generation successful');
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Problematic JSON (first 1000 chars):', cleanedText.substring(0, 1000));
          
          // Try one more aggressive cleaning attempt
          try {
            const superCleanedText = cleanedText
              .replace(/\\n/g, ' ')  // Replace escaped newlines with spaces
              .replace(/\\t/g, ' ')  // Replace escaped tabs with spaces
              .replace(/\s+/g, ' ')  // Collapse multiple spaces
              .trim();
            
            console.log('Attempting super-cleaned version...');
            generatedProblem = JSON.parse(superCleanedText);
            console.log('Super-cleaned parsing successful');
          } catch (secondParseError) {
            console.error('Second parse attempt also failed:', secondParseError);
            throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
          }
        }
      } else {
        const errorText = await response.text();
        console.log('AI API failed with status:', response.status, 'Response:', errorText);
        throw new Error(`AI API failed with status ${response.status}: ${errorText}`);
      }
      
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      
      // Return error with details instead of using fallback
      return NextResponse.json(
        { 
          error: `AI generation failed: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`,
          details: {
            problemTitle,
            problemDescription,
            category,
            topic,
            subtopic,
            sortOrder,
            errorType: aiError instanceof Error ? aiError.name : 'Unknown'
          }
        },
        { status: 500 }
      );
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
    if (!generatedProblem.functionTemplates || typeof generatedProblem.functionTemplates !== 'object') {
      generatedProblem.functionTemplates = {
        javascript: `function solution() {\n    // TODO: implement\n    return null;\n}`,
        python: `def solution():\n    # TODO: implement\n    pass`,
        java: `public class Solution {\n    public String solution() {\n        // TODO: implement\n        return "";\n    }\n}`,
        cpp: `class Solution {\npublic:\n    string solution() {\n        // TODO: implement\n        return "";\n    }\n};`,
        c: `char* solution() {\n    // TODO: implement\n    return "";\n}`,
        csharp: `public class Solution {\n    public string Solution() {\n        // TODO: implement\n        return "";\n    }\n}`,
        go: `func solution() string {\n    // TODO: implement\n    return ""\n}`,
        rust: `impl Solution {\n    pub fn solution() -> String {\n        // TODO: implement\n        String::new()\n    }\n}`,
        php: `function solution() {\n    // TODO: implement\n    return "";\n}`,
        ruby: `def solution\n    # TODO: implement\n    ""\nend`
      };
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
      Number(finalSortOrder), // Use the calculated sort order
      String(generatedProblem.constraints || '').trim(),
      String(generatedProblem.examples || '').trim(),
      JSON.stringify(generatedProblem.hints || []),
      String(generatedProblem.timeComplexity || 'O(n)').trim(),
      String(generatedProblem.spaceComplexity || 'O(1)').trim(),
      JSON.stringify(generatedProblem.testCases || []),
      JSON.stringify(generatedProblem.functionTemplates || {}),
      Boolean(true),
      userId // Add user ID to track who created the problem
    ];
    
    console.log('Insert data types and values:', insertData.map((val, idx) => ({
      index: idx,
      type: typeof val,
      value: typeof val === 'string' ? val.substring(0, 100) + (val.length > 100 ? '...' : '') : val
    })));
    
    let insertResult;
    
    if (isRegeneration) {
      // For regeneration, update existing record
      insertResult = await Database.query(
        `INSERT INTO code_problems (
          title, description, difficulty, category, topic, subtopic, sort_order,
          constraints, examples, hints, time_complexity, space_complexity, test_cases, function_templates, is_ai_generated, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          difficulty = VALUES(difficulty),
          constraints = VALUES(constraints),
          examples = VALUES(examples),
          hints = VALUES(hints),
          time_complexity = VALUES(time_complexity),
          space_complexity = VALUES(space_complexity),
          test_cases = VALUES(test_cases),
          function_templates = VALUES(function_templates),
          updated_at = CURRENT_TIMESTAMP`,
        insertData
      ) as ResultSetHeader;
    } else {
      // For new problems, insert new record
      insertResult = await Database.query(
        `INSERT INTO code_problems (
          title, description, difficulty, category, topic, subtopic, sort_order,
          constraints, examples, hints, time_complexity, space_complexity, test_cases, function_templates, is_ai_generated, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        insertData
      ) as ResultSetHeader;
    }

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
      sort_order: finalSortOrder, // Use the calculated sort order
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