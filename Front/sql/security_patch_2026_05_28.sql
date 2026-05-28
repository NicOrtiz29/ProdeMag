-- ============================================================
-- SECURITY PATCH: Apply to existing Supabase database
-- Run this in Supabase SQL Editor to fix all audit findings
-- Date: 2026-05-28
-- ============================================================

-- ─── #7: Fix trigger — force role='user' always ─────────────────────────────
-- Prevents privilege escalation via manipulated signup metadata
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

-- ─── #10: Add explicit DELETE policy for predictions ─────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'predictions' AND policyname = 'Users can delete own predictions.'
  ) THEN
    CREATE POLICY "Users can delete own predictions." ON public.predictions FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── #3: Create settings table with RLS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  points_exact INTEGER DEFAULT 5,
  points_winner INTEGER DEFAULT 2,
  points_formation INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read settings." ON public.settings;
CREATE POLICY "Anyone can read settings." ON public.settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify settings." ON public.settings;
CREATE POLICY "Only admins can modify settings." ON public.settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'Superadmin'))
);

-- ─── #3: Ensure prizes table has correct RLS ─────────────────────────────────
-- (The create_prizes_table.sql already has RLS, but reinforce here)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'prizes') THEN
    ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Anyone can read prizes." ON public.prizes;
    CREATE POLICY "Anyone can read prizes." ON public.prizes FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Admins can update prizes." ON public.prizes;
    CREATE POLICY "Admins can update prizes." ON public.prizes FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'Superadmin')
      )
    );
  END IF;
END $$;

-- ─── #3: Ensure messages table has correct RLS ───────────────────────────────
-- (The create_messages_table.sql already has RLS, but reinforce here)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    
    -- Drop old permissive policies if they exist and recreate
    DROP POLICY IF EXISTS "allow select" ON public.messages;
    DROP POLICY IF EXISTS "allow insert" ON public.messages;
    DROP POLICY IF EXISTS "Anyone can read messages" ON public.messages;
    DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.messages;
    
    CREATE POLICY "Anyone can read messages" ON public.messages FOR SELECT USING (true);
    CREATE POLICY "Authenticated users can insert messages" ON public.messages FOR INSERT 
      WITH CHECK (auth.uid() IS NOT NULL);
    -- No DELETE or UPDATE policy = users cannot delete or edit messages
  END IF;
END $$;

-- ============================================================
-- VERIFICATION: Run this after applying to confirm RLS status
-- ============================================================
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
