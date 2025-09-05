"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Brain,
  Sparkles,
  BookOpen,
  Target,
  Lightbulb,
  ChevronRight,
  Bot,
  Code,
  MessageSquare
} from 'lucide-react';
import Logo from '../../../../../../components/Logo';

export default function LearnModePage() {
  const params = useParams();
  const category = params.category as string;
  const topic = params.topic as string;
  const subtopic = params.subtopic as string;
  const sortOrder = params.sortOrder as string;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <span>{categoryDisplay}</span>
                <ChevronRight className="w-4 h-4" />
                <span>{topicDisplay}</span>
                <ChevronRight className="w-4 h-4" />
                <span>{subtopicDisplay}</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-purple-400">Learn Mode</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-white">Problem #{sortOrder}</div>
                <div className="text-xs text-slate-400">Learning Session</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8 shadow-2xl">
              <Bot className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              LOOPAI WORKSPACE
            </h1>

            <div className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-8">
              <span className="text-purple-300 font-medium">🚀 Coming Soon</span>
            </div>

            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Experience the future of coding education with our AI-powered learning assistant.
              Interactive explanations, personalized guidance, and intelligent problem-solving support.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Learning</h3>
              <p className="text-slate-400 text-sm">Get personalized explanations and step-by-step guidance tailored to your learning style.</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mb-4">
                <MessageSquare className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Interactive Chat</h3>
              <p className="text-slate-400 text-sm">Ask questions in natural language and receive instant, contextual responses from our AI tutor.</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-lg mb-4">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Insights</h3>
              <p className="text-slate-400 text-sm">Receive intelligent hints, related problems, and learning recommendations based on your progress.</p>
            </div>
          </div>

          {/* Implementation Status */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center mb-4">
              <Code className="w-8 h-8 text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Implementation in Progress</h2>
            </div>

            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              We're building the most advanced AI learning platform for coding education.
              This feature will revolutionize how developers learn and practice algorithms.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 bg-slate-800/50 px-4 py-2 rounded-lg">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300 text-sm">Interactive Tutorials</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800/50 px-4 py-2 rounded-lg">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-slate-300 text-sm">Problem Analysis</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800/50 px-4 py-2 rounded-lg">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300 text-sm">Smart Hints</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/zone/${category}/${topic}/${subtopic}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Problems
            </Link>

            <Link
              href="/zone"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Explore Zone
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 LoopWar.dev - Revolutionizing coding education with AI
          </p>
        </div>
      </footer>
    </div>
  );
}
