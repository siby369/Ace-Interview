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

function PanelInterviewStartContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const roleName = searchParams.get('role') || 'Selected Role';
  const panelString = searchParams.get('panel');
  let panel = [];
  try {
    if (panelString) {
      panel = JSON.parse(panelString);
    }
  } catch (e) {
    console.error('Failed to parse panel data', e);
  }

  if (error || panel.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <main className="flex-1 flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-lg">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error ||
                'Could not load panel interview data. Please go back and try again.'}
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
        topics={{}} // Panel mode doesn't strictly rely on topics in the same way, or you can provide defaults
        targetQuestionCount={panel.length * 2} // E.g., each panelist asks 2 questions
        panel={panel}
      />
    </div>
  );
}

export default function PanelInterviewStartPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PanelInterviewStartContent />
    </Suspense>
  );
}
