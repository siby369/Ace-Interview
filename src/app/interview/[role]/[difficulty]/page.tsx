import {
  generateInterviewQuestions,
  GenerateInterviewQuestionsInput,
} from '@/ai/flows/generate-interview-questions';
import { unslugify } from '@/lib/utils';
import { Header } from '@/components/header';
import { InterviewClientView } from '@/components/interview-client-view';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

export default async function InterviewPage({
  params,
}: {
  params: { role: string; difficulty: string };
}) {
  const roleName = unslugify(params.role);
  const difficulty = unslugify(params.difficulty) as GenerateInterviewQuestionsInput['difficulty'];
  let questions: string[] | null = null;
  let error: string | null = null;

  try {
    const result = await generateInterviewQuestions({ role: roleName, difficulty });
    questions = result.questions;
  } catch (e) {
    console.error(e);
    error = 'Failed to generate interview questions. Please try again later.';
  }

  if (error || !questions) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-lg">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error ||
                'Could not load interview questions for this role. Please go back and try another.'}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <InterviewClientView initialQuestions={questions} role={roleName} />
    </div>
  );
}
