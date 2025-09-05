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
  MessageSquare,
  Zap,
  Rocket,
  Star
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
                <span className="text-purple-400 font-semibold animate-pulse">Learn Mode</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-white">Problem #{sortOrder}</div>
                <div className="text-xs text-slate-400 flex items-center">
                  <Zap className="w-3 h-3 mr-1 text-yellow-400 animate-pulse" />
                  Learning Session
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] p-8 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full mb-8 shadow-2xl animate-glow relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full animate-ping opacity-20"></div>
              <Bot className="w-16 h-16 text-white relative z-10 animate-bounce" />
            </div>

            <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 via-pink-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
              LOOPAI WORKSPACE
            </h1>

            <div className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-8 backdrop-blur-sm animate-fade-in-up animation-delay-300">
              <span className="text-purple-300 font-semibold text-lg flex items-center">
                <Rocket className="w-5 h-5 mr-2 animate-bounce" />
                🚀 Coming Soon
              </span>
            </div>

            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-500">
              Experience the future of coding education with our AI-powered learning assistant.
              Interactive explanations, personalized guidance, and intelligent problem-solving support.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 group animate-fade-in-up animation-delay-700">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-8 h-8 text-blue-400 group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">AI-Powered Learning</h3>
              <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                Get personalized explanations and step-by-step guidance tailored to your learning style with advanced AI algorithms.
              </p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 group animate-fade-in-up animation-delay-900">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-8 h-8 text-green-400 group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-green-400 transition-colors">Interactive Chat</h3>
              <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                Ask questions in natural language and receive instant, contextual responses from our advanced AI tutor system.
              </p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 group animate-fade-in-up animation-delay-1100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-yellow-400 group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-yellow-400 transition-colors">Smart Insights</h3>
              <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                Receive intelligent hints, related problems, and learning recommendations based on your progress and performance.
              </p>
            </div>
          </div>

          {/* Implementation Status */}
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-3xl p-10 mb-12 backdrop-blur-sm animate-fade-in-up animation-delay-1300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-3">
                  <Code className="w-10 h-10 text-purple-400 animate-bounce" />
                  <h2 className="text-3xl font-bold text-white">Implementation in Progress</h2>
                  <Star className="w-10 h-10 text-yellow-400 animate-spin" />
                </div>
              </div>

              <p className="text-slate-300 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
                We&apos;re building the most advanced AI learning platform for coding education.
                This feature will revolutionize how developers learn and practice algorithms with cutting-edge AI technology.
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center space-x-3 bg-slate-800/50 px-6 py-3 rounded-xl hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 group">
                  <BookOpen className="w-5 h-5 text-blue-400 group-hover:animate-pulse" />
                  <span className="text-slate-300 font-medium group-hover:text-blue-400 transition-colors">Interactive Tutorials</span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-800/50 px-6 py-3 rounded-xl hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 group">
                  <Target className="w-5 h-5 text-green-400 group-hover:animate-pulse" />
                  <span className="text-slate-300 font-medium group-hover:text-green-400 transition-colors">Problem Analysis</span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-800/50 px-6 py-3 rounded-xl hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 group">
                  <Lightbulb className="w-5 h-5 text-yellow-400 group-hover:animate-pulse" />
                  <span className="text-slate-300 font-medium group-hover:text-yellow-400 transition-colors">Smart Hints</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up animation-delay-1500">
            <Link
              href={`/zone/${category}/${topic}/${subtopic}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-500/20 group"
            >
              <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
              Back to Problems
            </Link>

            <Link
              href="/zone"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30 animate-gradient-x group"
            >
              <span className="mr-3">Explore Zone</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-800/50 py-8 animate-fade-in-up animation-delay-2000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50 mb-4">
            <span className="text-slate-400 text-sm mr-2">Powered by</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">
              LOOPWAR
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            © 2025 LoopWar.dev - Revolutionizing coding education with AI
          </p>
        </div>
      </footer>
    </div>
  );
}
