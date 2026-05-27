// api/middleware/auth.js
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const { data: { user } } = await req.supabase.auth.getUser(token);
    req.user = user;
  } catch (e) {
    console.error('Auth error', e);
    req.user = null;
  }
  next();
};
