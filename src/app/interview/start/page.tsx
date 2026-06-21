'use client';
import {
  generateSingleInterviewQuestion,
  GenerateSingleInterviewQuestionOutput
} from '@/ai/flows/generate-single-question';
import { InterviewClientView } from '@/components/interview-client-view';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

// This is the key change to prevent static pre-rendering
export const dynamic = 'force-dynamic';

function InterviewStartContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const roleName = searchParams.get('role') || 'Selected Role';
  const company = searchParams.get('company') || '';
  const rawJD = searchParams.get('jd') || '';
  const persona = searchParams.get('persona') || 'friendly';
  const questionCount = parseInt(searchParams.get('questionCount') || '5', 10);
  const codingOnly = searchParams.get('codingOnly') === 'true';
  const difficulty = searchParams.get('difficulty');
  
  const topics: Record<string, string> = {};
  let jdContext = null;
  searchParams.forEach((value, key) => {
    if(key !== 'role' && key !== 'questionCount' && key !== 'company' && key !== 'persona' && key !== 'jdContext' && key !== 'jd' && key !== 'codingOnly' && key !== 'difficulty') {
      topics[key] = value;
    } else if (key === 'jdContext') {
      try { jdContext = JSON.parse(value); } catch { /* ignore */ }
    }
  });

  if (error || (Object.keys(topics).length === 0 && !rawJD && !jdContext)) {
    return (
      <div className="flex flex-col h-screen">
        <main className="flex-1 flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-lg">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error ||
                'Could not load interview questions for this role. Please go back and try again.'}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <InterviewClientView
        initialInterviewData={{ questions: [] as GenerateSingleInterviewQuestionOutput[] }}
        role={roleName}
        company={company}
        persona={persona as any}
        topics={topics}
        targetQuestionCount={questionCount}
        jdContext={jdContext ?? undefined}
        rawJD={rawJD}
        codingOnly={codingOnly}
      />
    </div>
  );
}

export default function InterviewStartPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewStartContent />
    </Suspense>
  );
}
