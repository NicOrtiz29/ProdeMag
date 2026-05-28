-- Supabase Schema Initialization for Prode Magnético

-- 1. Create public.users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  name TEXT,
  province TEXT,
  role TEXT DEFAULT 'user',
  avatar TEXT
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all profiles." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. Trigger to automatically create profile when user signs up
-- Security (#7): Role is ALWAYS forced to 'user' — never read from user metadata
-- to prevent privilege escalation via manipulated signup requests.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, province, avatar)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 
    'user',  -- SECURITY: Always 'user', never from metadata
    NEW.raw_user_meta_data->>'province',
    COALESCE(NEW.raw_user_meta_data->>'avatar', '⚽')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create predictions table
CREATE TABLE public.predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL,
  match_id TEXT NOT NULL,
  prediction JSONB NOT NULL, -- Format: [local_goals, visitor_goals]
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, match_id)
);

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all predictions." ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Users can insert own predictions." ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own predictions." ON public.predictions FOR UPDATE USING (auth.uid() = user_id);
-- Security (#10): Explicit DELETE policy — users can only delete their own predictions
CREATE POLICY "Users can delete own predictions." ON public.predictions FOR DELETE USING (auth.uid() = user_id);

-- 4. Create official_results table
CREATE TABLE public.official_results (
  match_id TEXT PRIMARY KEY,
  result JSONB NOT NULL, -- Format: [local_goals, visitor_goals]
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.official_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read official results." ON public.official_results FOR SELECT USING (true);
-- Admins update this table via the API using service_role (which bypasses RLS) or a specific policy if needed.
CREATE POLICY "Admins can update official results." ON public.official_results FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Admins can insert official results." ON public.official_results FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'Superadmin'))
);

-- 5. Create matches table
CREATE TABLE public.matches (
  id TEXT PRIMARY KEY,
  fecha INTEGER,
  date TEXT,
  time TEXT,
  local_team TEXT,
  visitor_team TEXT,
  local_code TEXT,
  visitor_code TEXT,
  group_name TEXT,
  stadium TEXT,
  status TEXT DEFAULT 'Not Started',
  local_goals INTEGER DEFAULT 0,
  visitor_goals INTEGER DEFAULT 0,
  minute INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read matches." ON public.matches FOR SELECT USING (true);
CREATE POLICY "Admins can update matches." ON public.matches FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'Superadmin'))
);

-- 6. Create settings table (Security #3: RLS enabled from schema)
CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  points_exact INTEGER DEFAULT 5,
  points_winner INTEGER DEFAULT 2,
  points_formation INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings." ON public.settings FOR SELECT USING (true);
CREATE POLICY "Only admins can modify settings." ON public.settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'Superadmin'))
);
