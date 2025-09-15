"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  ChevronRight,
  Clock,
  Target,
  Lightbulb,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Zap
} from 'lucide-react';
import Logo from '../../../../../../components/Logo';
import LoadingSpinner from '../../../../../../components/LoadingSpinner';
import judge0Service from '../../../../../../../lib/judge0-service';
import styles from './CodeChallenge.module.css';

interface TestCase {
  input: string;
  expected: string;
  explanation?: string;
}

interface ProblemData {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  constraints?: string;
  examples?: string;
  testCases: TestCase[];
  hints?: string[];
  timeComplexity?: string;
  spaceComplexity?: string;
  category_name: string;
  topic_name: string;
  subtopic_name: string;
  is_ai_generated?: boolean;
  needs_generation?: boolean;
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

interface UserData {
  username: string;
  authenticated: boolean;
}

const languageOptions = [
  { id: 'javascript', name: 'JavaScript', fileExtension: 'js' },
  { id: 'python', name: 'Python', fileExtension: 'py' },
  { id: 'java', name: 'Java', fileExtension: 'java' },
  { id: 'cpp', name: 'C++', fileExtension: 'cpp' },
  { id: 'c', name: 'C', fileExtension: 'c' },
  { id: 'csharp', name: 'C#', fileExtension: 'cs' },
  { id: 'go', name: 'Go', fileExtension: 'go' },
  { id: 'rust', name: 'Rust', fileExtension: 'rs' },
  { id: 'php', name: 'PHP', fileExtension: 'php' },
  { id: 'ruby', name: 'Ruby', fileExtension: 'rb' }
];

const languageBoilerplates: Record<string, string> = {
  javascript: `// Solve the problem here
function solution() {
    // Your code here
    
}

// Test your solution
console.log(solution());`,
  python: `# Solve the problem here
def solution():
    # Your code here
    pass

# Test your solution
print(solution())`,
  java: `public class Solution {
    public static void main(String[] args) {
        Solution sol = new Solution();
        // Test your solution
        System.out.println(sol.solution());
    }
    
    public String solution() {
        // Your code here
        return "";
    }
}`,
  cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    string solution() {
        // Your code here
        return "";
    }
};

int main() {
    Solution sol;
    cout << sol.solution() << endl;
    return 0;
}`,
  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Your code here
    
    return 0;
}`,
  csharp: `using System;

public class Solution {
    public static void Main(string[] args) {
        Solution sol = new Solution();
        // Test your solution
        Console.WriteLine(sol.SolutionMethod());
    }
    
    public string SolutionMethod() {
        // Your code here
        return "";
    }
}`,
  go: `package main

import "fmt"

func solution() string {
    // Your code here
    return ""
}

func main() {
    fmt.Println(solution())
}`,
  rust: `fn main() {
    println!("{}", solution());
}

fn solution() -> String {
    // Your code here
    String::new()
}`,
  php: `<?php
function solution() {
    // Your code here
    return "";
}

// Test your solution
echo solution();
?>`,
  ruby: `def solution
    # Your code here
    ""
end

# Test your solution
puts solution`
};

export default function CodeChallengePage() {
  const params = useParams();
  const category = params.category as string;
  const topic = params.topic as string;
  const subtopic = params.subtopic as string;
  const sortOrder = params.sortOrder as string;

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'constraints' | 'examples' | 'hints'>('description');
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const [generatingProblemTitle, setGeneratingProblemTitle] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [hasError, setHasError] = useState(false);

  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Error boundary function
  const handleError = useCallback((error: Error, errorInfo?: string) => {
    console.error('Component error:', error, errorInfo);
    setHasError(true);
    setIsLoading(false);
    setIsGeneratingProblem(false);
    setIsRegenerating(false);
  }, []);

  // Reset error state
  const resetError = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    // Retry initialization
    checkUserSession();
    fetchOrGenerateProblem();
  }, []);

  // Format display names for breadcrumb
  const formatDisplayName = (urlName: string) => {
    return urlName
      .replace(/-/g, ' ')
      .replace(/and/g, '&')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const categoryDisplay = formatDisplayName(category);
  const topicDisplay = formatDisplayName(topic);
  const subtopicDisplay = formatDisplayName(subtopic);

  // Check user authentication
  const checkUserSession = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/user', {
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const userData = await response.json();
        setUser({
          username: userData.username,
          authenticated: userData.authenticated
        });
      } else {
        console.warn('User session check failed, using guest mode');
        setUser({
          username: 'Guest',
          authenticated: false
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('User session check timed out, using guest mode');
      } else {
        console.error('Error checking user session:', error);
      }
      setUser({
        username: 'Guest',
        authenticated: false
      });
    }
  }, []);

  // Fetch or generate problem data
  const fetchOrGenerateProblem = useCallback(async () => {
    try {
      // First, try to fetch existing code problem
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`/api/code-problems/by-location?category=${category}&topic=${topic}&subtopic=${subtopic}&sortOrder=${sortOrder}`, {
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const problemData = await response.json();
        
        // Check if this is a base problem that needs AI generation
        if (problemData.needs_generation) {
          setIsGeneratingProblem(true);
          setGeneratingProblemTitle(problemData.title);
          
          // Generate AI-enhanced code problem based on existing problem data
          const generateResponse = await fetch('/api/code-problems/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              category,
              topic,
              subtopic,
              sortOrder: parseInt(sortOrder),
              baseProblem: {
                title: problemData.title,
                description: problemData.description,
                difficulty: problemData.difficulty
              }
            }),
          });

          if (generateResponse.ok) {
            const generatedProblem = await generateResponse.json();
            setProblem(generatedProblem);
          } else {
            // Use the base problem data with minimal enhancements
            setProblem({
              ...problemData,
              constraints: 'Standard algorithmic constraints apply.',
              examples: 'Examples will be provided based on the problem context.',
              testCases: [
                { input: '', expected: '', explanation: 'Test case will be generated' }
              ],
              hints: [`Think about the ${problemData.subtopic_name.toLowerCase()} approach`],
              timeComplexity: 'O(n)',
              spaceComplexity: 'O(1)'
            });
          }
        } else {
          // Use existing complete problem data
          setProblem(problemData);
        }
        setIsLoading(false);
        return;
      }

      // If no problem found at all, create a fallback
      setProblem({
        id: parseInt(sortOrder),
        title: `${subtopicDisplay} Challenge #${sortOrder}`,
        description: `Solve this ${subtopicDisplay.toLowerCase()} problem step by step.`,
        difficulty: 'Medium' as const,
        constraints: 'Standard constraints apply',
        examples: 'Examples will be provided based on the problem context',
        testCases: [
          { input: '', expected: '', explanation: 'Test case will be generated' }
        ],
        hints: [`Think about the ${subtopicDisplay.toLowerCase()} approach`],
        category_name: categoryDisplay,
        topic_name: topicDisplay,
        subtopic_name: subtopicDisplay
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Problem fetch timed out, using fallback');
      } else {
        console.error('Error fetching/generating problem:', error);
      }
      // Create fallback problem
      setProblem({
        id: parseInt(sortOrder),
        title: `${subtopicDisplay} Challenge #${sortOrder}`,
        description: `Solve this ${subtopicDisplay.toLowerCase()} problem step by step.`,
        difficulty: 'Medium' as const,
        constraints: 'Standard constraints apply',
        examples: 'Examples will be provided based on the problem context',
        testCases: [
          { input: '', expected: '', explanation: 'Test case will be generated' }
        ],
        hints: [`Think about the ${subtopicDisplay.toLowerCase()} approach`],
        category_name: categoryDisplay,
        topic_name: topicDisplay,
        subtopic_name: subtopicDisplay
      });
    } finally {
      setIsGeneratingProblem(false);
      setIsLoading(false);
    }
  }, [category, topic, subtopic, sortOrder, categoryDisplay, topicDisplay, subtopicDisplay]);

  // Initialize component
  useEffect(() => {
    let mounted = true;
    
    const initializeComponent = async () => {
      try {
        await Promise.all([
          checkUserSession(),
          fetchOrGenerateProblem()
        ]);
      } catch (error) {
        console.error('Component initialization error:', error);
        if (mounted) {
          handleError(error instanceof Error ? error : new Error('Unknown initialization error'));
        }
      }
    };

    initializeComponent();
    
    return () => {
      mounted = false;
    };
  }, [checkUserSession, fetchOrGenerateProblem, handleError]);

  // Update code when language changes
  useEffect(() => {
    setCode(languageBoilerplates[selectedLanguage] || '// Start coding here...');
  }, [selectedLanguage]);

  // Handle code execution
  const runCode = async () => {
    if (!problem || !code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setIsRunning(true);
    setExecutionResult(null);

    try {
      const result = await judge0Service.executeWithTestCases(
        code,
        selectedLanguage,
        problem.testCases
      );

      setExecutionResult(result);
      
      // Save submission to database
      if (user?.authenticated) {
        await fetch('/api/code-submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            problemId: problem.id,
            code,
            language: selectedLanguage,
            result,
            category,
            topic,
            subtopic,
            sortOrder: parseInt(sortOrder)
          }),
        });
      }
    } catch (error) {
      console.error('Error running code:', error);
      setExecutionResult({
        success: false,
        results: [],
        overallStatus: 'Error',
        error: 'Failed to execute code. Please try again.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Handle code reset
  const resetCode = () => {
    setCode(languageBoilerplates[selectedLanguage] || '// Start coding here...');
    setExecutionResult(null);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#22c55e';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Regenerate problem with AI
  const regenerateProblem = async () => {
    if (!problem) return;
    
    setIsRegenerating(true);
    try {
      // Delete existing code problem first
      await fetch(`/api/code-problems/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          topic,
          subtopic,
          sortOrder: parseInt(sortOrder)
        }),
      });

      // Generate new problem
      const generateResponse = await fetch('/api/code-problems/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          topic,
          subtopic,
          sortOrder: parseInt(sortOrder),
          baseProblem: {
            title: problem.title.replace(/Challenge #\d+/, `Challenge #${sortOrder}`),
            description: `Generate a new coding challenge for ${subtopic.replace(/-/g, ' ')} topic.`,
            difficulty: problem.difficulty
          }
        }),
      });

      if (generateResponse.ok) {
        const newProblem = await generateResponse.json();
        setProblem(newProblem);
        setExecutionResult(null);
        resetCode();
      } else {
        alert('Failed to regenerate problem. Please try again.');
      }
    } catch (error) {
      console.error('Error regenerating problem:', error);
      alert('Failed to regenerate problem. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Error UI
  if (hasError) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.errorContainer}>
          <XCircle size={48} color="#ef4444" />
          <h2>Something went wrong</h2>
          <p>There was an error loading the code challenge page.</p>
          <div className={styles.errorActions}>
            <button onClick={resetError} className={styles.retryButton}>
              <RotateCcw size={16} />
              Try Again
            </button>
            <Link href={`/zone/${category}/${topic}/${subtopic}`} className={styles.backButton}>
              <ArrowLeft size={16} />
              Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
        <p>Loading code challenge...</p>
        {isGeneratingProblem && (
          <div className={styles.generatingMessage}>
            <Zap className={styles.generatingIcon} />
            <span>Converting &quot;{generatingProblemTitle || 'problem'}&quot; into an AI-powered coding challenge...</span>
          </div>
        )}
      </div>
    );
  }

  if (!problem) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>
          <AlertCircle size={48} />
        </div>
        <h1>Problem Not Found</h1>
        <p>The requested coding problem could not be loaded.</p>
        <Link href={`/zone/${category}/${topic}/${subtopic}`} className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Problems
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href={`/zone/${category}/${topic}/${subtopic}`} className={styles.backButton}>
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className={styles.breadcrumb}>
            <span>{categoryDisplay}</span>
            <ChevronRight size={14} />
            <span>{topicDisplay}</span>
            <ChevronRight size={14} />
            <span>{subtopicDisplay}</span>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbActive}>Code #{sortOrder}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Left Panel - Problem Description */}
        <div className={styles.leftPanel}>
          <div className={styles.problemHeader}>
            <div className={styles.problemTitleRow}>
              <h1 className={styles.problemTitle}>{problem.title}</h1>
              <div className={styles.problemActions}>
                <div 
                  className={styles.difficultyBadge}
                  style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}
                >
                  {problem.difficulty}
                </div>
                {problem.is_ai_generated && (
                  <button
                    className={styles.regenerateButton}
                    onClick={regenerateProblem}
                    disabled={isRegenerating}
                    title="Generate another version of this problem"
                  >
                    <RotateCcw size={14} />
                    {isRegenerating ? 'Generating...' : 'Generate Another'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={styles.tabNav}>
            <button 
              className={`${styles.tab} ${activeTab === 'description' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'constraints' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('constraints')}
            >
              Constraints
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'examples' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('examples')}
            >
              Examples
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'hints' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('hints')}
            >
              <Lightbulb size={14} />
              Hints
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <div className={styles.description}>
                <p>{problem.description}</p>
              </div>
            )}
            
            {activeTab === 'constraints' && (
              <div className={styles.constraints}>
                <h3>Constraints</h3>
                <p>{problem.constraints || 'Standard algorithmic constraints apply.'}</p>
                {problem.timeComplexity && (
                  <div className={styles.complexity}>
                    <strong>Time Complexity:</strong> {problem.timeComplexity}
                  </div>
                )}
                {problem.spaceComplexity && (
                  <div className={styles.complexity}>
                    <strong>Space Complexity:</strong> {problem.spaceComplexity}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'examples' && (
              <div className={styles.examples}>
                <h3>Examples</h3>
                {problem.testCases.map((testCase, index) => (
                  <div key={index} className={styles.exampleCard}>
                    <h4>Example {index + 1}</h4>
                    <div className={styles.exampleInput}>
                      <strong>Input:</strong>
                      <pre>{testCase.input || 'No input'}</pre>
                    </div>
                    <div className={styles.exampleOutput}>
                      <strong>Output:</strong>
                      <pre>{testCase.expected}</pre>
                    </div>
                    {testCase.explanation && (
                      <div className={styles.exampleExplanation}>
                        <strong>Explanation:</strong>
                        <p>{testCase.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'hints' && (
              <div className={styles.hints}>
                <h3>Hints</h3>
                {problem.hints && problem.hints.length > 0 ? (
                  <div className={styles.hintsList}>
                    {problem.hints.map((hint, index) => (
                      <div key={index} className={styles.hintItem}>
                        <div className={styles.hintNumber}>{index + 1}</div>
                        <div className={styles.hintText}>{hint}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No hints available for this problem.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className={styles.rightPanel}>
          {/* Code Editor Header */}
          <div className={styles.editorHeader}>
            <div className={styles.editorHeaderLeft}>
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={styles.languageSelect}
              >
                {languageOptions.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.editorHeaderRight}>
              <button 
                onClick={resetCode}
                className={styles.iconButton}
                title="Reset Code"
              >
                <RotateCcw size={16} />
              </button>
              <button 
                onClick={runCode}
                disabled={isRunning}
                className={styles.runButton}
              >
                {isRunning ? (
                  <>
                    <div className={styles.spinner}></div>
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Run Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className={styles.codeEditor}>
            <textarea
              ref={codeTextareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={styles.codeTextarea}
              placeholder="Write your solution here..."
              spellCheck={false}
            />
          </div>

          {/* Results Panel */}
          {executionResult && (
            <div className={styles.resultsPanel}>
              <div className={styles.resultsHeader}>
                <h3>Test Results</h3>
                <div className={`${styles.overallStatus} ${executionResult.success ? styles.statusSuccess : styles.statusError}`}>
                  {executionResult.success ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  {executionResult.overallStatus}
                </div>
              </div>
              
              <div className={styles.testCases}>
                {executionResult.results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`${styles.testCase} ${result.passed ? styles.testCasePassed : styles.testCaseFailed}`}
                  >
                    <div className={styles.testCaseHeader}>
                      <span>Test Case #{result.testCase}</span>
                      {result.passed ? (
                        <CheckCircle2 size={14} className={styles.testCaseIcon} />
                      ) : (
                        <XCircle size={14} className={styles.testCaseIcon} />
                      )}
                    </div>
                    
                    {result.error ? (
                      <div className={styles.testCaseError}>
                        <strong>Error:</strong>
                        <pre>{result.error}</pre>
                      </div>
                    ) : (
                      <>
                        <div className={styles.testCaseInput}>
                          <strong>Input:</strong>
                          <pre>{result.input || 'No input'}</pre>
                        </div>
                        <div className={styles.testCaseExpected}>
                          <strong>Expected:</strong>
                          <pre>{result.expected}</pre>
                        </div>
                        <div className={styles.testCaseActual}>
                          <strong>Your Output:</strong>
                          <pre>{result.actual}</pre>
                        </div>
                      </>
                    )}
                    
                    {result.executionTime && (
                      <div className={styles.testCaseStats}>
                        <Clock size={12} />
                        {result.executionTime}
                        {result.memory && (
                          <>
                            <Target size={12} />
                            {result.memory} KB
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}