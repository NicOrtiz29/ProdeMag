/*
  Enable Row Level Security (RLS) and create a policy that only allows
  users whose role in the `users` table is 'admin' or 'Superadmin'
  to INSERT/UPDATE/DELETE rows in `official_results`.
*/

-- Enable RLS on the table (if not already enabled)
ALTER TABLE official_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policy (optional, safe if it doesn't exist)
DROP POLICY IF EXISTS admin_can_modify_official_results ON official_results;

-- Create a policy that checks the role via a join with the users table
CREATE POLICY admin_can_modify_official_results
  ON official_results
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND (users.role = 'admin' OR users.role = 'Superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND (users.role = 'admin' OR users.role = 'Superadmin')
    )
  );

-- Optional: Grant the authenticated role to select (read) the table
GRANT SELECT ON official_results TO anon, authenticated;
