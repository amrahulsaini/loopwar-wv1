import { notFound } from 'next/navigation';
import { Database } from '@/lib/database';
import LearningWorkspace from './LearningWorkspace-clean';

interface Props {
  params: {
    category: string;
    topic: string;
    subtopic: string;
    problemId: string;
  };
}

async function getProblemData(category: string, topic: string, subtopic: string, problemId: string) {
  try {
    const problems = await Database.query(`
      SELECT 
        p.id,
        p.problem_name,
        p.problem_description,
        p.difficulty,
        p.sort_order,
        c.name as category_name,
        c.slug as category_slug,
        t.name as topic_name,
        t.slug as topic_slug,
        st.name as subtopic_name,
        st.slug as subtopic_slug
      FROM problems p
      JOIN categories c ON p.category_id = c.id
      JOIN topics t ON p.topic_id = t.id
      JOIN subtopics st ON p.subtopic_id = st.id
      WHERE c.slug = ? AND t.slug = ? AND st.slug = ? AND p.sort_order = ? AND p.status = 'active'
      ORDER BY p.sort_order ASC
    `, [category, topic, subtopic, parseInt(problemId)]);

    if (problems.length === 0) {
      return null;
    }

    return {
      problem: problems[0],
      category,
      topic,
      subtopic,
      problemId: parseInt(problemId)
    };
  } catch (error) {
    console.error('Error fetching problem data:', error);
    return null;
  }
}

export default async function LearnWorkspacePage({ params }: Props) {
  const { category, topic, subtopic, problemId } = params;
  
  const problemData = await getProblemData(category, topic, subtopic, problemId);
  
  if (!problemData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <LearningWorkspace problemData={problemData} />
    </div>
  );
}
