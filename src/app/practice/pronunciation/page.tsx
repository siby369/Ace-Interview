import PronunciationPractice from '@/components/pronunciation-practice';

export default function PronunciationPage() {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl md:text-5xl">
            Pronunciation Practice
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Record yourself saying the sentence below and get instant AI feedback.
          </p>
        </div>
        <PronunciationPractice />
      </main>
    </div>
  );
}
