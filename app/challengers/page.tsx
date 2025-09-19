'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './challengers.module.css';
import { ADDITIONAL_PROBLEMS, PROBLEM_LANGUAGES } from './problemsData';

interface TestCase {
  input: string;
  expected: string;
  explanation?: string;
}

interface ExecutionResult {
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
  // Keep legacy fields for backward compatibility
  results?: Array<{
    testCase: number;
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    error?: string;
    executionTime?: string;
    memory?: number;
  }>;
  overallStatus?: string;
  error?: string;
}

interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: TestCase[];
}

// Merge K-Diverse Partition with Additional Problems
const PROBLEMS: Record<string, Problem> = {
    'k-diverse-partition': {
      id: 'k-diverse-partition',
      title: 'K-Diverse Partition',
      difficulty: 'Hard',
      description: `Given an array of integers and a value k, partition the array into subarrays such that each subarray contains at most k distinct elements. The goal is to minimize the number of partitions while ensuring no partition exceeds k distinct elements.

A k-diverse partition is valid if:
1. Each partition contains at most k distinct elements
2. The array is completely partitioned (no elements left out)
3. Partitions maintain the original order of elements

Return the minimum number of partitions needed.`,
      constraints: [
        '1 ≤ n ≤ 10⁵ (where n is the length of the array)',
        '1 ≤ k ≤ n',
        '1 ≤ arr[i] ≤ 10⁶',
        'Time complexity should be O(n) or O(n log n)',
        'Space complexity should be O(k) or better'
      ],
      examples: [
        {
          input: 'arr = [1,2,1,2,3], k = 2',
          output: '2',
          explanation: 'Optimal partitioning: [1,2,1,2] (2 distinct: 1,2) and [3] (1 distinct: 3). Total: 2 partitions.'
        },
        {
          input: 'arr = [1,2,3,4], k = 2',
          output: '2', 
          explanation: 'Optimal partitioning: [1,2] (2 distinct) and [3,4] (2 distinct). Total: 2 partitions.'
        },
        {
          input: 'arr = [1,1,1,1], k = 3',
          output: '1',
          explanation: 'All elements are the same, so [1,1,1,1] has only 1 distinct element ≤ 3. Total: 1 partition.'
        }
      ],
      testCases: [
        {
          input: JSON.stringify({ arr: [1,2,1,2,3], k: 2 }),
          expected: '2'
        },
        {
          input: JSON.stringify({ arr: [1,2,3,4], k: 2 }),
          expected: '2'
        },
        {
          input: JSON.stringify({ arr: [1,1,1,1], k: 3 }),
          expected: '1'
        },
        {
          input: JSON.stringify({ arr: [1,2,3,1,4,5,6], k: 3 }),
          expected: '2'
        },
        {
          input: JSON.stringify({ arr: [5,4,3,2,1,2,3,4,5], k: 4 }),
          expected: '2'
        },
        {
          input: JSON.stringify({ arr: [1], k: 1 }),
          expected: '1'
        }
      ]
    },
    ...ADDITIONAL_PROBLEMS
  };

const ChallengersPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<ExecutionResult | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedProblem, setSelectedProblem] = useState<string>('k-diverse-partition');

  // Get current language configurations based on selected problem
  const getCurrentLanguages = useCallback(() => {
    const problemLanguages = PROBLEM_LANGUAGES[selectedProblem as keyof typeof PROBLEM_LANGUAGES];
    return problemLanguages || {
      python: {
        name: 'Python 3',
        icon: '🐍',
        starterCode: '# Write your solution here\n'
      },
      javascript: {
        name: 'JavaScript (Node.js)',
        icon: '🟨',
        starterCode: '// Write your solution here\n'
      }
    };
  }, [selectedProblem]);

  // Set starter code when language or problem changes
  useEffect(() => {
    const currentLanguages = getCurrentLanguages();
    if (currentLanguages[selectedLanguage as keyof typeof currentLanguages]) {
      setCode(currentLanguages[selectedLanguage as keyof typeof currentLanguages].starterCode);
    }
  }, [selectedLanguage, selectedProblem, getCurrentLanguages]);

  // Initialize with Python starter code
  useEffect(() => {
    if (!code) {
      const currentLanguages = getCurrentLanguages();
      if (currentLanguages.python) {
        setCode(currentLanguages.python.starterCode);
      }
    }
  }, [code, getCurrentLanguages]);

  const handleRunCode = useCallback(async () => {
    if (!code.trim()) {
      alert('Please enter some code!');
      return;
    }

    setIsRunning(true);
    setShowResults(false);

    try {
      const problem = PROBLEMS[selectedProblem];
      // Use AI code checking instead of Judge0
      const response = await fetch('/api/code/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          problemDescription: problem.description,
          testCases: problem.testCases
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'AI code checking failed');
      }
      
      setResults(result.result); // Use result.result to get the actual AI analysis data
      setShowResults(true);
    } catch (error) {
      console.error('Error running code:', error);
      setResults({
        success: false,
        isCorrect: false,
        score: 0,
        feedback: error instanceof Error ? error.message : 'Unknown error occurred',
        detailedAnalysis: {
          syntax: { isValid: false, issues: [] },
          logic: { isCorrect: false, issues: [], suggestions: [] },
          efficiency: { timeComplexity: '', spaceComplexity: '', rating: 0, improvements: [] },
          testCases: { passed: 0, total: 0, results: [] }
        },
        hints: [],
        learningPoints: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      setShowResults(true);
    } finally {
      setIsRunning(false);
    }
  }, [code, selectedLanguage, selectedProblem]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
    }
  }, [handleRunCode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentProblem = PROBLEMS[selectedProblem];

  return (
    <div className={`${styles.challengersContainer} ${styles[theme]}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>🚀 Code Challengers</h1>
          <p className={styles.subtitle}>Master algorithmic challenges with our AI-powered platform</p>
        </div>
        
        {/* Problem Selector */}
        <div className={styles.problemSelector}>
          <label htmlFor="problemSelect">Choose Challenge:</label>
          <select 
            id="problemSelect"
            value={selectedProblem} 
            onChange={(e) => setSelectedProblem(e.target.value)}
            className={styles.problemSelect}
          >
            {Object.entries(PROBLEMS).map(([key, problem]) => (
              <option key={key} value={key}>
                [{problem.difficulty}] {problem.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        
        {/* Problem Panel */}
        <div className={styles.problemPanel}>
          <div className={styles.problemHeader}>
            <div className={styles.problemTitle}>
              <h2>{currentProblem.title}</h2>
              <span className={`${styles.difficulty} ${styles[currentProblem.difficulty.toLowerCase()]}`}>
                {currentProblem.difficulty}
              </span>
            </div>
          </div>

          <div className={styles.problemContent}>
            {/* Description */}
            <section className={styles.section}>
              <h3>📋 Problem Description</h3>
              <p className={styles.description}>{currentProblem.description}</p>
            </section>

            {/* Examples */}
            <section className={styles.section}>
              <h3>💡 Examples</h3>
              {currentProblem.examples.map((example, index) => (
                <div key={index} className={styles.example}>
                  <div className={styles.exampleHeader}>Example {index + 1}</div>
                  <div className={styles.exampleContent}>
                    <div className={styles.inputOutput}>
                      <strong>Input:</strong> <code>{example.input}</code>
                    </div>
                    <div className={styles.inputOutput}>
                      <strong>Output:</strong> <code>{example.output}</code>
                    </div>
                    {example.explanation && (
                      <div className={styles.explanation}>
                        <strong>Explanation:</strong> {example.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>

            {/* Constraints */}
            <section className={styles.section}>
              <h3>⚡ Constraints</h3>
              <ul className={styles.constraints}>
                {currentProblem.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className={styles.editorPanel}>
          
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={styles.languageSelect}
              >
                {Object.entries(getCurrentLanguages()).map(([key, lang]) => (
                  <option key={key} value={key}>
                    {lang.icon} {lang.name}
                  </option>
                ))}
              </select>
              
              <div className={styles.fontControls}>
                <button 
                  onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                  className={styles.fontBtn}
                  title="Decrease font size"
                >
                  A-
                </button>
                <span className={styles.fontSize}>{fontSize}px</span>
                <button 
                  onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                  className={styles.fontBtn}
                  title="Increase font size"
                >
                  A+
                </button>
              </div>

              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={styles.themeBtn}
                title="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>

            <div className={styles.toolbarRight}>
              <button 
                onClick={handleRunCode} 
                disabled={isRunning}
                className={`${styles.runBtn} ${isRunning ? styles.running : ''}`}
              >
                {isRunning ? (
                  <>
                    <span className={styles.spinner}></span>
                    Running...
                  </>
                ) : (
                  <>
                    ▶️ Run Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className={styles.editorContainer}>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={styles.codeEditor}
              style={{ fontSize: `${fontSize}px` }}
              placeholder={`Write your ${getCurrentLanguages()[selectedLanguage as keyof ReturnType<typeof getCurrentLanguages>]?.name || 'solution'} here...`}
              spellCheck={false}
            />
          </div>

          {/* Keyboard Shortcuts */}
          <div className={styles.shortcuts}>
            <span>💡 Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run code</span>
          </div>

          {/* Results Panel */}
          {showResults && results && (
            <div className={styles.resultsPanel}>
              <div className={styles.resultsHeader}>
                <h3>🧪 Test Results</h3>
                <span className={`${styles.overallStatus} ${results.success ? styles.success : styles.failure}`}>
                  {results.overallStatus}
                </span>
              </div>

              {results.error ? (
                <div className={styles.error}>
                  <strong>Error:</strong> {results.error}
                </div>
              ) : (
                <div className={styles.testResults}>
                  {/* AI Analysis Summary */}
                  <div className={styles.aiSummary}>
                    <h3>AI Analysis Summary</h3>
                    <div className={styles.summaryGrid}>
                      <div><strong>Score:</strong> {results.score}/100</div>
                      <div><strong>Status:</strong> {results.isCorrect ? 'Correct Solution' : 'Needs Improvement'}</div>
                    </div>
                    <div className={styles.feedback}>
                      <strong>Overall Feedback:</strong> {results.feedback}
                    </div>
                  </div>

                  {/* Detailed Analysis Sections */}
                  {results.detailedAnalysis && (
                    <>
                      {/* Syntax Analysis */}
                      {results.detailedAnalysis.syntax && (
                        <div className={styles.analysisSection}>
                          <h4>🔍 Syntax Analysis</h4>
                          <div><strong>Valid:</strong> {results.detailedAnalysis.syntax.isValid ? 'Yes' : 'No'}</div>
                          {results.detailedAnalysis.syntax.issues.length > 0 && (
                            <div>
                              <strong>Issues:</strong>
                              <ul>
                                {results.detailedAnalysis.syntax.issues.map((issue, index) => (
                                  <li key={index}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Logic Analysis */}
                      {results.detailedAnalysis.logic && (
                        <div className={styles.analysisSection}>
                          <h4>🧠 Logic Analysis</h4>
                          <div><strong>Correct:</strong> {results.detailedAnalysis.logic.isCorrect ? 'Yes' : 'No'}</div>
                          
                          {results.detailedAnalysis.logic.issues.length > 0 && (
                            <div>
                              <strong>Issues Found:</strong>
                              <ul>
                                {results.detailedAnalysis.logic.issues.map((issue, index) => (
                                  <li key={index}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {results.detailedAnalysis.logic.suggestions.length > 0 && (
                            <div>
                              <strong>Suggestions:</strong>
                              <ul>
                                {results.detailedAnalysis.logic.suggestions.map((suggestion, index) => (
                                  <li key={index}>{suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Test Cases */}
                  {results.detailedAnalysis?.testCases?.results && 
                    results.detailedAnalysis.testCases.results.map((result, index) => (
                      <div key={index} className={`${styles.testCase} ${result.passed ? styles.passed : styles.failed}`}>
                        <div className={styles.testCaseHeader}>
                          <span className={styles.testNumber}>Test Case {index + 1}</span>
                          <span className={`${styles.status} ${result.passed ? styles.passed : styles.failed}`}>
                            {result.passed ? '✅ Passed' : '❌ Failed'}
                          </span>
                        </div>
                        
                        <div className={styles.testDetails}>
                          <div className={styles.testDetail}>
                            <strong>Input:</strong> <code>{result.input}</code>
                          </div>
                          <div className={styles.testDetail}>
                            <strong>Expected:</strong> <code>{result.expectedOutput}</code>
                          </div>
                          <div className={styles.testDetail}>
                            <strong>Actual:</strong> <code>{result.actualOutput}</code>
                          </div>
                          
                          {result.explanation && (
                            <div className={styles.testDetail}>
                              <strong>Explanation:</strong> {result.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  }

                  {/* Hints */}
                  {results.hints && results.hints.length > 0 && (
                    <div className={styles.hintsSection}>
                      <h4>💡 Hints</h4>
                      <ul>
                        {results.hints.map((hint, index) => (
                          <li key={index}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Learning Points */}
                  {results.learningPoints && results.learningPoints.length > 0 && (
                    <div className={styles.learningSection}>
                      <h4>📚 Learning Points</h4>
                      <ul>
                        {results.learningPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Efficiency Analysis */}
                  {results.detailedAnalysis?.efficiency && (
                    <div className={styles.efficiencySection}>
                      <h4>⚡ Efficiency Analysis</h4>
                      <div className={styles.efficiencyGrid}>
                        <div><strong>Time Complexity:</strong> {results.detailedAnalysis.efficiency.timeComplexity}</div>
                        <div><strong>Space Complexity:</strong> {results.detailedAnalysis.efficiency.spaceComplexity}</div>
                        <div><strong>Rating:</strong> {results.detailedAnalysis.efficiency.rating}/5</div>
                      </div>
                      {results.detailedAnalysis.efficiency.improvements.length > 0 && (
                        <div>
                          <strong>Optimization Suggestions:</strong>
                          <ul>
                            {results.detailedAnalysis.efficiency.improvements.map((improvement, index) => (
                              <li key={index}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengersPage;
