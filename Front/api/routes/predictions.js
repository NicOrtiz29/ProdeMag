// api/routes/predictions.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { isPredictionAllowed } = require('../utils/time');

// Load matches schedule once (could be cached)
const matchesData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../src/data/worldcup2026.json'), 'utf8'));

router.post('/', async (req, res) => {
  const { user } = req; // set by auth middleware
  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  const { match_id, prediction } = req.body;
  if (!match_id || !Array.isArray(prediction) || prediction.length !== 2) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const match = matchesData.find(m => m.id === match_id);
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }
  // Enforce 45 minute cutoff
  if (!isPredictionAllowed(match)) {
    return res.status(403).json({ error: 'Predictions closed 45 minutes before match start' });
  }
  // Upsert prediction in Supabase
  const { error } = await req.supabase.from('predictions').upsert({
    user_id: user.id,
    match_id,
    prediction,
  }, { onConflict: 'user_id,match_id' });
  if (error) {
    console.error('Supabase upsert error', error);
    return res.status(500).json({ error: 'Database error' });
  }
  return res.json({ success: true });
});

module.exports = router;
