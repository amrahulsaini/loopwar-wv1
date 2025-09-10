# Quiz System Documentation

## Overview

The Quiz System is a comprehensive testing platform that generates and manages different types of educational quizzes. It supports multiple question types, AI-powered generation, and detailed analytics.

## Features

### Question Types
1. **Multiple Choice Questions (MCQ)** - Traditional A, B, C, D format
2. **True/False Questions** - Simple boolean responses
3. **Logical Thinking Questions** - Open-ended analytical problems
4. **Fill in the Blanks** - Complete sentences with missing words

### AI Integration
- **Automatic Quiz Generation** using LoopAI
- **Contextual Questions** based on category, topic, and subtopic
- **Difficulty Progression** from easy to hard
- **Educational Explanations** for each question

### User Experience
- **Timed Quizzes** with countdown timer
- **Progress Tracking** with visual indicators
- **Instant Feedback** with explanations
- **Score Analytics** with detailed breakdown
- **Retry Functionality** for practice

## File Structure

```
app/zone/[category]/[topic]/[subtopic]/
├── quiz/
│   └── [sortOrder]/
│       ├── page.tsx       # Main quiz interface
│       └── quiz.css       # Quiz-specific styles
├── page.tsx               # Zone main page (with quiz mode)
└── ...

app/api/quiz/
├── [category]/[topic]/[subtopic]/[sortOrder]/
│   └── route.ts           # Get specific quiz
├── generate/
│   └── route.ts           # Generate new quiz with AI
└── result/
    └── route.ts           # Save quiz results

database/
└── quiz-schema.sql        # Database schema
```

## Database Schema

### Tables
1. **quizzes** - Main quiz metadata
2. **quiz_questions** - Individual questions and answers
3. **quiz_results** - User attempt records
4. **quiz_user_answers** - Individual answer tracking

### Key Fields
- `sort_order` - Links quizzes to problems by order
- `is_ai_generated` - Tracks AI vs manual creation
- `question_type` - Supports multiple question formats
- `correct_answer_type` - Handles different answer data types

## API Endpoints

### GET /api/quiz/[category]/[topic]/[subtopic]/[sortOrder]
Fetches a specific quiz with all questions.

**Response:**
```json
{
  "id": 1,
  "title": "JavaScript Basics Quiz",
  "description": "Test your JS knowledge",
  "category": "programming",
  "topic": "javascript",
  "subtopic": "basics",
  "sort_order": 1,
  "questions": [...],
  "time_limit": 30,
  "is_ai_generated": true
}
```

### POST /api/quiz/generate
Generates a new quiz using AI for the specified topic.

**Request:**
```json
{
  "category": "programming",
  "topic": "javascript",
  "subtopic": "basics",
  "sortOrder": 1
}
```

**Response:** Complete quiz object with generated questions.

### POST /api/quiz/result
Saves user quiz attempt results.

**Request:**
```json
{
  "quizId": 1,
  "userAnswers": [...],
  "score": 85,
  "totalQuestions": 10,
  "correctAnswers": 8,
  "timeSpent": 1200
}
```

## Usage Flow

1. **User navigates** to zone page → selects Quiz mode
2. **System checks** for existing quiz by sortOrder
3. **If no quiz exists** → Shows "Generate Quiz" option
4. **User generates quiz** → AI creates questions via LoopAI
5. **Quiz is saved** to database with proper linking
6. **User takes quiz** → Timed, interactive experience
7. **Results are saved** → Analytics and review available
8. **User can retry** → Reset quiz for practice

## Integration Points

### With LoopAI
- Quiz generation uses the existing AI chat API
- Structured prompts ensure consistent question format
- AI responses are parsed and validated before storage

### With Zone System
- Quizzes link to problems via `sort_order` parameter
- Same navigation pattern as learn/code modes
- Consistent styling with globals.css base theme

### With Database
- Reuses existing database connection patterns
- Follows established naming conventions
- Supports existing user authentication system

## Styling Guidelines

### CSS Classes
- `quiz-*` prefix for all quiz-specific styles
- Black and white base theme following globals.css
- Sora font family for consistency
- Responsive design for mobile/desktop

### Key Components
- `.quiz-container` - Main wrapper
- `.quiz-question-container` - Question display area
- `.quiz-option` - MCQ answer choices
- `.quiz-progress-bar` - Visual progress indicator
- `.quiz-results` - Score and analytics display

## Configuration

### Environment Variables
- Uses existing database configuration
- Requires `NEXT_PUBLIC_API_URL` for AI integration
- No additional environment setup needed

### Default Settings
- Quiz time limit: 30 minutes
- Questions per quiz: 10-15
- Point distribution: Easy (1), Medium (2), Hard (3)
- Auto-save results: Enabled

## Future Enhancements

### Planned Features
1. **Question Banks** - Reusable question libraries
2. **Custom Quizzes** - User-created quizzes
3. **Leaderboards** - Competitive scoring
4. **Study Modes** - Practice without timing
5. **Question Statistics** - Performance analytics per question

### Technical Improvements
1. **Real-time collaboration** - Multi-user quizzes
2. **Offline support** - Downloaded quiz taking
3. **Advanced AI** - Adaptive difficulty
4. **Export/Import** - Quiz sharing capabilities

## Troubleshooting

### Common Issues
1. **Quiz not generating** - Check AI service availability
2. **Database errors** - Verify schema is up to date
3. **Routing issues** - Ensure [sortOrder] directory exists
4. **Styling problems** - Check quiz.css import

### Debug Steps
1. Check browser console for API errors
2. Verify database connection and schema
3. Test AI endpoint separately
4. Validate quiz data format in database

## Contributing

When adding new question types:
1. Update `question_type` enum in database
2. Add rendering logic in quiz component
3. Update answer validation functions
4. Add corresponding CSS styles
5. Update AI generation prompts

## Security Considerations

- Quiz data is validated before database insertion
- User answers are sanitized to prevent injection
- Quiz generation rate-limited to prevent abuse
- Results are tied to authenticated users when possible
