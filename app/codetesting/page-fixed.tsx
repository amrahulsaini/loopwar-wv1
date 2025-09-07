'use client';

import React, { useState } from 'react';
import styles from './CodeTesting.module.css';
import judge0Service from '@/lib/judge0-service';

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

const CodeTesting: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<ExecutionResult | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  // Two Sum problem test cases
  const TEST_CASES: TestCase[] = [
    {
      input: JSON.stringify([2, 7, 11, 15, 9]),
      expected: JSON.stringify([0, 1])
    },
    {
      input: JSON.stringify([3, 2, 4, 6]), 
      expected: JSON.stringify([1, 2])
    },
    {
      input: JSON.stringify([3, 3, 6]),
      expected: JSON.stringify([0, 1])
    },
    {
      input: JSON.stringify([1, 2, 3, 4, 5, 6, 7]),
      expected: JSON.stringify([0, 5])
    }
  ];

  // Language configurations with starter code
  const LANGUAGES = {
    javascript: {
      name: 'JavaScript',
      starterCode: `function twoSum(nums, target) {
    // Write your solution here
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}

// Test runner - reads from stdin
const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
const inputData = JSON.parse(input);
const nums = inputData.slice(0, -1);
const target = inputData[inputData.length - 1];
console.log(JSON.stringify(twoSum(nums, target)));`
    },
    python: {
      name: 'Python',
      starterCode: `def two_sum(nums, target):
    # Write your solution here
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

# Test runner - reads from stdin
import json
import sys
input_data = json.loads(sys.stdin.read().strip())
nums = input_data[:-1]
target = input_data[-1]
result = two_sum(nums, target)
print(json.dumps(result))`
    },
    java: {
      name: 'Java',
      starterCode: `import java.util.*;
import java.io.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your solution here
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[]{i, j};
                }
            }
        }
        return new int[]{};
    }
    
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String input = reader.readLine();
        
        // Parse JSON array: [2,7,11,15,9] -> nums=[2,7,11,15], target=9
        input = input.trim().substring(1, input.length() - 1); // Remove [ ]
        String[] parts = input.split(",");
        int[] nums = new int[parts.length - 1];
        for (int i = 0; i < parts.length - 1; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        int target = Integer.parseInt(parts[parts.length - 1].trim());
        
        int[] result = twoSum(nums, target);
        System.out.print("[");
        for (int i = 0; i < result.length; i++) {
            System.out.print(result[i]);
            if (i < result.length - 1) System.out.print(",");
        }
        System.out.println("]");
    }
}`
    },
    cpp: {
      name: 'C++',
      starterCode: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your solution here
    for (int i = 0; i < nums.size(); i++) {
        for (int j = i + 1; j < nums.size(); j++) {
            if (nums[i] + nums[j] == target) {
                return {i, j};
            }
        }
    }
    return {};
}

int main() {
    string line;
    getline(cin, line);
    
    // Parse JSON array: [2,7,11,15,9] -> nums=[2,7,11,15], target=9
    line = line.substr(1, line.length() - 2); // Remove [ ]
    vector<int> input;
    stringstream ss(line);
    string item;
    
    while (getline(ss, item, ',')) {
        input.push_back(stoi(item));
    }
    
    vector<int> nums(input.begin(), input.end() - 1);
    int target = input.back();
    
    vector<int> result = twoSum(nums, target);
    cout << "[" << result[0] << "," << result[1] << "]" << endl;
    
    return 0;
}`
    }
  };

  // Set starter code when language changes
  React.useEffect(() => {
    if (LANGUAGES[selectedLanguage as keyof typeof LANGUAGES]) {
      setCode(LANGUAGES[selectedLanguage as keyof typeof LANGUAGES].starterCode);
    }
  }, [selectedLanguage]);

  // Initialize with Python starter code
  React.useEffect(() => {
    if (!code && LANGUAGES.python) {
      setCode(LANGUAGES.python.starterCode);
    }
  }, []);

  const handleRunCode = async () => {
    if (!code.trim()) {
      alert('Please enter some code!');
      return;
    }

    setIsRunning(true);
    setShowResults(false);

    try {
      // Use the judge0Service directly
      const result = await judge0Service.executeWithTestCases(
        code,
        selectedLanguage,
        TEST_CASES
      );

      if (result.success) {
        setResults(result);
        setShowResults(true);
      } else {
        alert(`Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error running code:', error);
      alert('Failed to execute code. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (passed: boolean) => {
    return passed ? '#000000' : '#666666';
  };

  const allTestsPassed = results?.results && results.results.length > 0 && results.results.every(r => r.passed);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Code Testing Platform</h1>
        <p className={styles.subtitle}>Practice coding problems with real-time execution</p>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Problem Panel */}
        <div className={styles.problemPanel}>
          <div className={styles.problemHeader}>
            <h2>Two Sum</h2>
            <span className={styles.difficulty}>Easy</span>
          </div>
          
          <div className={styles.problemDescription}>
            <p>
              Given an array of integers <code>nums</code> and an integer <code>target</code>, 
              return indices of the two numbers such that they add up to target.
            </p>
            
            <p>
              You may assume that each input would have <strong>exactly one solution</strong>, 
              and you may not use the same element twice.
            </p>
            
            <p>You can return the answer in any order.</p>
            
            <h4>Example 1:</h4>
            <div className={styles.example}>
              <strong>Input:</strong> nums = [2,7,11,15], target = 9<br/>
              <strong>Output:</strong> [0,1]<br/>
              <strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
            </div>
            
            <h4>Example 2:</h4>
            <div className={styles.example}>
              <strong>Input:</strong> nums = [3,2,4], target = 6<br/>
              <strong>Output:</strong> [1,2]
            </div>
            
            <h4>Test Cases:</h4>
            <div className={styles.testCases}>
              {TEST_CASES.map((testCase, index) => (
                <div key={index} className={styles.testCase}>
                  <div><strong>Input:</strong> {testCase.input}</div>
                  <div><strong>Expected:</strong> {testCase.expected}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Panel */}
        <div className={styles.codePanel}>
          <div className={styles.codeHeader}>
            <div className={styles.languageSelector}>
              {Object.entries(LANGUAGES).map(([key, lang]) => (
                <button
                  key={key}
                  className={`${styles.languageBtn} ${selectedLanguage === key ? styles.active : ''}`}
                  onClick={() => setSelectedLanguage(key)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
            
            <button
              className={styles.runButton}
              onClick={handleRunCode}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
          </div>
          
          <textarea
            className={styles.codeEditor}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
            spellCheck={false}
          />
          
          {/* Results Panel */}
          {showResults && results && (
            <div className={styles.resultsPanel}>
              <div className={styles.resultsHeader}>
                <h3>Test Results</h3>
                <div 
                  className={styles.overallStatus}
                  style={{ color: getStatusColor(allTestsPassed || false) }}
                >
                  {allTestsPassed ? 'All Tests Passed!' : 'Some Tests Failed'}
                </div>
              </div>
              
              <div className={styles.resultsList}>
                {results.error ? (
                  <div className={styles.resultItem}>
                    <div className={styles.error}>
                      <strong>Error:</strong> {results.error}
                    </div>
                  </div>
                ) : (
                  results.results.map((result, index) => (
                    <div key={index} className={styles.resultItem}>
                      <div className={styles.resultHeader}>
                        <span className={styles.testNumber}>
                          Test Case {result.testCase}
                        </span>
                        <span 
                          className={styles.status}
                          style={{ 
                            color: getStatusColor(result.passed) 
                          }}
                        >
                          {result.error ? 'ERROR' : result.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      
                      <div className={styles.resultDetails}>
                        <div><strong>Input:</strong> {result.input}</div>
                        <div><strong>Expected:</strong> {result.expected}</div>
                        <div><strong>Actual:</strong> {result.actual || 'No output'}</div>
                        
                        {result.executionTime && (
                          <div><strong>Time:</strong> {result.executionTime}s</div>
                        )}
                        
                        {result.memory && (
                          <div><strong>Memory:</strong> {Math.round(result.memory / 1024)}KB</div>
                        )}
                        
                        {result.error && (
                          <div className={styles.error}>
                            <strong>Error:</strong> {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeTesting;
