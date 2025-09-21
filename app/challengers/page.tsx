'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './challengers.module.css';

interface TestCase {
  input: string;
  expected: string;
  explanation?: string;
}

interface AIProblem {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  topic: string;
  subtopic: string;
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
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  constraints: string;
  examples: string;
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
  hints: string[];
}

const ChallengersPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<ExecutionResult | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedProblem, setSelectedProblem] = useState<number | null>(null);
  const [problems, setProblems] = useState<AIProblem[]>([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState<boolean>(true);
  const [isGeneratingProblem, setIsGeneratingProblem] = useState<boolean>(false);

  // Load AI-generated problems from your backend
  const loadProblems = useCallback(async () => {
    try {
      setIsLoadingProblems(true);
      const response = await fetch('/api/code-problems/by-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'algorithms',
          topic: 'data-structures',
          subtopic: 'arrays'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProblems(data.problems || []);
        if (data.problems && data.problems.length > 0) {
          setSelectedProblem(data.problems[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading problems:', error);
    } finally {
      setIsLoadingProblems(false);
    }
  }, []);

  // Generate a new AI problem
  const generateNewProblem = useCallback(async () => {
    try {
      setIsGeneratingProblem(true);
      const response = await fetch('/api/code-problems/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'algorithms',
          topic: 'data-structures', 
          subtopic: 'arrays',
          sortOrder: problems.length + 1,
          baseProblem: null,
          isRegeneration: false
        }),
      });

      if (response.ok) {
        const newProblem = await response.json();
        setProblems(prev => [...prev, newProblem]);
        setSelectedProblem(newProblem.id);
      } else {
        alert('Failed to generate new problem. Please try again.');
      }
    } catch (error) {
      console.error('Error generating problem:', error);
      alert('Error generating problem. Please try again.');
    } finally {
      setIsGeneratingProblem(false);
    }
  }, [problems.length]);

  // Load problems on component mount
  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  // Get current problem 
  const currentProblem = selectedProblem ? problems.find(p => p.id === selectedProblem) : null;

  // Get available languages for current problem
  const getAvailableLanguages = useCallback(() => {
    if (!currentProblem) {
      return {
        python: { name: 'Python 3', icon: '🐍' },
        javascript: { name: 'JavaScript', icon: '🟨' }
      };
    }

    const langs: Record<string, { name: string; icon: string }> = {};
    if (currentProblem.functionTemplates.python) langs.python = { name: 'Python 3', icon: '🐍' };
    if (currentProblem.functionTemplates.javascript) langs.javascript = { name: 'JavaScript', icon: '🟨' };
    if (currentProblem.functionTemplates.java) langs.java = { name: 'Java', icon: '☕' };
    if (currentProblem.functionTemplates.cpp) langs.cpp = { name: 'C++', icon: '⚡' };
    if (currentProblem.functionTemplates.c) langs.c = { name: 'C', icon: '🔧' };
    if (currentProblem.functionTemplates.csharp) langs.csharp = { name: 'C#', icon: '🔷' };
    if (currentProblem.functionTemplates.go) langs.go = { name: 'Go', icon: '🐹' };
    if (currentProblem.functionTemplates.rust) langs.rust = { name: 'Rust', icon: '🦀' };
    if (currentProblem.functionTemplates.php) langs.php = { name: 'PHP', icon: '🐘' };
    if (currentProblem.functionTemplates.ruby) langs.ruby = { name: 'Ruby', icon: '💎' };

    return langs;
  }, [currentProblem]);

  // Set starter code when language or problem changes
  useEffect(() => {
    if (currentProblem && currentProblem.functionTemplates) {
      const template = currentProblem.functionTemplates[selectedLanguage as keyof typeof currentProblem.functionTemplates];
      if (template) {
        setCode(template);
      }
    }
  }, [selectedLanguage, currentProblem]);

  // Initialize with default starter code
  useEffect(() => {
    if (!code && currentProblem) {
      const template = currentProblem.functionTemplates.python || currentProblem.functionTemplates.javascript || '';
      if (template) {
        setCode(template);
      }
    }
  }, [code, currentProblem]);

  const handleRunCode = useCallback(async () => {
    if (!code.trim()) {
      alert('Please enter some code!');
      return;
    }

    if (!currentProblem) {
      alert('No problem selected!');
      return;
    }

    setIsRunning(true);
    setShowResults(false);

    try {
      // Validate test cases exist and are properly formatted
      const testCases = currentProblem.testCases || [];
      console.log('Test cases:', testCases);
      
      // Use AI code checking instead of Judge0
      const response = await fetch('/api/code/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          problemDescription: currentProblem.description || 'Solve this coding problem',
          testCases: testCases
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'AI code checking failed');
      }
      
      // Ensure result data exists before setting
      if (result.result) {
        setResults(result.result);
        setShowResults(true);
      } else {
        throw new Error('Invalid response from AI checker');
      }
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
  }, [code, selectedLanguage, currentProblem]);

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

  // Safety check to prevent client-side errors
  if (!currentProblem && !isLoadingProblems) {
    return (
      <div className={styles.challengersContainer}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1>No Problems Available</h1>
            <p>Generate a new problem to get started.</p>
            <button 
              onClick={generateNewProblem}
              disabled={isGeneratingProblem}
              className={styles.generateBtn}
            >
              {isGeneratingProblem ? 'Generating...' : '🎯 Generate New Problem'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingProblems) {
    return (
      <div className={styles.challengersContainer}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Loading Problems...</h1>
            <p>Please wait while we load your challenges.</p>
          </div>
        </div>
      </div>
    );
  }

  const availableLanguages = getAvailableLanguages();

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
            value={selectedProblem || ''} 
            onChange={(e) => setSelectedProblem(Number(e.target.value))}
            className={styles.problemSelect}
          >
            {problems.map((problem) => (
              <option key={problem.id} value={problem.id}>
                [{problem.difficulty}] {problem.title}
              </option>
            ))}
          </select>
          
          <button 
            onClick={generateNewProblem}
            disabled={isGeneratingProblem}
            className={styles.generateBtn}
          >
            {isGeneratingProblem ? '⏳ Generating...' : '🎯 Generate New Problem'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      {currentProblem && (
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
                <div className={styles.examples}>
                  <pre className={styles.exampleContent}>{currentProblem.examples}</pre>
                </div>
              </section>

              {/* Constraints */}
              <section className={styles.section}>
                <h3>⚡ Constraints</h3>
                <div className={styles.constraints}>
                  <pre className={styles.constraintContent}>{currentProblem.constraints}</pre>
                </div>
              </section>

              {/* Hints */}
              {currentProblem.hints && currentProblem.hints.length > 0 && (
                <section className={styles.section}>
                  <h3>💡 Hints</h3>
                  <ul className={styles.hintsList}>
                    {currentProblem.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </section>
              )}
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
                  {Object.entries(availableLanguages).map(([key, lang]) => (
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
                placeholder={`Write your ${availableLanguages[selectedLanguage]?.name || 'solution'} here...`}
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
                      Array.isArray(results.detailedAnalysis.testCases.results) &&
                      results.detailedAnalysis.testCases.results.length > 0 &&
                      results.detailedAnalysis.testCases.results.map((result, index) => {
                        // Safety check for each result object
                        if (!result || typeof result !== 'object') return null;
                        
                        return (
                          <div key={index} className={`${styles.testCase} ${result.passed ? styles.passed : styles.failed}`}>
                            <div className={styles.testCaseHeader}>
                              <span className={styles.testNumber}>Test Case {index + 1}</span>
                              <span className={`${styles.status} ${result.passed ? styles.passed : styles.failed}`}>
                                {result.passed ? '✅ Passed' : '❌ Failed'}
                              </span>
                            </div>
                            
                            <div className={styles.testDetails}>
                              <div className={styles.testDetail}>
                                <strong>Input:</strong> <code>{result.input || 'N/A'}</code>
                              </div>
                              <div className={styles.testDetail}>
                                <strong>Expected:</strong> <code>{result.expectedOutput || 'N/A'}</code>
                              </div>
                              <div className={styles.testDetail}>
                                <strong>Actual:</strong> <code>{result.actualOutput || 'N/A'}</code>
                              </div>
                              
                              {result.explanation && (
                                <div className={styles.testDetail}>
                                  <strong>Explanation:</strong> {result.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }).filter(Boolean)
                    }

                    {/* Hints */}
                    {results.hints && Array.isArray(results.hints) && results.hints.length > 0 && (
                      <div className={styles.hintsSection}>
                        <h4>💡 Hints</h4>
                        <ul>
                          {results.hints.map((hint, index) => (
                            <li key={index}>{hint || 'No hint available'}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Learning Points */}
                    {results.learningPoints && Array.isArray(results.learningPoints) && results.learningPoints.length > 0 && (
                      <div className={styles.learningSection}>
                        <h4>📚 Learning Points</h4>
                        <ul>
                          {results.learningPoints.map((point, index) => (
                            <li key={index}>{point || 'No learning point available'}</li>
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
      )}
    </div>
  );
};

export default ChallengersPage;
