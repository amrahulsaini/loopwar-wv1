"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  MessageCircle,
  HelpCircle,
  Code,
  Play,
  CheckCircle2,
  Clock,
  Target,
  Database,
  Send,
  Bot,
  User,
  Lightbulb
} from 'lucide-react';
import Logo from '../../../../../../components/Logo';
import LoadingSpinner from '../../../../../../components/LoadingSpinner';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  solved: boolean;
  timeSpent?: number;
  lastAttempt?: string;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function LearnProblemPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [username, setUsername] = useState('');
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);

  // URL parameters
  const category = params.category as string;
  const topic = params.topic as string;
  const subtopic = params.subtopic as string;
  const problemId = params.problemId as string;

  // Format display names
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
        // Fetch user session
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

        // Fetch problem details
        const problemResponse = await fetch(`/api/admin/problems/${problemId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (problemResponse.ok) {
          const problemData = await problemResponse.json();
          if (problemData.success) {
            setProblem(problemData.problem);
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
  }, [problemId, router]);

  const sendMessageToAI = async () => {
    if (!userMessage.trim() || !problem) return;

    setIsAiLoading(true);
    const newMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, newMessage]);
    const messageToSend = userMessage;
    setUserMessage('');

    try {
      const response = await fetch('https://ai.loopwar.dev/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // TODO: Get actual user ID
          message: messageToSend,
          conversation_id: conversationId,
          context: `${problem.title} - ${subtopicDisplay}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConversationId(data.conversation_id);

        const aiResponse: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };

        setAiMessages(prev => [...prev, aiResponse]);
      } else {
        console.error('AI API error:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
    } finally {
      setIsAiLoading(false);
    }
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
                <span className="breadcrumb-current">Learn</span>
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

      <main className="learn-main">
        <div className="container">
          <div className="learn-layout">
            {/* Problem Content */}
            <div className="learn-content">
              <div className="problem-header-section">
                <div className="problem-meta">
                  <div
                    className="problem-difficulty"
                    style={{ color: getDifficultyColor(problem.difficulty) }}
                  >
                    {problem.difficulty}
                  </div>
                  <div className="problem-id">Problem #{problem.id}</div>
                </div>
                <h1 className="problem-title">{problem.title}</h1>
                <p className="problem-description">{problem.description}</p>
              </div>

              <div className="learning-sections">
                <div className="learning-section">
                  <h3 className="section-title">
                    <BookOpen size={20} />
                    Understanding the Problem
                  </h3>
                  <div className="section-content">
                    <p>Let's break down this problem step by step. Click the AI assistant below to get personalized help!</p>
                  </div>
                </div>

                <div className="learning-section">
                  <h3 className="section-title">
                    <Code size={20} />
                    Solution Approach
                  </h3>
                  <div className="section-content">
                    <p>Think about the best way to solve this problem. Consider time complexity and space efficiency.</p>
                  </div>
                </div>

                <div className="learning-section">
                  <h3 className="section-title">
                    <Lightbulb size={20} />
                    Key Concepts
                  </h3>
                  <div className="section-content">
                    <p>This problem involves important concepts in {subtopicDisplay}. Ask the AI for explanations!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Chat Sidebar */}
            <div className="ai-chat-sidebar">
              <div className="chat-header">
                <Bot size={20} />
                <h3>LoopAI Assistant</h3>
              </div>

              <div className="chat-messages">
                {aiMessages.length === 0 && (
                  <div className="welcome-message">
                    <Bot size={24} />
                    <p>Hi! I'm LoopAI, your coding tutor. Ask me anything about this problem!</p>
                    <div className="suggested-questions">
                      <button
                        className="suggested-btn"
                        onClick={() => setUserMessage("Explain this problem step by step")}
                      >
                        Explain this problem
                      </button>
                      <button
                        className="suggested-btn"
                        onClick={() => setUserMessage("What concepts do I need to know?")}
                      >
                        Key concepts needed
                      </button>
                      <button
                        className="suggested-btn"
                        onClick={() => setUserMessage("Give me a hint")}
                      >
                        Give me a hint
                      </button>
                    </div>
                  </div>
                )}

                {aiMessages.map((message) => (
                  <div key={message.id} className={`message ${message.role}`}>
                    <div className="message-avatar">
                      {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="message assistant">
                    <div className="message-avatar">
                      <Bot size={16} />
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessageToAI()}
                  placeholder="Ask me anything about this problem..."
                  disabled={isAiLoading}
                />
                <button
                  onClick={sendMessageToAI}
                  disabled={isAiLoading || !userMessage.trim()}
                  className="send-btn"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
