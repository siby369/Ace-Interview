'use client';

import { getPronunciationFeedback } from '@/ai/flows/get-pronunciation-feedback';
import type { PronunciationFeedback } from '@/lib/types';
import { getSecureRandomInt } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Mic, RefreshCw, Square } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';

const practiceSentences = [
  'The quick brown fox jumps over the lazy dog.',
  'To be or not to be, that is the question.',
  'I have a dream that one day this nation will rise up.',
  'Ask not what your country can do for you – ask what you can do for your country.',
  'The only thing we have to fear is fear itself.',
  'She sells seashells by the seashore.',
  'Peter Piper picked a peck of pickled peppers.'
];

export default function PronunciationPractice() {
  const { toast } = useToast();
  const [currentSentence, setCurrentSentence] = useState(practiceSentences[0]);
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setFeedback(null);
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error('MediaDevices API is not available. Use a supported browser over HTTPS.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
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
          setIsLoading(true);
          try {
            const result = await getPronunciationFeedback({
              audioDataUri: base64Audio,
              expectedText: currentSentence,
            });
            setFeedback(result);
          } catch (error) {
            console.error('Pronunciation feedback failed', error);
            toast({
              title: 'Analysis Failed',
              description: 'Could not get pronunciation feedback. Please try again.',
              variant: 'destructive',
            });
          } finally {
            setIsLoading(false);
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

  const handleNewSentence = () => {
    setFeedback(null);
    setIsLoading(false);
    let newSentence = currentSentence;
    while (newSentence === currentSentence) {
      newSentence = practiceSentences[getSecureRandomInt(0, practiceSentences.length)];
    }
    setCurrentSentence(newSentence);
  }

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return '[&>div]:bg-green-500';
    if (score >= 50) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-red-500';
  };

  return (
    <div className="w-full max-w-2xl mt-8 flex flex-col gap-6">
      <Card>
        <CardContent className="p-6">
          <div className='flex justify-between items-center mb-4'>
            <h2 className="text-lg font-semibold">Sentence to Read:</h2>
            <Button variant="outline" size="sm" onClick={handleNewSentence}>
              <RefreshCw className="mr-2 h-4 w-4" />
              New Sentence
            </Button>
          </div>
          <p className="text-2xl font-serif text-center p-8 rounded-md bg-secondary">
            &ldquo;{currentSentence}&rdquo;
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          className="w-48"
          variant={isRecording ? 'destructive' : 'default'}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
        >
          {isRecording ? (
            <Square className="mr-2 h-5 w-5" />
          ) : (
            <Mic className="mr-2 h-5 w-5" />
          )}
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
      </div>

      {isLoading && (
        <div className="w-full flex flex-col items-center justify-center text-center gap-4 p-8 rounded-lg border border-dashed">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
          <h3 className="text-xl font-semibold font-headline">
            Analyzing your pronunciation...
          </h3>
          <p className="text-muted-foreground">The AI is comparing your speech to the text. Hang tight!</p>
        </div>
      )}

      {feedback && !isLoading && (
        <Card className="animate-in fade-in-50 duration-500">
          <CardContent className="p-6 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">Overall Score</h3>
                <span className="font-bold text-xl text-primary">{feedback.overallScore}/100</span>
              </div>
              <Progress value={feedback.overallScore} className={`h-3 ${getScoreColorClass(feedback.overallScore)}`} />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Your Pronunciation:</h3>
              <p className='text-lg p-4 rounded-md bg-secondary'>
                {feedback.wordLevelFeedback.map((word, index) => (
                  <span key={index} className={!word.isCorrect ? 'text-destructive font-bold underline' : 'text-accent-foreground'}>
                    {word.word}{' '}
                  </span>
                ))}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">AI Coach Feedback:</h3>
              <p className="text-muted-foreground">{feedback.generalFeedback}</p>
            </div>

            {feedback.wordLevelFeedback.some(w => !w.isCorrect) && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Suggestions for Mispronounced Words:</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {feedback.wordLevelFeedback.filter(w => !w.isCorrect && w.feedback).map((word, index) => (
                    <li key={index}>
                      <span className='font-bold text-foreground'>{word.word}:</span> {word.feedback}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </CardContent>
        </Card>
      )}
    </div>
  );
}
