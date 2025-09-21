import { NextRequest, NextResponse } from 'next/server';
import Database from '../../../../lib/database';
import { SecurityService } from '../../../../lib/security';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is required');
}

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
  user_id?: number;
  created_at: string;
  updated_at: string;
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
    
    // First, check if a problem with the same title already exists for this location
    if (baseProblem && baseProblem.title && !isRegeneration) {
      console.log(`Checking for existing problem with title: "${baseProblem.title}"`);
      
      const existingProblemWithTitle = await Database.query(
        `SELECT id, sort_order, title, description, difficulty, constraints, examples, 
                hints, time_complexity, space_complexity, test_cases, function_templates,
                is_ai_generated, created_at, updated_at 
         FROM code_problems 
         WHERE category = ? AND topic = ? AND subtopic = ? AND title = ?
         ORDER BY created_at DESC LIMIT 1`,
        [category, topic, subtopic, baseProblem.title]
      ) as CodeProblemRow[];

      if (existingProblemWithTitle && existingProblemWithTitle.length > 0) {
        // Found existing problem with same title - return it instead of creating new one
        const problem = existingProblemWithTitle[0];
        console.log(`Found existing problem with same title "${baseProblem.title}" at sort_order ${problem.sort_order}, returning cached version`);
        
        // Format display names
        const formatDisplayName = (urlName: string) => {
          return urlName
            .replace(/-/g, ' ')
            .replace(/and/g, '&')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        };

        // Parse JSON fields safely
        let parsedHints: string[] = [];
        let parsedTestCases: Array<{ input: string; expected: string; explanation?: string }> = [];
        let parsedFunctionTemplates: Record<string, string> = {};

        try {
          parsedHints = problem.hints ? JSON.parse(problem.hints) : [];
        } catch (e) {
          parsedHints = ["Think step by step", "Consider edge cases"];
        }

        try {
          parsedTestCases = problem.test_cases ? JSON.parse(problem.test_cases) : [];
        } catch (e) {
          parsedTestCases = [{ input: "sample", expected: "result", explanation: "example" }];
        }

        try {
          parsedFunctionTemplates = problem.function_templates ? JSON.parse(problem.function_templates) : {};
        } catch (e) {
          parsedFunctionTemplates = {};
        }

        const responseData = {
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
          timeComplexity: problem.time_complexity,
          spaceComplexity: problem.space_complexity,
          testCases: parsedTestCases,
          functionTemplates: parsedFunctionTemplates,
          category_name: formatDisplayName(category),
          topic_name: formatDisplayName(topic),
          subtopic_name: formatDisplayName(subtopic),
          is_ai_generated: problem.is_ai_generated,
          created_at: problem.created_at,
          updated_at: problem.updated_at
        };

        console.log(`Returning cached problem: ${problem.title} (ID: ${problem.id})`);
        return NextResponse.json(responseData);
      } else {
        console.log(`No existing problem found with title "${baseProblem.title}", will generate new one`);
      }
    }

    // If we reach here, we need to generate a new problem
    if (!isRegeneration) {
      // For new problems, find the next available sort order to create a new record
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
      // For regeneration, also create a new record instead of updating
      // Find the next available sort order even for regeneration
      const existingProblems = await Database.query(
        `SELECT sort_order FROM code_problems 
         WHERE category = ? AND topic = ? AND subtopic = ? 
         ORDER BY sort_order DESC`,
        [category, topic, subtopic]
      ) as Array<{ sort_order: number }>;

      if (existingProblems && existingProblems.length > 0) {
        const maxSortOrder = Math.max(...existingProblems.map(p => p.sort_order));
        finalSortOrder = maxSortOrder + 1;
        console.log(`Regeneration: creating new record with sort order: ${finalSortOrder}`);
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

    // Create AI prompt based on the specific problem title and context
    let systemPrompt: string;
    
    if (baseProblem && baseProblem.title) {
      // User has selected a specific problem title - generate based on that exact title
      systemPrompt = `Generate a comprehensive coding problem based on the SPECIFIC TITLE provided.

REQUIRED PROBLEM TITLE: "${baseProblem.title}"
Category: ${category}
Topic: ${topic}
Subtopic: ${subtopic.replace(/-/g, ' ')}
Difficulty: ${baseProblem.difficulty || problemDifficulty}

You MUST create a coding problem that directly matches the title "${baseProblem.title}".
Make the problem unique and challenging while staying true to the exact title provided.
The problem should be related to ${subtopic.replace(/-/g, ' ')} concepts.

Return ONLY this JSON structure with no extra text:

{
  "title": "${baseProblem.title}",
  "description": "Detailed problem description that directly relates to the title '${baseProblem.title}' and involves ${subtopic.replace(/-/g, ' ')} concepts",
  "difficulty": "${baseProblem.difficulty || problemDifficulty}",
  "constraints": "Specific constraints for this problem based on the title",
  "examples": "Clear examples showing input/output format for '${baseProblem.title}'",
  "hints": ["Strategic hint 1 for ${baseProblem.title}", "Algorithmic hint 2", "Implementation hint 3", "Optimization hint 4"],
  "timeComplexity": "Expected optimal time complexity",
  "spaceComplexity": "Expected space complexity",
  "testCases": [
    {"input": "realistic test input for ${baseProblem.title}", "expected": "correct output", "explanation": "why this output is correct"},
    {"input": "edge case input", "expected": "edge output", "explanation": "edge case explanation"},
    {"input": "complex scenario input", "expected": "complex output", "explanation": "complex case explanation"},
    {"input": "boundary condition input", "expected": "boundary output", "explanation": "boundary explanation"},
    {"input": "performance test input", "expected": "performance output", "explanation": "performance test case"},
    {"input": "corner case input", "expected": "corner output", "explanation": "corner case handling"}
  ],
  "functionTemplates": {
    "javascript": "function solve${baseProblem.title.replace(/\s+/g, '')}(param1, param2) {\\n    // TODO: Implement solution for ${baseProblem.title}\\n    return null;\\n}",
    "python": "def solve_${baseProblem.title.toLowerCase().replace(/\s+/g, '_')}(param1, param2):\\n    \\"\\"\\"\\n    TODO: Implement solution for ${baseProblem.title}\\n    \\"\\"\\"\\n    pass",
    "java": "public class Solution {\\n    public int solve${baseProblem.title.replace(/\s+/g, '')}(int[] param1, int param2) {\\n        // TODO: Implement solution for ${baseProblem.title}\\n        return 0;\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    int solve${baseProblem.title.replace(/\s+/g, '')}(vector<int>& param1, int param2) {\\n        // TODO: Implement solution for ${baseProblem.title}\\n        return 0;\\n    }\\n};",
    "c": "int solve_${baseProblem.title.toLowerCase().replace(/\s+/g, '_')}(int* param1, int size, int param2) {\\n    // TODO: Implement solution for ${baseProblem.title}\\n    return 0;\\n}",
    "csharp": "public class Solution {\\n    public int Solve${baseProblem.title.replace(/\s+/g, '')}(int[] param1, int param2) {\\n        // TODO: Implement solution for ${baseProblem.title}\\n        return 0;\\n    }\\n}",
    "go": "func solve${baseProblem.title.replace(/\s+/g, '')}(param1 []int, param2 int) int {\\n    // TODO: Implement solution for ${baseProblem.title}\\n    return 0\\n}",
    "rust": "impl Solution {\\n    pub fn solve_${baseProblem.title.toLowerCase().replace(/\s+/g, '_')}(param1: Vec<i32>, param2: i32) -> i32 {\\n        // TODO: Implement solution for ${baseProblem.title}\\n        0\\n    }\\n}",
    "php": "function solve${baseProblem.title.replace(/\s+/g, '')}($param1, $param2) {\\n    // TODO: Implement solution for ${baseProblem.title}\\n    return 0;\\n}",
    "ruby": "def solve_${baseProblem.title.toLowerCase().replace(/\s+/g, '_')}(param1, param2)\\n    # TODO: Implement solution for ${baseProblem.title}\\n    0\\nend"
  }
}`;
    } else {
      // Fallback for when no specific title is provided (original random generation)
      const problemTypes = [
        'array manipulation', 'string processing', 'mathematical calculation', 'data structure implementation',
        'algorithm optimization', 'pattern matching', 'sorting and searching', 'graph traversal',
        'dynamic programming', 'greedy algorithm', 'two pointer technique', 'sliding window',
        'hash table operations', 'binary search', 'recursion and backtracking'
      ];
      
      const complexity_levels = {
        'Easy': ['simple iteration', 'basic conditions', 'direct calculation', 'straightforward logic'],
        'Medium': ['nested loops', 'multiple conditions', 'intermediate algorithms', 'data structure usage'],
        'Hard': ['complex algorithms', 'advanced optimization', 'multiple data structures', 'edge case handling']
      };
      
      const randomProblemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
      const randomComplexity = complexity_levels[problemDifficulty as keyof typeof complexity_levels];
      const randomComplexityHint = randomComplexity[Math.floor(Math.random() * randomComplexity.length)];
      const randomSeed = Math.floor(Math.random() * 10000);
      
      systemPrompt = `Generate a UNIQUE and CREATIVE coding problem as valid JSON only.

REQUIREMENTS:
- Topic: ${subtopic.replace(/-/g, ' ')}
- Problem Type: ${randomProblemType}
- Complexity Focus: ${randomComplexityHint}
- Difficulty: ${problemDifficulty}
- Uniqueness Seed: ${randomSeed}

CREATE A COMPLETELY ORIGINAL PROBLEM that involves ${randomProblemType} with ${randomComplexityHint}.
Make it different from common coding problems. Be creative and innovative!

Return ONLY this JSON structure with no extra text:

{
  "title": "Creative and unique problem title here",
  "description": "Detailed problem description with clear requirements and innovative twist",
  "difficulty": "${problemDifficulty}",
  "constraints": "Specific constraints for this unique problem",
  "examples": "Multiple clear examples showing input/output format",
  "hints": ["Creative hint 1", "Algorithmic hint 2", "Implementation hint 3", "Optimization hint 4"],
  "timeComplexity": "Expected optimal time complexity",
  "spaceComplexity": "Expected space complexity",
  "testCases": [
    {"input": "realistic test input", "expected": "correct output", "explanation": "why this output"},
    {"input": "edge case input", "expected": "edge output", "explanation": "edge case explanation"},
    {"input": "complex input", "expected": "complex output", "explanation": "complex case explanation"},
    {"input": "boundary input", "expected": "boundary output", "explanation": "boundary explanation"},
    {"input": "stress test input", "expected": "stress output", "explanation": "performance test"},
    {"input": "corner case input", "expected": "corner output", "explanation": "corner case handling"}
  ],
  "functionTemplates": {
    "javascript": "function solveProblem(param1, param2) {\\n    // TODO: Implement your solution\\n    return null;\\n}",
    "python": "def solve_problem(param1, param2):\\n    \\"\\"\\"\\n    TODO: Implement your solution\\n    \\"\\"\\"\\n    pass",
    "java": "public class Solution {\\n    public int solveProblem(int[] param1, int param2) {\\n        // TODO: Implement your solution\\n        return 0;\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    int solveProblem(vector<int>& param1, int param2) {\\n        // TODO: Implement your solution\\n        return 0;\\n    }\\n};",
    "c": "int solveProblem(int* param1, int size, int param2) {\\n    // TODO: Implement your solution\\n    return 0;\\n}",
    "csharp": "public class Solution {\\n    public int SolveProblem(int[] param1, int param2) {\\n        // TODO: Implement your solution\\n        return 0;\\n    }\\n}",
    "go": "func solveProblem(param1 []int, param2 int) int {\\n    // TODO: Implement your solution\\n    return 0\\n}",
    "rust": "impl Solution {\\n    pub fn solve_problem(param1: Vec<i32>, param2: i32) -> i32 {\\n        // TODO: Implement your solution\\n        0\\n    }\\n}",
    "php": "function solveProblem($param1, $param2) {\\n    // TODO: Implement your solution\\n    return 0;\\n}",
    "ruby": "def solve_problem(param1, param2)\\n    # TODO: Implement your solution\\n    0\\nend"
  }
}`;
    }

    console.log('Generating AI problem for:', { 
      problemTitle, 
      category, 
      topic, 
      subtopic, 
      baseProblemTitle: baseProblem?.title || 'None',
      hasBaseProblem: !!baseProblem 
    });
    console.log('API Key available:', !!apiKey, 'Length:', apiKey?.length);
    
    // Generate with fallback structure
    let generatedProblem: GeneratedProblem;
    
    try {
      // Try AI generation first - using simple fetch for compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30 second timeout
      
      console.log('Starting AI generation with Gemini...');
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
      console.log('AI API response status:', response.status);
      
      if (response.ok) {
        const aiResult = await response.json();
        const aiText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Simple JSON extraction
        function cleanJsonString(jsonStr: string): string {
          let cleaned = jsonStr
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
          
          const jsonStart = cleaned.indexOf('{');
          const jsonEnd = cleaned.lastIndexOf('}');
          
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
          }
          
          return cleaned;
        }
        
        const cleanedText = cleanJsonString(aiText);
        console.log('Cleaned AI text (first 500 chars):', cleanedText.substring(0, 500));
        
        try {
          generatedProblem = JSON.parse(cleanedText);
          console.log('AI generation successful');
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Problematic JSON:', cleanedText);
          console.error('JSON around error position:', cleanedText.substring(830, 850));
          throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
        }
      } else {
        const errorText = await response.text();
        console.log('AI API failed with status:', response.status, 'Response:', errorText);
        throw new Error(`AI API failed with status ${response.status}: ${errorText}`);
      }
      
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      
      // Create a fallback problem when AI fails
      console.log('Creating fallback problem due to AI failure');
      generatedProblem = {
        title: problemTitle,
        description: problemDescription,
        difficulty: problemDifficulty,
        constraints: 'Standard algorithmic constraints apply.',
        examples: 'Examples will be provided based on the problem context.',
        hints: [
          `Think about the ${subtopic.replace(/-/g, ' ')} approach`,
          'Consider edge cases and boundary conditions',
          'Optimize your solution for time complexity',
          'Test with different input sizes'
        ],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        testCases: [
          { input: 'sample input', expected: 'sample output', explanation: 'This is a sample test case' },
          { input: 'edge case input', expected: 'edge output', explanation: 'This tests edge conditions' },
          { input: 'normal input', expected: 'normal output', explanation: 'This is a typical case' }
        ],
        functionTemplates: {
          javascript: `function solution() {\n    // TODO: Implement ${problemTitle}\n    return null;\n}`,
          python: `def solution():\n    """\n    TODO: Implement ${problemTitle}\n    """\n    pass`,
          java: `public class Solution {\n    public String solution() {\n        // TODO: Implement ${problemTitle}\n        return "";\n    }\n}`,
          cpp: `class Solution {\npublic:\n    string solution() {\n        // TODO: Implement ${problemTitle}\n        return "";\n    }\n};`,
          c: `char* solution() {\n    // TODO: Implement ${problemTitle}\n    return "";\n}`,
          csharp: `public class Solution {\n    public string Solution() {\n        // TODO: Implement ${problemTitle}\n        return "";\n    }\n}`,
          go: `func solution() string {\n    // TODO: Implement ${problemTitle}\n    return ""\n}`,
          rust: `impl Solution {\n    pub fn solution() -> String {\n        // TODO: Implement ${problemTitle}\n        String::new()\n    }\n}`,
          php: `function solution() {\n    // TODO: Implement ${problemTitle}\n    return "";\n}`,
          ruby: `def solution\n    # TODO: Implement ${problemTitle}\n    ""\nend`
        }
      };
    }

    // Validate and clean generated problem data
    if (!generatedProblem.title || typeof generatedProblem.title !== 'string') {
      throw new Error('Generated problem missing valid title');
    }
    if (!generatedProblem.description || typeof generatedProblem.description !== 'string') {
      throw new Error('Generated problem missing valid description');
    }

    // Clean all text fields from format artifacts
    function cleanTextContent(text: string): string {
      if (!text || typeof text !== 'string') return text;
      
      return text
        // Remove format class artifacts
        .replace(/"format-[^"]*">/g, '')
        .replace(/format-[a-zA-Z]*">/g, '')
        .replace(/class="format-[^"]*"/g, '')
        .replace(/"format-[^"]*"/g, '')
        .replace(/format-\w+/g, '')
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Clean up quotes and spacing
        .replace(/"/g, '"')
        .replace(/'/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Clean all text fields in the generated problem
    generatedProblem.title = cleanTextContent(generatedProblem.title);
    generatedProblem.description = cleanTextContent(generatedProblem.description);
    generatedProblem.constraints = cleanTextContent(generatedProblem.constraints || '');
    generatedProblem.examples = cleanTextContent(generatedProblem.examples || '');
    
    // Clean hints array
    if (Array.isArray(generatedProblem.hints)) {
      generatedProblem.hints = generatedProblem.hints.map(hint => cleanTextContent(hint));
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
    
    // Always insert a new record - no more updating existing ones
    // This ensures each user generation creates a separate problem record
    const insertResult = await Database.query(
      `INSERT INTO code_problems (
        title, description, difficulty, category, topic, subtopic, sort_order,
        constraints, examples, hints, time_complexity, space_complexity, test_cases, function_templates, is_ai_generated, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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