'use client';

import { provideAnswerFeedback, type ProvideAnswerFeedbackOutput } from '@/ai/flows/provide-answer-feedback';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Languages, LoaderCircle, Mic, MicOff, Sparkles, Square, Volume2 } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const answerSchema = z.object({
  answer: z.string().min(1, 'Please provide an answer.'),
});

interface InterviewClientViewProps {
  initialInterviewData: GenerateInterviewQuestionsOutput;
  role: string;
}

const supportedLanguages = [
  { name: 'English (US)', code: 'en-US' },
  { name: 'Spanish (Spain)', code: 'es-ES' },
  { name: 'French (France)', code: 'fr-FR' },
  { name: 'German (Germany)', code: 'de-DE' },
  { name: 'Japanese (Japan)', code: 'ja-JP' },
  { name: 'Chinese (Mandarin, Simplified)', code: 'cmn-CN' },
];

export function InterviewClientView({ initialInterviewData, role }: InterviewClientViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [interviewData] = useState(initialInterviewData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<ProvideAnswerFeedbackOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(true);
  const [questionAudio, setQuestionAudio] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioDataUri, setRecordedAudioDataUri] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof answerSchema>>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: '',
    },
  });

  const currentQuestion = interviewData.questions[currentQuestionIndex];

  useEffect(() => {
    async function getMicPermission() {
      try {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
          setHasMicPermission(false);
          return;
        }
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicPermission(true);
      } catch (error) {
        console.error('Microphone access denied:', error);
        setHasMicPermission(false);
      }
    }
    getMicPermission();
  }, []);

  useEffect(() => {
    async function generateQuestionAudio() {
      if (!currentQuestion?.question) return;
      setIsGeneratingSpeech(true);
      setQuestionAudio(null);
      try {
        const { audioDataUri } = await textToSpeech({ text: currentQuestion.question });
        setQuestionAudio(audioDataUri);
        // Play the audio right after setting it
        if (audioPlayerRef.current) {
            audioPlayerRef.current.src = audioDataUri;
            audioPlayerRef.current.play().catch(e => console.error("Audio autoplay failed:", e));
        }
      } catch (error) {
        console.error('Failed to generate speech:', error);
        toast({
          title: 'Audio Error',
          description: "Could not generate the question's audio.",
          variant: 'destructive',
        });
      } finally {
        setIsGeneratingSpeech(false);
      }
    }
    generateQuestionAudio();
  }, [currentQuestionIndex, currentQuestion.question, toast]);

  const startRecording = async () => {
    if (hasMicPermission === false) {
      toast({
        title: 'Microphone Required',
        description: 'Please grant microphone access in your browser settings to record your answer.',
        variant: 'destructive',
      });
      return;
    }
    setRecordedAudioDataUri(null); // Clear previous recording
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error('MediaDevices API is not available. Use a supported browser over HTTPS.');
      }
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
          setRecordedAudioDataUri(base64Audio);
          setIsTranscribing(true);
          try {
            const { text } = await transcribeAudio({ audioDataUri: base64Audio, languageCode: selectedLanguage });
            const currentAnswer = form.getValues('answer');
            form.setValue('answer', (currentAnswer ? currentAnswer + '\n' : '') + text);
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
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Could not start recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Could not start recording. Ensure you are on HTTPS and using a browser that supports microphone access.',
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
        interviewQuestion: currentQuestion.question,
        userAnswerText: data.answer,
        audioDataUri: recordedAudioDataUri ?? undefined
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
      setIsTranscribing(false);
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interviewData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setFeedback(null);
      form.reset();
      setQuestionAudio(null);
      setRecordedAudioDataUri(null);
    }
  };

  const isLastQuestion = currentQuestionIndex === interviewData.questions.length - 1;
  const isInterviewFinished = isLastQuestion && feedback;
  const isLoading = isSubmitting || isTranscribing || isGeneratingSpeech;

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
        <div className="space-y-2 mb-8">
          <p className="text-sm font-medium text-primary">
            Role: {role}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold font-headline">
            Question {currentQuestionIndex + 1} of {interviewData.questions.length}
          </h2>
          <Progress value={((currentQuestionIndex + 1) / interviewData.questions.length) * 100} className="w-full" />
           <div className="flex items-center gap-4 pt-4 !mt-6">
              <p className="text-lg sm:text-xl text-foreground flex-1">
                {currentQuestion.question}
              </p>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => audioPlayerRef.current?.play()} 
                disabled={!questionAudio || isGeneratingSpeech}
              >
                {isGeneratingSpeech ? <LoaderCircle className="h-5 w-5 animate-spin"/> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          <audio ref={audioPlayerRef} />
        </div>

        <div className="flex-1 flex flex-col">
          {!feedback && !isLoading && (
            <>
            {hasMicPermission === false && (
              <Alert variant="destructive" className="mb-4">
                <MicOff className="h-4 w-4" />
                <AlertTitle>Microphone Access Denied</AlertTitle>
                <AlertDescription>
                  To use voice recording, please enable microphone permissions in your browser settings and refresh the page.
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
                      <FormLabel>
                        {currentQuestion.requiresTyping
                          ? 'Your Answer & Code'
                          : 'Your Answer'}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            currentQuestion.requiresTyping
                              ? 'Explain your approach and then write your code here...'
                              : 'Speak or type your answer here...'
                          }
                          className="flex-1 resize-none text-base p-4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2">
                       <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <Languages className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportedLanguages.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant={isRecording ? 'destructive' : 'outline'}
                        size="lg"
                        onClick={handleMicButtonClick}
                        disabled={hasMicPermission === null || isLoading}
                        className="flex-1 sm:flex-none"
                      >
                        {isRecording ? (
                          <Square className="mr-2 h-4 w-4" />
                        ) : (
                          <Mic className="mr-2 h-4 w-4" />
                        )}
                        {isRecording ? 'Stop' : 'Record'}
                      </Button>
                    </div>
                  <Button type="submit" size="lg" disabled={isLoading || isTranscribing} className="flex-1">
                    {isTranscribing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isTranscribing ? 'Transcribing...' : 'Submit for Feedback'}
                  </Button>
                </div>
              </form>
            </Form>
            </>
          )}

          {isLoading && !isGeneratingSpeech && (
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center gap-4 p-8 rounded-lg border border-dashed">
              <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
              <h3 className="text-xl font-semibold font-headline">
                {isTranscribing ? 'Transcribing your voice...' : 'Analyzing your answer...'}
              </h3>
              <p className="text-muted-foreground">The AI is working its magic. This won't take long.</p>
            </div>
          )}
          
           {isGeneratingSpeech && (
             <div className="w-full flex-1 flex flex-col items-center justify-center text-center gap-4 p-8">
               <p className="text-muted-foreground">Preparing question...</p>
             </div>
           )}


          {feedback && !isLoading && (
            <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
              <FeedbackDisplay feedback={feedback} />
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => router.push('/')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  New Interview
                </Button>
                {isInterviewFinished ? (
                  <Button onClick={() => router.push('/')} className="bg-green-600 hover:bg-green-700 text-white">
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

    