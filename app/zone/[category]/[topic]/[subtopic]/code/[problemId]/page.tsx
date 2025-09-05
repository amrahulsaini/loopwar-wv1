"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  XCircle,
  Database,
  RotateCcw
} from 'lucide-react';
import Logo from '../../../../../../components/Logo';
import LoadingSpinner from '../../../../../../components/LoadingSpinner';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  solved: boolean;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export default function CodeProblemPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{testCase: number, input: string, expected: string, actual: string, passed: boolean, isHidden: boolean}[]>([]);
  const [allPassed, setAllPassed] = useState(false);

  const category = params.category as string;
  const topic = params.topic as string;
  const subtopic = params.subtopic as string;
  const sortOrder = params.problemId as string;

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch('/api/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUsername(userData.username);
        } else {
          router.push('/login');
          return;
        }

        // Fetch problem by sortOrder within the subtopic
        const problemResponse = await fetch(`/api/admin/problems?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}&subtopic=${encodeURIComponent(subtopic)}&sortOrder=${encodeURIComponent(sortOrder)}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (problemResponse.ok) {
          const problemData = await problemResponse.json();
          if (problemData.success) {
            setProblem(problemData.problem);
            // Generate sample test cases
            generateTestCases();
            // Set initial code template
            setCode(`// Write your solution for: ${problemData.problem.title}
// ${problemData.problem.description}

function solution() {
    // Your code here

}`);
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [category, topic, subtopic, sortOrder, router]);

  const generateTestCases = () => {
    // This is a placeholder - in real implementation, you'd fetch from database
    const sampleTestCases: TestCase[] = [
      {
        input: "Sample Input 1",
        expectedOutput: "Sample Output 1",
        isHidden: false
      },
      {
        input: "Sample Input 2",
        expectedOutput: "Sample Output 2",
        isHidden: false
      },
      {
        input: "Hidden Test Case",
        expectedOutput: "Hidden Output",
        isHidden: true
      }
    ];

    setTestCases(sampleTestCases);
  };

  const runCode = async () => {
    setIsRunning(true);
    setResults([]);

    // Simulate code execution (in real implementation, this would call a code execution service)
    setTimeout(() => {
      const mockResults = testCases.map((testCase, index) => ({
        testCase: index + 1,
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: testCase.isHidden ? "Hidden" : "Mock output",
        passed: Math.random() > 0.5, // Random for demo
        isHidden: testCase.isHidden
      }));

      setResults(mockResults);
      setAllPassed(mockResults.every(r => r.passed));
      setIsRunning(false);
    }, 2000);
  };

  const resetCode = () => {
    setCode(`// Write your solution for: ${problem?.title}
// ${problem?.description}

function solution() {
    // Your code here

}`);
    setResults([]);
    setAllPassed(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#22c55e';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Database size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Problem Not Found</h2>
          <p className="text-gray-600 mb-4">The requested problem could not be found.</p>
          <Link href={`/zone/${category}/${topic}/${subtopic}`} className="text-blue-600 hover:underline">
            ← Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="main-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <Link href={`/zone/${category}/${topic}/${subtopic}`} className="logo-link">
                <Logo />
              </Link>
            </div>

            <div className="header-center">
              <div className="breadcrumb">
                <Link href="/zone" className="breadcrumb-link">Zone</Link>
                <span className="breadcrumb-separator">→</span>
                <span className="breadcrumb-link">{categoryDisplay}</span>
                <span className="breadcrumb-separator">→</span>
                <span className="breadcrumb-link">{topicDisplay}</span>
                <span className="breadcrumb-separator">→</span>
                <Link href={`/zone/${category}/${topic}/${subtopic}`} className="breadcrumb-link">
                  {subtopicDisplay}
                </Link>
                <span className="breadcrumb-separator">→</span>
                <span className="breadcrumb-current">Code</span>
              </div>
            </div>

            <div className="header-right">
              <Link href={`/zone/${category}/${topic}/${subtopic}`} className="header-back-btn" title="Back to Problems">
                <ArrowLeft size={20} />
              </Link>
              <div className="user-info">
                <span className="username">@{username}</span>
                <button
                  className="profile-btn"
                  onClick={() => router.push(`/profiles/${username}`)}
                  aria-label="View Profile"
                  title={`Go to ${username}'s profile`}
                >
                  <div className="profile-avatar">
                    {username.charAt(0).toUpperCase()}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="code-main">
        <div className="container">
          <div className="code-layout">
            {/* Problem Description */}
            <div className="problem-panel">
              <div className="problem-header">
                <div
                  className="problem-difficulty"
                  style={{ color: getDifficultyColor(problem.difficulty) }}
                >
                  {problem.difficulty}
                </div>
                <h1 className="problem-title">{problem.title}</h1>
                <p className="problem-description">{problem.description}</p>
              </div>

              <div className="test-cases">
                <h3>Test Cases</h3>
                {testCases.filter(tc => !tc.isHidden).map((testCase, index) => (
                  <div key={index} className="test-case">
                    <div className="test-input">
                      <strong>Input:</strong> {testCase.input}
                    </div>
                    <div className="test-output">
                      <strong>Expected Output:</strong> {testCase.expectedOutput}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Editor */}
            <div className="editor-panel">
              <div className="editor-header">
                <h3>Solution</h3>
                <div className="editor-actions">
                  <button className="reset-btn" onClick={resetCode}>
                    <RotateCcw size={16} />
                    Reset
                  </button>
                  <button
                    className="run-btn"
                    onClick={runCode}
                    disabled={isRunning}
                  >
                    <Play size={16} />
                    {isRunning ? 'Running...' : 'Run Code'}
                  </button>
                </div>
              </div>

              <textarea
                className="code-editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your solution here..."
              />

              {/* Results */}
              {results.length > 0 && (
                <div className="results-section">
                  <h4>Test Results</h4>
                  <div className="results-list">
                    {results.map((result, index) => (
                      <div key={index} className={`result-item ${result.passed ? 'passed' : 'failed'}`}>
                        <div className="result-header">
                          <span>Test Case {result.testCase}</span>
                          {result.passed ? (
                            <CheckCircle2 size={16} className="pass-icon" />
                          ) : (
                            <XCircle size={16} className="fail-icon" />
                          )}
                        </div>
                        {!result.isHidden && (
                          <div className="result-details">
                            <div>Input: {result.input}</div>
                            <div>Expected: {result.expected}</div>
                            <div>Actual: {result.actual}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {allPassed && (
                    <div className="success-message">
                      <CheckCircle2 size={20} />
                      <span>All tests passed! Great job! 🎉</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
