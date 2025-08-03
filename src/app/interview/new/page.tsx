import { RoleSelectionForm } from '@/components/role-selection-form';
import { Header } from '@/components/header';

export default function NewInterviewPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl md:text-5xl">
            Choose Your Role
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Select a role to begin your mock interview. The questions will be
            tailored to this position.
          </p>
        </div>
        <RoleSelectionForm />
      </main>
    </div>
  );
}
