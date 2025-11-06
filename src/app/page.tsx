'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BotMessageSquare, BrainCircuit, MicVocal, Sparkles, ArrowRight, Zap } from 'lucide-react';
import AnimatedBackground from '@/components/animated-background';
import Floating3DCard from '@/components/floating-3d-card';
import FeatureCard from '@/components/feature-card';

const features = [
    {
        icon: <BrainCircuit size={32} className="text-primary" />,
        title: 'AI-Generated Questions',
        description: 'Get a unique set of questions tailored to the role and topics you select.',
        delay: 0.1
    },
    {
        icon: <BotMessageSquare size={32} className="text-primary" />,
        title: 'Instant, In-Depth Feedback',
        description: 'Receive AI-powered feedback on both your answer content and your delivery.',
        delay: 0.2
    },
    {
        icon: <MicVocal size={32} className="text-primary" />,
        title: 'Pronunciation Analysis',
        description: 'Improve your clarity and confidence with detailed pronunciation scores and tips.',
        delay: 0.3
    }
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-50 px-4 lg:px-6 h-16 flex items-center backdrop-blur-sm bg-background/80 border-b border-border/50">
        <Link href="#" className="flex items-center gap-2 group" prefetch={false}>
          <div className="relative">
            <BotMessageSquare className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-headline font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Ace Interview
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/interview/new"
            className="text-sm font-medium hover:text-primary transition-colors duration-300 relative group"
            prefetch={false}
          >
            Start Interview
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </Link>
          <Link
            href="/practice/pronunciation"
            className="text-sm font-medium hover:text-primary transition-colors duration-300 relative group"
            prefetch={false}
          >
            Pronunciation Practice
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative w-full min-h-[90vh] flex items-center justify-center py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
              {/* Main Heading with 3D Effect */}
              <Floating3DCard intensity={5}>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-fade-in">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">AI-Powered Mock Interviews</span>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-headline tracking-tight">
                    <span className="block bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent animate-gradient">
                      Practice Interviews,
                    </span>
                    <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-gradient-delay">
                      Perfected with AI
                    </span>
                  </h1>
                  
                  <p className="mx-auto max-w-[700px] text-lg md:text-xl text-muted-foreground leading-relaxed">
                    Get ready to land your dream job. Ace Interview provides realistic mock interviews with instant, AI-driven feedback.
                  </p>
                </div>
              </Floating3DCard>

              {/* CTA Button with 3D Effect */}
              <Floating3DCard intensity={8} className="mt-8">
                <Link href="/interview/new">
                  <Button 
                    size="lg" 
                    className="group relative overflow-hidden px-8 py-6 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-primary/20 transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Start Your Free Interview
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </Button>
                </Link>
              </Floating3DCard>

              {/* Floating Stats */}
              <div className="grid grid-cols-3 gap-8 mt-16 w-full max-w-2xl">
                {[
                  { label: 'Mock Interviews', value: '10K+' },
                  { label: 'Success Rate', value: '95%' },
                  { label: 'AI Feedback', value: 'Instant' }
                ].map((stat, i) => (
                  <Floating3DCard key={stat.label} intensity={3} className="h-full">
                    <div 
                      className="p-6 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 text-center hover:bg-card/50 transition-all duration-300"
                      style={{ animationDelay: `${0.4 + i * 0.1}s` }}
                    >
                      <div className="text-2xl font-bold font-headline text-primary mb-1">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </Floating3DCard>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </section>

        {/* Features Section */}
        <section id="features" className="relative w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tighter">
                  <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Key Features
                  </span>
                </h2>
                <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                  Everything you need to prepare, practice, and perform your best on interview day.
                </p>
              </div>
            </div>
            
            <div className="mx-auto grid max-w-6xl items-start gap-8 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={feature.delay}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-50 flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center justify-center px-4 md:px-6 border-t border-border/50 backdrop-blur-sm bg-background/80">
        <p className="text-xs text-muted-foreground">
          &copy; 2025 Ace Interview. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
