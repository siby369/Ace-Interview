import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BotMessageSquare, BrainCircuit, MicVocal } from 'lucide-react';
import BackgroundParticles from '@/components/background-particles';
import Image from 'next/image';

const features = [
    {
        icon: <BrainCircuit size={32} className="text-primary" />,
        title: 'AI-Generated Questions',
        description: 'Get a unique set of questions tailored to the role and topics you select.'
    },
    {
        icon: <BotMessageSquare size={32} className="text-primary" />,
        title: 'Instant, In-Depth Feedback',
        description: 'Receive AI-powered feedback on both your answer content and your delivery.'
    },
    {
        icon: <MicVocal size={32} className="text-primary" />,
        title: 'Pronunciation Analysis',
        description: 'Improve your clarity and confidence with detailed pronunciation scores and tips.'
    }
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <BotMessageSquare className="h-6 w-6 text-primary" />
          <span className="sr-only">Ace Interview</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/interview/new"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Start Interview
          </Link>
          <Link
            href="/practice/pronunciation"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Pronunciation Practice
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48">
           <BackgroundParticles />
          <div className="container px-4 md:px-6 text-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold font-headline tracking-tight sm:text-5xl xl:text-6xl/none">
                Practice Interviews, Perfected with AI
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Get ready to land your dream job. Ace Interview provides realistic mock interviews with instant, AI-driven feedback.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/interview/new">
                <Button size="lg">
                    Start Your Free Interview
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to prepare, practice, and perform your best on interview day.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              {features.map((feature, i) => (
                  <div key={feature.title} className="grid gap-4 p-6 rounded-lg bg-background shadow-md">
                    {feature.icon}
                    <h3 className="text-lg font-bold font-headline">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>
      </main>
       <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Ace Interview. All rights reserved.</p>
      </footer>
    </div>
  );
}
