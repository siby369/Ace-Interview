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

