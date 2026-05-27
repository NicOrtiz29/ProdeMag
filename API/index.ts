import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables (from the parent directory or API dir if set)
dotenv.config({ path: '../.env' }); 

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
// We use the Service Role Key to bypass RLS and allow inserting into tables
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const API_SPORTS_KEY = process.env.API_SPORTS_KEY || '';
const LEAGUE_ID = process.env.LEAGUE_ID || '1'; // API-Football League 1 = World Cup
const SEASON = process.env.SEASON || '2026';

app.post('/api/sync-matches', async (req, res) => {
  // Check authorization - require passing the service role key to trigger sync
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!API_SPORTS_KEY) {
    return res.status(500).json({ error: 'Falta configurar API_SPORTS_KEY en el .env' });
  }

  try {
    console.log(`[API] Fetching fixtures for World Cup 2026...`);
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?league=${LEAGUE_ID}&season=${SEASON}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_SPORTS_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    const fixtures = data.response;

    if (!fixtures || fixtures.length === 0) {
      return res.json({ message: 'No fixtures found for this league and season yet (or invalid API key).' });
    }

    let updatedCount = 0;

    for (const item of fixtures) {
      const fix = item.fixture;
      const teams = item.teams;
      const goals = item.goals;
      const status = fix.status;

      // Status logic mapping
      let statusStr = 'Not Started';
      if (['1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(status.short)) {
        statusStr = 'In Play';
      } else if (['FT', 'AET', 'PEN'].includes(status.short)) {
        statusStr = 'Finished';
      } else if (['PST', 'CANC', 'ABD'].includes(status.short)) {
        statusStr = 'Postponed';
      }

      await supabase.from('matches').upsert({
        id: fix.id.toString(),
        fecha: 1, // Optional: logic to parse round/matchday could go here
        date: fix.date.split('T')[0],
        time: fix.date.split('T')[1].substring(0, 5),
        local_team: teams.home.name,
        visitor_team: teams.away.name,
        local_code: teams.home.name.substring(0, 3).toUpperCase(),
        visitor_code: teams.away.name.substring(0, 3).toUpperCase(),
        group_name: item.league.round, // e.g. "Group A - 1"
        stadium: fix.venue.name || 'TBD',
        status: statusStr,
        local_goals: goals.home ?? 0,
        visitor_goals: goals.away ?? 0,
        minute: fix.status.elapsed ?? 0,
        updated_at: new Date().toISOString()
      });

      if (statusStr === 'Finished' || statusStr === 'In Play') {
        await supabase.from('official_results').upsert({
          match_id: fix.id.toString(),
          result: [goals.home ?? 0, goals.away ?? 0],
          updated_at: new Date().toISOString()
        });
      }
      
      updatedCount++;
    }

    console.log(`[API] Successfully synced ${updatedCount} matches to Supabase.`);
    res.json({ success: true, count: updatedCount });

  } catch (err) {
    console.error('[API] Error during sync:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`⚽ Backend API running on http://localhost:${PORT}`);
});
