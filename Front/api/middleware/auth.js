// api/middleware/auth.js
// Resolves the Supabase Auth user AND enriches with profile data (role, etc.)
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    // 1. Validate the JWT and get the auth user
    const { data: { user }, error: authError } = await req.supabase.auth.getUser(token);
    if (authError || !user) {
      console.warn('[Auth] Invalid or expired token');
      req.user = null;
      return next();
    }

    // 2. Fetch the profile from public.users to get role, name, etc.
    const { data: profile, error: profileError } = await req.supabase
      .from('users')
      .select('id, email, name, role, province, avatar')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.warn('[Auth] User has no profile in public.users:', user.id);
      req.user = { id: user.id, email: user.email };
      return next();
    }

    // 3. Attach enriched user with isAdmin flag
    req.user = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      province: profile.province,
      avatar: profile.avatar,
      isAdmin: profile.role === 'admin' || profile.role === 'Superadmin',
    };
  } catch (e) {
    console.error('[Auth] Unexpected error:', e);
    req.user = null;
  }
  next();
};
