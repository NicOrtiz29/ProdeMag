// api/routes/officialResults.js
const express = require('express');
const router = express.Router();

// Validation constants
const MAX_GOALS = 20;
const MIN_GOALS = 0;

router.post('/', async (req, res) => {
  const { user } = req;

  // ──── 1. Authentication + Admin authorization ────
  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  if (!user.isAdmin) {
    console.warn(`[OfficialResults] Non-admin user ${user.id} (role: ${user.role}) tried to update results`);
    return res.status(403).json({ error: 'Admin privileges required' });
  }

  // ──── 2. Payload validation ────
  const { match_id, result } = req.body;
  if (!match_id || typeof match_id !== 'string') {
    return res.status(400).json({ error: 'match_id is required and must be a string' });
  }
  if (!Array.isArray(result) || result.length !== 2) {
    return res.status(400).json({ error: 'result must be an array of exactly 2 numbers' });
  }

  // ──── 3. Validate result values are safe integers ────
  const [homeGoals, awayGoals] = result;
  if (
    !Number.isInteger(homeGoals) || !Number.isInteger(awayGoals) ||
    homeGoals < MIN_GOALS || homeGoals > MAX_GOALS ||
    awayGoals < MIN_GOALS || awayGoals > MAX_GOALS
  ) {
    return res.status(400).json({
      error: `Each result value must be an integer between ${MIN_GOALS} and ${MAX_GOALS}`
    });
  }

  // ──── 4. Sanitized upsert ────
  const sanitizedResult = [homeGoals, awayGoals];

  const { error } = await req.supabase.from('official_results').upsert({
    match_id,
    result: sanitizedResult,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'match_id' });

  if (error) {
    console.error('[OfficialResults] Supabase upsert error:', error);
    return res.status(500).json({ error: 'Database error' });
  }

  console.log(`[OfficialResults] Admin ${user.id} set match ${match_id}: [${sanitizedResult}]`);
  return res.json({ success: true });
});

module.exports = router;
