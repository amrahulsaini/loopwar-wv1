'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  ArrowLeft,
  Plus,
  Save,
  AlertCircle,
  CheckCircle2,
  Database,
  BookOpen,
  Target
} from 'lucide-react';
import Logo from '../../../components/Logo';

interface Category {
  id: number;
  name: string;
}

interface Topic {
  id: number;
  name: string;
  category_id: number;
}

interface Subtopic {
  id: number;
  name: string;
  topic_id: number;
}

interface ProblemForm {
  categoryId: string;
  topicId: string;
  subtopicId: string;
  problemName: string;
  problemDescription: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function AddProblemPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form data
  const [formData, setFormData] = useState<ProblemForm>({
    categoryId: '',
    topicId: '',
    subtopicId: '',
    problemName: '',
    problemDescription: '',
    difficulty: 'Easy'
  });

  // Dropdown data
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);

  // Filtered data
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [filteredSubtopics, setFilteredSubtopics] = useState<Subtopic[]>([]);

  useEffect(() => {
    // Check admin authentication
    const adminSession = localStorage.getItem('admin-session');
    if (!adminSession || adminSession !== 'true') {
      router.push('/admin');
      return;
    }
    setIsAuthenticated(true);
    loadFormData();
  }, [router]);

  const loadFormData = async () => {
    setIsLoading(true);
    try {
      // Fetch categories, topics, and subtopics from admin API
      const categoriesRes = await fetch('/api/admin/categories');

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        if (data.success) {
          setCategories(data.categories || []);
          setTopics(data.topics || []);
          setSubtopics(data.subtopics || []);
        } else {
          console.error('Failed to fetch categories:', data.message);
          setMessage({ type: 'error', text: 'Failed to load categories data.' });
        }
      } else {
        console.error('API request failed');
        setMessage({ type: 'error', text: 'Failed to connect to database.' });
      }
    } catch (error) {
      console.error('Error loading form data:', error);
      setMessage({ type: 'error', text: 'Failed to load form data. Please refresh the page.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryId,
      topicId: '',
      subtopicId: ''
    }));

    if (categoryId) {
      const filtered = topics.filter(topic => topic.category_id === parseInt(categoryId));
      setFilteredTopics(filtered);
    } else {
      setFilteredTopics([]);
    }
    setFilteredSubtopics([]);
  };

  const handleTopicChange = (topicId: string) => {
    setFormData(prev => ({
      ...prev,
      topicId,
      subtopicId: ''
    }));

    if (topicId) {
      const filtered = subtopics.filter(subtopic => subtopic.topic_id === parseInt(topicId));
      setFilteredSubtopics(filtered);
    } else {
      setFilteredSubtopics([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage({ type: '', text: '' }); // Clear message when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/admin/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          category_id: parseInt(formData.categoryId),
          topic_id: parseInt(formData.topicId),
          subtopic_id: parseInt(formData.subtopicId),
          problem_name: formData.problemName,
          problem_description: formData.problemDescription,
          difficulty: formData.difficulty
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Problem added successfully!' });
        // Reset form
        setFormData({
          categoryId: '',
          topicId: '',
          subtopicId: '',
          problemName: '',
          problemDescription: '',
          difficulty: 'Easy'
        });
        setFilteredTopics([]);
        setFilteredSubtopics([]);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to add problem. Please try again.' });
      }
    } catch (error) {
      console.error('Error adding problem:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="admin-add-problem">
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
                <span>→</span>
                <span>Add Problem</span>
              </div>
            </div>
            
            <div className="admin-header-right">
              <Link href="/admin/dashboard" className="back-btn">
                <ArrowLeft size={16} />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <div className="container">
          <div className="add-problem-content">
            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">Add New Problem</h1>
              <p className="page-subtitle">
                Create a new problem and assign it to a specific subtopic
              </p>
            </div>

            {/* Form */}
            <div className="problem-form-container">
              <form onSubmit={handleSubmit} className="problem-form">
                {/* Message */}
                {message.text && (
                  <div className={`form-message ${message.type}`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{message.text}</span>
                  </div>
                )}

                {/* Category Selection */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="categoryId" className="form-label">
                      <Database size={16} />
                      <span>Category</span>
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="form-select"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="topicId" className="form-label">
                      <BookOpen size={16} />
                      <span>Topic</span>
                    </label>
                    <select
                      id="topicId"
                      name="topicId"
                      value={formData.topicId}
                      onChange={(e) => handleTopicChange(e.target.value)}
                      className="form-select"
                      required
                      disabled={!formData.categoryId || isLoading}
                    >
                      <option value="">Select a topic</option>
                      {filteredTopics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subtopicId" className="form-label">
                      <Target size={16} />
                      <span>Subtopic</span>
                    </label>
                    <select
                      id="subtopicId"
                      name="subtopicId"
                      value={formData.subtopicId}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                      disabled={!formData.topicId || isLoading}
                    >
                      <option value="">Select a subtopic</option>
                      {filteredSubtopics.map((subtopic) => (
                        <option key={subtopic.id} value={subtopic.id}>
                          {subtopic.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Problem Details */}
                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="problemName" className="form-label">
                      <Plus size={16} />
                      <span>Problem Name</span>
                    </label>
                    <input
                      type="text"
                      id="problemName"
                      name="problemName"
                      value={formData.problemName}
                      onChange={handleInputChange}
                      placeholder="Enter problem name (e.g., Two Sum, Binary Tree Traversal)"
                      className="form-input"
                      required
                      maxLength={255}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="problemDescription" className="form-label">
                      <span>Problem Description</span>
                    </label>
                    <textarea
                      id="problemDescription"
                      name="problemDescription"
                      value={formData.problemDescription}
                      onChange={handleInputChange}
                      placeholder="Describe the problem in detail. Include what the problem is asking for, any constraints, and examples if needed."
                      className="form-textarea"
                      required
                      rows={6}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="difficulty" className="form-label">
                      <span>Difficulty Level</span>
                    </label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="submit-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="loading-spinner small"></div>
                        <span>Adding Problem...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Add Problem</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
