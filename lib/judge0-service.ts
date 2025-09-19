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

      // Encode source code and stdin to base64 to handle UTF-8 issues
      const encodedSourceCode = Buffer.from(code, 'utf8').toString('base64');
      const encodedStdin = Buffer.from(stdin || '', 'utf8').toString('base64');

      const response = await fetch(`${this.baseUrl}/submissions?base64_encoded=true&wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_code: encodedSourceCode,
          language_id: languageId,
          stdin: encodedStdin,
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

      // Validate the response structure
      if (!result || typeof result !== 'object') {
        console.error('Invalid Judge0 response format:', result);
        throw new Error('Invalid response format from Judge0');
      }

      // Decode base64 encoded response fields
      if (result.stdout) {
        try {
          result.stdout = Buffer.from(result.stdout, 'base64').toString('utf8');
        } catch (decodeError) {
          console.warn('Failed to decode stdout from base64:', decodeError);
        }
      }
      
      if (result.stderr) {
        try {
          result.stderr = Buffer.from(result.stderr, 'base64').toString('utf8');
        } catch (decodeError) {
          console.warn('Failed to decode stderr from base64:', decodeError);
        }
      }
      
      if (result.compile_output) {
        try {
          result.compile_output = Buffer.from(result.compile_output, 'base64').toString('utf8');
        } catch (decodeError) {
          console.warn('Failed to decode compile_output from base64:', decodeError);
        }
      }

      // Ensure status object exists with required properties
      if (!result.status || typeof result.status !== 'object') {
        console.error('Missing or invalid status in Judge0 response:', result);
        // Create a default error status
        result.status = {
          id: 6, // Compilation Error
          description: 'Invalid response format'
        };
      }

      // Ensure status has id and description
      if (typeof result.status.id !== 'number') {
        result.status.id = 6; // Default to compilation error
      }
      if (typeof result.status.description !== 'string') {
        result.status.description = result.status.description || 'Unknown status';
      }

      return result as SubmissionResult;
    } catch (error) {
      console.error('Error submitting code:', error);
      throw error;
    }
  }

  // Enhanced function to parse and call user functions with proper input handling
  private generateAdvancedWrapper(userCode: string, language: string, testCase: TestCase): string {
    const input = testCase.input;
    
    switch (language) {
      case 'javascript':
        return `${userCode}

// Universal test execution for AI-generated test cases
const input = "${input.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";

try {
  // Parse input - handle both JSON objects and simple values
  let parsedInput;
  try {
    parsedInput = JSON.parse(input);
  } catch {
    parsedInput = input;
  }
  
  // Extract function name from user code
  const funcMatches = userCode.match(/function\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
  if (funcMatches) {
    const funcName = funcMatches[1];
    let result;
    
    // Handle different input types for AI test cases
    if (typeof parsedInput === 'object' && parsedInput !== null) {
      // Handle JSON object inputs like {"nums": [2,7,11,15], "target": 9}
      if (Array.isArray(parsedInput)) {
        // Direct array input: [2,7,11,15,9]
        result = eval(\`\${funcName}(...parsedInput)\`);
      } else if (parsedInput.nums && parsedInput.target !== undefined) {
        // Two Sum style: {"nums": [2,7,11,15], "target": 9}
        result = eval(\`\${funcName}(parsedInput.nums, parsedInput.target)\`);
      } else if (parsedInput.nums && parsedInput.k !== undefined) {
        // Array with k parameter: {"nums": [1,2,3], "k": 2}
        result = eval(\`\${funcName}(parsedInput.nums, parsedInput.k)\`);
      } else {
        // Generic object - try to spread values
        const values = Object.values(parsedInput);
        result = eval(\`\${funcName}(...values)\`);
      }
    } else {
      // Simple string/number input
      result = eval(\`\${funcName}(parsedInput)\`);
    }
    
    // Output result in consistent format
    if (typeof result === 'object') {
      console.log(JSON.stringify(result));
    } else {
      console.log(result);
    }
  } else {
    console.log("Error: No function found in code");
  }
} catch (error) {
  console.log("Error: " + error.message);
}`;

      case 'python':
        return `${userCode}

# Universal test execution for AI-generated test cases
import json
import sys
import re

input_data = "${input.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"

try:
    # Parse input - handle both JSON objects and simple values
    try:
        parsed_input = json.loads(input_data)
    except:
        parsed_input = input_data
    
    # Extract function name from user code
    function_matches = re.findall(r'def\\s+([a-zA-Z_][a-zA-Z0-9_]*)', '''${userCode}''')
    if function_matches:
        function_name = function_matches[0]
        
        # Handle different input types for AI test cases
        if isinstance(parsed_input, dict):
            # Handle JSON object inputs like {"nums": [2,7,11,15], "target": 9}
            if "nums" in parsed_input and "target" in parsed_input:
                # Two Sum style
                result = eval(f"{function_name}(parsed_input['nums'], parsed_input['target'])")
            elif "nums" in parsed_input and "k" in parsed_input:
                # Array with k parameter
                result = eval(f"{function_name}(parsed_input['nums'], parsed_input['k'])")
            else:
                # Generic object - try to spread values
                values = list(parsed_input.values())
                if len(values) == 1:
                    result = eval(f"{function_name}({repr(values[0])})")
                else:
                    args_str = ", ".join(repr(v) for v in values)
                    result = eval(f"{function_name}({args_str})")
        elif isinstance(parsed_input, list):
            # Direct array input: [2,7,11,15,9]
            args_str = ", ".join(repr(x) for x in parsed_input)
            result = eval(f"{function_name}({args_str})")
        else:
            # Simple string/number input
            result = eval(f"{function_name}({repr(parsed_input)})")
        
        # Output result in consistent format
        if isinstance(result, (list, dict)):
            print(json.dumps(result))
        else:
            print(result)
    else:
        print("Error: No function found in code")
        
except Exception as error:
    print(f"Error: {error}")`;

      case 'java':
        return `import java.util.*;
import java.lang.reflect.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        String input = "${input.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
        try {
            Solution solution = new Solution();
            
            // Use reflection to find the first public method
            Method[] methods = Solution.class.getDeclaredMethods();
            Method targetMethod = null;
            for (Method method : methods) {
                if (Modifier.isPublic(method.getModifiers()) && !method.getName().equals("main")) {
                    targetMethod = method;
                    break;
                }
            }
            
            if (targetMethod != null) {
                Object result;
                // Simple approach: call with no parameters first, then try with input
                try {
                    result = targetMethod.invoke(solution);
                } catch (Exception e) {
                    // If no-args fails, try with input (simplified)
                    result = targetMethod.invoke(solution, input);
                }
                System.out.println(result);
            } else {
                System.out.println("Error: No public method found");
            }
        } catch (Exception error) {
            System.out.println("Error: " + error.getMessage());
        }
    }
}`;

      case 'cpp':
        return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

${userCode}

int main() {
    string input = "${input.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
    try {
        Solution sol;
        // Assume the main method is called 'solution'
        auto result = sol.solution();
        cout << result << endl;
    } catch (const exception& e) {
        cout << "Error: " << e.what() << endl;
    }
    return 0;
}`;

      case 'c':
        // Extract function name and signature from user code
        const cFuncMatch = userCode.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*\{/);
        const cFuncName = cFuncMatch ? cFuncMatch[1] : 'solution';
        const cFuncParams = cFuncMatch ? cFuncMatch[2] : '';
        
        // Check if this looks like an array-based function (has array parameters)
        const hasArrayParam = cFuncParams.includes('*') || cFuncParams.includes('[]');
        const hasReturnSize = cFuncParams.includes('returnSize');
        const isArrayFunction = hasArrayParam; // Any function with array params needs special handling
        
        // Create universal C wrapper that handles AI test case inputs
        if (isArrayFunction) {
          if (hasReturnSize) {
            // Handle array-based functions that return arrays (like getAverages)
            return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

${userCode}

// Universal input parser for AI test cases
typedef struct {
    int* nums;
    int numsSize;
    int target;
    int k;
} ParsedInput;

ParsedInput parseInput(const char* input) {
    ParsedInput result = {0};
    
    // Try to parse as JSON object: {"nums":[1,2,3],"target":9}
    if (input[0] == '{') {
        char* inputCopy = strdup(input);
        char* ptr = inputCopy;
        
        // Extract nums array
        char* numsStart = strstr(ptr, "\\"nums\\":");
        if (numsStart) {
            numsStart = strchr(numsStart, '[');
            if (numsStart) {
                numsStart++;
                char* numsEnd = strchr(numsStart, ']');
                if (numsEnd) {
                    *numsEnd = '\\0';
                    
                    // Count numbers
                    int count = 1;
                    char* countPtr = numsStart;
                    while (*countPtr) {
                        if (*countPtr == ',') count++;
                        countPtr++;
                    }
                    
                    result.nums = (int*)malloc(count * sizeof(int));
                    result.numsSize = count;
                    
                    // Parse numbers
                    char* token = strtok(numsStart, ",");
                    int i = 0;
                    while (token && i < count) {
                        result.nums[i++] = atoi(token);
                        token = strtok(NULL, ",");
                    }
                }
            }
        }
        
        // Extract target
        char* targetStart = strstr(ptr, "\\"target\\":");
        if (targetStart) {
            targetStart += 9; // Skip "target":
            while (*targetStart && !isdigit(*targetStart) && *targetStart != '-') targetStart++;
            result.target = atoi(targetStart);
        }
        
        // Extract k value
        char* kStart = strstr(ptr, "\\"k\\":");
        if (kStart) {
            kStart += 4; // Skip "k":
            while (*kStart && !isdigit(*kStart) && *kStart != '-') kStart++;
            result.k = atoi(kStart);
        }
        
        free(inputCopy);
    }
    // Try to parse as simple array: [1,2,3,4,5]
    else if (input[0] == '[') {
        char* inputCopy = strdup(input);
        char* ptr = inputCopy + 1; // Skip opening bracket
        char* end = strrchr(ptr, ']');
        if (end) *end = '\\0';
        
        // Count numbers
        int count = 1;
        char* countPtr = ptr;
        while (*countPtr) {
            if (*countPtr == ',') count++;
            countPtr++;
        }
        
        result.nums = (int*)malloc(count * sizeof(int));
        result.numsSize = count;
        
        // Parse numbers
        char* token = strtok(ptr, ",");
        int i = 0;
        while (token && i < count) {
            result.nums[i++] = atoi(token);
            token = strtok(NULL, ",");
        }
        
        free(inputCopy);
    }
    // Try to parse as simple number
    else {
        result.k = atoi(input);
        result.target = atoi(input);
    }
    
    return result;
}

void printArray(int* arr, int size) {
    printf("[");
    for (int i = 0; i < size; i++) {
        printf("%d", arr[i]);
        if (i < size - 1) printf(",");
    }
    printf("]");
}

int main() {
    char input[] = "${input.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
    ParsedInput parsed = parseInput(input);
    
    // Default test data if parsing fails
    if (!parsed.nums) {
        static int defaultNums[] = {7, 4, 3, 9, 1, 8, 5, 2, 6};
        parsed.nums = defaultNums;
        parsed.numsSize = 9;
        parsed.k = 3;
        parsed.target = 9;
    }
    
    // Call function and handle result
    int returnSize;
    int* result = ${cFuncName}(parsed.nums, parsed.numsSize, parsed.k, &returnSize);
    
    if (result != NULL) {
        printArray(result, returnSize);
        printf("\\n");
        free(result);
    } else {
        printf("null\\n");
    }
    
    return 0;
}`;
          } else {
            // Handle array-based functions that return simple values (like calculate_memory_usage)
            return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

${userCode}

// Universal input parser for AI test cases
typedef struct {
    int* nums;
    int numsSize;
    int target;
    int k;
} ParsedInput;

ParsedInput parseInput(const char* input) {
    ParsedInput result = {0};
    
    // Try to parse as JSON object: {"nums":[1,2,3],"target":9}
    if (input[0] == '{') {
        char* inputCopy = strdup(input);
        char* ptr = inputCopy;
        
        // Extract nums array
        char* numsStart = strstr(ptr, "\\"nums\\":");
        if (numsStart) {
            numsStart = strchr(numsStart, '[');
            if (numsStart) {
                numsStart++;
                char* numsEnd = strchr(numsStart, ']');
                if (numsEnd) {
                    *numsEnd = '\\0';
                    
                    // Count numbers
                    int count = 1;
                    char* countPtr = numsStart;
                    while (*countPtr) {
                        if (*countPtr == ',') count++;
                        countPtr++;
                    }
                    
                    result.nums = (int*)malloc(count * sizeof(int));
                    result.numsSize = count;
                    
                    // Parse numbers
                    char* token = strtok(numsStart, ",");
                    int i = 0;
                    while (token && i < count) {
                        result.nums[i++] = atoi(token);
                        token = strtok(NULL, ",");
                    }
                }
            }
        }
        
        free(inputCopy);
    }
    // Try to parse as simple array: [1,2,3,4,5]
    else if (input[0] == '[') {
        char* inputCopy = strdup(input);
        char* ptr = inputCopy + 1; // Skip opening bracket
        char* end = strrchr(ptr, ']');
        if (end) *end = '\\0';
        
        // Count numbers
        int count = 1;
        char* countPtr = ptr;
        while (*countPtr) {
            if (*countPtr == ',') count++;
            countPtr++;
        }
        
        result.nums = (int*)malloc(count * sizeof(int));
        result.numsSize = count;
        
        // Parse numbers
        char* token = strtok(ptr, ",");
        int i = 0;
        while (token && i < count) {
            result.nums[i++] = atoi(token);
            token = strtok(NULL, ",");
        }
        
        free(inputCopy);
    }
    // Default test data if no input
    else {
        static int defaultNums[] = {7, 4, 3, 9, 1, 8, 5, 2, 6};
        result.nums = defaultNums;
        result.numsSize = 9;
    }
    
    return result;
}

int main() {
    char input[] = "${input.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
    ParsedInput parsed = parseInput(input);
    
    // Call function with array parameters
    int result = ${cFuncName}(parsed.nums, parsed.numsSize);
    printf("%d\\n", result);
    
    // Cleanup if we allocated memory
    if (parsed.nums != (int[]){7, 4, 3, 9, 1, 8, 5, 2, 6}) {
        free(parsed.nums);
    }
    
    return 0;
}`;
          }
        } else {
          // Handle simple functions
          return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

${userCode}

int main() {
    char input[] = "${input.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
    
    // Try to parse input as integer for function parameter
    int param = 5; // Default value
    if (strlen(input) > 0) {
        param = atoi(input);
    }
    
    // Call the detected function
    double result = ${cFuncName}(param);
    printf("%.1f\\n", result);
    return 0;
}`;
        }

      case 'csharp':
        return `using System;
using System.Collections.Generic;
using System.Reflection;

${userCode}

public class Program {
    public static void Main(string[] args) {
        string input = "${input.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
        try {
            Solution solution = new Solution();
            
            // Use reflection to find the first public method
            Type type = typeof(Solution);
            MethodInfo[] methods = type.GetMethods(BindingFlags.Public | BindingFlags.Instance);
            
            MethodInfo targetMethod = null;
            foreach (MethodInfo method in methods) {
                if (method.DeclaringType == type && method.Name != "GetType" && 
                    method.Name != "ToString" && method.Name != "Equals" && 
                    method.Name != "GetHashCode") {
                    targetMethod = method;
                    break;
                }
            }
            
            if (targetMethod != null) {
                object result = targetMethod.Invoke(solution, null);
                Console.WriteLine(result);
            } else {
                Console.WriteLine("Error: No suitable method found");
            }
        } catch (Exception error) {
            Console.WriteLine("Error: " + error.Message);
        }
    }
}`;

      case 'go':
        return `package main

import "fmt"

${userCode}

func main() {
    input := "${input.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
    _ = input // Use input if needed
    
    defer func() {
        if r := recover(); r != nil {
            fmt.Printf("Error: %v\\n", r)
        }
    }()
    
    result := solution()
    fmt.Println(result)
}`;

      case 'rust':
        return `${userCode}

fn main() {
    let input = "${input.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
    let _ = input; // Use input if needed
    
    match std::panic::catch_unwind(|| {
        let result = solution();
        println!("{}", result);
    }) {
        Err(_) => println!("Error: Panic occurred"),
        Ok(_) => {}
    }
}`;

      case 'php':
        return `<?php
${userCode}

$input = "${input.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
try {
    $result = solution();
    echo $result;
} catch (Exception $error) {
    echo "Error: " . $error->getMessage();
}
?>`;

      case 'ruby':
        return `${userCode}

input = "${input.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
begin
    result = solution()
    puts result
rescue => error
    puts "Error: #{error.message}"
end`;

      default:
        return userCode;
    }
  }

  // Generate executable wrapper for function-only code
  private generateWrapper(userCode: string, language: string, testCase: TestCase): string {
    // Use the advanced wrapper for better function detection and input handling
    return this.generateAdvancedWrapper(userCode, language, testCase);
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
        
        // Generate wrapped executable code
        const wrappedCode = this.generateWrapper(code, language, testCase);
        console.log(`Wrapped code for ${language}:`, wrappedCode.substring(0, 200) + '...');
        
        const submission = await this.submitCode(wrappedCode, languageId);
        
        // Add defensive checks for submission response
        if (!submission) {
          throw new Error('No submission response received');
        }
        
        if (!submission.status) {
          console.error('Invalid submission response - missing status:', submission);
          throw new Error('Invalid submission response - missing status');
        }
        
        console.log('Submission status:', submission.status);
        
        let passed = false;
        let actual = '';
        let error = '';

        // Check if submission was accepted (status id 3)
        if (submission.status.id === 3) { // Accepted
          actual = (submission.stdout || '').trim();
          const expected = testCase.expected.trim();
          
          // Normalize JSON outputs for comparison
          let normalizedActual = actual;
          let normalizedExpected = expected;
          
          try {
            // Try to parse and re-stringify both to normalize JSON format
            const parsedActual = JSON.parse(actual);
            const parsedExpected = JSON.parse(expected);
            normalizedActual = JSON.stringify(parsedActual);
            normalizedExpected = JSON.stringify(parsedExpected);
          } catch {
            // If not valid JSON, just use trimmed strings
            normalizedActual = actual;
            normalizedExpected = expected;
          }
          
          passed = normalizedActual === normalizedExpected;
          
          if (passed) passedCount++;
          
          console.log(`Test case ${i + 1} result:`, {
            passed,
            expected: normalizedExpected,
            actual: normalizedActual,
            originalActual: actual,
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
            compile_output: submission.compile_output,
            stdout: submission.stdout
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
      ? `All ${testCases.length} tests passed!` 
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
