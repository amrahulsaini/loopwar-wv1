import { NextRequest, NextResponse } from 'next/server';
import Database from '../../../../lib/database';
import { SecurityService } from '../../../../lib/security';
import { ResultSetHeader } from 'mysql2';

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
      // For new problems, always find the next available sort order to create a new record
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

    // Create a much simpler AI prompt
    const systemPrompt = `Generate a coding problem as valid JSON only.

Topic: ${subtopic.replace(/-/g, ' ')}
Title: ${problemTitle}
Difficulty: ${problemDifficulty}

Return ONLY this JSON structure with no extra text:

{
  "title": "Problem title here",
  "description": "Problem description here",
  "difficulty": "${problemDifficulty}",
  "constraints": "Constraints here",
  "examples": "Examples here",
  "hints": ["Hint 1", "Hint 2", "Hint 3", "Hint 4"],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "testCases": [
    {"input": "example input", "expected": "example output", "explanation": "explanation"},
    {"input": "example input", "expected": "example output", "explanation": "explanation"},
    {"input": "example input", "expected": "example output", "explanation": "explanation"},
    {"input": "example input", "expected": "example output", "explanation": "explanation"},
    {"input": "example input", "expected": "example output", "explanation": "explanation"},
    {"input": "example input", "expected": "example output", "explanation": "explanation"}
  ],
  "functionTemplates": {
    "javascript": "function solve() { return null; }",
    "python": "def solve(): return None",
    "java": "public int solve() { return 0; }",
    "cpp": "int solve() { return 0; }",
    "c": "int solve() { return 0; }",
    "csharp": "public int Solve() { return 0; }",
    "go": "func solve() int { return 0 }",
    "rust": "fn solve() -> i32 { 0 }",
    "php": "function solve() { return 0; }",
    "ruby": "def solve; 0; end"
  }
}`;

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