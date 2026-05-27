// api/routes/officialResults.js
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { user } = req;
  // Only admins can update official results
  if (!user || !user.is_admin) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  const { match_id, result } = req.body;
  if (!match_id || !Array.isArray(result) || result.length !== 2) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const { error } = await req.supabase.from('official_results').upsert({
    match_id,
    result,
  }, { onConflict: 'match_id' });
  if (error) {
    console.error('Supabase upsert official result error', error);
    return res.status(500).json({ error: 'Database error' });
  }
  return res.json({ success: true });
});

module.exports = router;
