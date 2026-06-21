-- Allow users to insert their own profile (fallback for existing users)
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Backfill any missing profiles for existing users
INSERT INTO public.profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;
