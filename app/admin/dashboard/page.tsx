'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Plus,
  Database,
  BarChart3,
  LogOut,
  BookOpen,
  Code,
  Target,
  AlertCircle
} from 'lucide-react';
import Logo from '../../components/Logo';

interface DashboardStats {
  totalProblems: number;
  totalCategories: number;
  totalTopics: number;
  totalSubtopics: number;
  recentProblems: Array<{
    id: number;
    name: string;
    category: string;
    topic: string;
    subtopic: string;
    difficulty: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUsername, setAdminUsername] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalProblems: 0,
    totalCategories: 0,
    totalTopics: 0,
    totalSubtopics: 0,
    recentProblems: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check admin authentication
    const adminSession = localStorage.getItem('admin-session');
    const username = localStorage.getItem('admin-username');
    
    if (!adminSession || adminSession !== 'true' || !username) {
      router.push('/admin');
      return;
    }

    setAdminUsername(username);
    fetchDashboardStats();
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch dashboard statistics
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Use mock data if API fails
        setStats({
          totalProblems: 25,
          totalCategories: 8,
          totalTopics: 45,
          totalSubtopics: 150,
          recentProblems: [
            {
              id: 1,
              name: 'Two Sum',
              category: 'Core DSA',
              topic: 'Arrays and Matrices',
              subtopic: 'Array Fundamentals',
              difficulty: 'Easy',
              createdAt: new Date().toISOString()
            },
            {
              id: 2,
              name: 'Binary Tree Traversal',
              category: 'Core DSA',
              topic: 'Trees and Binary Trees',
              subtopic: 'Tree Traversals',
              difficulty: 'Medium',
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Use mock data on error
      setStats({
        totalProblems: 25,
        totalCategories: 8,
        totalTopics: 45,
        totalSubtopics: 150,
        recentProblems: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-session');
    localStorage.removeItem('admin-username');
    localStorage.removeItem('admin-login-time');
    router.push('/admin');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#22c55e';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div className="admin-header-left">
              <Link href="/" className="logo-link">
                <Logo />
              </Link>
              <div className="admin-breadcrumb">
                <Shield size={16} />
                <span>Admin Panel</span>
              </div>
            </div>
            
            <div className="admin-header-right">
              <span className="admin-welcome">Welcome, {adminUsername}</span>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <div className="container">
          {/* Dashboard Title */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">
              Manage problems, categories, and monitor platform statistics
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon problems">
                <Code size={24} />
              </div>
              <div className="stat-content">
                <h3>Total Problems</h3>
                <p className="stat-number">{stats.totalProblems}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon categories">
                <Database size={24} />
              </div>
              <div className="stat-content">
                <h3>Categories</h3>
                <p className="stat-number">{stats.totalCategories}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon topics">
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <h3>Topics</h3>
                <p className="stat-number">{stats.totalTopics}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon subtopics">
                <Target size={24} />
              </div>
              <div className="stat-content">
                <h3>Subtopics</h3>
                <p className="stat-number">{stats.totalSubtopics}</p>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="action-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="action-grid">
              <Link href="/admin/dashboard/add-problem" className="action-card primary">
                <div className="action-icon">
                  <Plus size={24} />
                </div>
                <div className="action-content">
                  <h3>Add New Problem</h3>
                  <p>Create and add problems to subtopics</p>
                </div>
              </Link>

              <Link href="/admin/dashboard/manage-problems" className="action-card">
                <div className="action-icon">
                  <Database size={24} />
                </div>
                <div className="action-content">
                  <h3>Manage Problems</h3>
                  <p>View, edit, and organize existing problems</p>
                </div>
              </Link>

              <Link href="/admin/dashboard/analytics" className="action-card">
                <div className="action-icon">
                  <BarChart3 size={24} />
                </div>
                <div className="action-content">
                  <h3>Analytics</h3>
                  <p>View platform statistics and insights</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Problems */}
          <div className="recent-section">
            <div className="section-header">
              <h2 className="section-title">Recent Problems</h2>
              <Link href="/admin/dashboard/manage-problems" className="view-all-btn">
                View All
              </Link>
            </div>

            {stats.recentProblems.length > 0 ? (
              <div className="recent-problems-grid">
                {stats.recentProblems.map((problem) => (
                  <div key={problem.id} className="problem-card">
                    <div className="problem-header">
                      <h4 className="problem-name">{problem.name}</h4>
                      <span 
                        className="problem-difficulty"
                        style={{ color: getDifficultyColor(problem.difficulty) }}
                      >
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="problem-path">
                      <span>{problem.category}</span>
                      <span>→</span>
                      <span>{problem.topic}</span>
                      <span>→</span>
                      <span>{problem.subtopic}</span>
                    </div>
                    <div className="problem-date">
                      Created: {new Date(problem.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <AlertCircle size={48} />
                <h3>No Problems Yet</h3>
                <p>Start by adding your first problem to the platform.</p>
                <Link href="/admin/dashboard/add-problem" className="add-first-problem-btn">
                  <Plus size={16} />
                  Add First Problem
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
