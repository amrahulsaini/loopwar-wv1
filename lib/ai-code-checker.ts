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
      
      // Step 1: Basic syntax validation
      const syntaxValidation = await this.validateSyntax(userCode, language);
      if (!syntaxValidation.isValid) {
        return this.createSyntaxErrorResult(syntaxValidation.errors, language);
      }
      
      // Step 2: Language detection validation
      const languageValidation = this.validateLanguageMatch(userCode, language);
      if (!languageValidation.isValid) {
        return this.createLanguageMismatchResult(languageValidation.detectedLanguages, language);
      }
      
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

  // Basic syntax validation for different languages
  private async validateSyntax(code: string, language: string): Promise<{isValid: boolean, errors: string[]}> {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return { isValid: false, errors: ['Code cannot be empty'] };
    }

    switch (language.toLowerCase()) {
      case 'javascript':
        return this.validateJavaScriptSyntax(trimmedCode);
      case 'python':
        return this.validatePythonSyntax(trimmedCode);
      case 'java':
        return this.validateJavaSyntax(trimmedCode);
      case 'cpp':
      case 'c++':
        return this.validateCppSyntax(trimmedCode);
      case 'c':
        return this.validateCSyntax(trimmedCode);
      case 'csharp':
        return this.validateCSharpSyntax(trimmedCode);
      default:
        // For other languages, do basic checks
        return this.validateGenericSyntax(trimmedCode, language);
    }
  }

  private validateJavaScriptSyntax(code: string): {isValid: boolean, errors: string[]} {
    const errors: string[] = [];
    
    // Check for common wrong language patterns
    if (code.includes('printf(') || code.includes('#include')) {
      errors.push('This appears to be C/C++ code, not JavaScript. Use console.log() instead of printf()');
    }
    if (code.includes('System.out.print') || code.includes('public class')) {
      errors.push('This appears to be Java code, not JavaScript. Use console.log() instead of System.out.println()');
    }
    if (code.includes('def ') && code.match(/def\s+\w+\s*\(/)) {
      errors.push('This appears to be Python code, not JavaScript. Use function keyword instead of def');
    }
    if (code.includes('print(') && !code.includes('console.') && !code.includes('window.print')) {
      errors.push('Use console.log() instead of print() in JavaScript');
    }

    // Basic JavaScript syntax checks
    try {
      // Simple syntax validation using Function constructor
      new Function(code);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown syntax error';
      errors.push(`JavaScript syntax error: ${errorMessage}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  private validatePythonSyntax(code: string): {isValid: boolean, errors: string[]} {
    const errors: string[] = [];
    
    // Check for common wrong language patterns
    if (code.includes('console.log') || code.includes('function ')) {
      errors.push('This appears to be JavaScript code, not Python. Use print() instead of console.log()');
    }
    if (code.includes('printf(') || code.includes('#include')) {
      errors.push('This appears to be C/C++ code, not Python. Use print() instead of printf()');
    }
    if (code.includes('System.out.print') || code.includes('public class')) {
      errors.push('This appears to be Java code, not Python. Use print() instead of System.out.println()');
    }
    if (code.includes('{') && code.includes('}') && !code.includes('f"')) {
      errors.push('Python uses indentation, not curly braces {}');
    }

    // Basic Python syntax checks
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#')) {
        // Check for missing colons in control structures
        if (line.match(/^(if|for|while|def|class|try|except|finally|with)\s.*[^:]$/)) {
          errors.push(`Line ${i + 1}: Missing colon (:) after ${line.split(' ')[0]} statement`);
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  private validateJavaSyntax(code: string): {isValid: boolean, errors: string[]} {
    const errors: string[] = [];
    
    // Check for common wrong language patterns
    if (code.includes('console.log') || code.includes('function ')) {
      errors.push('This appears to be JavaScript code, not Java. Use System.out.println() instead of console.log()');
    }
    if (code.includes('printf(') && !code.includes('System.out.printf')) {
      errors.push('This appears to be C/C++ code, not Java. Use System.out.println() instead of printf()');
    }
    if (code.includes('def ') && code.match(/def\s+\w+\s*\(/)) {
      errors.push('This appears to be Python code, not Java. Use method declarations instead of def');
    }
    if (code.includes('print(') && !code.includes('System.out.print')) {
      errors.push('Use System.out.println() instead of print() in Java');
    }

    // Basic Java syntax checks
    if (!code.includes('class ')) {
      errors.push('Java code must contain at least one class declaration');
    }
    if (!code.includes('{') || !code.includes('}')) {
      errors.push('Java code requires curly braces {} for class and method bodies');
    }

    return { isValid: errors.length === 0, errors };
  }

  private validateCppSyntax(code: string): {isValid: boolean, errors: string[]} {
    const errors: string[] = [];
    
    // Check for common wrong language patterns
    if (code.includes('console.log') || code.includes('function ')) {
      errors.push('This appears to be JavaScript code, not C++. Use cout instead of console.log()');
    }
    if (code.includes('System.out.print')) {
      errors.push('This appears to be Java code, not C++. Use cout instead of System.out.println()');
    }
    if (code.includes('def ') && code.match(/def\s+\w+\s*\(/)) {
      errors.push('This appears to be Python code, not C++. Use function declarations instead of def');
    }

    // Basic C++ syntax checks
    if (!code.includes('#include') && !code.includes('using namespace')) {
      errors.push('C++ code typically requires #include directives');
    }

    return { isValid: errors.length === 0, errors };
  }

  private validateCSyntax(code: string): {isValid: boolean, errors: string[]} {
    const errors: string[] = [];
    
    // Check for common wrong language patterns
    if (code.includes('console.log') || code.includes('function ')) {
      errors.push('This appears to be JavaScript code, not C. Use printf() instead of console.log()');
    }
    if (code.includes('System.out.print')) {
      errors.push('This appears to be Java code, not C. Use printf() instead of System.out.println()');
    }
    if (code.includes('def ') && code.match(/def\s+\w+\s*\(/)) {
      errors.push('This appears to be Python code, not C. Use function declarations instead of def');
    }

    // Basic C syntax checks
    if (!code.includes('#include')) {
      errors.push('C code typically requires #include directives');
    }

    return { isValid: errors.length === 0, errors };
  }

  private validateCSharpSyntax(code: string): {isValid: boolean, errors: string[]} {
    const errors: string[] = [];
    
    // Check for common wrong language patterns
    if (code.includes('console.log') || code.includes('function ')) {
      errors.push('This appears to be JavaScript code, not C#. Use Console.WriteLine() instead of console.log()');
    }
    if (code.includes('printf(')) {
      errors.push('This appears to be C/C++ code, not C#. Use Console.WriteLine() instead of printf()');
    }
    if (code.includes('def ') && code.match(/def\s+\w+\s*\(/)) {
      errors.push('This appears to be Python code, not C#. Use method declarations instead of def');
    }

    // Basic C# syntax checks
    if (!code.includes('class ') && !code.includes('namespace ')) {
      errors.push('C# code must contain at least one class or namespace declaration');
    }

    return { isValid: errors.length === 0, errors };
  }

  private validateGenericSyntax(code: string, language: string): {isValid: boolean, errors: string[]} {
    const errors: string[] = [];
    
    // Generic validation for other languages
    if (code.includes('console.log') && language !== 'javascript') {
      errors.push(`console.log() is JavaScript syntax, not ${language}`);
    }
    if (code.includes('print(') && !['python', 'ruby'].includes(language)) {
      errors.push(`print() might not be the correct output method for ${language}`);
    }
    if (code.includes('printf(') && !['c', 'cpp'].includes(language)) {
      errors.push(`printf() is C/C++ syntax, not ${language}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  // Language detection validation
  private validateLanguageMatch(code: string, expectedLanguage: string): {isValid: boolean, detectedLanguages: string[]} {
    const detectedLanguages = this.detectCodeLanguage(code);
    const isValid = detectedLanguages.length === 0 || detectedLanguages.includes(expectedLanguage);
    
    return { isValid, detectedLanguages };
  }

  private detectCodeLanguage(code: string): string[] {
    const detectedLanguages: string[] = [];
    
    // JavaScript patterns
    if (code.includes('console.log') || code.includes('function ') || code.includes('let ') || code.includes('const ')) {
      detectedLanguages.push('javascript');
    }
    
    // Python patterns
    if ((code.includes('def ') && code.match(/def\s+\w+\s*\(/)) || code.includes('import ') || (code.includes('print(') && !code.includes('printf'))) {
      detectedLanguages.push('python');
    }
    
    // Java patterns
    if (code.includes('System.out.print') || code.includes('public class') || code.includes('public static void main')) {
      detectedLanguages.push('java');
    }
    
    // C/C++ patterns
    if (code.includes('printf(') || code.includes('#include') || code.includes('int main(')) {
      detectedLanguages.push('c');
      if (code.includes('cout') || code.includes('using namespace')) {
        detectedLanguages.push('cpp');
      }
    }
    
    // C# patterns
    if (code.includes('Console.WriteLine') || code.includes('using System')) {
      detectedLanguages.push('csharp');
    }
    
    return detectedLanguages;
  }

  // Create error result for syntax errors
  private createSyntaxErrorResult(errors: string[], language: string): CodeCheckResult {
    return {
      success: false,
      isCorrect: false,
      score: 0,
      feedback: `Syntax errors detected in your ${language} code. Please fix these issues and try again.`,
      detailedAnalysis: {
        syntax: { isValid: false, issues: errors },
        logic: { isCorrect: false, issues: ['Cannot analyze logic due to syntax errors'], suggestions: [] },
        efficiency: { timeComplexity: 'Unknown', spaceComplexity: 'Unknown', rating: 1, improvements: [] },
        testCases: { passed: 0, total: 0, results: [] }
      },
      hints: [
        'Check your syntax carefully',
        'Make sure you\'re using the correct programming language',
        'Review the language-specific syntax rules'
      ],
      learningPoints: [
        `${language} has specific syntax rules that must be followed`,
        'Syntax errors prevent code from running',
        'Each programming language has its own unique syntax'
      ]
    };
  }

  // Create error result for language mismatch
  private createLanguageMismatchResult(detectedLanguages: string[], expectedLanguage: string): CodeCheckResult {
    const detectedStr = detectedLanguages.length > 0 ? detectedLanguages.join(' or ') : 'another language';
    
    return {
      success: false,
      isCorrect: false,
      score: 0,
      feedback: `Your code appears to be written in ${detectedStr}, but you selected ${expectedLanguage}. Please either rewrite your code in ${expectedLanguage} or select the correct language.`,
      detailedAnalysis: {
        syntax: { 
          isValid: false, 
          issues: [`Code is written in ${detectedStr}, not ${expectedLanguage}`] 
        },
        logic: { isCorrect: false, issues: ['Cannot analyze logic due to language mismatch'], suggestions: [] },
        efficiency: { timeComplexity: 'Unknown', spaceComplexity: 'Unknown', rating: 1, improvements: [] },
        testCases: { passed: 0, total: 0, results: [] }
      },
      hints: [
        `Rewrite your code using ${expectedLanguage} syntax`,
        'Or select the correct language that matches your code',
        'Each language has different syntax and functions'
      ],
      learningPoints: [
        'Programming languages have distinct syntax patterns',
        'Language selection must match the code you write',
        'Cross-language confusion is common for beginners'
      ]
    };
  }

  private createAnalysisPrompt(
    userCode: string,
    language: string,
    problemDescription: string,
    testCases: TestCase[]
  ): string {
    return `You are an expert code reviewer and programming tutor. Analyze this ${language} code solution thoroughly and provide educational feedback.

**CRITICAL LANGUAGE VALIDATION:**
This code MUST be valid ${language} syntax. Before any other analysis:

1. **VERIFY LANGUAGE SYNTAX**: 
   - Check if this code uses proper ${language} syntax throughout
   - If ANY line contains syntax from other languages, IMMEDIATELY mark as FAILED
   - Common cross-language mistakes to reject:
     ${this.getLanguageValidationRules(language)}

2. **SYNTAX ENFORCEMENT**:
   - If you detect wrong language syntax, set "isCorrect": false, "score": 0
   - Focus on exact syntax requirements for ${language}
   - Be strict about language-specific patterns

**PROBLEM DESCRIPTION:**
${problemDescription}

**USER'S CODE (Must be ${language}):**
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
Provide a comprehensive analysis in the following JSON format:

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

**ANALYSIS PRIORITY:**
1. **LANGUAGE VALIDATION** (40%): Strict ${language} syntax compliance
2. **LOGIC CORRECTNESS** (40%): Algorithm solves the problem  
3. **EFFICIENCY** (15%): Time/space complexity optimization
4. **CODE QUALITY** (5%): Style and best practices

**SCORING RULES:**
- Wrong language detected: Automatic 0 points
- Syntax errors: Maximum 20 points
- Logic errors: Maximum 50 points
- Inefficient but correct: 60-80 points
- Perfect solution: 90-100 points

**IMPORTANT:**
- Be extremely strict about language syntax validation
- Actually trace through code execution for each test case
- Provide specific, actionable feedback for learning
- If syntax is wrong language, explain the correct ${language} equivalent

Respond with ONLY the JSON object, no additional text.`;
  }

  private getLanguageValidationRules(language: string): string {
    switch (language.toLowerCase()) {
      case 'javascript':
        return `
     - printf() → Should be console.log()
     - System.out.println() → Should be console.log()  
     - def function() → Should be function name()
     - print() → Should be console.log()
     - #include → Not valid in JavaScript
     - public class → Not valid in JavaScript`;
      
      case 'python':
        return `
     - console.log() → Should be print()
     - printf() → Should be print()
     - System.out.println() → Should be print()
     - function name() → Should be def name():
     - { } braces → Should use indentation
     - ; semicolons → Not needed in Python`;
      
      case 'java':
        return `
     - console.log() → Should be System.out.println()
     - printf() → Should be System.out.printf()
     - print() → Should be System.out.println()
     - def function() → Should be public method()
     - No class declaration → Java requires class
     - #include → Not valid in Java`;
      
      case 'cpp':
      case 'c++':
        return `
     - console.log() → Should be cout <<
     - System.out.println() → Should be cout <<
     - print() → Should be cout << or printf()
     - def function() → Should be return_type function()
     - No #include → C++ typically needs headers`;
      
      case 'c':
        return `
     - console.log() → Should be printf()
     - System.out.println() → Should be printf()
     - print() → Should be printf()
     - def function() → Should be return_type function()
     - No #include → C requires headers`;
      
      case 'csharp':
        return `
     - console.log() → Should be Console.WriteLine()
     - printf() → Should be Console.WriteLine()
     - print() → Should be Console.WriteLine()
     - def function() → Should be access_modifier return_type Method()
     - No class → C# requires class declaration`;
      
      default:
        return `
     - Check for language-specific syntax patterns
     - Verify correct function/method declarations
     - Ensure proper output statements for ${language}`;
    }
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