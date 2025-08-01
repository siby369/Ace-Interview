'use client';

import { provideAnswerFeedback, type ProvideAnswerFeedbackOutput } from '@/ai/flows/provide-answer-feedback';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, LoaderCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FeedbackDisplay } from './feedback-display';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';

const answerSchema = z.object({
  answer: z.string().min(20, 'Your answer should be at least 20 characters long.'),
});

interface InterviewClientViewProps {
  initialQuestions: string[];
  role: string;
}

export function InterviewClientView({ initialQuestions, role }: InterviewClientViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [questions] = useState(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<ProvideAnswerFeedbackOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof answerSchema>>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: '',
    },
  });

  async function getFeedbackAction(data: z.infer<typeof answerSchema>) {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const result = await provideAnswerFeedback({
        jobRole: role,
        interviewQuestion: questions[currentQuestionIndex],
        userAnswer: data.answer,
      });
      setFeedback(result);
    } catch (error) {
      console.error('Failed to get feedback', error);
      toast({
        title: 'Error',
        description: 'Failed to get feedback from the AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setFeedback(null);
      form.reset();
    }
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isInterviewFinished = isLastQuestion && feedback;

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
        <div className="space-y-2 mb-8">
          <p className="text-sm font-medium text-primary">
            Role: {role}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold font-headline">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="w-full" />
          <p className="text-lg sm:text-xl text-foreground pt-4 !mt-6">
            {questions[currentQuestionIndex]}
          </p>
        </div>

        <div className="flex-1 flex flex-col">
          {!feedback && !isSubmitting && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(getFeedbackAction)} className="space-y-6 flex flex-col flex-1">
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col">
                      <FormLabel className="sr-only">Your Answer</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Type your answer here..."
                          className="flex-1 resize-none text-base p-4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Submit Answer for Feedback
                </Button>
              </form>
            </Form>
          )}

          {isSubmitting && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center gap-4 p-8 rounded-lg border border-dashed">
              <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
              <h3 className="text-xl font-semibold font-headline">Analyzing your answer...</h3>
              <p className="text-muted-foreground">The AI is preparing your feedback. This won't take long.</p>
            </div>
          )}

          {feedback && (
            <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
              <FeedbackDisplay feedback={feedback} />
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => router.push('/interview/new')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  New Interview
                </Button>
                {isInterviewFinished ? (
                  <Button onClick={() => router.push('/')} className="bg-accent hover:bg-accent/90">
                    Finish & Go Home
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next Question
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
