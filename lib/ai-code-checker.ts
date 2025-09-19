import { GoogleGenerativeAI } from '@google/generative-ai';

interface CodeCheckResult {
  success: boolean;
  isCorrect: boolean;
  score: number; // 0-100
  feedback: string;
  detailedAnalysis: {
    syntax: {
      isValid: boolean;
      issues: string[];
    };
    logic: {
      isCorrect: boolean;
      issues: string[];
      suggestions: string[];
    };
    efficiency: {
      timeComplexity: string;
      spaceComplexity: string;
      rating: number; // 1-5
      improvements: string[];
    };
    testCases: {
      passed: number;
      total: number;
      results: Array<{
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
        explanation: string;
      }>;
    };
  };
  hints: string[];
  learningPoints: string[];
}

interface TestCase {
  input: string;
  expected: string;
  explanation?: string;
}

export class AICodeChecker {
  private ai: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required for AI code checking');
    }
    this.ai = new GoogleGenerativeAI(apiKey);
  }

  async checkCode(
    userCode: string,
    language: string,
    problemDescription: string,
    testCases: TestCase[]
  ): Promise<CodeCheckResult> {
    try {
      console.log('AI Code Checker: Starting analysis for', language);
      
      const analysisPrompt = this.createAnalysisPrompt(
        userCode,
        language,
        problemDescription,
        testCases
      );

      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(analysisPrompt);
      const analysisText = result.response.text();

      // Parse AI response into structured result
      const checkResult = this.parseAIResponse(analysisText, testCases);

      console.log('AI Code Checker: Analysis completed, score:', checkResult.score);
      return checkResult;

    } catch (error) {
      console.error('AI Code Checker Error:', error);
      return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private createAnalysisPrompt(
    userCode: string,
    language: string,
    problemDescription: string,
    testCases: TestCase[]
  ): string {
    return `You are an expert code reviewer and programming tutor. Analyze this ${language} code solution thoroughly and provide educational feedback.

**PROBLEM DESCRIPTION:**
${problemDescription}

**USER'S CODE:**
\`\`\`${language}
${userCode}
\`\`\`

**TEST CASES TO VALIDATE:**
${testCases.map((tc, i) => `
Test Case ${i + 1}:
- Input: ${tc.input}
- Expected Output: ${tc.expected}
- Explanation: ${tc.explanation || 'Test the function with given input'}
`).join('')}

**ANALYSIS REQUIREMENTS:**
Please provide a comprehensive analysis in the following JSON format:

{
  "isCorrect": boolean,
  "score": number (0-100),
  "feedback": "Overall feedback summary",
  "syntax": {
    "isValid": boolean,
    "issues": ["list of syntax errors if any"]
  },
  "logic": {
    "isCorrect": boolean,
    "issues": ["logical errors or bugs"],
    "suggestions": ["improvement suggestions"]
  },
  "efficiency": {
    "timeComplexity": "O() notation",
    "spaceComplexity": "O() notation", 
    "rating": number (1-5),
    "improvements": ["performance improvement suggestions"]
  },
  "testCases": {
    "passed": number,
    "total": ${testCases.length},
    "results": [
      {
        "input": "test input",
        "expectedOutput": "expected result",
        "actualOutput": "what the code would produce",
        "passed": boolean,
        "explanation": "why it passed/failed"
      }
    ]
  },
  "hints": ["helpful hints for improvement"],
  "learningPoints": ["educational insights"]
}

**ANALYSIS FOCUS:**
1. **Syntax Check**: Is the code syntactically correct?
2. **Logic Validation**: Does the algorithm solve the problem correctly?
3. **Test Case Analysis**: Mentally execute the code for each test case
4. **Efficiency Analysis**: Time/space complexity and optimization opportunities
5. **Educational Feedback**: What can the student learn from this?

**IMPORTANT:**
- Actually trace through the code execution for each test case
- Be encouraging but honest about issues
- Provide specific, actionable feedback
- Focus on learning and improvement
- Score based on correctness (60%), efficiency (20%), code quality (20%)

Respond with ONLY the JSON object, no additional text.`;
  }

  private parseAIResponse(analysisText: string, testCases: TestCase[]): CodeCheckResult {
    try {
      // Clean the response to extract JSON
      let jsonString = analysisText.replace(/```json\s*|\s*```/g, '').trim();
      
      // Find JSON object in the response
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }

      const analysis = JSON.parse(jsonString);

      return {
        success: true,
        isCorrect: analysis.isCorrect || false,
        score: analysis.score || 0,
        feedback: analysis.feedback || "Code analysis completed",
        detailedAnalysis: {
          syntax: {
            isValid: analysis.syntax?.isValid || false,
            issues: analysis.syntax?.issues || []
          },
          logic: {
            isCorrect: analysis.logic?.isCorrect || false,
            issues: analysis.logic?.issues || [],
            suggestions: analysis.logic?.suggestions || []
          },
          efficiency: {
            timeComplexity: analysis.efficiency?.timeComplexity || "Unknown",
            spaceComplexity: analysis.efficiency?.spaceComplexity || "Unknown",
            rating: analysis.efficiency?.rating || 3,
            improvements: analysis.efficiency?.improvements || []
          },
          testCases: {
            passed: analysis.testCases?.passed || 0,
            total: analysis.testCases?.total || testCases.length,
            results: analysis.testCases?.results || []
          }
        },
        hints: analysis.hints || [],
        learningPoints: analysis.learningPoints || []
      };

    } catch (parseError) {
      console.error('Failed to parse AI analysis response:', parseError);
      console.log('Raw AI response:', analysisText.substring(0, 500));
      
      // Fallback to basic analysis
      return {
        success: true,
        isCorrect: false,
        score: 50,
        feedback: "Code received, but detailed analysis couldn't be parsed. Please check syntax and logic.",
        detailedAnalysis: {
          syntax: { isValid: true, issues: [] },
          logic: { isCorrect: false, issues: ["Analysis parsing failed"], suggestions: [] },
          efficiency: { timeComplexity: "Unknown", spaceComplexity: "Unknown", rating: 3, improvements: [] },
          testCases: { passed: 0, total: testCases.length, results: [] }
        },
        hints: ["Check your code syntax and logic"],
        learningPoints: ["AI analysis system is learning from your code"]
      };
    }
  }

  private createErrorResult(errorMessage: string): CodeCheckResult {
    return {
      success: false,
      isCorrect: false,
      score: 0,
      feedback: `Error during code analysis: ${errorMessage}`,
      detailedAnalysis: {
        syntax: { isValid: false, issues: [errorMessage] },
        logic: { isCorrect: false, issues: [errorMessage], suggestions: [] },
        efficiency: { timeComplexity: "Unknown", spaceComplexity: "Unknown", rating: 1, improvements: [] },
        testCases: { passed: 0, total: 0, results: [] }
      },
      hints: ["Please check your code and try again"],
      learningPoints: ["Code analysis requires valid input"]
    };
  }
}

const aiCodeChecker = new AICodeChecker();
export default aiCodeChecker;