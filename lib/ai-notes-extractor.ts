import Database from './database';

export class AINotesExtractor {
  
  // Extract structured learning content from AI conversation
  static async extractLearningContent(aiResponse: string, _userMessage?: string): Promise<{
    definitions: Array<{term: string, definition: string}>,
    analogies: Array<{concept: string, analogy: string}>,
    keyInsights: Array<string>,
    examples: Array<{concept: string, example: string}>
  }> {
    
    const content = {
      definitions: [] as Array<{term: string, definition: string}>,
      analogies: [] as Array<{concept: string, analogy: string}>,
      keyInsights: [] as Array<string>,
      examples: [] as Array<{concept: string, example: string}>
    };

    // Extract definitions (patterns like "X is", "X means", "X refers to")
    const definitionPatterns = [
      /(?:^|\n)(?:\*\*)?([A-Z][a-zA-Z\s]+?)(?:\*\*)?\s+(?:is|means|refers to|represents)\s+(.+?)(?:\n|$)/gi,
      /(?:^|\n)(?:\*\*)?Definition(?:\*\*)?:?\s*([A-Z][a-zA-Z\s]+?)\s*[-–—]\s*(.+?)(?:\n|$)/gi,
      /(?:^|\n)(?:\*\*)?([A-Z][a-zA-Z\s]+?)(?:\*\*)?\s*:\s*(.+?)(?:\n|$)/gi
    ];

    definitionPatterns.forEach(pattern => {
      const matches = aiResponse.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[2] && match[1].length < 50 && match[2].length < 200) {
          content.definitions.push({
            term: match[1].trim(),
            definition: match[2].trim()
          });
        }
      }
    });

    // Extract analogies (patterns like "like", "similar to", "think of it as")
    const analogyPatterns = [
      /(?:think of|imagine|like|similar to|just like|it's like)\s+(.+?)\s+(?:where|with|that|which)\s+(.+?)(?:\.|!|\n|$)/gi,
      /(?:^|\n)(?:\*\*)?([A-Z][a-zA-Z\s]+?)(?:\*\*)?\s+(?:is like|works like|similar to)\s+(.+?)(?:\n|$)/gi
    ];

    analogyPatterns.forEach(pattern => {
      const matches = aiResponse.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[2]) {
          content.analogies.push({
            concept: match[1].trim(),
            analogy: match[2].trim()
          });
        }
      }
    });

    // Extract key insights (patterns with emphasis, important points)
    const insightPatterns = [
      /(?:^|\n)(?:\*\*)?(?:Key point|Important|Remember|Note|Insight)(?:\*\*)?:?\s*(.+?)(?:\n|$)/gi,
      /(?:^|\n)(?:\*\*)?(.+?)(?:\*\*)?\s+(?:is crucial|is important|is key|is essential)(?:\.|!|\n|$)/gi,
      /(?:^|\n)- (.+?provides? O\(.+?\).+?)(?:\n|$)/gi // Big-O insights
    ];

    insightPatterns.forEach(pattern => {
      const matches = aiResponse.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length < 150) {
          content.keyInsights.push(match[1].trim());
        }
      }
    });

    // Extract examples (code examples, use cases)
    const examplePatterns = [
      /(?:^|\n)(?:\*\*)?Example(?:\*\*)?:?\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/gi,
      /(?:^|\n)(?:\*\*)?For example(?:\*\*)?:?\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/gi,
      /(?:^|\n)(?:\*\*)?Use case(?:\*\*)?:?\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/gi
    ];

    examplePatterns.forEach(pattern => {
      const matches = aiResponse.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length < 300) {
          content.examples.push({
            concept: 'General Example',
            example: match[1].trim()
          });
        }
      }
    });

    return content;
  }

  // Update or create notes for a specific learning session
  static async updateLearningNotes(
    userId: number,
    category: string,
    topic: string,
    subtopic: string,
    sortOrder: number,
    aiResponse: string,
    userMessage: string
  ) {
    try {
      // Extract learning content from AI response
      const extractedContent = await this.extractLearningContent(aiResponse, userMessage);

      // Get existing notes
      const existingNotes = await Database.query(
        'SELECT * FROM ai_learning_notes WHERE user_id = ? AND category = ? AND topic = ? AND subtopic = ? AND sort_order = ?',
        [userId, category, topic, subtopic, sortOrder]
      ) as Array<Record<string, unknown>>;

      if (existingNotes.length > 0) {
        // Update existing notes by merging new content
        const existing = existingNotes[0] as Record<string, unknown>;
        const mergedDefinitions = this.mergeContent(
          JSON.parse((existing.definitions as string) || '[]'), 
          extractedContent.definitions, 
          'term'
        );
        const mergedAnalogies = this.mergeContent(
          JSON.parse((existing.analogies as string) || '[]'), 
          extractedContent.analogies, 
          'concept'
        );
        const mergedInsights = this.mergeArrayContent(
          JSON.parse((existing.key_insights as string) || '[]'), 
          extractedContent.keyInsights
        );
        const mergedExamples = this.mergeContent(
          JSON.parse((existing.examples as string) || '[]'), 
          extractedContent.examples, 
          'concept'
        );

        await Database.query(
          `UPDATE ai_learning_notes SET 
            definitions = ?, analogies = ?, key_insights = ?, examples = ?,
            conversation_context = CONCAT(COALESCE(conversation_context, ''), '\n---\n', ?),
            last_ai_update = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [
            JSON.stringify(mergedDefinitions),
            JSON.stringify(mergedAnalogies),
            JSON.stringify(mergedInsights),
            JSON.stringify(mergedExamples),
            `User: ${userMessage}\nAI: ${aiResponse.substring(0, 500)}...`,
            (existing.id as number)
          ]
        );
      } else {
        // Create new notes
        await Database.query(
          `INSERT INTO ai_learning_notes 
            (user_id, category, topic, subtopic, sort_order, definitions, analogies, key_insights, examples, conversation_context)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            category,
            topic,
            subtopic,
            sortOrder,
            JSON.stringify(extractedContent.definitions),
            JSON.stringify(extractedContent.analogies),
            JSON.stringify(extractedContent.keyInsights),
            JSON.stringify(extractedContent.examples),
            `User: ${userMessage}\nAI: ${aiResponse.substring(0, 500)}...`
          ]
        );
      }

      return true;
    } catch (error) {
      console.error('Error updating learning notes:', error);
      return false;
    }
  }

  // Helper function to merge content arrays without duplicates
  private static mergeContent(existing: Array<Record<string, unknown>>, newContent: Array<Record<string, unknown>>, keyField: string): Array<Record<string, unknown>> {
    const merged = [...existing];
    
    newContent.forEach(newItem => {
      const exists = merged.some(existingItem => 
        String(existingItem[keyField] || '').toLowerCase() === String(newItem[keyField] || '').toLowerCase()
      );
      
      if (!exists) {
        merged.push(newItem);
      }
    });
    
    return merged;
  }

  // Helper function to merge simple arrays without duplicates
  private static mergeArrayContent(existing: string[], newContent: string[]): string[] {
    const merged = [...existing];
    
    newContent.forEach(newItem => {
      const exists = merged.some(existingItem => 
        existingItem.toLowerCase().includes(newItem.toLowerCase()) ||
        newItem.toLowerCase().includes(existingItem.toLowerCase())
      );
      
      if (!exists) {
        merged.push(newItem);
      }
    });
    
    return merged;
  }

  // Get notes for a specific learning session
  static async getLearningNotes(
    userId: number,
    category: string,
    topic: string,
    subtopic: string,
    sortOrder: number
  ) {
    try {
      const notes = await Database.query(
        'SELECT * FROM ai_learning_notes WHERE user_id = ? AND category = ? AND topic = ? AND subtopic = ? AND sort_order = ?',
        [userId, category, topic, subtopic, sortOrder]
      ) as Array<Record<string, unknown>>;

      if (notes.length > 0) {
        const note = notes[0] as Record<string, unknown>;
        return {
          id: note.id as number,
          definitions: JSON.parse((note.definitions as string) || '[]'),
          analogies: JSON.parse((note.analogies as string) || '[]'),
          keyInsights: JSON.parse((note.key_insights as string) || '[]'),
          examples: JSON.parse((note.examples as string) || '[]'),
          learningPath: JSON.parse((note.learning_path as string) || '[]'),
          connections: JSON.parse((note.connections as string) || '[]'),
          conversationSummary: (note.conversation_summary as string) || '',
          personalNotes: (note.personal_notes as string) || '',
          userHighlights: JSON.parse((note.user_highlights as string) || '[]'),
          customTags: JSON.parse((note.custom_tags as string) || '[]'),
          lastUpdated: note.last_ai_update as string
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting learning notes:', error);
      return null;
    }
  }

  // Update user's personal notes
  static async updatePersonalNotes(
    noteId: number,
    personalNotes: string,
    userHighlights: Array<Record<string, unknown>> = [],
    customTags: string[] = []
  ) {
    try {
      await Database.query(
        `UPDATE ai_learning_notes SET 
          personal_notes = ?, user_highlights = ?, custom_tags = ?, last_user_update = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [personalNotes, JSON.stringify(userHighlights), JSON.stringify(customTags), noteId]
      );
      return true;
    } catch (error) {
      console.error('Error updating personal notes:', error);
      return false;
    }
  }
}
