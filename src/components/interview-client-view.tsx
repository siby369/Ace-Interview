'use client';

import { provideAnswerFeedback, type ProvideAnswerFeedbackOutput } from '@/ai/flows/provide-answer-feedback';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { generateSingleInterviewQuestion, type GenerateSingleInterviewQuestionOutput } from '@/ai/flows/generate-single-question';
import { generateAnswerRewrite } from '@/ai/flows/generate-answer-rewrite';
import { generateSessionReview } from '@/ai/flows/generate-session-review';
import { coachSpeechDelivery, type CoachSpeechDeliveryOutput } from '@/ai/flows/coach-speech-delivery';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Languages, LoaderCircle, Mic, MicOff, Sparkles, Square, Volume2, Bookmark, RotateCcw, FileText, Maximize, ShieldAlert, AlertTriangle, Play, BrainCircuit } from 'lucide-react';
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
import { useProctoredEnvironment } from '@/hooks/use-proctored-environment';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { createSessionId, getAdaptiveTopicHints, loadInterviewSessions, loadPracticeSettings, upsertInterviewSession } from '@/lib/storage';
import type { InterviewPersona, InterviewSessionRecord } from '@/lib/types';

const answerSchema = z.object({
  answer: z.string().min(1, 'Please provide an answer.'),
});

interface InterviewClientViewProps {
  initialInterviewData: { questions: GenerateSingleInterviewQuestionOutput[] };
  role: string;
  company?: string;
  persona?: InterviewPersona;
  topics: Record<string, string>;
  targetQuestionCount: number;
  jdContext?: {
    extractedSkills: string[];
    focusAreas: string[];
    companyCulture: string;
    questionAngle: string;
    seniority: string;
  };
}

const supportedLanguages = [
  { name: 'English (US)', code: 'en-US' },
  { name: 'Spanish (Spain)', code: 'es-ES' },
  { name: 'French (France)', code: 'fr-FR' },
  { name: 'German (Germany)', code: 'de-DE' },
  { name: 'Japanese (Japan)', code: 'ja-JP' },
  { name: 'Chinese (Mandarin, Simplified)', code: 'cmn-CN' },
];

export function InterviewClientView({ initialInterviewData, role, company, persona = 'friendly', topics, targetQuestionCount, jdContext }: InterviewClientViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const settings = loadPracticeSettings();
  const [allQuestions, setAllQuestions] = useState<GenerateSingleInterviewQuestionOutput[]>(initialInterviewData.questions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<ProvideAnswerFeedbackOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(settings.voiceLanguage);
  const [rewrite, setRewrite] = useState<Awaited<ReturnType<typeof generateAnswerRewrite>> | null>(null);
  const [sessionId] = useState(() => createSessionId());
  const [isGeneratingRewrite, setIsGeneratingRewrite] = useState(false);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [sessionReview, setSessionReview] = useState<{ summary: string; topStrengths: string[]; topWeaknesses: string[]; nextPractice: string[] } | null>(null);
  const [sessionAnswers, setSessionAnswers] = useState<Array<{ question: string; answer: string; score: number; feedback: string }>>([]);
  const [initialQuestionError, setInitialQuestionError] = useState<string | null>(null);

  // Proctoring
  const { isFullscreen, focusLossCount, requestFullscreen, hasStarted } = useProctoredEnvironment();

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioDataUri, setRecordedAudioDataUri] = useState<string | null>(null);
  // Per-question audio blob storage (index -> dataUri)
  const [questionAudioMap, setQuestionAudioMap] = useState<Record<number, string>>({});
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  // Filler word detection
  const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'right', 'so yeah', 'i mean'];
  const [fillerWordCount, setFillerWordCount] = useState(0);
  const [fillerWordsFound, setFillerWordsFound] = useState<string[]>([]);
  // Speech coach
  const [speechCoach, setSpeechCoach] = useState<CoachSpeechDeliveryOutput | null>(null);
  const [isCoaching, setIsCoaching] = useState(false);
  const [isSpeakingCoach, setIsSpeakingCoach] = useState(false);
  const coachAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentQuestionText = currentQuestion?.question || '';

  const form = useForm<z.infer<typeof answerSchema>>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: '',
    },
  });

  // Background question generation
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);
  const loadingTargetRef = useRef(initialInterviewData.questions.length);
  const [isPreparingFirstQuestion, setIsPreparingFirstQuestion] = useState(initialInterviewData.questions.length === 0);

  useEffect(() => {
    if (allQuestions.length > 0 || !isPreparingFirstQuestion) return;

    let cancelled = false;
    async function fetchInitialQuestion() {
      try {
        const orderedTopics = getAdaptiveTopicHints(topics);
        const adaptiveTopics = orderedTopics.reduce<Record<string, string>>((acc, topic) => {
          acc[topic] = topics[topic];
          return acc;
        }, {});
        const firstQuestion = await generateSingleInterviewQuestion({
          role: `${role}${company ? ` for ${company}` : ''} (${persona})`,
          topics: adaptiveTopics,
          previousQuestions: [],
          jdContext,
        });
        if (cancelled) return;
        setAllQuestions([firstQuestion]);
        loadingTargetRef.current = 1;
      } catch (error) {
        console.error('Failed to fetch initial question:', error);
        if (!cancelled) {
          setInitialQuestionError('We could not prepare your first question right now. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setIsPreparingFirstQuestion(false);
        }
      }
    }

    fetchInitialQuestion();
    return () => {
      cancelled = true;
    };
  }, [allQuestions.length, isPreparingFirstQuestion, role, company, persona, topics]);

  useEffect(() => {
    if (allQuestions.length === 0) return;
    const queueTarget = Math.min(targetQuestionCount, currentQuestionIndex + 3);
    if (allQuestions.length < queueTarget && allQuestions.length === loadingTargetRef.current && !isGeneratingNext) {
      loadingTargetRef.current = allQuestions.length + 1;
      setIsGeneratingNext(true);
      const orderedTopics = getAdaptiveTopicHints(topics);
      const adaptiveTopics = orderedTopics.reduce<Record<string, string>>((acc, topic) => {
        acc[topic] = topics[topic];
        return acc;
      }, {});
      generateSingleInterviewQuestion({
        role,
        topics: adaptiveTopics,
        previousQuestions: allQuestions.map(q => q.question),
        jdContext,
      }).then(newQ => {
        setAllQuestions(prev => [...prev, newQ]);
        setIsGeneratingNext(false);
      }).catch(err => {
        console.error("Failed to fetch next question:", err);
        loadingTargetRef.current = allQuestions.length;
        setIsGeneratingNext(false);
      });
    }
  }, [allQuestions, targetQuestionCount, role, topics, isGeneratingNext, currentQuestionIndex]);

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

  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Priority order for high-quality, professional English voices
          const bestVoice = 
            voices.find(v => v.name.includes('Online (Natural) - English') && v.name.includes('Guy')) ||
            voices.find(v => v.name.includes('Online (Natural) - English') && v.name.includes('Aria')) ||
            voices.find(v => v.name.includes('Google UK English Male')) ||
            voices.find(v => v.name.includes('Google US English')) ||
            voices.find(v => v.name.includes('Samantha') || v.name.includes('Daniel')) ||
            voices.find(v => v.lang.startsWith('en') && (v.name.includes('Premium') || v.name.includes('Natural'))) ||
            voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-US')) ||
            voices.find(v => v.lang.startsWith('en')) ||
            voices[0];
          
          voiceRef.current = bestVoice || null;
          setVoicesLoaded(true);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const playQuestionAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestionText || '');
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.rate = 0.95; // Slightly slower pacing for an interviewer feel
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Only play if voices are loaded and the user has started the interview
    if (voicesLoaded && hasStarted) {
      playQuestionAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, currentQuestionText, voicesLoaded, hasStarted]);

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
          // Save audio per question index
          setQuestionAudioMap(prev => ({ ...prev, [currentQuestionIndex]: base64Audio }));
          setIsTranscribing(true);
          try {
            const { text } = await transcribeAudio({ audioDataUri: base64Audio, languageCode: selectedLanguage });
            const currentAnswer = form.getValues('answer');
            form.setValue('answer', (currentAnswer ? currentAnswer + '\n' : '') + text);
            // Count filler words
            const lowerText = text.toLowerCase();
            const found: string[] = [];
            let count = 0;
            FILLER_WORDS.forEach(fw => {
              const regex = new RegExp(`\\b${fw}\\b`, 'gi');
              const matches = lowerText.match(regex);
              if (matches) { count += matches.length; found.push(...Array(matches.length).fill(fw)); }
            });
            setFillerWordCount(prev => prev + count);
            setFillerWordsFound(prev => [...prev, ...found]);
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
        jobRole: `${role}${company ? ` for ${company}` : ''} (${persona})`,
        interviewQuestion: currentQuestionText,
        userAnswerText: data.answer,
        audioDataUri: recordedAudioDataUri ?? undefined
      });
      setFeedback(result);
      setSessionAnswers((prev) => {
        const next = [...prev.filter((item) => item.question !== currentQuestionText), {
          question: currentQuestionText,
          answer: data.answer,
          score: result.overallScore,
          feedback: result.feedback,
        }];
        return next;
      });
      setIsGeneratingRewrite(true);
      generateAnswerRewrite({ role, question: currentQuestionText, answer: data.answer, feedback: result.feedback })
        .then(setRewrite)
        .catch((error) => {
          console.error('Failed to generate rewrite', error);
          setRewrite(null);
        })
        .finally(() => setIsGeneratingRewrite(false));
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
    if (currentQuestionIndex < targetQuestionCount - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setFeedback(null);
      setRewrite(null);
      setSpeechCoach(null);
      setFillerWordCount(0);
      setFillerWordsFound([]);
      form.reset();
      setRecordedAudioDataUri(null);
    }
  };

  const handleCoachSpeech = async () => {
    const answer = form.getValues('answer');
    if (!answer) return;
    setIsCoaching(true);
    setSpeechCoach(null);
    try {
      const result = await coachSpeechDelivery({ originalTranscript: answer, question: currentQuestionText, role });
      setSpeechCoach(result);
      // Auto-speak the coached version
      handleSpeakCoached(result.coachedVersion);
    } catch (e) {
      console.error('Speech coach failed', e);
      toast({ title: 'Coach Failed', description: 'Could not generate coaching. Please try again.', variant: 'destructive' });
    } finally {
      setIsCoaching(false);
    }
  };

  const handleSpeakCoached = async (text: string) => {
    setIsSpeakingCoach(true);
    try {
      const { audioDataUri } = await textToSpeech({ text });
      if (coachAudioRef.current) {
        coachAudioRef.current.src = audioDataUri;
        coachAudioRef.current.play();
        coachAudioRef.current.onended = () => setIsSpeakingCoach(false);
      }
    } catch (e) {
      console.error('TTS failed', e);
      setIsSpeakingCoach(false);
    }
  };

  const saveSession = async (completed = false) => {
    const existing = loadInterviewSessions();
    const nextSession: InterviewSessionRecord = {
      id: sessionId,
      createdAt: existing.find((item) => item.id === sessionId)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role,
      company,
      persona,
      topics,
      questionCount: targetQuestionCount,
      completed,
      answers: sessionAnswers.map((item) => ({
        ...item,
        timestamp: new Date().toISOString(),
      })),
      bookmarkedQuestions: existing.find((item) => item.id === sessionId)?.bookmarkedQuestions || [],
      summary: sessionReview?.summary,
      recommendedPractice: sessionReview?.nextPractice,
    };
    upsertInterviewSession(nextSession);
  };

  const isLastQuestion = currentQuestionIndex === targetQuestionCount - 1;
  const isInterviewFinished = isLastQuestion && feedback;
  const isLoading = isSubmitting || isTranscribing;

  useEffect(() => {
    saveSession(false);
  }, [role, company, persona, topics, targetQuestionCount, sessionAnswers, sessionReview]);

  if (!hasStarted) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
        <div className="max-w-md w-full space-y-8 text-center p-8 rounded-xl border bg-card shadow-lg">
          <div className="space-y-4">
            <ShieldAlert className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-3xl font-bold font-headline tracking-tight">Proctored Interview</h1>
            <p className="text-muted-foreground text-lg">
              This interview requires a fullscreen environment. Your focus will be monitored to ensure integrity. Please close other applications and remain focused on this window.
            </p>
          </div>
          <Button size="lg" className="w-full text-lg h-14" onClick={requestFullscreen}>
            <Maximize className="mr-2 h-5 w-5" />
            Enter Fullscreen & Begin
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      {!isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="max-w-md p-8 bg-card border rounded-xl shadow-lg text-center space-y-6">
            <AlertTriangle className="h-16 w-16 mx-auto text-destructive" />
            <h2 className="text-2xl font-bold">Fullscreen Required</h2>
            <p className="text-muted-foreground">
              You have exited the fullscreen environment. Please return to fullscreen to continue your interview.
            </p>
            <Button size="lg" className="w-full h-14 text-lg" onClick={requestFullscreen}>
              <Maximize className="mr-2 h-5 w-5" />
              Return to Fullscreen
            </Button>
          </div>
        </div>
      )}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
          {focusLossCount > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Focus Warning</AlertTitle>
              <AlertDescription>
                We detected that you navigated away from the interview {focusLossCount} time(s). Please remain focused on the interview window.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2 mb-8">
          <p className="text-sm font-medium text-primary">
            Role: {role}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold font-headline">
            Question {currentQuestionIndex + 1} of {targetQuestionCount}
          </h2>
          <Progress value={((currentQuestionIndex + 1) / targetQuestionCount) * 100} className="w-full" />
           {currentQuestion ? (
            <div className="flex items-center gap-4 pt-4 !mt-6">
              <p className="text-lg sm:text-xl text-foreground flex-1">
                {currentQuestionText}
              </p>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={playQuestionAudio}
                title="Play Audio"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                title="Bookmark question"
                onClick={() => {
                  const sessions = loadInterviewSessions();
                  const current = sessions.find((item) => item.id === sessionId);
                  if (current && !current.bookmarkedQuestions.includes(currentQuestionText)) {
                    current.bookmarkedQuestions = [...current.bookmarkedQuestions, currentQuestionText];
                    upsertInterviewSession({ ...current, updatedAt: new Date().toISOString() });
                    toast({ title: 'Saved', description: 'Question bookmarked for later review.' });
                  }
                }}
              >
                <Bookmark className="h-5 w-5" />
              </Button>
            </div>
           ) : (
            <div className="flex items-center gap-4 pt-4 !mt-6 text-muted-foreground animate-pulse">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              <p className="text-lg sm:text-xl flex-1">
                {isPreparingFirstQuestion ? 'Preparing your first question...' : 'Generating your next question...'}
              </p>
            </div>
           )}
        </div>

        <div className="flex-1 flex flex-col">
          {initialQuestionError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Question Generation Failed</AlertTitle>
              <AlertDescription>{initialQuestionError}</AlertDescription>
            </Alert>
          )}
          {!feedback && !isLoading && currentQuestion && (
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
                      {/* Filler word badge */}
                      {fillerWordCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-medium">
                          <span>⚡</span>
                          <span>{fillerWordCount} filler{fillerWordCount !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {/* Playback own recording */}
                      {questionAudioMap[currentQuestionIndex] && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Play back your recording"
                          onClick={() => {
                            const a = new Audio(questionAudioMap[currentQuestionIndex]);
                            a.play();
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  <Button type="submit" size="lg" disabled={isLoading || isTranscribing} className="flex-1">
                    {isTranscribing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isTranscribing ? 'Transcribing...' : 'Submit for Feedback'}
                  </Button>
                </div>
              </form>
            </Form>
            {/* Hidden audio element for coach TTS */}
            <audio ref={coachAudioRef} className="hidden" />
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

              {/* Filler word summary */}
              {fillerWordsFound.length > 0 && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-yellow-400">
                    <span>⚡</span> Filler Word Report
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You used <strong className="text-yellow-400">{fillerWordsFound.length} filler word{fillerWordsFound.length !== 1 ? 's' : ''}</strong> in this answer:
                    {' '}{[...new Set(fillerWordsFound)].map(fw => `"${fw}"`).join(', ')}.
                    Try replacing them with a brief pause (0.5–1 second) for a more confident delivery.
                  </p>
                </div>
              )}

              {/* Speech Coach card */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <BrainCircuit className="h-4 w-4" />
                    Speech Coach
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCoachSpeech}
                    disabled={isCoaching || !form.getValues('answer')}
                  >
                    {isCoaching ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <BrainCircuit className="mr-2 h-3.5 w-3.5" />}
                    {isCoaching ? 'Coaching...' : 'Coach My Delivery'}
                  </Button>
                </div>
                {!speechCoach && !isCoaching && (
                  <p className="text-sm text-muted-foreground">Click "Coach My Delivery" to get a version of your exact answer — same content, better delivery. The AI will also speak it for you.</p>
                )}
                {isCoaching && <p className="text-sm text-muted-foreground">Analyzing your delivery...</p>}
                {speechCoach && (
                  <div className="space-y-3 text-sm">
                    <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
                      <p className="font-medium text-xs uppercase tracking-wide text-primary mb-1.5">Coached version</p>
                      <p className="text-muted-foreground leading-relaxed">{speechCoach.coachedVersion}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-primary"
                        onClick={() => handleSpeakCoached(speechCoach.coachedVersion)}
                        disabled={isSpeakingCoach}
                      >
                        <Volume2 className="mr-2 h-3.5 w-3.5" />
                        {isSpeakingCoach ? 'Speaking...' : 'Hear it again'}
                      </Button>
                    </div>
                    {speechCoach.changes.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">What changed</p>
                        <div className="space-y-2">
                          {speechCoach.changes.map((change, i) => (
                            <div key={i} className="rounded-md border p-2.5 space-y-1">
                              <p className="text-xs line-through text-muted-foreground">{change.original}</p>
                              <p className="text-xs text-emerald-400">{change.coached}</p>
                              <p className="text-[11px] text-muted-foreground italic">{change.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <RotateCcw className="h-4 w-4" />
                    Rewrite Coach
                  </div>
                  {isGeneratingRewrite ? (
                    <p className="text-sm text-muted-foreground">Generating a stronger version of your answer...</p>
                  ) : rewrite ? (
                    <div className="space-y-3 text-sm">
                      <p className="text-muted-foreground">{rewrite.improvedAnswer}</p>
                      <div>
                        <p className="font-medium mb-1">Structure tips</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          {rewrite.structureTips.map((tip) => <li key={tip}>{tip}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Concise version</p>
                        <p className="text-muted-foreground">{rewrite.conciseVersion}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <FileText className="h-4 w-4" />
                    Session Review
                  </div>
                  {isGeneratingReview ? (
                    <p className="text-sm text-muted-foreground">Creating your end-of-session review...</p>
                  ) : sessionReview ? (
                    <div className="space-y-3 text-sm">
                      <p className="text-muted-foreground">{sessionReview.summary}</p>
                      <div>
                        <p className="font-medium mb-1">Next practice</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          {sessionReview.nextPractice.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={async () => {
                      setIsGeneratingReview(true);
                      try {
                        const review = await generateSessionReview({
                          role,
                          company,
                          persona,
                          answers: [{
                            question: currentQuestionText,
                            answer: form.getValues('answer'),
                            score: feedback.overallScore,
                            feedback: feedback.feedback,
                          }],
                        });
                        setSessionReview(review);
                        await saveSession(!!isInterviewFinished);
                      } finally {
                        setIsGeneratingReview(false);
                      }
                    }}>
                      Generate Review
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => router.push('/')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  New Interview
                </Button>
                {isInterviewFinished ? (
                  <Button onClick={() => { saveSession(true); router.push('/dashboard'); }} className="bg-green-600 hover:bg-green-700 text-white">
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
    </>
  );
}
