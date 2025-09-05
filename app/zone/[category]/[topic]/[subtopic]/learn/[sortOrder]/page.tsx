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
        <div className="w-3/10 bg-slate-800/20 backdrop-blur-sm border-r border-slate-700/50 p-6">
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-8 max-w-sm">
              <Code className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold text-white mb-3">Work in Progress</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Advanced features and interactive tools will be implemented here soon.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - 70% - LOOPAI Chat */}
        <div className="w-7/10 flex flex-col bg-slate-900/20 backdrop-blur-sm">
          {/* Chat Header */}
          <div className="bg-slate-800/30 border-b border-slate-700/50 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">LOOPAI Assistant</h2>
                <p className="text-sm text-slate-400">Your AI coding tutor for {subtopicDisplay}</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 mt-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <p>Ask me anything about {subtopicDisplay}!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.message_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.message_type === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}>
                    {msg.message_type === 'user' ? msg.message : msg.response}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-slate-700/50 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this problem..."
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
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
