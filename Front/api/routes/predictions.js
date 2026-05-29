// api/routes/predictions.js
const express = require('express');
const router = express.Router();
const { isPredictionAllowed } = require('../utils/time');
// Load matches schedule once (required directly so bundler packages it)
const matchesData = require('../../src/data/worldcup2026.json');

// Validation constants
const MAX_GOALS = 20; // Maximum realistic goals per team in a single match
const MIN_GOALS = 0;

router.post('/', async (req, res) => {
  // ──── 1. Authentication ────
  const { user } = req; // set by auth middleware
  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  // ──── 2. Payload validation ────
  const { match_id, prediction } = req.body;
  if (!match_id || typeof match_id !== 'string') {
    return res.status(400).json({ error: 'match_id is required and must be a string' });
  }
  if (!Array.isArray(prediction) || prediction.length !== 2) {
    return res.status(400).json({ error: 'prediction must be an array of exactly 2 numbers' });
  }

  // ──── 3. Validate prediction values are safe integers ────
  const [homeGoals, awayGoals] = prediction;
  if (
    !Number.isInteger(homeGoals) || !Number.isInteger(awayGoals) ||
    homeGoals < MIN_GOALS || homeGoals > MAX_GOALS ||
    awayGoals < MIN_GOALS || awayGoals > MAX_GOALS
  ) {
    return res.status(400).json({
      error: `Each prediction value must be an integer between ${MIN_GOALS} and ${MAX_GOALS}`
    });
  }

  // ──── 4. Match existence check ────
  const match = matchesData.find(m => m.id === match_id);
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  // ──── 5. Enforce 45-minute cutoff (server-side, non-bypassable) ────
  if (!isPredictionAllowed(match)) {
    return res.status(403).json({ error: 'Predictions closed 45 minutes before match start' });
  }

  // ──── 6. Force user_id from token (never trust client) ────
  const sanitizedPrediction = [homeGoals, awayGoals];

  const { error } = await req.supabase.from('predictions').upsert({
    user_id: user.id,       // ALWAYS from the authenticated token, never from body
    match_id,
    prediction: sanitizedPrediction,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,match_id' });

  if (error) {
    console.error('[Predictions] Supabase upsert error:', error);
    return res.status(500).json({ error: 'Database error' });
  }

  console.log(`[Predictions] User ${user.id} → match ${match_id}: [${sanitizedPrediction}]`);
  return res.json({ success: true });
});

module.exports = router;
