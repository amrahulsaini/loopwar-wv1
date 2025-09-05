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

      if (response.ok) {
        const data = await response.json();
        // Add the new messages to the list
        setMessages(prev => [
          ...prev,
          { message: userMessage, response: '', message_type: 'user', created_at: new Date().toISOString() },
          { message: '', response: data.response, message_type: 'ai', created_at: new Date().toISOString() }
        ]);
      } else {
        console.error('Error sending message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-slate-800/30 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/zone/${category}/${topic}/${subtopic}`}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Logo />
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-400">
                <span className="hover:text-purple-400 transition-colors">{categoryDisplay}</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
                <span className="hover:text-purple-400 transition-colors">{topicDisplay}</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
                <span className="hover:text-purple-400 transition-colors">{subtopicDisplay}</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-semibold animate-pulse">LOOPAI Workspace</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-white">Problem #{sortOrder}</div>
                <div className="text-xs text-slate-400 flex items-center">
                  <Bot className="w-3 h-3 mr-1 text-purple-400 animate-pulse" />
                  AI Learning Session
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex min-h-[calc(100vh-4rem)] relative z-10">
        {/* Left Side - 30% - Future Work Placeholder */}
        <div className="w-30-percent bg-gradient-to-br from-slate-800/30 via-slate-800/20 to-slate-900/30 backdrop-blur-xl border-r border-slate-700/30 p-6 relative overflow-hidden" style={{ width: '30%' }}>
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
          
          <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
            <div className="bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60 backdrop-blur-sm border border-slate-600/40 rounded-3xl p-8 max-w-sm shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-105">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-400/20">
                  <Code className="w-16 h-16 text-purple-400 mx-auto animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Work in Progress</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Advanced AI-powered tools and interactive features will be available here soon.
              </p>
              <div className="mt-6 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-300"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - 70% - LOOPAI Chat */}
        <div className="w-70-percent flex flex-col bg-gradient-to-br from-slate-900/30 via-slate-800/20 to-slate-900/40 backdrop-blur-xl relative overflow-hidden" style={{ width: '70%' }}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/10 via-transparent to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-500/10 via-transparent to-transparent rounded-full blur-3xl"></div>
          
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-slate-800/40 via-slate-800/30 to-slate-800/40 backdrop-blur-xl border-b border-slate-700/30 p-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-50 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                  <Bot className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-1 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  LOOPAI Assistant
                </h2>
                <p className="text-sm text-slate-400 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Ready to help with {subtopicDisplay}
                </p>
              </div>
              <div className="hidden sm:flex items-center space-x-3">
                <div className="px-4 py-2 bg-slate-700/50 rounded-full border border-slate-600/50">
                  <span className="text-xs text-slate-300 font-medium">Problem #{sortOrder}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 mt-16">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-full flex items-center justify-center mx-auto border border-slate-600/50 shadow-2xl">
                    <Bot className="w-10 h-10 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">Welcome to LOOPAI!</h3>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                  I&apos;m here to help you understand <span className="text-purple-400 font-medium">{subtopicDisplay}</span>. 
                  Ask me anything about concepts, algorithms, or implementation details!
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.message_type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                  <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm border relative ${
                    msg.message_type === 'user'
                      ? 'bg-gradient-to-r from-purple-600/90 to-purple-700/90 text-white border-purple-500/30 ml-4'
                      : 'bg-gradient-to-r from-slate-800/90 via-slate-700/80 to-slate-800/90 text-slate-200 border-slate-600/30 mr-4'
                  }`}>
                    {msg.message_type === 'ai' && (
                      <div className="absolute -left-3 top-4 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="text-sm leading-relaxed">
                      {msg.message_type === 'user' ? msg.message : msg.response}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-slate-700/30 p-6 bg-gradient-to-r from-slate-800/20 via-slate-800/30 to-slate-800/20 backdrop-blur-xl relative z-10">
            <div className="flex space-x-4 items-end">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about this problem..."
                  className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-2xl px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm shadow-lg"
                  disabled={isLoading}
                />
                {inputMessage && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 disabled:from-slate-600 disabled:via-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white px-6 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-purple-500/25 hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-800/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50">
            <span className="text-slate-400 text-sm mr-2">Powered by</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">
              LOOPAI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
