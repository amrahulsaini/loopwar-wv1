"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
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
  Zap,
  FileText,
  Code,
  AlertTriangle,
  Info,
  CheckCircle,
  TestTube,
  FileCode,
  Brain,
  SeparatorHorizontal
} from 'lucide-react';
import Logo from '../../../../../../components/Logo';
import LoadingSpinner from '../../../../../../components/LoadingSpinner';
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
  user_id?: number;
  needs_generation?: boolean;
  functionTemplates?: {
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
  const [activeTab, setActiveTab] = useState<'description' | 'constraints' | 'testcases' | 'hints'>('description');
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const [generatingProblemTitle, setGeneratingProblemTitle] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Resizable panel state
  const [leftWidth, setLeftWidth] = useState('30%'); // Problem section (30%)
  const [rightWidth, setRightWidth] = useState('30%'); // AI section (30%)
  
  // Console state
  const [consoleExpanded, setConsoleExpanded] = useState(false);

  // Function to get the appropriate code template for a language
  const getCodeTemplate = useCallback((language: string): string => {
    // First try to use function template from the problem (if available)
    if (problem?.functionTemplates && problem.functionTemplates[language as keyof typeof problem.functionTemplates]) {
      return problem.functionTemplates[language as keyof typeof problem.functionTemplates];
    }
    
    // Fallback to hardcoded boilerplates
    return languageBoilerplates[language] || '// Start coding here...';
  }, [problem]);

  // Enhanced format content with better AI content parsing
  const formatContent = (content: string) => {
    if (!content) return null;

    // First, clean up any CSS class names that might have been generated as text
    const cleanContent = content
      // Remove CSS class references that appear as text
      .replace(/"format-[^"]*">/g, '')
      .replace(/format-[a-zA-Z]*">/g, '')
      .replace(/class="format-[^"]*"/g, '')
      .replace(/"format-[^"]*"/g, '')
      .replace(/format-\w+/g, '')
      // Remove any span or other tags with format classes
      .replace(/<[^>]*format-[^>]*>/g, '')
      .replace(/<\/[^>]*>/g, '')
      // Remove any escaped HTML that might appear
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // Remove unicode emojis
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .trim();

    // Split content into sections based on common AI patterns
    const sections = [];
    let currentSection = '';
    
    // Split by double newlines or major sentence breaks
    const parts = cleanContent.split(/\n\s*\n|\.\s*(?=[A-Z][a-z]+(?:\s|:))/);
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;
      
      // Check if this looks like a title or header (starts with caps, short)
      if (part.length < 100 && /^[A-Z][^.]*:?\s*$/.test(part) && !part.includes(' the ') && !part.includes(' a ')) {
        if (currentSection) {
          sections.push({ type: 'content', text: currentSection });
          currentSection = '';
        }
        sections.push({ type: 'header', text: part.replace(/:$/, '') });
      }
      // Check for bullet point content
      else if (part.includes('\n-') || part.includes('\n•') || part.includes('\n*') || /^\s*[-•*]\s/.test(part)) {
        if (currentSection) {
          sections.push({ type: 'content', text: currentSection });
          currentSection = '';
        }
        sections.push({ type: 'bullets', text: part });
      }
      // Check for numbered lists
      else if (/^\s*\d+\./.test(part) || part.includes('\n1.') || part.includes('\n2.')) {
        if (currentSection) {
          sections.push({ type: 'content', text: currentSection });
          currentSection = '';
        }
        sections.push({ type: 'numbered', text: part });
      }
      // Regular content
      else {
        currentSection += (currentSection ? ' ' : '') + part;
      }
    }
    
    // Add remaining content
    if (currentSection) {
      sections.push({ type: 'content', text: currentSection });
    }

    // Render the sections
    return sections.map((section, index) => {
      switch (section.type) {
        case 'header':
          return (
            <h4 key={index} className={styles.contentHeader}>
              <span dangerouslySetInnerHTML={{ __html: formatInlineText(section.text) }} />
            </h4>
          );
          
        case 'bullets':
          const bulletItems = section.text
            .split(/\n\s*[-•*]\s+/)
            .filter(item => item.trim())
            .slice(section.text.startsWith('-') || section.text.startsWith('•') || section.text.startsWith('*') ? 0 : 1);
          
          return (
            <div key={index} className={styles.bulletList}>
              {bulletItems.map((item, itemIndex) => (
                <div key={itemIndex} className={styles.bulletItem}>
                  <div className={styles.bulletPoint}>•</div>
                  <span dangerouslySetInnerHTML={{ __html: formatInlineText(item.trim()) }} />
                </div>
              ))}
            </div>
          );
          
        case 'numbered':
          const numberedItems = section.text
            .split(/\n\s*\d+\.\s*/)
            .filter(item => item.trim())
            .slice(1);
          
          return (
            <div key={index} className={styles.numberedList}>
              {numberedItems.map((item, itemIndex) => (
                <div key={itemIndex} className={styles.numberedItem}>
                  <div className={styles.numberPoint}>{itemIndex + 1}.</div>
                  <span dangerouslySetInnerHTML={{ __html: formatInlineText(item.trim()) }} />
                </div>
              ))}
            </div>
          );
          
        case 'content':
        default:
          return (
            <div key={index} className={styles.contentParagraph}>
              <span dangerouslySetInnerHTML={{ __html: formatInlineText(section.text) }} />
            </div>
          );
      }
    });
  };

  // Enhanced inline text formatting - using CSS classes instead of inline styles
  const formatInlineText = (text: string) => {
    return text
      // Bold text patterns - various formats
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="format-bold">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<strong class="format-bold">$1</strong>')
      .replace(/(?:^|\s)([A-Z][A-Z\s]{2,}?)(?=\s|$)/g, ' <strong class="format-bold">$1</strong>')
      
      // Important keywords and concepts
      .replace(/\b(Input|Output|Example|Note|Constraint|Algorithm|Time Complexity|Space Complexity|Return|Given|Find|Determine|Calculate|Implement)\b/g, '<strong class="format-keyword">$1</strong>')
      
      // Code snippets and technical terms
      .replace(/`([^`]+)`/g, '<code class="format-code">$1</code>')
      .replace(/(\[[\d,\s-]+\])/g, '<code class="format-array">$1</code>')
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*\([^)]*\))/g, '<code class="format-function">$1</code>')
      
      // Numbers and values
      .replace(/\b(\d+)\b/g, '<span class="format-number">$1</span>')
      
      // Quotes and strings
      .replace(/"([^"]+)"/g, '<span class="format-string">"$1"</span>')
      
      // Mathematical expressions
      .replace(/\b(O\([^)]+\))/g, '<code class="format-complexity">$1</code>');
  };

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      // First, try to fetch existing code problem with aggressive cache busting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const timestamp = Date.now();
      console.log('=== FETCHING PROBLEM DATA ===');
      console.log('URL params:', { category, topic, subtopic, sortOrder });
      
      const response = await fetch(`/api/code-problems/by-location?category=${category}&topic=${topic}&subtopic=${subtopic}&sortOrder=${sortOrder}&cache=${timestamp}`, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const problemData = await response.json();
        console.log('=== RECEIVED PROBLEM DATA ===');
        console.log('Problem ID:', problemData.id);
        console.log('Title:', problemData.title);
        console.log('Test Cases Count:', problemData.testCases?.length || 0);
        console.log('Test Cases:', problemData.testCases);
        console.log('Needs Generation:', problemData.needs_generation);
        console.log('Function Templates Keys:', problemData.function_templates ? Object.keys(problemData.function_templates) : 'None');
        console.log('=== END RECEIVED DATA ===');
        
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
            console.log('Generated problem received:', {
              id: generatedProblem.id,
              title: generatedProblem.title,
              testCasesCount: generatedProblem.testCases?.length || 0,
              testCases: generatedProblem.testCases,
              functionTemplatesKeys: generatedProblem.functionTemplates ? Object.keys(generatedProblem.functionTemplates) : 'None'
            });
            setProblem(generatedProblem);
            
            // Force a complete refetch after generation to ensure persistence
            setTimeout(async () => {
              try {
                console.log('Force refetching problem after generation...');
                const timestamp = Date.now();
                const verifyResponse = await fetch(`/api/code-problems/by-location?category=${category}&topic=${topic}&subtopic=${subtopic}&sortOrder=${sortOrder}&t=${timestamp}`, {
                  cache: 'no-store',
                  headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                  }
                });
                if (verifyResponse.ok) {
                  const verifiedProblem = await verifyResponse.json();
                  console.log('Verified problem after generation:', {
                    id: verifiedProblem.id,
                    title: verifiedProblem.title,
                    testCasesCount: verifiedProblem.testCases?.length || 0,
                    testCasesData: verifiedProblem.testCases,
                    hasTestCases: !verifiedProblem.needs_generation,
                    needsGeneration: verifiedProblem.needs_generation,
                    functionTemplatesKeys: verifiedProblem.functionTemplates ? Object.keys(verifiedProblem.functionTemplates) : 'None'
                  });
                  // Always update with the verified problem from database
                  setProblem(verifiedProblem);
                } else {
                  console.error('Verification fetch failed with status:', verifyResponse.status);
                }
              } catch (error) {
                console.error('Verification fetch failed:', error);
              }
            }, 2000); // Increased delay to 2 seconds
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
          console.log('Using existing problem data:', {
            id: problemData.id,
            title: problemData.title,
            testCasesCount: problemData.testCases?.length || 0,
            testCasesData: problemData.testCases
          });
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

  // Initialize code template when component mounts or language changes (only if code is empty)
  useEffect(() => {
    if (!code || code.trim() === '') {
      const template = getCodeTemplate(selectedLanguage);
      setCode(template);
    }
  }, [selectedLanguage, problem, code, getCodeTemplate]);

  // Handle code execution
  const runCode = async () => {
    if (!problem || !code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setIsRunning(true);
    setExecutionResult(null);

    try {
      // Use AI code checking instead of Judge0 execution
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

      setExecutionResult(result.result); // Use result.result to get the actual AI analysis data
      
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
        isCorrect: false,
        score: 0,
        feedback: 'Failed to execute code. Please try again.',
        detailedAnalysis: {
          syntax: { isValid: false, issues: [] },
          logic: { isCorrect: false, issues: [], suggestions: [] },
          efficiency: { timeComplexity: '', spaceComplexity: '', rating: 0, improvements: [] },
          testCases: { passed: 0, total: 0, results: [] }
        },
        hints: [],
        learningPoints: [],
        error: 'Failed to execute code. Please try again.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Handle code reset
  const resetCode = () => {
    setCode(getCodeTemplate(selectedLanguage));
    setExecutionResult(null);
  };

  // Initialize code template when component mounts or language changes
  useEffect(() => {
    if (!code || code.trim() === '') {
      const template = getCodeTemplate(selectedLanguage);
      setCode(template);
    }
  }, [selectedLanguage, problem, code, getCodeTemplate]);

  // Handle language switching for Monaco Editor
  useEffect(() => {
    // Check if current code matches any default template
    const allTemplates = Object.values(languageBoilerplates);
    const currentTemplate = getCodeTemplate(selectedLanguage);
    
    // If current code is a template or empty, update to new language template
    const isCurrentlyTemplate = allTemplates.some(template => 
      code.trim() === template.trim()
    ) || code.trim() === '' || code.trim() === '// Start coding here...';
    
    if (isCurrentlyTemplate) {
      setCode(currentTemplate);
    }
  }, [selectedLanguage, code, getCodeTemplate]); // Added missing dependencies

  // Resize handlers for panels
  const handleLeftResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startLeftWidth = parseFloat(leftWidth);

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newLeftWidth = Math.max(20, Math.min(50, startLeftWidth + deltaPercent));
      setLeftWidth(`${newLeftWidth}%`);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRightResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startRightWidth = parseFloat(rightWidth);

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = startX - e.clientX; // Reversed for right panel
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newRightWidth = Math.max(20, Math.min(50, startRightWidth + deltaPercent));
      setRightWidth(`${newRightWidth}%`);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
      // Generate new problem without deleting the previous one
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
          },
          // Flag to indicate this is a regeneration (save as new version)
          isRegeneration: true
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
        {/* Resizable 3-Panel Layout */}
        <div className={styles.resizableContainer}>
          {/* Left Panel - Problem Description */}
          <div 
            className={styles.problemPanel}
            style={{ width: leftWidth }}
          >
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

          {/* Problem Content Wrapper */}
          <div className={styles.problemContent}>
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
              className={`${styles.tab} ${activeTab === 'testcases' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('testcases')}
            >
              Test Cases
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
              <div className={styles.descriptionContainer}>
                {problem && problem.description ? (
                  <div className={styles.problemDescription}>
                    <div className={styles.descriptionSection}>
                      <h3 className={styles.sectionTitle}>
                        <FileText size={20} />
                        Description
                      </h3>
                      <div className={styles.descriptionContent}>
                        {formatContent(problem.description)}
                      </div>
                    </div>
                    
                    {/* Expected Complexity */}
                    {(problem.timeComplexity || problem.spaceComplexity) && (
                      <div className={styles.complexitySection}>
                        <h3 className={styles.sectionTitle}>
                          <Zap size={20} />
                          Expected Complexity
                        </h3>
                        <div className={styles.complexityGrid}>
                          {problem.timeComplexity && (
                            <div className={styles.complexityItem}>
                              <Clock size={16} />
                              <span>Time: <code>{problem.timeComplexity}</code></span>
                            </div>
                          )}
                          {problem.spaceComplexity && (
                            <div className={styles.complexityItem}>
                              <Target size={16} />
                              <span>Space: <code>{problem.spaceComplexity}</code></span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.loadingDescription}>
                    <p>Loading problem description...</p>
                  </div>
                )}
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
            
            {activeTab === 'testcases' && (
              <div className={styles.examples}>
                <div className={styles.testCasesHeader}>
                  <h3>
                    <TestTube size={20} />
                    Test Cases
                  </h3>
                </div>
                {problem && problem.testCases && problem.testCases.length > 0 ? (
                  <div className={styles.testCasesContainer}>
                    {problem.testCases.map((testCase, index) => (
                      <div key={index} className={styles.testCaseCard}>
                        <div className={styles.testCaseHeader}>
                          <h4>
                            <FileCode size={18} />
                            Test Case {index + 1}
                          </h4>
                        </div>
                        <div className={styles.testCaseContent}>
                          <div className={styles.testCaseInput}>
                            <div className={styles.testCaseLabel}>
                              <Code size={14} />
                              <strong>Input:</strong>
                            </div>
                            <pre className={styles.testCaseCode}>{testCase.input || 'No input provided'}</pre>
                          </div>
                          <div className={styles.testCaseOutput}>
                            <div className={styles.testCaseLabel}>
                              <CheckCircle size={14} />
                              <strong>Expected Output:</strong>
                            </div>
                            <pre className={styles.testCaseCode}>{testCase.expected || 'No expected output'}</pre>
                          </div>
                          {testCase.explanation && (
                            <div className={styles.testCaseExplanation}>
                              <div className={styles.testCaseLabel}>
                                <Info size={14} />
                                <strong>Explanation:</strong>
                              </div>
                              <p className={styles.testCaseExplanationText}>{testCase.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.testCasesEmpty}>
                    <div className={styles.emptyIconContainer}>
                      <TestTube size={48} className={styles.emptyIcon} />
                    </div>
                    <h4>No Test Cases Available</h4>
                    <p>Test cases are being generated or haven&apos;t been created yet.</p>
                    {problem?.is_ai_generated && (
                      <button
                        className={styles.regenerateTestCases}
                        onClick={regenerateProblem}
                        disabled={isRegenerating}
                      >
                        <Zap size={16} />
                        {isRegenerating ? 'Generating...' : 'Generate Test Cases'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'hints' && (
              <div className={styles.hints}>
                <h3>Hints</h3>
                {problem && problem.hints && problem.hints.length > 0 ? (
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
        </div>

        {/* First Resizer */}
        <div 
          className={styles.resizer}
          onMouseDown={(e) => handleLeftResize(e)}
          title="Drag to resize panel"
        >
          <SeparatorHorizontal size={14} />
        </div>

        {/* Middle Panel - Code Editor */}
        <div 
          className={styles.codePanel}
          style={{ width: `calc(100% - ${leftWidth} - ${rightWidth} - 20px)` }}
        >
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

          {/* Code Editor Content Wrapper */}
          <div className={styles.codeEditorArea}>
            {/* Monaco Editor with VS Code-like Interface */}
            <div className={styles.monacoEditorWrapper}>
              <Editor
                height="100%"
                language={selectedLanguage}
                value={code}
                onChange={(value) => {
                  setCode(value || '');
                }}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, Monaco, Consolas, Courier New, monospace',
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: 'off',
                  contextmenu: true,
                  selectOnLineNumbers: true,
                  lineNumbersMinChars: 3,
                  glyphMargin: false,
                  folding: true,
                  lineDecorationsWidth: 0,
                  lineHeight: 22,
                  renderLineHighlight: 'line',
                  cursorBlinking: 'blink',
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                  bracketPairColorization: {
                    enabled: true,
                  },
                  guides: {
                    bracketPairs: true,
                    indentation: true,
                  },
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: 'on',
                  quickSuggestions: true,
                  parameterHints: {
                    enabled: true,
                  },
                }}
                loading={<div className={styles.editorLoading}>Loading editor...</div>}
              />
            </div>
          </div>

          {/* Console Section */}
          <div className={styles.consoleSection}>
            <div 
              className={styles.consoleHeader}
              onClick={() => setConsoleExpanded(!consoleExpanded)}
            >
              <div className={styles.consoleTitle}>
                <span>Console</span>
                {executionResult && (
                  <span style={{ 
                    color: executionResult.isCorrect ? '#22c55e' : '#ef4444',
                    fontSize: '0.75rem'
                  }}>
                    {executionResult.detailedAnalysis?.testCases?.passed || 0}/
                    {executionResult.detailedAnalysis?.testCases?.total || 0} tests passed
                  </span>
                )}
              </div>
              <div className={`${styles.consoleToggle} ${consoleExpanded ? styles.expanded : ''}`}>
                <ChevronRight size={16} />
              </div>
            </div>
            
            <div className={`${styles.consoleContent} ${!consoleExpanded ? styles.consoleCollapsed : ''}`}>
              {executionResult ? (
                <div className={styles.consoleOutput}>
                  {/* Test Results */}
                  {executionResult.detailedAnalysis?.testCases?.results && executionResult.detailedAnalysis.testCases.results.map((result, index) => (
                    <div key={index} className={`${styles.testCaseResult} ${result.passed ? 'passed' : 'failed'}`}>
                      <div className={styles.testCaseHeader}>
                        <span>Test Case {index + 1}</span>
                        <div className={styles.testCaseStatus}>
                          {result.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {result.passed ? 'PASSED' : 'FAILED'}
                        </div>
                      </div>
                      <div>
                        <strong>Input:</strong> {result.input || 'N/A'}
                      </div>
                      <div>
                        <strong>Expected:</strong> {result.expectedOutput || 'N/A'}
                      </div>
                      <div>
                        <strong>Output:</strong> {result.actualOutput || 'N/A'}
                      </div>
                      {!result.passed && result.explanation && (
                        <div style={{ color: '#ef4444' }}>
                          <strong>Issue:</strong> {result.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Execution Info */}
                  <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(0, 122, 204, 0.1)', borderRadius: '4px' }}>
                    <div><strong>Score:</strong> {executionResult.score}/100</div>
                    <div><strong>Status:</strong> {executionResult.isCorrect ? 'Accepted' : 'Wrong Answer'}</div>
                    <div><strong>Tests Passed:</strong> {executionResult.detailedAnalysis?.testCases?.passed || 0}/{executionResult.detailedAnalysis?.testCases?.total || 0}</div>
                  </div>
                </div>
              ) : (
                <div className={styles.consoleOutput}>
                  <div style={{ color: '#858585', fontStyle: 'italic' }}>
                    Run your code to see test results and output here...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Second Resizer */}
        <div 
          className={styles.resizer}
          onMouseDown={(e) => handleRightResize(e)}
          title="Drag to resize panel"
        >
          <SeparatorHorizontal size={14} />
        </div>

        {/* Right Panel - AI Analysis */}
        <div 
          className={styles.aiPanel}
          style={{ width: rightWidth }}
        >
          {/* AI Analysis Content Wrapper */}
          <div className={styles.aiContent}>
            {/* AI Analysis Results Panel */}
            {executionResult ? (
            <div className={styles.resultsPanel}>
              <div className={styles.resultsHeader}>
                <h3>AI Code Analysis</h3>
                <div className={`${styles.overallStatus} ${executionResult.isCorrect ? styles.statusSuccess : styles.statusError}`}>
                  {executionResult.isCorrect ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  Score: {executionResult.score}/100 {executionResult.isCorrect ? '- Correct!' : '- Needs Improvement'}
                </div>
              </div>

              {/* Main Feedback */}
              <div className={styles.feedbackSection}>
                <h4>Overall Feedback</h4>
                <p>{executionResult.feedback}</p>
              </div>

              {/* Syntax Analysis */}
              {executionResult.detailedAnalysis?.syntax && !executionResult.detailedAnalysis.syntax.isValid && (
                <div className={styles.analysisSection}>
                  <h4><AlertTriangle size={16} /> Syntax Issues</h4>
                  <ul className={styles.issuesList}>
                    {executionResult.detailedAnalysis.syntax.issues.map((issue, index) => (
                      <li key={index} className={styles.syntaxIssue}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Logic Analysis */}
              {executionResult.detailedAnalysis?.logic && (
                <div className={styles.analysisSection}>
                  <h4><Lightbulb size={16} /> Logic Analysis</h4>
                  
                  {executionResult.detailedAnalysis.logic.issues.length > 0 && (
                    <div className={styles.subSection}>
                      <strong>Issues Found:</strong>
                      <ul className={styles.issuesList}>
                        {executionResult.detailedAnalysis.logic.issues.map((issue, index) => (
                          <li key={index} className={styles.logicIssue}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {executionResult.detailedAnalysis.logic.suggestions.length > 0 && (
                    <div className={styles.subSection}>
                      <strong>Suggestions:</strong>
                      <ul className={styles.suggestionsList}>
                        {executionResult.detailedAnalysis.logic.suggestions.map((suggestion, index) => (
                          <li key={index} className={styles.suggestion}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Efficiency Analysis */}
              {executionResult.detailedAnalysis?.efficiency && (
                <div className={styles.analysisSection}>
                  <h4><Zap size={16} /> Efficiency Analysis</h4>
                  <div className={styles.efficiencyGrid}>
                    <div className={styles.efficiencyItem}>
                      <strong>Time Complexity:</strong> {executionResult.detailedAnalysis.efficiency.timeComplexity}
                    </div>
                    <div className={styles.efficiencyItem}>
                      <strong>Space Complexity:</strong> {executionResult.detailedAnalysis.efficiency.spaceComplexity}
                    </div>
                    <div className={styles.efficiencyItem}>
                      <strong>Rating:</strong> {executionResult.detailedAnalysis.efficiency.rating}/5
                    </div>
                  </div>
                  
                  {executionResult.detailedAnalysis.efficiency.improvements.length > 0 && (
                    <div className={styles.subSection}>
                      <strong>Optimization Suggestions:</strong>
                      <ul className={styles.improvementsList}>
                        {executionResult.detailedAnalysis.efficiency.improvements.map((improvement, index) => (
                          <li key={index} className={styles.improvement}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Hints */}
              {executionResult.hints && executionResult.hints.length > 0 && (
                <div className={styles.analysisSection}>
                  <h4><Info size={16} /> Hints</h4>
                  <ul className={styles.hintsList}>
                    {executionResult.hints.map((hint, index) => (
                      <li key={index} className={styles.hint}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Learning Points */}
              {executionResult.learningPoints && executionResult.learningPoints.length > 0 && (
                <div className={styles.analysisSection}>
                  <h4><FileText size={16} /> Learning Points</h4>
                  <ul className={styles.learningPointsList}>
                    {executionResult.learningPoints.map((point, index) => (
                      <li key={index} className={styles.learningPoint}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.placeholderContent}>
              <div className={styles.placeholderHeader}>
                <h3>AI Code Analysis</h3>
                <div className={styles.placeholderIcon}>
                  <Brain size={24} />
                </div>
              </div>
              <div className={styles.placeholderBody}>
                <h4>Ready to Analyze Your Code</h4>
                <p>Write your solution and click &quot;Run Code&quot; to get:</p>
                <ul className={styles.featureList}>
                  <li><CheckCircle2 size={16} /> Detailed feedback on your logic</li>
                  <li><Zap size={16} /> Time & space complexity analysis</li>
                  <li><Lightbulb size={16} /> Optimization suggestions</li>
                  <li><AlertTriangle size={16} /> Syntax error detection</li>
                  <li><FileText size={16} /> Learning points and hints</li>
                </ul>
                <div className={styles.tipSection}>
                  <h5><Info size={16} /> Pro Tip</h5>
                  <p>The AI analyzes your code structure, logic flow, and efficiency to provide personalized feedback that helps you improve as a programmer.</p>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}