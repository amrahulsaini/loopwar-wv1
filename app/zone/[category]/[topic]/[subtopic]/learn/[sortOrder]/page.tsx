"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  BookOpen,
  Brain,
  Lightbulb,
  Target,
  User,
  Bot,
  Sparkles,
  FileText,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import Logo from '../../../../../../components/Logo';
import LoadingSpinner from '../../../../../../components/LoadingSpinner';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  topic_name: string;
  subtopic_name: string;
  category_name: string;
}

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  promptType?: string;
}

interface Note {
  id: number;
  type: 'definition' | 'concept' | 'example' | 'analogy' | 'prerequisite' | 'practice_suggestion';
  title: string;
  content: string;
  isImportant: boolean;
}

interface DefaultPrompt {
  id: string;
  text: string;
  type: string;
  icon: React.ReactNode;
}

const defaultPrompts: DefaultPrompt[] = [
  {
    id: 'explain_concept',
    text: 'Explain this concept to me in simple terms',
    type: 'explain_concept',
    icon: <BookOpen className="w-4 h-4" />
  },
  {
    id: 'problem_meaning',
    text: 'What does this problem mean and what am I supposed to solve?',
    type: 'explain_concept',
    icon: <Target className="w-4 h-4" />
  },
  {
    id: 'real_life_analogy',
    text: 'Give me a real-life analogy for this concept',
    type: 'real_life_analogy',
    icon: <Lightbulb className="w-4 h-4" />
  },
  {
    id: 'prerequisites',
    text: 'What prerequisites should I know before learning this?',
    type: 'prerequisites',
    icon: <Brain className="w-4 h-4" />
  },
  {
    id: 'practice_problems',
    text: 'Suggest similar practice problems for this concept',
    type: 'practice_problems',
    icon: <Sparkles className="w-4 h-4" />
  },
  {
    id: 'step_by_step',
    text: 'Break down this problem step by step',
    type: 'explain_concept',
    icon: <FileText className="w-4 h-4" />
  }
];

export default function AILearningWorkspace() {
  const params = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const category = params.category as string;
  const topic = params.topic as string;
  const subtopic = params.subtopic as string;
  const sortOrder = parseInt(params.sortOrder as string);

  const formatDisplayName = (urlName: string) => {
    return urlName
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch user data (optional)
        try {
          const userResponse = await fetch('/api/user');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('User authenticated:', userData.username);
          }
        } catch {
          console.log('User not authenticated, continuing as anonymous');
        }

        // Fetch problem data
        const problemResponse = await fetch(`/api/problems/by-sort-order?category=${category}&topic=${topic}&subtopic=${subtopic}&sortOrder=${sortOrder}`);
        
        if (!problemResponse.ok) {
          throw new Error('Problem not found');
        }
        
        const problemData = await problemResponse.json();
        setProblem(problemData.problem);

        // Initialize or fetch existing session
        await initializeSession(problemData.problem);
        
      } catch {
        console.error('Error fetching data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [category, topic, subtopic, sortOrder]);

  const initializeSession = useCallback(async (problemData: Problem) => {
    try {
      const response = await fetch('/api/learning/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId: problemData.id,
          category,
          topic,
          subtopic,
          sortOrder
        }),
      });

      if (response.ok) {
        const sessionData = await response.json();
        setSessionId(sessionData.sessionId);
        
        // Load existing conversation and notes if any
        if (sessionData.messages) {
          setMessages(sessionData.messages);
        }
        if (sessionData.notes) {
          setNotes(sessionData.notes);
        }

        // Send initial AI greeting if new session
        if (!sessionData.messages || sessionData.messages.length === 0) {
          await sendInitialGreeting(problemData);
        }
      }
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }, [category, topic, subtopic, sortOrder, sendInitialGreeting]);

  const sendInitialGreeting = useCallback(async (problemData: Problem) => {
    const greeting = `👋 Hi! I'm LoopAI, your learning companion. I see you're working on "${problemData.title}" - a ${problemData.difficulty} level problem in ${formatDisplayName(problemData.topic_name)}.

I'm here to help you understand this concept thoroughly. I have access to all our problem database and can suggest related problems, explain prerequisites, and provide real-world analogies.

What would you like to start with today?`;

    const aiMessage: Message = {
      id: Date.now(),
      type: 'ai',
      content: greeting,
      timestamp: new Date()
    };

    setMessages([aiMessage]);
    
    // Save to database
    if (sessionId) {
      await saveMessage(aiMessage);
    }
  }, [sessionId]);

  const handleSendMessage = async (messageText: string, promptType?: string) => {
    if (!messageText.trim() || isAITyping) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
      promptType
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsAITyping(true);

    try {
      // Save user message
      await saveMessage(userMessage);

      // Send to AI
      const response = await fetch('/api/learning/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: messageText,
          promptType,
          problemData: problem,
          conversationHistory: messages.slice(-10) // Last 10 messages for context
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        
        const aiMessage: Message = {
          id: Date.now() + 1,
          type: 'ai',
          content: aiResponse.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Save AI message
        await saveMessage(aiMessage);

        // Update notes if AI generated any
        if (aiResponse.notes && aiResponse.notes.length > 0) {
          setNotes(prev => [...prev, ...aiResponse.notes]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAITyping(false);
    }
  };

  const saveMessage = async (message: Message) => {
    if (!sessionId) return;
    
    try {
      await fetch('/api/learning/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message
        }),
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handlePromptClick = (prompt: DefaultPrompt) => {
    handleSendMessage(prompt.text, prompt.type);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
          <Link
            href="/zone"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Return to Zone
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/zone/${category}/${topic}/${subtopic}`}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Logo />
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
                <span>{formatDisplayName(category)}</span>
                <ChevronRight className="w-4 h-4" />
                <span>{formatDisplayName(topic)}</span>
                <ChevronRight className="w-4 h-4" />
                <span>{formatDisplayName(subtopic)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium">{problem.title}</div>
                <div className="text-xs text-gray-400">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                    problem.difficulty === 'Easy' ? 'bg-green-500' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
                  {problem.difficulty}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Side - AI Generated Notes */}
        <div className="w-1/3 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <FileText className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold">Learning Notes</h2>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>
            
            {notes.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Notes will appear here as you chat with LoopAI</p>
                <p className="text-sm mt-2">Ask questions to generate structured learning notes!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-4 rounded-lg border ${
                      note.isImportant 
                        ? 'bg-blue-900/20 border-blue-500/30' 
                        : 'bg-gray-700/30 border-gray-600/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        note.type === 'definition' ? 'bg-purple-500' :
                        note.type === 'concept' ? 'bg-blue-500' :
                        note.type === 'example' ? 'bg-green-500' :
                        note.type === 'analogy' ? 'bg-yellow-500' :
                        note.type === 'prerequisite' ? 'bg-red-500' : 'bg-gray-500'
                      }`}></span>
                      <h4 className="font-medium text-sm uppercase tracking-wide text-gray-300">
                        {note.type.replace('_', ' ')}
                      </h4>
                      {note.isImportant && (
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{note.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Default Prompts */}
          {messages.length <= 1 && (
            <div className="p-6 bg-gray-800/50 border-b border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Quick Start Suggestions:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {defaultPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => handlePromptClick(prompt)}
                    className="flex items-center space-x-3 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-left"
                    disabled={isAITyping}
                  >
                    <div className="text-blue-400">{prompt.icon}</div>
                    <span className="text-sm">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl flex space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 text-gray-100'
                  }`}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      {message.content.split('\n').map((line, index) => (
                        <p key={index} className="mb-2 last:mb-0">{line}</p>
                      ))}
                    </div>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isAITyping && (
              <div className="flex justify-start">
                <div className="max-w-3xl flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-lg bg-gray-800">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 bg-gray-800 border-t border-gray-700">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask LoopAI anything about this problem..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  disabled={isAITyping}
                />
              </div>
              <button
                onClick={() => handleSendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isAITyping}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
