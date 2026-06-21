-- Create Profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  onboarding_completed BOOLEAN DEFAULT false,
  tokens_remaining INTEGER DEFAULT 100, -- Free tier starting tokens
  practice_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  company TEXT,
  persona TEXT,
  raw_jd TEXT,
  topics JSONB DEFAULT '{}'::jsonb,
  recommended_practice JSONB DEFAULT '[]'::jsonb,
  completed BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Answers table
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  transcript TEXT,
  score INTEGER DEFAULT 0,
  feedback JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create a trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Sessions RLS Policies
CREATE POLICY "Users can view own sessions" 
ON public.sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" 
ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" 
ON public.sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" 
ON public.sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public sessions" 
ON public.sessions FOR SELECT USING (is_public = true);

-- Answers RLS Policies
CREATE POLICY "Users can view answers for own sessions" 
ON public.answers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = answers.session_id AND sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert answers for own sessions" 
ON public.answers FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = answers.session_id AND sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update answers for own sessions" 
ON public.answers FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = answers.session_id AND sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view answers for public sessions" 
ON public.answers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = answers.session_id AND sessions.is_public = true
  )
);
