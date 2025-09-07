interface SubmissionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

interface TestCase {
  input: string;
  expected: string;
}

interface ExecutionResult {
  success: boolean;
  results: Array<{
    testCase: number;
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    error?: string;
    executionTime?: string;
    memory?: number;
  }>;
  overallStatus: string;
  error?: string;
}

class Judge0Service {
  private readonly baseUrl = 'https://loopwar.dev/judge0';

  // Language ID mappings for Judge0
  private readonly languageIds = {
    javascript: 63, // Node.js
    python: 71,     // Python 3
    java: 62,       // Java
    cpp: 54,        // C++ (GCC 9.2.0)
    c: 50,          // C (GCC 9.2.0)
    csharp: 51,     // C#
    go: 60,         // Go
    rust: 73,       // Rust
    php: 68,        // PHP
    ruby: 72,       // Ruby
    swift: 83,      // Swift
    kotlin: 78,     // Kotlin
    typescript: 74  // TypeScript
  };

  async submitCode(
    code: string, 
    languageId: number, 
    stdin?: string
  ): Promise<SubmissionResult> {
    try {
      console.log('Submitting code to Judge0:', {
        languageId,
        codeLength: code.length,
        hasStdin: !!stdin
      });

      const response = await fetch(`${this.baseUrl}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          stdin: stdin || '',
          expected_output: null,
          cpu_time_limit: 10,
          memory_limit: 128000,
          wall_time_limit: 10,
          stack_limit: 64000,
          max_processes_and_or_threads: 60,
          enable_per_process_and_thread_time_limit: false,
          enable_per_process_and_thread_memory_limit: false,
          max_file_size: 1024
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Judge0 API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Judge0 API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Judge0 response:', result);

      return result as SubmissionResult;
    } catch (error) {
      console.error('Error submitting code:', error);
      throw error;
    }
  }

  async executeWithTestCases(
    code: string, 
    language: string, 
    testCases: TestCase[]
  ): Promise<ExecutionResult> {
    const languageId = this.languageIds[language as keyof typeof this.languageIds];
    
    if (!languageId) {
      return {
        success: false,
        results: [],
        overallStatus: 'Error',
        error: `Unsupported language: ${language}`
      };
    }

    const results = [];
    let passedCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      try {
        console.log(`Running test case ${i + 1}:`, testCase);
        
        const submission = await this.submitCode(code, languageId, testCase.input);
        
        let passed = false;
        let actual = '';
        let error = '';

        if (submission.status.id === 3) { // Accepted
          actual = (submission.stdout || '').trim();
          const expected = testCase.expected.trim();
          passed = actual === expected;
          
          if (passed) passedCount++;
          
          console.log(`Test case ${i + 1} result:`, {
            passed,
            expected,
            actual,
            status: submission.status.description
          });
        } else {
          // Handle compilation errors, runtime errors, etc.
          error = submission.stderr || submission.compile_output || submission.status.description;
          actual = submission.stdout || '';
          
          console.log(`Test case ${i + 1} failed:`, {
            status: submission.status,
            error,
            stderr: submission.stderr,
            compile_output: submission.compile_output
          });
        }

        results.push({
          testCase: i + 1,
          passed,
          input: testCase.input,
          expected: testCase.expected,
          actual,
          error: error || undefined,
          executionTime: submission.time || undefined,
          memory: submission.memory || undefined
        });

      } catch (error) {
        console.error(`Error running test case ${i + 1}:`, error);
        
        results.push({
          testCase: i + 1,
          passed: false,
          input: testCase.input,
          expected: testCase.expected,
          actual: '',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const overallStatus = passedCount === testCases.length 
      ? 'All tests passed!' 
      : `${passedCount}/${testCases.length} tests passed`;

    return {
      success: passedCount === testCases.length,
      results,
      overallStatus
    };
  }

  async getLanguages() {
    try {
      const response = await fetch(`${this.baseUrl}/languages`);
      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  }

  async getSystemInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/system_info`);
      if (!response.ok) {
        throw new Error(`Failed to fetch system info: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching system info:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const judge0Service = new Judge0Service();

export default judge0Service;
export { Judge0Service };
export type { SubmissionResult, TestCase, ExecutionResult };
