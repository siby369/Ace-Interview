import { AuthForm } from '@/components/auth-form';
import { Header } from '@/components/header';

export default function SignUpPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl md:text-5xl">
            Create an Account
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Join Ace Interview to start practicing with AI-powered mock interviews.
          </p>
        </div>
        <AuthForm mode="signup" />
      </main>
    </div>
  );
}
