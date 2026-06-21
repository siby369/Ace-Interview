'use client';

import { provideAnswerFeedback, type ProvideAnswerFeedbackOutput } from '@/ai/flows/provide-answer-feedback';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { generateSingleInterviewQuestion, type GenerateSingleInterviewQuestionOutput } from '@/ai/flows/generate-single-question';
import { generateAnswerRewrite } from '@/ai/flows/generate-answer-rewrite';
import { generateSessionReview } from '@/ai/flows/generate-session-review';
import { coachSpeechDelivery, type CoachSpeechDeliveryOutput } from '@/ai/flows/coach-speech-delivery';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { generatePanelQuestion } from '@/ai/flows/generate-panel-question';
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
  panel?: Array<{ id: string; name: string; role: string; focus: string }>;
  rawJD?: string;
  codingOnly?: boolean;
}

const supportedLanguages = [
  { name: 'English (US)', code: 'en-US' },
  { name: 'Spanish (Spain)', code: 'es-ES' },
  { name: 'French (France)', code: 'fr-FR' },
  { name: 'German (Germany)', code: 'de-DE' },
  { name: 'Japanese (Japan)', code: 'ja-JP' },
  { name: 'Chinese (Mandarin, Simplified)', code: 'cmn-CN' },
];

export function InterviewClientView({ initialInterviewData, role, company, persona = 'friendly', topics, targetQuestionCount, jdContext, panel, rawJD, codingOnly = false }: InterviewClientViewProps) {
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
        
        let firstQuestion;
        if (panel && panel.length > 0) {
          firstQuestion = await generatePanelQuestion({
            persona: panel[0],
            jobRole: role,
            previousQuestions: [],
            jdContext,
            companyName: company,
            rawJD,
            codingOnly,
          });
        } else {
          firstQuestion = await generateSingleInterviewQuestion({
            role: `${role} (${persona})`,
            topics: adaptiveTopics,
            previousQuestions: [],
            jdContext,
            companyName: company,
            rawJD,
            codingOnly,
          });
        }
        if (cancelled) return;
        setAllQuestions([firstQuestion]);
        loadingTargetRef.current = 1;
      } catch (error: any) {
        console.error('Failed to fetch initial question:', error);
        if (!cancelled) {
          if (error.message === 'OUT_OF_TOKENS') {
            setInitialQuestionError('OUT_OF_TOKENS');
          } else if (error.message === 'UNAUTHENTICATED') {
            setInitialQuestionError('UNAUTHENTICATED');
          } else {
            setInitialQuestionError('We could not prepare your first question right now. Please try again.');
          }
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

      let questionPromise;
      if (panel && panel.length > 0) {
        const nextPersona = panel[allQuestions.length % panel.length];
        questionPromise = generatePanelQuestion({
          persona: nextPersona,
          jobRole: role,
          previousQuestions: allQuestions.map(q => q.question),
          jdContext,
          companyName: company,
          rawJD,
          codingOnly,
        });
      } else {
        questionPromise = generateSingleInterviewQuestion({
          role: `${role} (${persona})`,
          topics: adaptiveTopics,
          previousQuestions: allQuestions.map(q => q.question),
          jdContext,
          companyName: company,
          rawJD,
          codingOnly,
        });
      }

      questionPromise.then(newQ => {
        setAllQuestions(prev => [...prev, newQ]);
        setIsGeneratingNext(false);
      }).catch(err => {
        console.error("Failed to fetch next question:", err);
        if (err.message === 'OUT_OF_TOKENS') {
          setInitialQuestionError('OUT_OF_TOKENS');
        } else if (err.message === 'UNAUTHENTICATED') {
          setInitialQuestionError('UNAUTHENTICATED');
        }
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
    } catch (error: any) {
      console.error('Failed to get feedback', error);
      if (error.message === 'OUT_OF_TOKENS') {
        setInitialQuestionError('OUT_OF_TOKENS');
        toast({
          title: 'Token limit reached',
          description: 'You have used all your free AI tokens. Please upgrade to continue.',
          variant: 'destructive',
        });
      } else if (error.message === 'UNAUTHENTICATED') {
        setInitialQuestionError('UNAUTHENTICATED');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to get feedback from the AI. Please try again.',
          variant: 'destructive',
        });
      }
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

  if (initialQuestionError === 'OUT_OF_TOKENS') {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#080808] text-[#E1E0CC]">
        <div className="max-w-md w-full space-y-8 text-center p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
          <div className="space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <ShieldAlert className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-3xl font-medium tracking-tight">Token Limit Reached</h1>
            <p className="text-[#E1E0CC]/60 text-base leading-relaxed">
              You have used all the free practice tokens allocated to your account.
              Please upgrade to our Premium tier to continue practicing with our virtual interview panel.
            </p>
          </div>
          <div className="space-y-3 pt-4">
            <Button size="lg" className="w-full text-base h-12 bg-[#E1E0CC] hover:bg-[#E1E0CC]/90 text-black font-semibold rounded-xl" onClick={() => router.push('/dashboard')}>
              Upgrade to Premium
            </Button>
            <Button variant="ghost" size="lg" className="w-full text-base h-12 border border-white/10 hover:bg-white/5 text-[#E1E0CC]/60 rounded-xl" onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (initialQuestionError === 'UNAUTHENTICATED') {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#080808] text-[#E1E0CC]">
        <div className="max-w-md w-full space-y-8 text-center p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
          <div className="space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-[#E1E0CC]/10 flex items-center justify-center border border-[#E1E0CC]/20">
              <ShieldAlert className="h-8 w-8 text-[#E1E0CC]" />
            </div>
            <h1 className="text-3xl font-medium tracking-tight">Authentication Required</h1>
            <p className="text-[#E1E0CC]/60 text-base leading-relaxed">
              You must be logged in to access the virtual interview panel and track your practice session progress.
            </p>
          </div>
          <div className="space-y-3 pt-4">
            <Button size="lg" className="w-full text-base h-12 bg-[#E1E0CC] hover:bg-[#E1E0CC]/90 text-black font-semibold rounded-xl" onClick={() => router.push('?auth=login')}>
              Log In
            </Button>
            <Button variant="ghost" size="lg" className="w-full text-base h-12 border border-white/10 hover:bg-white/5 text-[#E1E0CC]/60 rounded-xl" onClick={() => router.push('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </main>
    );
  }

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full p-8 bg-card border rounded-xl shadow-lg text-center space-y-6">
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
          {/* Cinematic Question Header */}
          <div className="flex flex-col items-center text-center space-y-8 mb-4 animate-in slide-in-from-bottom-4 duration-1000 mt-12">
            <div className="flex flex-col items-center gap-3">
              <div className="px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-md">
                <p className="text-xs font-medium tracking-widest text-[#E1E0CC]/50 uppercase">
                  {role} • Q{currentQuestionIndex + 1}/{targetQuestionCount}
                </p>
              </div>
              {panel && panel.length > 0 && (
                <p className="text-sm font-medium text-[#E1E0CC]/30">
                  Interviewer: <span className="text-[#E1E0CC]/80">{panel[currentQuestionIndex % panel.length].name}</span>
                </p>
              )}
            </div>
            
            <div className="w-full max-w-sm mx-auto">
              <Progress value={((currentQuestionIndex + 1) / targetQuestionCount) * 100} className="h-0.5 bg-white/5 [&>div]:bg-[#E1E0CC]" />
            </div>

            <div className="min-h-[160px] flex flex-col items-center justify-center w-full mt-4">
              {currentQuestion ? (
                <div className="relative group w-full flex flex-col md:flex-row justify-center items-center">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-[#E1E0CC] leading-tight px-4 sm:px-8 max-w-5xl drop-shadow-md text-center">
                    {currentQuestionText}
                  </h1>
                  <div className="flex md:absolute md:-right-16 md:top-1/2 md:-translate-y-1/2 mt-6 md:mt-0 flex-row md:flex-col justify-center gap-4 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={playQuestionAudio} className="rounded-full bg-white/5 hover:bg-white/10 text-[#E1E0CC] h-10 w-10 md:h-12 md:w-12">
                      <Volume2 className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10 text-[#E1E0CC] h-10 w-10 md:h-12 md:w-12" onClick={() => {
                        const sessions = loadInterviewSessions();
                        const current = sessions.find((item) => item.id === sessionId);
                        if (current && !current.bookmarkedQuestions.includes(currentQuestionText)) {
                          current.bookmarkedQuestions = [...current.bookmarkedQuestions, currentQuestionText];
                          upsertInterviewSession({ ...current, updatedAt: new Date().toISOString() });
                          toast({ title: 'Saved', description: 'Question bookmarked for later review.' });
                        }
                      }}>
                      <Bookmark className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-[#E1E0CC]/30 animate-pulse">
                  <div className="w-4 h-4 rounded-full bg-[#E1E0CC]/50 animate-ping" />
                  <p className="text-xl font-light tracking-wide">
                    {isPreparingFirstQuestion ? 'Preparing your session...' : 'Thinking...'}
                  </p>
                </div>
              )}
            </div>
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
              <form onSubmit={form.handleSubmit(getFeedbackAction)} className="space-y-6 flex flex-col flex-1 h-full justify-center">
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto mb-24">
                      <FormControl>
                        <Textarea
                          placeholder={
                            currentQuestion.requiresTyping
                              ? 'Write your code here...'
                              : 'Speak your answer... or type it here.'
                          }
                          className="flex-1 min-h-[40vh] w-full resize-none text-3xl md:text-5xl font-light text-center p-6 bg-transparent border-none focus-visible:ring-0 text-[#E1E0CC] placeholder:text-[#E1E0CC]/10 leading-snug drop-shadow-sm transition-all focus:text-[#E1E0CC]/90"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dynamic Island Toolbar */}
                <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] z-50 transition-all duration-500 w-[95vw] sm:w-max overflow-x-auto no-scrollbar justify-between sm:justify-start">
                    <div className="flex items-center gap-2 pl-2">
                       <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-[140px] rounded-full bg-transparent border-none focus:ring-0 text-[#E1E0CC]/80 hover:text-[#E1E0CC]">
                          <Languages className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/10 text-[#E1E0CC]">
                          {supportedLanguages.map(lang => (
                             <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        type="button"
                        variant={isRecording ? 'destructive' : 'secondary'}
                        size="icon"
                        onClick={handleMicButtonClick}
                        disabled={hasMicPermission === null || isLoading}
                        className={`rounded-full w-12 h-12 flex-shrink-0 relative overflow-hidden transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-white/5 hover:bg-white/10 text-[#E1E0CC]'}`}
                      >
                        {isRecording && (
                          <div className="absolute inset-0 bg-red-400 opacity-50 animate-ping rounded-full" />
                        )}
                        {isRecording ? (
                          <Square className="h-5 w-5 relative z-10 text-white" />
                        ) : (
                          <Mic className="h-5 w-5 relative z-10" />
                        )}
                      </Button>
                      
                      {fillerWordCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                          <span>⚡</span>
                          <span>{fillerWordCount}</span>
                        </div>
                      )}
                      
                      {questionAudioMap[currentQuestionIndex] && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-full w-12 h-12 text-[#E1E0CC]/70 hover:text-[#E1E0CC]"
                          title="Play back your recording"
                          onClick={() => {
                            const a = new Audio(questionAudioMap[currentQuestionIndex]);
                            a.play();
                          }}
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="w-px h-8 bg-white/10 mx-1" />
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading || isTranscribing} 
                      className="rounded-full px-8 bg-[#E1E0CC] text-black hover:bg-[#E1E0CC]/90 hover:scale-105 active:scale-95 transition-all font-medium text-base h-12 mr-1"
                    >
                      {isTranscribing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                      {isTranscribing ? 'Transcribing...' : 'Submit'}
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
