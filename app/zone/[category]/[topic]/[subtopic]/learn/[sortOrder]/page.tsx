"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Send,
  ChevronRight,
  Zap,
  BookOpen
} from 'lucide-react';
import Logo from '../../../../../../components/Logo';
import CodeShell from '../../../../../../components/CodeShell/CodeShell';
import NotesPanel from '../../../../../../components/NotesPanel/NotesPanel';
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showProblemTooltip, setShowProblemTooltip] = useState(false);
  
  // Enhanced conversation state
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const [lastResponseTime, setLastResponseTime] = useState<number>(0);
  const [responseQuality, setResponseQuality] = useState<'fast' | 'detailed'>('detailed');
  
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

  // Format AI response to handle new structured format with Lucide icons (no emojis)
  const formatAIResponse = (text: string) => {
    if (!text) return '';
    
    const hasCodeShell = text.includes('Code Shell') || text.includes('code shell');
    
    // Remove all emojis and use professional Lucide icons instead
    let formattedText = text
      // Remove all common emojis
      .replace(/[🎯💡🔍🔥⚠️💭🚀🛠️📚✨🔧⭐💻📝]/g, '');
    
    // First, handle multi-line code blocks (```code```)
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const codeBlocks: { placeholder: string; content: React.ReactElement }[] = [];
    
    let match;
    let blockIndex = 0;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      const codeContent = match[1].trim();
      const placeholder = `__CODE_BLOCK_${blockIndex}__`;
      
      // Detect language from first line if present
      const lines = codeContent.split('\n');
      let language = 'text';
      let actualCode = codeContent;
      
      // Check if first line is a language identifier
      if (lines[0] && lines[0].length < 20 && /^[a-zA-Z]+$/.test(lines[0].trim())) {
        language = lines[0].trim().toLowerCase();
        actualCode = lines.slice(1).join('\n');
      }
      
      const codeElement = (
        <div key={`code-${blockIndex}`} className={styles.codeBlock}>
          <div className={styles.codeHeader}>
            <span className={styles.codeLanguage}>{language}</span>
            <button 
              className={styles.copyButton}
              onClick={() => navigator.clipboard.writeText(actualCode)}
              title="Copy code"
            >
              Copy
            </button>
          </div>
          <pre className={styles.codeContent}>
            <code>{actualCode}</code>
          </pre>
        </div>
      );
      
      codeBlocks.push({ placeholder, content: codeElement });
      formattedText = formattedText.replace(match[0], placeholder);
      blockIndex++;
    }
    
    // Split text into lines and track if we're in the follow-up section
    const lines = formattedText.split('\n');
    let inFollowUpSection = false;
    
    const formattedContent = lines.map((line, index) => {
        // Check for code block placeholders
        const codeBlock = codeBlocks.find(block => line.includes(block.placeholder));
        if (codeBlock) {
          return codeBlock.content;
        }
        
        if (line.trim() === '') {
          return <br key={index} />;
        }
        
        // Check if we're entering the follow-up section
        if (line.includes("What Would You Like?") || line.includes("What's next?") || line.includes("📚")) {
          inFollowUpSection = true;
        }
        
        // Better formatting: Convert asterisks to proper HTML
        let formattedLine = line;
        
        // Handle section headers with Lucide icons (no emojis, keep them bold)
        if (line.match(/^\*\*(.*?)\*\*/) && line.includes('**')) {
          formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
        // Convert bullet points with asterisks to proper HTML bullets
        else if (line.match(/^\s*[\*•-]\s+/)) {
          formattedLine = line
            .replace(/^\s*[\*•-]\s+/, '') // Remove bullet markers
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Keep bold formatting
          formattedLine = `• ${formattedLine}`; // Add proper bullet
        }
        // Handle regular text with asterisks for emphasis
        else {
          formattedLine = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
            .replace(/(?<!\*)\*([^*\s][^*]*[^*\s])\*(?!\*)/g, '<em>$1</em>'); // *italic* (not **)
        }
        
        // Handle inline code with `code`
        formattedLine = formattedLine.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');
        
        // Convert follow-up bullets to clickable buttons (works with both old and new format)
        const isBulletPoint = line.match(/^[•·*-]\s+/) || line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ');
        if (inFollowUpSection && isBulletPoint) {
          // Remove bullet point and any surrounding quotes
          const promptText = line
            .replace(/^[•·*-]\s+/, '')
            .replace(/^["']|["']$/g, '') // Remove quotes from start/end
            .trim();
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
              Open Code Shell (C++)
            </button>
            <button 
              className={styles.codeShellButton}
              onClick={() => handleOpenCodeShell('java')}
            >
              Open Code Shell (Java)
            </button>
            <button 
              className={styles.codeShellButton}
              onClick={() => handleOpenCodeShell('python')}
            >
              Open Code Shell (Python)
            </button>
          </div>
        )}
      </div>
    );
  };

  // Smooth progressive display with cool animations (no cursor, eye-catching transitions)
  const displayResponseSmoothly = useCallback((text: string) => {
    // Split response into sections for smooth display (no emoji-based splitting)
    const sections = text.split(/(?=\*\*[A-Z][^*]*\*\*:)|(?=\n\n)/);
    
    setIsTyping(true);
    setTypingText('');
    
    // Display sections progressively with smooth animations
    sections.forEach((section, index) => {
      setTimeout(() => {
        setTypingText(prev => {
          const newText = prev + section;
          
          // Add smooth fade-in animation for each section
          setTimeout(() => {
            const elements = document.querySelectorAll('.formattedResponse > div:last-child');
            const lastElement = elements[elements.length - 1] as HTMLElement;
            if (lastElement) {
              lastElement.style.animation = 'fadeInUp 0.5s ease-out';
            }
          }, 50);
          
          return newText;
        });
        
        // If last section, complete the message with final animation
        if (index === sections.length - 1) {
          setTimeout(() => {
            setIsTyping(false);
            
            // Add the final message to the messages array
            const aiMessageObj = { 
              message: '', 
              response: text, 
              message_type: 'ai' as const, 
              created_at: new Date().toISOString() 
            };
            setMessages(prev => [...prev, aiMessageObj]);
            setLatestAIResponse(text);
            setTypingText('');
            
            // Cool completion animation
            setTimeout(() => {
              const lastMessage = document.querySelector('.messageContainerAi:last-child') as HTMLElement;
              if (lastMessage) {
                lastMessage.style.animation = 'slideInComplete 0.3s ease-out';
              }
            }, 100);
            
            // Update conversation context
            setConversationContext(prev => [...prev.slice(-4), `AI: ${text.substring(0, 100)}...`]);
          }, 400); // Longer delay for smoother completion
        }
      }, index * 600); // Increased timing for better visual flow
    });
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

    // Track response timing for optimization
    const startTime = Date.now();
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

    // Update conversation context for better follow-ups
    setConversationContext(prev => [...prev.slice(-4), userMessage]); // Keep last 5 messages

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
          conversationContext: conversationContext, // Enhanced context
          responseMode: responseQuality, // Fast or detailed
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
        // Track response time for adaptive optimization
        const responseTime = Date.now() - startTime;
        setLastResponseTime(responseTime);
        
        // Auto-adjust response quality based on performance
        if (responseTime > 5000 && responseQuality === 'detailed') {
          setResponseQuality('fast');
        } else if (responseTime < 2000 && responseQuality === 'fast') {
          setResponseQuality('detailed');
        }

        // Use smooth progressive display like Grok (no typing animation)
        displayResponseSmoothly(data.response);
      } else {
        // Add error message with smooth display
        const errorMessage = `Sorry, I'm having trouble responding right now. ${data.error || 'Please try again.'}`;
        displayResponseSmoothly(errorMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message with smooth display
      const errorMessage = "I'm experiencing connection issues. Please make sure you're connected to the internet and try again.";
      displayResponseSmoothly(errorMessage);
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

  // Handle predefined prompt clicks - send directly to AI (fixed double-click issue)
  const handlePromptClick = (prompt: string) => {
    if (isLoading) return; // Prevent spam clicks during loading
    
    // Clear current input and set new prompt
    setInputMessage('');
    
    // Send the message directly without using input field
    sendMessageDirect(prompt);
  };

  // Direct message sending for follow-up questions (bypasses input field)
  const sendMessageDirect = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const startTime = Date.now();
    setIsLoading(true);

    // Add user message immediately for better UX
    const userMessageObj = { 
      message: messageText, 
      response: '', 
      message_type: 'user' as const, 
      created_at: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, userMessageObj]);
    setConversationContext(prev => [...prev.slice(-4), messageText]);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          category,
          topic,
          subtopic,
          sortOrder,
          conversationContext: conversationContext,
          responseMode: responseQuality,
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
        const responseTime = Date.now() - startTime;
        setLastResponseTime(responseTime);
        
        // Use smooth progressive display
        displayResponseSmoothly(data.response);
      } else {
        const errorMessage = `Sorry, I'm having trouble responding right now. ${data.error || 'Please try again.'}`;
        displayResponseSmoothly(errorMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = "I'm experiencing connection issues. Please make sure you're connected to the internet and try again.";
      displayResponseSmoothly(errorMessage);
    } finally {
      setIsLoading(false);
    }
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

  // Full screen handlers
  const handleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullScreen(!isFullScreen);
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText]);

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
                <div className={styles.problemNameContainer}>
                  <span 
                    className={styles.breadcrumbActive}
                    onMouseEnter={() => setShowProblemTooltip(true)}
                    onMouseLeave={() => setShowProblemTooltip(false)}
                  >
                    {problem ? problem.title : 'LOOPAI Workspace'}
                  </span>
                  {showProblemTooltip && problem && (
                    <div className={styles.problemTooltip}>
                      <h4>{problem.title}</h4>
                      <p className={styles.problemDescription}>{problem.description}</p>
                      <span className={`${styles.difficultyBadge} ${styles[problem.difficulty.toLowerCase()]}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  className={styles.fullScreenButton}
                  onClick={handleFullScreen}
                  title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
                >
                  {isFullScreen ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 10l7-7m0 0h-6m6 0v6M10 14l-7 7m0 0h6m-6 0v-6"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 3H3v4m0 10v4h4m10 0h4v-4M21 7V3h-4"/>
                    </svg>
                  )}
                </button>
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
        {/* Left Side - 30% - AI Learning Notes */}
        <div className={styles.leftPanel}>
          <NotesPanel
            category={category}
            topic={topic}
            subtopic={subtopic}
            sortOrder={parseInt(sortOrder)}
            className={styles.notesContainer}
          />
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
                
                {/* Smooth Response Display (no cursor) */}
                {isTyping && (
                  <div className={`${styles.messageContainer} ${styles.messageContainerAi}`}>
                    <div className={styles.aiAvatarContainer}>
                      {renderAIAvatar('small')}
                    </div>
                    <div className={`${styles.messageBubble} ${styles.messageBubbleAi}`}>
                      <div className={styles.messageText}>
                        <div className={styles.formattedResponse}>
                          {formatAIResponse(typingText)}
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
            {/* Conversation Enhancement Indicators */}
            <div className={styles.conversationIndicators}>
              <div className={styles.responseMode}>
                <span className={styles.indicatorLabel}>Response Mode:</span>
                <button 
                  className={`${styles.modeBtn} ${responseQuality === 'fast' ? styles.active : ''}`}
                  onClick={() => setResponseQuality('fast')}
                  title="Faster, concise responses"
                >
                  <Zap className="w-4 h-4" /> Fast
                </button>
                <button 
                  className={`${styles.modeBtn} ${responseQuality === 'detailed' ? styles.active : ''}`}
                  onClick={() => setResponseQuality('detailed')}
                  title="Detailed, comprehensive responses"
                >
                  <BookOpen className="w-4 h-4" /> Detailed
                </button>
              </div>
              {lastResponseTime > 0 && (
                <div className={styles.responseTime}>
                  <span className={styles.timeIndicator}>
                    Last response: {(lastResponseTime / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
            </div>
            
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
