import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Brain, 
  RefreshCw, 
  Search, 
  Globe, 
  Lightbulb, 
  FileText, 
  Target, 
  Link, 
  Edit3, 
  Plus, 
  Save, 
  X, 
  ChevronDown,
  BarChart3 
} from 'lucide-react';
import styles from './NotesPanel.module.css';

interface Note {
  id: number;
  definitions: Array<{term: string, definition: string}>;
  analogies: Array<{concept: string, analogy: string}>;
  keyInsights: Array<string>;
  examples: Array<{concept: string, example: string}>;
  learningPath: Array<string>;
  connections: Array<string>;
  conversationSummary: string;
  personalNotes: string;
  userHighlights: Array<Record<string, unknown>>;
  customTags: Array<string>;
  lastUpdated: string;
}

interface NotesPanelProps {
  category: string;
  topic: string;
  subtopic: string;
  sortOrder: number;
  className?: string;
}

const NotesPanel: React.FC<NotesPanelProps> = ({
  category,
  topic,
  subtopic,
  sortOrder,
  className = ''
}) => {
  const [notes, setNotes] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [personalNotes, setPersonalNotes] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    definitions: true,
    analogies: true,
    insights: true,
    examples: true,
    learningPath: true,
    connections: true,
    personal: true
  });

  // Debug log to verify component is rendering
  console.log('NotesPanel rendering with props:', { category, topic, subtopic, sortOrder });

  const fetchNotes = async () => {
    try {
      setLoading(true);
      console.log('Fetching notes for:', { category, topic, subtopic, sortOrder });
      
      const response = await fetch(
        `/api/ai-notes?category=${category}&topic=${topic}&subtopic=${subtopic}&sortOrder=${sortOrder}`
      );
      
      console.log('Notes fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Notes fetch data:', data);
        setNotes(data.notes);
        setPersonalNotes(data.notes?.personalNotes || '');
      } else {
        console.warn('Notes fetch failed:', response.status, response.statusText);
        // Don't fail silently - show empty state with generate button
        setNotes(null);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      // Don't fail silently - show empty state with generate button
      setNotes(null);
    } finally {
      setLoading(false);
    }
  };

  const generateNotes = async () => {
    try {
      setIsGenerating(true);
      console.log('Generating notes for:', { category, topic, subtopic, sortOrder });
      
      const response = await fetch('/api/ai-notes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          topic,
          subtopic,
          sortOrder
        })
      });

      console.log('Generate notes response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Generate notes result:', result);
        // Refresh notes after generation
        await fetchNotes();
      } else {
        const errorText = await response.text();
        console.error('Failed to generate notes:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error generating notes:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Fetch notes when component mounts or location changes
  useEffect(() => {
    fetchNotes();
  }, [category, topic, subtopic, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const savePersonalNotes = async () => {
    if (!notes) return;

    try {
      const response = await fetch('/api/ai-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          noteId: notes.id,
          personalNotes,
          userHighlights: notes.userHighlights,
          customTags: notes.customTags
        })
      });

      if (response.ok) {
        setIsEditing(false);
        // Update local notes
        setNotes(prev => prev ? { ...prev, personalNotes } : null);
      }
    } catch (error) {
      console.error('Error saving personal notes:', error);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className={`${styles.notesPanel} ${className}`}>
        <div className={styles.header}>
          <h3><BookOpen size={16} /> Learning Notes</h3>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading notes...</p>
        </div>
      </div>
    );
  }

  if (!notes) {
    return (
      <div className={`${styles.notesPanel} ${className}`}>
        <div className={styles.header}>
          <h3><BookOpen size={16} /> Learning Notes</h3>
          <div className={styles.headerActions}>
            <button 
              className={styles.generateBtn}
              onClick={generateNotes}
              disabled={isGenerating}
              title="Generate notes from conversation"
            >
              <Brain size={14} /> {isGenerating ? 'Generating...' : 'Generate'}
            </button>
            <button 
              className={styles.refreshBtn}
              onClick={fetchNotes}
              title="Refresh notes"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
        <div className={styles.emptyState}>
          <p><Lightbulb size={16} /> No notes yet - click Generate to create AI learning notes!</p>
          <small>AI will analyze your conversations and create structured learning content</small>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.notesPanel} ${className}`}>
      <div className={styles.header}>
        <h3><BookOpen size={16} /> Learning Notes</h3>
        <div className={styles.headerActions}>
          <button 
            className={styles.generateBtn}
            onClick={generateNotes}
            disabled={isGenerating}
            title="Generate notes from conversation"
          >
            <Brain size={14} /> {isGenerating ? 'Generating...' : 'Generate'}
          </button>
          <button 
            className={styles.refreshBtn}
            onClick={fetchNotes}
            title="Refresh notes"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className={styles.notesContent}>
        {/* Definitions Section */}
        {notes.definitions.length > 0 && (
          <div className={styles.section}>
            <button 
              className={styles.sectionHeader}
              onClick={() => toggleSection('definitions')}
            >
              <span><Search size={14} /> Definitions ({notes.definitions.length})</span>
              <ChevronDown size={14} className={expandedSections.definitions ? styles.expanded : styles.collapsed} />
            </button>
            {expandedSections.definitions && (
              <div className={styles.sectionContent}>
                {notes.definitions.map((def, index) => (
                  <div key={index} className={styles.definitionItem}>
                    <strong className={styles.term}>{def.term}</strong>
                    <p className={styles.definition}>{def.definition}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analogies Section */}
        {notes.analogies.length > 0 && (
          <div className={styles.section}>
            <button 
              className={styles.sectionHeader}
              onClick={() => toggleSection('analogies')}
            >
              <span><Globe size={14} /> Real-World Analogies ({notes.analogies.length})</span>
              <ChevronDown size={14} className={expandedSections.analogies ? styles.expanded : styles.collapsed} />
            </button>
            {expandedSections.analogies && (
              <div className={styles.sectionContent}>
                {notes.analogies.map((analogy, index) => (
                  <div key={index} className={styles.analogyItem}>
                    <strong className={styles.concept}>{analogy.concept}</strong>
                    <p className={styles.analogy}><Lightbulb size={12} /> {analogy.analogy}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Key Insights Section */}
        {notes.keyInsights.length > 0 && (
          <div className={styles.section}>
            <button 
              className={styles.sectionHeader}
              onClick={() => toggleSection('insights')}
            >
              <span><Lightbulb size={14} /> Key Insights ({notes.keyInsights.length})</span>
              <ChevronDown size={14} className={expandedSections.insights ? styles.expanded : styles.collapsed} />
            </button>
            {expandedSections.insights && (
              <div className={styles.sectionContent}>
                {notes.keyInsights.map((insight, index) => (
                  <div key={index} className={styles.insightItem}>
                    <p><Target size={12} /> {insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Examples Section */}
        {notes.examples.length > 0 && (
          <div className={styles.section}>
            <button 
              className={styles.sectionHeader}
              onClick={() => toggleSection('examples')}
            >
              <span><FileText size={14} /> Examples ({notes.examples.length})</span>
              <ChevronDown size={14} className={expandedSections.examples ? styles.expanded : styles.collapsed} />
            </button>
            {expandedSections.examples && (
              <div className={styles.sectionContent}>
                {notes.examples.map((example, index) => (
                  <div key={index} className={styles.exampleItem}>
                    <strong className={styles.exampleConcept}>{example.concept}</strong>
                    <p className={styles.example}>{example.example}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Learning Path Section */}
        {notes.learningPath && notes.learningPath.length > 0 && (
          <div className={styles.section}>
            <button 
              className={styles.sectionHeader}
              onClick={() => toggleSection('learningPath')}
            >
              <span><Target size={14} /> Learning Journey ({notes.learningPath.length})</span>
              <ChevronDown size={14} className={expandedSections.learningPath ? styles.expanded : styles.collapsed} />
            </button>
            {expandedSections.learningPath && (
              <div className={styles.sectionContent}>
                {notes.learningPath.map((step, index) => (
                  <div key={index} className={styles.learningPathItem}>
                    <span className={styles.stepNumber}>{index + 1}</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Connections Section */}
        {notes.connections && notes.connections.length > 0 && (
          <div className={styles.section}>
            <button 
              className={styles.sectionHeader}
              onClick={() => toggleSection('connections')}
            >
              <span><Link size={14} /> Related Concepts ({notes.connections.length})</span>
              <ChevronDown size={14} className={expandedSections.connections ? styles.expanded : styles.collapsed} />
            </button>
            {expandedSections.connections && (
              <div className={styles.sectionContent}>
                {notes.connections.map((connection, index) => (
                  <div key={index} className={styles.connectionItem}>
                    <p><Link size={12} /> {connection}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Personal Notes Section */}
        <div className={styles.section}>
          <button 
            className={styles.sectionHeader}
            onClick={() => toggleSection('personal')}
          >
            <span><Edit3 size={14} /> My Personal Notes</span>
            <ChevronDown size={14} className={expandedSections.personal ? styles.expanded : styles.collapsed} />
          </button>
          {expandedSections.personal && (
            <div className={styles.sectionContent}>
              {isEditing ? (
                <div className={styles.editMode}>
                  <textarea
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    placeholder="Add your personal notes, insights, and thoughts here..."
                    className={styles.personalNotesTextarea}
                    rows={6}
                  />
                  <div className={styles.editActions}>
                    <button 
                      className={styles.saveBtn}
                      onClick={savePersonalNotes}
                    >
                      <Save size={12} /> Save
                    </button>
                    <button 
                      className={styles.cancelBtn}
                      onClick={() => {
                        setIsEditing(false);
                        setPersonalNotes(notes.personalNotes || '');
                      }}
                    >
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.viewMode}>
                  {personalNotes ? (
                    <div className={styles.personalNotesContent}>
                      <p>{personalNotes}</p>
                      <button 
                        className={styles.editBtn}
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                    </div>
                  ) : (
                    <div className={styles.emptyPersonalNotes}>
                      <p>No personal notes yet</p>
                      <button 
                        className={styles.addNotesBtn}
                        onClick={() => setIsEditing(true)}
                      >
                        <Plus size={12} /> Add Notes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className={styles.statsFooter}>
          <div className={styles.stats}>
            <span><BarChart3 size={14} /> Progress</span>
            <div className={styles.statsList}>
              <span>Concepts: {notes.definitions.length + notes.analogies.length}</span>
              <span>Insights: {notes.keyInsights.length}</span>
            </div>
          </div>
          <div className={styles.lastUpdated}>
            <small>Last updated: {new Date(notes.lastUpdated).toLocaleString()}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
