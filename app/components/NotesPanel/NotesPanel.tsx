import React, { useState, useEffect } from 'react';
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

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/ai-notes?category=${category}&topic=${topic}&subtopic=${subtopic}&sortOrder=${sortOrder}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes);
        setPersonalNotes(data.notes?.personalNotes || '');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotes = async () => {
    try {
      setIsGenerating(true);
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

      if (response.ok) {
        // Refresh notes after generation
        await fetchNotes();
      } else {
        console.error('Failed to generate notes');
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
  }, [category, topic, subtopic, sortOrder]);

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
          <h3>📚 Learning Notes</h3>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Generating notes...</p>
        </div>
      </div>
    );
  }

  if (!notes) {
    return (
      <div className={`${styles.notesPanel} ${className}`}>
        <div className={styles.header}>
          <h3>📚 Learning Notes</h3>
        </div>
        <div className={styles.emptyState}>
          <p>💡 Start chatting with LOOPAI to generate notes!</p>
          <small>Notes will appear here as you learn</small>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.notesPanel} ${className}`}>
      <div className={styles.header}>
        <h3>📚 Learning Notes</h3>
        <div className={styles.headerActions}>
          <button 
            className={styles.generateBtn}
            onClick={generateNotes}
            disabled={isGenerating}
            title="Generate notes from conversation"
          >
            {isGenerating ? '🔄' : '🧠'} {isGenerating ? 'Generating...' : 'Generate'}
          </button>
          <button 
            className={styles.refreshBtn}
            onClick={fetchNotes}
            title="Refresh notes"
          >
            ↻
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
              <span>🔍 Definitions ({notes.definitions.length})</span>
              <span className={expandedSections.definitions ? styles.expanded : styles.collapsed}>▼</span>
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
              <span>🌍 Real-World Analogies ({notes.analogies.length})</span>
              <span className={expandedSections.analogies ? styles.expanded : styles.collapsed}>▼</span>
            </button>
            {expandedSections.analogies && (
              <div className={styles.sectionContent}>
                {notes.analogies.map((analogy, index) => (
                  <div key={index} className={styles.analogyItem}>
                    <strong className={styles.concept}>{analogy.concept}</strong>
                    <p className={styles.analogy}>💭 {analogy.analogy}</p>
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
              <span>💡 Key Insights ({notes.keyInsights.length})</span>
              <span className={expandedSections.insights ? styles.expanded : styles.collapsed}>▼</span>
            </button>
            {expandedSections.insights && (
              <div className={styles.sectionContent}>
                {notes.keyInsights.map((insight, index) => (
                  <div key={index} className={styles.insightItem}>
                    <p>⚡ {insight}</p>
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
              <span>📝 Examples ({notes.examples.length})</span>
              <span className={expandedSections.examples ? styles.expanded : styles.collapsed}>▼</span>
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
              <span>🎯 Learning Journey ({notes.learningPath.length})</span>
              <span className={expandedSections.learningPath ? styles.expanded : styles.collapsed}>▼</span>
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
              <span>🔗 Related Concepts ({notes.connections.length})</span>
              <span className={expandedSections.connections ? styles.expanded : styles.collapsed}>▼</span>
            </button>
            {expandedSections.connections && (
              <div className={styles.sectionContent}>
                {notes.connections.map((connection, index) => (
                  <div key={index} className={styles.connectionItem}>
                    <p>🔸 {connection}</p>
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
            <span>✏️ My Personal Notes</span>
            <span className={expandedSections.personal ? styles.expanded : styles.collapsed}>▼</span>
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
                      Save
                    </button>
                    <button 
                      className={styles.cancelBtn}
                      onClick={() => {
                        setIsEditing(false);
                        setPersonalNotes(notes.personalNotes || '');
                      }}
                    >
                      Cancel
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
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className={styles.emptyPersonalNotes}>
                      <p>No personal notes yet</p>
                      <button 
                        className={styles.addNotesBtn}
                        onClick={() => setIsEditing(true)}
                      >
                        Add Notes
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
            <span>📊 Progress</span>
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
