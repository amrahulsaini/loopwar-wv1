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

interface TestResult {
  test_case_number: number;
  status: string;
  output: string;
  expected_output: string;
  execution_time: number;
  memory_usage: number;
  passed: boolean;
  error?: string;
}

const STARTER_CODE: Record<string, string> = {
  javascript: `function twoSum(nums, target) {
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
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    const inputData = JSON.parse(input.trim());
    const nums = inputData.slice(0, -1);
    const target = inputData[inputData.length - 1];
    console.log(JSON.stringify(twoSum(nums, target)));
    rl.close();
});`,
  
  python: `def two_sum(nums, target):
    # Write your solution here
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

# Test runner - reads from stdin
import json
input_data = json.loads(input().strip())
nums = input_data[:-1]
target = input_data[-1]
result = two_sum(nums, target)
print(json.dumps(result))`,
  
  java: `import java.util.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Your solution here
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[]{i, j};
                }
            }
        }
        return new int[]{};
    }
    
    public static void main(String[] args) {
        // Parse input
        String numsStr = args[0].replace("[", "").replace("]", "");
        String[] numsArray = numsStr.split(",");
        int[] nums = new int[numsArray.length];
        for (int i = 0; i < numsArray.length; i++) {
            nums[i] = Integer.parseInt(numsArray[i].trim());
        }
        int target = Integer.parseInt(args[1]);
        
        // Call function and print result
        int[] result = twoSum(nums, target);
        System.out.print("[");
        for (int i = 0; i < result.length; i++) {
            System.out.print(result[i]);
            if (i < result.length - 1) System.out.print(",");
        }
        System.out.println("]");
    }
}`,
  
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your solution here
    for (int i = 0; i < nums.size(); i++) {
        for (int j = i + 1; j < nums.size(); j++) {
            if (nums[i] + nums[j] == target) {
                return {i, j};
            }
        }
    }
    return {};
}

int main(int argc, char* argv[]) {
    // Parse input
    string numsStr = argv[1];
    int target = stoi(argv[2]);
    
    // Parse array from string like "[2,7,11,15]"
    vector<int> nums;
    numsStr = numsStr.substr(1, numsStr.length() - 2); // Remove [ ]
    stringstream ss(numsStr);
    string item;
    while (getline(ss, item, ',')) {
        nums.push_back(stoi(item));
    }
    
    // Call function
    vector<int> result = twoSum(nums, target);
    
    // Print result
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    
    return 0;
}`
};

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

export default function CodeTesting() {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState(STARTER_CODE.python);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ExecutionResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(STARTER_CODE[language as keyof typeof STARTER_CODE] || '');
    setResults(null);
    setShowResults(false);
  };

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
    return passed ? '#4ade80' : '#f87171';
  };

  const allTestsPassed = results?.results && results.results.length > 0 && results.results.every(r => r.passed);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Code Testing Platform</h1>
        <p className={styles.subtitle}>Practice coding problems with real-time execution</p>
      </div>

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
            
            <h4>Example:</h4>
            <div className={styles.example}>
              <strong>Input:</strong> nums = [2,7,11,15], target = 9<br/>
              <strong>Output:</strong> [0,1]<br/>
              <strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
            </div>

            <h4>Test Cases:</h4>
            <div className={styles.testCases}>
              {TEST_CASES.map((testCase, index) => (
                <div key={index} className={styles.testCase}>
                  <strong>Test {index + 1}:</strong>
                  <div>Input: {testCase.input}</div>
                  <div>Expected: {testCase.expected}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Panel */}
        <div className={styles.codePanel}>
          <div className={styles.codeHeader}>
            <div className={styles.languageSelector}>
              {Object.keys(STARTER_CODE).map((lang) => (
                <button
                  key={lang}
                  className={`${styles.languageBtn} ${selectedLanguage === lang ? styles.active : ''}`}
                  onClick={() => handleLanguageChange(lang)}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
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
          {showResults && (
            <div className={styles.resultsPanel}>
              <div className={styles.resultsHeader}>
                <h3>Test Results</h3>
                <span 
                  className={styles.overallStatus}
                  style={{ color: getStatusColor(allTestsPassed || false) }}
                >
                  {allTestsPassed ? 'All Tests Passed!' : 'Some Tests Failed'}
                </span>
              </div>

              <div className={styles.resultsList}>
                {results?.results?.map((result, index) => (
                  <div 
                    key={index} 
                    className={styles.resultItem}
                    style={{ borderLeft: `4px solid ${getStatusColor(result.passed)}` }}
                  >
                    <div className={styles.resultHeader}>
                      <span className={styles.testNumber}>Test Case {result.testCase}</span>
                      <span 
                        className={styles.status}
                        style={{ color: getStatusColor(result.passed) }}
                      >
                        {result.passed ? 'PASSED' : 'FAILED'}
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
