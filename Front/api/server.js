// api/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ──── CORS: restrict to known origins ────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  process.env.FRONTEND_URL, // For production
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ──── Body size limit (prevent abuse) ────
app.use(express.json({ limit: '10kb' }));

// ──── Simple in-memory rate limiter ────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // max 60 requests per minute per IP

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return next();
  }

  const entry = rateLimitMap.get(ip);
  if (now - entry.startTime > RATE_LIMIT_WINDOW_MS) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return next();
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    console.warn(`[RateLimit] IP ${ip} exceeded ${RATE_LIMIT_MAX} req/min`);
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }
  next();
});

// ──── Supabase client (service role for DB operations) ────
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// Attach supabase client to request
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// ──── Auth middleware (validates JWT + fetches user profile/role) ────
const authMiddleware = require('./middleware/auth');
app.use(authMiddleware);

// ──── Routes ────
const predictionsRouter = require('./routes/predictions');
const officialResultsRouter = require('./routes/officialResults');
const matchesRouter = require('./routes/matches');

app.use('/predictions', predictionsRouter);
app.use('/official-results', officialResultsRouter);
app.use('/matches', matchesRouter);

// ──── Error handling ────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`⚽ API server listening on http://localhost:${PORT}`));
