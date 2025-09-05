'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Brain, 
  BookOpen, 
  Lightbulb, 
  Code, 
  MessageSquare, 
  Save, 
  Download, 
  Maximize2, 
  Minimize2,
  User,
  Bot,
  Sparkles,
  Target,
  Clock,
  Pin,
  Edit3,
  Trash2,
  RefreshCw,
  Zap,
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
  icon: any;
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
    id: 'prerequisites',
    title: 'Check Prerequisites',
    prompt: 'What concepts should I know before learning this? Are there any problems I should practice first?',
    icon: Target,
    category: 'learning',
    description: 'Identify required knowledge'
  },
  {
    id: 'time_complexity',
    title: 'Time Complexity',
    prompt: 'Explain the time and space complexity of this approach. Why is it efficient or inefficient?',
    icon: Clock,
    category: 'technical',
    description: 'Understand algorithm efficiency'
  },
  {
    id: 'step_by_step',
    title: 'Step by Step Solution',
    prompt: 'Can you walk me through the solution step by step?',
    icon: Code,
    category: 'technical',
    description: 'Get detailed solution breakdown'
  }
];

export default function LearningWorkspace({ problemData }: { problemData: ProblemData }) {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const { problem } = problemData;

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeWorkspace();
  }, []);

  const initializeWorkspace = async () => {
    try {
      // Get user info
      const userResponse = await fetch('/api/user', { credentials: 'include' });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserId(userData.id);
        setUsername(userData.username);
      }

      // Generate unique session ID
      const session = `${userId || 'guest'}_${problem.id}_${Date.now()}`;
      setSessionId(session);

      // Create learning session
      await createLearningSession(session);
      
      // Load existing data if any
      await loadSessionData(session);
      
    } catch (error) {
      console.error('Error initializing workspace:', error);
    }
  };

  const createLearningSession = async (session: string) => {
    try {
      await fetch('/api/ai/learning/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: session,
          userId: userId,
          problemId: problem.id,
          title: `Learning: ${problem.problem_name}`
        })
      });
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const loadSessionData = async (session: string) => {
    try {
      // Load messages
      const messagesResponse = await fetch(`/api/ai/learning/messages?sessionId=${session}`);
      if (messagesResponse.ok) {
        const data = await messagesResponse.json();
        if (data.success && data.messages) {
          setMessages(data.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.created_at)
          })));
        }
      }

      // Load notes
      await loadNotes(session);
    } catch (error) {
      console.error('Error loading session data:', error);
    }
  };

  const loadNotes = async (session: string) => {
    setIsNotesLoading(true);
    try {
      const response = await fetch(`/api/ai/learning/notes?sessionId=${session}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.notes) {
          setNotes(data.notes);
        }
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsNotesLoading(false);
    }
  };

  const sendMessage = async (message: string, promptType?: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date(),
      promptType
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId || 0,
          message,
          problem_id: problem.id,
          problem_title: problem.problem_name,
          conversation_id: sessionId,
          action: promptType
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.message || data.response,
          timestamp: new Date(),
          promptType
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Reload notes after AI response
        setTimeout(() => {
          loadNotes(sessionId);
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const pinNote = async (noteId: number) => {
    try {
      await fetch('/api/ai/learning/notes/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId })
      });
      loadNotes(sessionId);
    } catch (error) {
      console.error('Error pinning note:', error);
    }
  };

  const deleteNote = async (noteId: number) => {
    try {
      await fetch('/api/ai/learning/notes/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId })
      });
      loadNotes(sessionId);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const startEditNote = (note: Note) => {
    setEditingNote(note.id);
    setEditNoteContent(note.content);
  };

  const saveNoteEdit = async (noteId: number) => {
    try {
      await fetch('/api/ai/learning/notes/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, content: editNoteContent })
      });
      setEditingNote(null);
      setEditNoteContent('');
      loadNotes(sessionId);
    } catch (error) {
      console.error('Error editing note:', error);
    }
  };

  const saveNotes = async () => {
    setIsLoading(true);
    try {
      // Save current notes state to database
      await fetch('/api/ai/learning/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          notes: notes
        })
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

}

  return (
    <div className={`learning-workspace ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <div className="workspace-header">
        <div className="header-info">
          <div className="header-title">
            <Brain size={24} />
            <div>
              <h1>AI Learning Workspace</h1>
              <p className="problem-path">
                {problem.category_name} › {problem.topic_name} › {problem.subtopic_name}
              </p>
            </div>
          </div>
          
          <div className="problem-info">
            <div className="problem-meta">
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}
              >
                {problem.difficulty}
              </span>
            </div>
            <h2 className="problem-title">{problem.problem_name}</h2>
            <p className="problem-description">{problem.problem_description}</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="action-btn"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
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
            <div className="panel-actions">
              <button
                onClick={() => loadNotes(sessionId)}
                className="refresh-btn"
                disabled={isNotesLoading}
                title="Refresh notes"
              >
                <RefreshCw size={16} className={isNotesLoading ? 'spinning' : ''} />
              </button>
              <button
                onClick={saveNotes}
                className="save-btn"
                disabled={isLoading}
                title="Save notes"
              >
                <Save size={16} />
              </button>
              <button
                onClick={exportNotes}
                className="export-btn"
                title="Export notes"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
          
          <div className="notes-content">
            {isNotesLoading ? (
              <div className="notes-loading">
                <div className="loading-spinner"></div>
                <span>Loading notes...</span>
              </div>
            ) : notes.length === 0 ? (
              <div className="notes-empty">
                <Brain size={48} />
                <h3>No Notes Yet</h3>
                <p>Start chatting with LoopAI to generate learning notes automatically!</p>
              </div>
            ) : (
              <div className="notes-list">
                {notes
                  .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
                  .map((note) => (
                  <div key={note.id} className={`note-item ${note.is_pinned ? 'pinned' : ''}`}>
                    <div className="note-header">
                      <div className="note-type">
                        {getNoteIcon(note.type)}
                        <span className={`note-type-badge ${note.type}`}>
                          {note.type}
                        </span>
                      </div>
                      <div className="note-actions">
                        <button
                          className={`note-action-btn ${note.is_pinned ? 'active' : ''}`}
                          onClick={() => pinNote(note.id)}
                          title={note.is_pinned ? 'Unpin note' : 'Pin note'}
                        >
                          <Pin size={14} />
                        </button>
                        <button
                          className="note-action-btn"
                          onClick={() => startEditNote(note)}
                          title="Edit note"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="note-action-btn delete"
                          onClick={() => deleteNote(note.id)}
                          title="Delete note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="note-title">{note.title}</h4>
                    
                    {editingNote === note.id ? (
                      <div className="note-edit">
                        <textarea
                          value={editNoteContent}
                          onChange={(e) => setEditNoteContent(e.target.value)}
                          className="note-edit-textarea"
                          rows={4}
                        />
                        <div className="note-edit-actions">
                          <button
                            className="note-save-btn"
                            onClick={() => saveNoteEdit(note.id)}
                          >
                            <Save size={14} />
                            Save
                          </button>
                          <button
                            className="note-cancel-btn"
                            onClick={() => setEditingNote(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="note-content"
                        dangerouslySetInnerHTML={{ 
                          __html: note.content.replace(/\n/g, '<br>') 
                        }} 
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Chat Interface */}
        <div className="chat-panel">
          {/* Default Prompts (shown when no messages) */}
          {messages.length === 0 && (
            <div className="welcome-section">
              <div className="welcome-header">
                <Bot size={32} />
                <div>
                  <h3>Hi! I'm LoopAI 🤖</h3>
                  <p>I'm here to help you master <strong>{problem.problem_name}</strong> step by step!</p>
                  <p className="welcome-sub">Choose a prompt below or ask me anything:</p>
                </div>
              </div>
              
              <div className="prompts-grid">
                {DEFAULT_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.id}
                    className="prompt-card"
                    onClick={() => handlePromptClick(prompt)}
                    disabled={isAiTyping}
                  >
                    <div className="prompt-icon">
                      <prompt.icon size={20} />
                    </div>
                    <div className="prompt-content">
                      <h4>{prompt.title}</h4>
                      <p>{prompt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'user' ? (
                    <User size={20} />
                  ) : message.type === 'ai' ? (
                    <Bot size={20} />
                  ) : (
                    <Zap size={20} />
                  )}
                </div>
                <div className="message-content">
                  <div 
                    className="message-text"
                    dangerouslySetInnerHTML={{ 
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br>') 
                    }} 
                  />
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isAiTyping && (
              <div className="message ai typing">
                <div className="message-avatar">
                  <Bot size={20} />
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
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="chat-input-section">
            {/* Quick Prompts (shown when there are messages) */}
            {messages.length > 0 && (
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
