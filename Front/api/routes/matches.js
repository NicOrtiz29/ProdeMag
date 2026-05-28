// api/routes/matches.js
const express = require('express');
const router = express.Router();

// GET /matches — read-only, no authentication required
router.get('/', async (req, res) => {
  const { data, error } = await req.supabase.from('matches').select('*');
  if (error) {
    console.error('[Matches] Error fetching matches:', error);
    return res.status(500).json({ error: 'Database error' });
  }
  return res.json(data || []);
});

module.exports = router;
