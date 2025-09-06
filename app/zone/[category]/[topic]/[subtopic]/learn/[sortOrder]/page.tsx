"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Code,
  Send,
  ChevronRight
} from 'lucide-react';
import Logo from '../../../../../../components/Logo';
import CodeShell from '../../../../../../components/CodeShell/CodeShell';
import styles from './LearnMode.module.css';

interface ChatMessage {
  message: string;
  response: string;
  message_type: 'user' | 'ai';
  created_at: string;
}

interface UserData {
  username: string;
  profilePicture?: string;
  authenticated: boolean;
}

interface ProblemData {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  solution_hints?: string;
  time_complexity?: string;
  space_complexity?: string;
  tags?: string;
  category_name: string;
  topic_name: string;
  subtopic_name: string;
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
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [showCodeShell, setShowCodeShell] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [latestAIResponse, setLatestAIResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check user authentication and get user data
  const checkUserSession = useCallback(async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUser({
          username: userData.username,
          profilePicture: userData.profilePicture,
          authenticated: userData.authenticated
        });
      } else {
        // User not authenticated, but allow guest access
        setUser({
          username: 'Guest',
          authenticated: false
        });
      }
    } catch (error) {
      console.error('Error checking user session:', error);
      setUser({
        username: 'Guest',
        authenticated: false
      });
    }
  }, []);

  // Fetch specific problem data
  const fetchProblemData = useCallback(async () => {
    try {
      const response = await fetch(`/api/problems/by-location?category=${category}&topic=${topic}&subtopic=${subtopic}&sortOrder=${sortOrder}`);
      if (response.ok) {
        const problemData = await response.json();
        setProblem(problemData);
      } else {
        console.error('Failed to fetch problem data');
      }
    } catch (error) {
      console.error('Error fetching problem data:', error);
    }
  }, [category, topic, subtopic, sortOrder]);

  // Initialize user session and problem data on component mount
  useEffect(() => {
    checkUserSession();
    fetchProblemData();
  }, [checkUserSession, fetchProblemData]);

  // Render user avatar
  const renderUserAvatar = (size: 'small' | 'medium' = 'small') => {
    const sizeClass = size === 'medium' ? styles.userAvatarMedium : styles.userAvatarSmall;
    
    if (user?.profilePicture) {
      return (
        <div className={sizeClass}>
          <Image 
            src={user.profilePicture} 
            alt={`${user.username}'s avatar`}
            className={styles.avatarImage}
            width={size === 'medium' ? 40 : 28}
            height={size === 'medium' ? 40 : 28}
          />
        </div>
      );
    }
    
    // Default avatar with user's first letter
    return (
      <div className={`${sizeClass} ${styles.defaultAvatar}`}>
        {user?.username?.charAt(0).toUpperCase() || 'G'}
      </div>
    );
  };

  // Render AI avatar (using custom LOOPAI icon)
  const renderAIAvatar = (size: 'small' | 'medium' = 'small') => {
    const containerClass = size === 'medium' ? styles.botAvatar : styles.aiAvatar;
    
    return (
      <div className={containerClass}>
        {/* Direct SVG background approach */}
        <div className={styles.aiAvatarSvg}></div>
      </div>
    );
  };

  // Format display names
  const formatDisplayName = (urlName: string) => {
    return urlName
      .replace(/-/g, ' ')
      .replace(/and/g, '&')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format AI response to handle line breaks, bold text, and Code Shell buttons
  const formatAIResponse = (text: string) => {
    if (!text) return '';
    
    const hasCodeShell = text.includes('Code Shell') || text.includes('code shell');
    const hasFollowUp = text.includes("What's next?") || text.includes('• ');
    
    const formattedContent = text
      .split('\n')
      .map((line, index) => {
        if (line.trim() === '') {
          return <br key={index} />;
        }
        
        // Handle both **text** and *text* for bold formatting
        let formattedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
          .replace(/\*([^*]+)\*/g, '<strong>$1</strong>');    // *bold*
        
        // Handle code blocks with `code`
        formattedLine = formattedLine.replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.85em;">$1</code>');
        
        // Handle follow-up prompts as clickable buttons
        if (line.startsWith('• ')) {
          const promptText = line.substring(2).trim();
          return (
            <button
              key={index}
              className={styles.followUpPrompt}
              onClick={() => handlePromptClick(promptText)}
            >
              {promptText}
            </button>
          );
        }
        
        return (
          <div key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} style={{ marginBottom: '0.5rem' }} />
        );
      });

    return (
      <div>
        {formattedContent}
        {hasCodeShell && (
          <div className={styles.codeShellActions}>
            <button 
              className={styles.codeShellButton}
              onClick={() => handleOpenCodeShell('cpp')}
            >
              🔥 Open Code Shell (C++)
            </button>
            <button 
              className={styles.codeShellButton}
              onClick={() => handleOpenCodeShell('java')}
            >
              ☕ Open Code Shell (Java)
            </button>
            <button 
              className={styles.codeShellButton}
              onClick={() => handleOpenCodeShell('python')}
            >
              🐍 Open Code Shell (Python)
            </button>
          </div>
        )}
      </div>
    );
  };

  // Typing animation effect with faster speed and smoother animation
  const typeMessage = useCallback((text: string) => {
    setIsTyping(true);
    setTypingText('');
    
    let index = 0;
    const typeSpeed = 15; // Faster typing speed (was 30)
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setTypingText(prev => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        
        // Add the final message to the messages array
        const aiMessageObj = { 
          message: '', 
          response: text, 
          message_type: 'ai' as const, 
          created_at: new Date().toISOString() 
        };
        setMessages(prev => [...prev, aiMessageObj]);
        setLatestAIResponse(text); // Track latest AI response for Code Shell context
        setTypingText('');
      }
    }, typeSpeed);

    return () => clearInterval(timer);
  }, []);

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
          problem: problem ? {
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty,
            hints: problem.solution_hints,
            timeComplexity: problem.time_complexity,
            spaceComplexity: problem.space_complexity
          } : null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Use typing animation for AI response
        typeMessage(data.response);
      } else {
        // Add error message as AI response with typing animation
        const errorMessage = `Sorry, I'm having trouble responding right now. ${data.error || 'Please try again.'}`;
        typeMessage(errorMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message as AI response with typing animation
      const errorMessage = "I'm experiencing connection issues. Please make sure you're connected to the internet and try again.";
      typeMessage(errorMessage);
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

  // Handle predefined prompt clicks
  const handlePromptClick = (prompt: string) => {
    setInputMessage(prompt);
    // Auto-send the message
    setTimeout(() => {
      if (!isLoading) {
        sendMessage();
      }
    }, 100);
  };

  // CodeShell handlers
  const handleOpenCodeShell = (language: string = 'cpp') => {
    setCodeLanguage(language);
    setShowCodeShell(true);
  };

  const handleCloseCodeShell = () => {
    setShowCodeShell(false);
  };

  const handleSubmitCode = async (code: string) => {
    // Send the code to AI for review
    const codeReviewMessage = `Here's my ${codeLanguage} code for review:\n\n\`\`\`${codeLanguage}\n${code}\n\`\`\`\n\nPlease review my code and provide feedback!`;
    setInputMessage(codeReviewMessage);
    setShowCodeShell(false);
    
    // Auto-send the code review message
    setTimeout(() => {
      if (!isLoading) {
        sendMessage();
      }
    }, 100);
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText]);

  // Extract coding question from AI response
  const extractCodingQuestion = (aiResponse: string) => {
    // Look for common patterns in AI responses that indicate a coding task
    const patterns = [
      /Write a .*? function/i,
      /Create a .*? function/i,
      /Implement .*? function/i,
      /Problem:\s*(.*?)(?:\n|$)/i,
      /Task:\s*(.*?)(?:\n|$)/i,
      /Question:\s*(.*?)(?:\n|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = aiResponse.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    
    // Fallback: return first sentence that contains "function" or "array"
    const sentences = aiResponse.split(/[.!?]/);
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes('function') || 
          sentence.toLowerCase().includes('array') ||
          sentence.toLowerCase().includes('implement') ||
          sentence.toLowerCase().includes('write')) {
        return sentence.trim();
      }
    }
    
    return '';
  };

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
              {/* Clean header - just user profile */}
              {user && (
                <div className={styles.userProfileSection}>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.username}</span>
                    {user.authenticated && (
                      <Link href={`/profiles/${user.username}`} className={styles.profileLink}>
                        View Profile
                      </Link>
                    )}
                  </div>
                  {renderUserAvatar('medium')}
                </div>
              )}
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
                {renderAIAvatar('medium')}
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
                    <div className={styles.aiAvatarSvg}></div>
                  </div>
                </div>
                <h3 className={styles.welcomeTitle}>Welcome to LOOPAI{user ? `, ${user.username}` : ''}!</h3>
                {problem ? (
                  <>
                    <p className={styles.welcomeText}>
                      I&apos;m here to help you solve <span className={styles.welcomeHighlight}>{problem.title}</span>.
                      This is a <span className={styles.difficultyBadge}>{problem.difficulty}</span> level problem in {subtopicDisplay}.
                    </p>
                    <div className={styles.welcomePrompts}>
                      <p className={styles.promptsTitle}>Choose how you&apos;d like to start:</p>
                      <div className={styles.promptsList}>
                        <div 
                          className={styles.promptItem}
                          onClick={() => handlePromptClick("Explain this problem to me step by step")}
                        >
                          &quot;Explain this problem to me step by step&quot;
                        </div>
                        <div 
                          className={styles.promptItem}
                          onClick={() => handlePromptClick("What approach should I use to solve this?")}
                        >
                          &quot;What approach should I use to solve this?&quot;
                        </div>
                        <div 
                          className={styles.promptItem}
                          onClick={() => handlePromptClick("Show me similar examples")}
                        >
                          &quot;Show me similar examples&quot;
                        </div>
                        <div 
                          className={styles.promptItem}
                          onClick={() => handlePromptClick("What's the optimal time and space complexity?")}
                        >
                          &quot;What&apos;s the optimal time and space complexity?&quot;
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className={styles.welcomeText}>Loading problem details...</p>
                )}
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div key={index} className={`${styles.messageContainer} ${msg.message_type === 'user' ? styles.messageContainerUser : styles.messageContainerAi}`}>
                    {msg.message_type === 'ai' ? (
                      <div className={styles.aiAvatarContainer}>
                        {renderAIAvatar('small')}
                      </div>
                    ) : (
                      <div className={styles.userAvatarContainer}>
                        {renderUserAvatar('small')}
                      </div>
                    )}
                    <div className={`${styles.messageBubble} ${msg.message_type === 'user' ? styles.messageBubbleUser : styles.messageBubbleAi}`}>
                      <div className={styles.messageText}>
                        {msg.message_type === 'user' 
                          ? msg.message 
                          : <div className={styles.formattedResponse}>{formatAIResponse(msg.response)}</div>
                        }
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Animation */}
                {isTyping && (
                  <div className={`${styles.messageContainer} ${styles.messageContainerAi}`}>
                    <div className={styles.aiAvatarContainer}>
                      {renderAIAvatar('small')}
                    </div>
                    <div className={`${styles.messageBubble} ${styles.messageBubbleAi}`}>
                      <div className={styles.messageText}>
                        <div className={styles.formattedResponse}>
                          {formatAIResponse(typingText)}
                          <span className={styles.typingCursor}>|</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {isLoading && !isTyping && (
              <div className={`${styles.messageContainer} ${styles.messageContainerAi}`}>
                <div className={styles.aiAvatarContainer}>
                  {renderAIAvatar('small')}
                </div>
                <div className={`${styles.messageBubble} ${styles.messageBubbleAi}`}>
                  <div className={styles.messageText}>
                    <div className={styles.loadingContainer}>
                      <div className={styles.spinner}></div>
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

      {/* Code Shell Modal */}
      {showCodeShell && problem && (
        <CodeShell
          language={codeLanguage}
          problemTitle={problem.title}
          problemDescription={problem.description}
          conversationContext={latestAIResponse}
          currentQuestion={latestAIResponse.includes('function') || latestAIResponse.includes('Function') ? 
            latestAIResponse.split('\n').find(line => 
              line.toLowerCase().includes('function') || 
              line.toLowerCase().includes('write') ||
              line.toLowerCase().includes('implement')
            ) || problem.title : problem.title
          }
          onSubmitCode={handleSubmitCode}
          onClose={handleCloseCodeShell}
        />
      )}
    </div>
  );
}

  // Extract coding question from AI response
  const extractCodingQuestion = (aiResponse: string) => {
    // Look for common patterns in AI responses that indicate a coding task
    const patterns = [
      /Write a .*? function/i,
      /Create a .*? function/i,
      /Implement .*? function/i,
      /Problem:\s*(.*?)(?:\n|$)/i,
      /Task:\s*(.*?)(?:\n|$)/i,
      /Question:\s*(.*?)(?:\n|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = aiResponse.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    
    // Fallback: return first sentence that contains "function" or "array"
    const sentences = aiResponse.split(/[.!?]/);
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes('function') || 
          sentence.toLowerCase().includes('array') ||
          sentence.toLowerCase().includes('implement') ||
          sentence.toLowerCase().includes('write')) {
        return sentence.trim();
      }
    }
    
    return '';
  };
