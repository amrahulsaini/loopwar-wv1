"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Bot,
  Code,
  Send,
  ChevronRight
} from 'lucide-react';
import Logo from '../../../../../../components/Logo';
import styles from './LearnMode.module.css';

interface ChatMessage {
  message: string;
  response: string;
  message_type: 'user' | 'ai';
  created_at: string;
}

export default function LearnModePage() {
  const params = useParams();
  const category = params.category as string;
  const topic = params.topic as string;
  const subtopic = params.subtopic as string;
  const sortOrder = params.sortOrder as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/ai-chat?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}&subtopic=${encodeURIComponent(subtopic)}&sortOrder=${sortOrder}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [category, topic, subtopic, sortOrder]);

  // Fetch chat messages on load
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message immediately for better UX
    const userMessageObj = { 
      message: userMessage, 
      response: '', 
      message_type: 'user' as const, 
      created_at: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, userMessageObj]);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          category,
          topic,
          subtopic,
          sortOrder,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add AI response
        const aiMessageObj = { 
          message: '', 
          response: data.response, 
          message_type: 'ai' as const, 
          created_at: new Date().toISOString() 
        };
        setMessages(prev => [...prev, aiMessageObj]);
      } else {
        // Add error message as AI response
        const errorMessageObj = { 
          message: '', 
          response: `Sorry, I'm having trouble responding right now. ${data.error || 'Please try again.'}`, 
          message_type: 'ai' as const, 
          created_at: new Date().toISOString() 
        };
        setMessages(prev => [...prev, errorMessageObj]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message as AI response
      const errorMessageObj = { 
        message: '', 
        response: "I'm experiencing connection issues. Please make sure you're connected to the internet and try again.", 
        message_type: 'ai' as const, 
        created_at: new Date().toISOString() 
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInner}>
            <div className={styles.headerLeft}>
              <Link
                href={`/zone/${category}/${topic}/${subtopic}`}
                className={styles.backButton}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Logo />
              <div className={styles.breadcrumb}>
                <span className={styles.breadcrumbItem}>{categoryDisplay}</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
                <span className={styles.breadcrumbItem}>{topicDisplay}</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
                <span className={styles.breadcrumbItem}>{subtopicDisplay}</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
                <span className={styles.breadcrumbActive}>LOOPAI Workspace</span>
              </div>
            </div>

            <div className={styles.headerRight}>
              <div className={styles.problemInfo}>
                <div className={styles.problemNumber}>Problem #{sortOrder}</div>
                <div className={styles.sessionInfo}>
                  <Bot className={`w-3 h-3 ${styles.aiIcon}`} />
                  AI Learning Session
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Left Side - 30% - Future Work Placeholder */}
        <div className={styles.leftPanel}>
          <div className={styles.leftPanelContent}>
            <div className={styles.workInProgressCard}>
              <div className={styles.wipIconContainer}>
                <div className={styles.wipIconWrapper}>
                  <Code className={`w-16 h-16 ${styles.wipIcon}`} />
                </div>
              </div>
              <h3 className={styles.wipTitle}>Work in Progress</h3>
              <p className={styles.wipDescription}>
                Advanced AI-powered tools and interactive features will be available here soon.
              </p>
              <div className={styles.wipIndicators}>
                <div className={styles.wipDot}></div>
                <div className={styles.wipDot}></div>
                <div className={styles.wipDot}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - 70% - LOOPAI Chat */}
        <div className={styles.rightPanel}>
          {/* Chat Header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderContent}>
              <div className={styles.botAvatarContainer}>
                <div className={styles.botAvatar}>
                  <Bot className="w-7 h-7" />
                </div>
              </div>
              <div className={styles.chatInfo}>
                <h2 className={styles.chatTitle}>
                  LOOPAI Assistant
                </h2>
                <p className={styles.chatStatus}>
                  <span className={styles.statusIndicator}></span>
                  Ready to help with {subtopicDisplay}
                </p>
              </div>
              <div className={styles.chatMeta}>
                <div className={styles.problemBadge}>
                  <span className={styles.problemBadgeText}>Problem #{sortOrder}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.welcomeContainer}>
                <div className={styles.welcomeAvatarContainer}>
                  <div className={styles.welcomeAvatar}>
                    <Bot className="w-10 h-10 text-purple-400" />
                  </div>
                </div>
                <h3 className={styles.welcomeTitle}>Welcome to LOOPAI!</h3>
                <p className={styles.welcomeText}>
                  I&apos;m your AI tutor for <span className={styles.welcomeHighlight}>{subtopicDisplay}</span>. 
                  I&apos;ll help you understand concepts, solve problems, and master algorithms step by step.
                </p>
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Try asking me:</strong></p>
                  <ul className="mt-2 space-y-1 text-left max-w-md mx-auto">
                    <li>• &quot;Explain the basics of {subtopicDisplay}&quot;</li>
                    <li>• &quot;What should I know before starting?&quot;</li>
                    <li>• &quot;Walk me through this concept step by step&quot;</li>
                    <li>• &quot;Show me a simple example&quot;</li>
                  </ul>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`${styles.messageContainer} ${msg.message_type === 'user' ? styles.messageContainerUser : styles.messageContainerAi}`}>
                  <div className={`${styles.messageBubble} ${msg.message_type === 'user' ? styles.messageBubbleUser : styles.messageBubbleAi}`}>
                    {msg.message_type === 'ai' && (
                      <div className={styles.aiMessageIcon}>
                        <Bot className="w-3 h-3" />
                      </div>
                    )}
                    <div className={styles.messageText}>
                      {msg.message_type === 'user' ? msg.message : msg.response}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className={`${styles.messageContainer} ${styles.messageContainerAi}`}>
                <div className={`${styles.messageBubble} ${styles.messageBubbleAi}`}>
                  <div className={styles.aiMessageIcon}>
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className={styles.messageText}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">LOOPAI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className={styles.chatInput}>
            <div className={styles.inputContainer}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about this problem..."
                  className={styles.textInput}
                  disabled={isLoading}
                />
                {inputMessage && (
                  <div className={styles.inputIndicator}>
                    <div className={styles.inputDot}></div>
                  </div>
                )}
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className={styles.sendButton}
              >
                {isLoading ? (
                  <div className={styles.loadingSpinner} />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBadge}>
            <span className={styles.footerText}>Powered by</span>
            <span className={styles.footerBrand}>
              LOOPAI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
