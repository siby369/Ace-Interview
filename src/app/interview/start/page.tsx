'use client';
import {
  generateInterviewQuestions,
  GenerateInterviewQuestionsOutput
} from '@/ai/flows/generate-interview-questions';
import { InterviewClientView } from '@/components/interview-client-view';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderCircle, TriangleAlert } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

// This is the key change to prevent static pre-rendering
export const dynamic = 'force-dynamic';

function InterviewStartContent() {
  const searchParams = useSearchParams();
  const [interviewData, setInterviewData] = useState<GenerateInterviewQuestionsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const roleName = searchParams.get('role') || 'Selected Role';
  const questionCount = parseInt(searchParams.get('questionCount') || '5', 10);
  
  useEffect(() => {
    const topics: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if(key !== 'role' && key !== 'questionCount') {
        topics[key] = value;
      }
    });

    if (Object.keys(topics).length === 0 && searchParams.toString()) {
      setError('No topics selected. Please go back and select topics for your interview.');
      setIsLoading(false);
      return;
    }

    async function fetchQuestions() {
      // Only fetch if topics are available
      if (Object.keys(topics).length > 0) {
        try {
          const result = await generateInterviewQuestions({ role: roleName, topics, questionCount });
          setInterviewData(result);
        } catch (e) {
          console.error(e);
          setError('Failed to generate interview questions. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      } else {
        // If there are no topics, we don't start loading.
        // This might happen on an initial, incorrect load.
        // We can either show an error or a default state.
        setIsLoading(false);
        setError('No topics selected. Please go back and select topics for your interview.');
      }
    }

    fetchQuestions();
  }, [searchParams, roleName, questionCount]);

  if (isLoading) {
      return (
      <div className="flex flex-col h-screen">
        <main className="flex-1 flex flex-col items-center justify-center p-4">
           <div className="w-full flex-1 flex flex-col items-center justify-center text-center gap-4 p-8 rounded-lg">
              <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
              <h3 className="text-xl font-semibold font-headline">
                Generating your custom interview...
              </h3>
              <p className="text-muted-foreground">The AI is preparing your questions. This should just take a moment.</p>
            </div>
        </main>
      </div>
      );
  }

  if (error || !interviewData) {
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
      <InterviewClientView initialInterviewData={interviewData} role={roleName} />
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
