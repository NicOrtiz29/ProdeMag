-- Allow authenticated users to read the `users` table

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies that might block access
DROP POLICY IF EXISTS select_users ON public.users;

-- Create a permissive SELECT policy for authenticated users
CREATE POLICY "public_select_users"
  ON public.users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Grant SELECT privilege to the authenticated role
GRANT SELECT ON public.users TO authenticated;
