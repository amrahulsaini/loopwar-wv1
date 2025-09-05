'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Brain, 
  BookOpen, 
  Code, 
  MessageSquare, 
  Maximize2, 
  Minimize2,
  Sparkles,
  Target,
  Pin,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import './workspace-clean.css';

interface Problem {
  id: number;
  problem_name: string;
  problem_description: string;
  difficulty: string;
  sort_order: number;
  category_name: string;
  category_slug: string;
  topic_name: string;
  topic_slug: string;
  subtopic_name: string;
  subtopic_slug: string;
}

interface ProblemData {
  problem: Problem;
  category: string;
  topic: string;
  subtopic: string;
  problemId: number;
}

interface Message {
  id: number;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  promptType?: string;
}

interface Note {
  id: number;
  type: 'definition' | 'concept' | 'example' | 'prerequisite' | 'summary';
  title: string;
  content: string;
  is_pinned?: boolean;
  order_index?: number;
}

interface DefaultPrompt {
  id: string;
  title: string;
  prompt: string;
  icon: React.ComponentType<{ size?: number }>;
  category: string;
  description: string;
}

const DEFAULT_PROMPTS: DefaultPrompt[] = [
  {
    id: 'explain_concept',
    title: 'Explain This Concept',
    prompt: 'Please explain the main concept of this problem in simple terms with examples.',
    icon: BookOpen,
    category: 'learning',
    description: 'Get a clear explanation of the main concept'
  },
  {
    id: 'problem_meaning',
    title: 'What Does This Problem Mean?',
    prompt: 'Can you explain what this problem is asking for? Break it down in simple terms.',
    icon: MessageSquare,
    category: 'learning',
    description: 'Understand the problem statement'
  },
  {
    id: 'real_life_analogy',
    title: 'Real Life Analogy',
    prompt: 'Can you give me a real-life analogy to understand this concept better?',
    icon: Sparkles,
    category: 'learning',
    description: 'Learn through practical examples'
  },
  {
    id: 'step_by_step',
    title: 'Step by Step Solution',
    prompt: 'Can you walk me through solving this problem step by step?',
    icon: Target,
    category: 'solving',
    description: 'Get guided solution approach'
  },
  {
    id: 'prerequisite_check',
    title: 'What Should I Know First?',
    prompt: 'What concepts or topics should I understand before tackling this problem?',
    icon: Brain,
    category: 'prerequisites',
    description: 'Check required knowledge'
  },
  {
    id: 'code_example',
    title: 'Show Me Code Examples',
    prompt: 'Can you provide code examples for similar problems or this concept?',
    icon: Code,
    category: 'coding',
    description: 'See practical implementations'
  }
];

export default function LearningWorkspace({ problemData }: { problemData: ProblemData }) {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const { problem } = problemData;

  useEffect(() => {
    const initializeAll = async () => {
      await fetchUserData();
      await initializeSession();
    };
    initializeAll();
  }, []);

  useEffect(() => {
    if (sessionId) {
      loadNotes(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const userData = await response.json();
        setUserId(userData.id);
        setUsername(userData.username || userData.email?.split('@')[0] || 'User');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUsername('User');
    }
  };

  const initializeSession = async () => {
    try {
      const response = await fetch('/api/ai/learning/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          userId: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);

        // Load existing messages for this session
        const messagesResponse = await fetch(`/api/ai/learning/messages?sessionId=${data.sessionId}`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(messagesData.messages || []);
          
          // Add system welcome message if no messages exist
          if (!messagesData?.messages?.length) {
            const welcomeMessage: Message = {
              id: Date.now(),
              type: 'system',
              content: `Welcome to your AI Learning Workspace for "${problem.problem_name}"! I'm LoopAI, and I'm here to help you understand this ${problem.difficulty} level problem. Ask me anything or use the quick prompts below to get started.`,
              timestamp: new Date()
            };
            setMessages([welcomeMessage]);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const loadNotes = async (sessionId: string) => {
    setIsNotesLoading(true);
    try {
      const response = await fetch(`/api/ai/learning/notes?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsNotesLoading(false);
    }
  };

  const sendMessage = async (messageContent: string, promptType?: string) => {
    if (!messageContent.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: messageContent.trim(),
      timestamp: new Date(),
      promptType
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsAiTyping(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: Date.now() + 1,
      type: 'ai',
      content: '',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          problemContext: {
            name: problem.problem_name,
            description: problem.problem_description,
            difficulty: problem.difficulty,
            category: problem.category_name,
            topic: problem.topic_name,
            subtopic: problem.subtopic_name
          },
          sessionId,
          userId,
          promptType
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Remove typing indicator and add AI response
        setMessages(prev => {
          const withoutTyping = prev.slice(0, -1);
          return [...withoutTyping, {
            id: Date.now() + 2,
            type: 'ai',
            content: data.response,
            timestamp: new Date()
          }];
        });

        // Save messages to session
        await fetch('/api/ai/learning/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            messages: [userMessage, {
              id: Date.now() + 2,
              type: 'ai',
              content: data.response,
              timestamp: new Date()
            }]
          })
        });

        // Refresh notes if AI generated any
        if (data.notesGenerated) {
          loadNotes(sessionId);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.slice(0, -1)); // Remove typing indicator
    } finally {
      setIsAiTyping(false);
    }
  };

  const handlePromptClick = (prompt: DefaultPrompt) => {
    sendMessage(prompt.prompt, prompt.id);
  };

  const handleSendMessage = () => {
    sendMessage(currentMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'definition': return <BookOpen size={16} />;
      case 'concept': return <Brain size={16} />;
      case 'example': return <Code size={16} />;
      case 'prerequisite': return <Target size={16} />;
      case 'summary': return <CheckCircle2 size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className={`learning-workspace ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <div className="workspace-header">
        <div className="header-content">
          <div className="header-info">
            <div className="problem-meta">
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}
              >
                {problem.difficulty}
              </span>
            </div>
            <h1>{problem.problem_name}</h1>
            <p>{problem.category_name} → {problem.topic_name} → {problem.subtopic_name}</p>
          </div>
          
          <div className="header-actions">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="header-btn"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
          </div>
        </div>
      </div>

      <div className="workspace-content">
        {/* Left Panel - AI Generated Notes */}
        <div className="notes-panel">
          <div className="panel-header">
            <div className="panel-title">
              <BookOpen size={20} />
              <span>Learning Notes</span>
            </div>
          </div>
          
          <div className="notes-content">
            {isNotesLoading ? (
              <div className="loading-notes">
                <RefreshCw className="animate-spin" size={24} />
                <span>Loading notes...</span>
              </div>
            ) : notes.length > 0 ? (
              <div className="notes-list">
                {notes.map((note) => (
                  <div key={note.id} className={`note-item ${note.type}`}>
                    <div className="note-meta">
                      {getNoteIcon(note.type)}
                      <span className="note-type">{note.type}</span>
                      {note.is_pinned && <Pin size={12} />}
                    </div>
                    <h4 className="note-title">{note.title}</h4>
                    <p className="note-content">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-notes">
                <Brain className="empty-notes-icon" />
                <p>Start a conversation and I&apos;ll generate helpful notes for you!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="chat-panel">
          <div className="panel-header">
            <div className="panel-title">
              <MessageSquare size={20} />
              <span>AI Tutor Chat</span>
            </div>
          </div>

          <div className="chat-content">
            {messages.length === 0 || (messages.length === 1 && messages[0].type === 'system') ? (
              /* Welcome Section with Prompts */
              <div className="welcome-section">
                <div className="welcome-header">
                  <h3>Let&apos;s Learn Together!</h3>
                  <p>I&apos;m your AI tutor for this problem. Choose a learning path below or ask me anything:</p>
                </div>
                
                <div className="prompts-grid">
                  {DEFAULT_PROMPTS.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="prompt-card"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      <div className="prompt-icon">
                        <prompt.icon size={20} />
                      </div>
                      <div className="prompt-content">
                        <h4>{prompt.title}</h4>
                        <p>{prompt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div className="chat-messages">
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.type}`}>
                    <div className="message-avatar">
                      {message.type === 'user' ? (
                        username.charAt(0).toUpperCase()
                      ) : message.type === 'ai' ? (
                        <Brain size={16} />
                      ) : (
                        <Sparkles size={16} />
                      )}
                    </div>
                    <div className="message-content">
                      {message.content ? (
                        <>
                          <div className="message-text">{message.content}</div>
                          <div className="message-time">{formatTime(message.timestamp)}</div>
                        </>
                      ) : (
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="chat-input-section">
            {/* Quick Prompts (shown when there are messages) */}
            {messages.length > 1 && (
              <div className="quick-prompts">
                {DEFAULT_PROMPTS.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt.id}
                    className="quick-prompt-btn"
                    onClick={() => handlePromptClick(prompt)}
                    disabled={isAiTyping}
                  >
                    <prompt.icon size={14} />
                    {prompt.title}
                  </button>
                ))}
              </div>
            )}
            
            <div className="chat-input-wrapper">
              <input
                ref={chatInputRef}
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask LoopAI anything about this problem..."
                className="chat-input"
                disabled={isAiTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isAiTyping}
                className="send-btn"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
