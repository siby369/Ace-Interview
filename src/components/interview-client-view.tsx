'use client';

import { provideAnswerFeedback, type ProvideAnswerFeedbackOutput } from '@/ai/flows/provide-answer-feedback';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, LoaderCircle, Mic, MicOff, Sparkles, Square } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FeedbackDisplay } from './feedback-display';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { Header } from './header';

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
  const { user } = useAuth();
  const [questions] = useState(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<ProvideAnswerFeedbackOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const form = useForm<z.infer<typeof answerSchema>>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: '',
    },
  });

  useEffect(() => {
    async function getMicPermission() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicPermission(true);
      } catch (error) {
        console.error('Microphone access denied:', error);
        setHasMicPermission(false);
      }
    }
    getMicPermission();
  }, []);

  const startRecording = async () => {
    if (hasMicPermission === false) {
      toast({
        title: 'Microphone Required',
        description: 'Please grant microphone access in your browser settings to record your answer.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setIsTranscribing(true);
          try {
            const { text } = await transcribeAudio({ audioDataUri: base64Audio });
            form.setValue('answer', text);
            // Automatically submit for feedback after transcription
            await getFeedbackAction({ answer: text });
          } catch (error) {
            console.error('Transcription failed', error);
            toast({
              title: 'Transcription Failed',
              description: 'Could not transcribe your audio. Please try again or type your answer.',
              variant: 'destructive',
            });
          } finally {
            setIsTranscribing(false);
          }
        };
        // Stop all media tracks to turn off the mic indicator
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Could not start recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Could not start recording. Please check your microphone.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };


  const handleMicButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

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
      form.setValue('answer', data.answer);
    } catch (error) {
      console.error('Failed to get feedback', error);
      toast({
        title: 'Error',
        description: 'Failed to get feedback from the AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsTranscribing(false);
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
  
  const isLoading = isSubmitting || isTranscribing;

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
          {!feedback && !isLoading && (
            <>
            {hasMicPermission === false && (
              <Alert variant="destructive" className="mb-4">
                <MicOff className="h-4 w-4" />
                <AlertTitle>Microphone Access Denied</AlertTitle>
                <AlertDescription>
                  To use voice recording, please enable microphone permissions in your browser settings and refresh the page. You can still type your answer below.
                </AlertDescription>
              </Alert>
            )}
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
                          placeholder="Type your answer here, or use the microphone to record it."
                          className="flex-1 resize-none text-base p-4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="button" size="lg" onClick={handleMicButtonClick} disabled={hasMicPermission === null || isLoading} className="flex-1">
                    {isRecording ? <Square className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                    {isRecording ? 'Stop Recording' : 'Record Answer'}
                  </Button>
                  <Button type="submit" size="lg" disabled={isLoading} className="flex-1">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Submit for Feedback
                  </Button>
                </div>
              </form>
            </Form>
            </>
          )}

          {isLoading && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center gap-4 p-8 rounded-lg border border-dashed">
              <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
              <h3 className="text-xl font-semibold font-headline">
                {isTranscribing ? 'Transcribing your voice...' : 'Analyzing your answer...'}
              </h3>
              <p className="text-muted-foreground">The AI is working its magic. This won't take long.</p>
            </div>
          )}

          {feedback && !isLoading && (
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
