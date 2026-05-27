// api/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // service role key for admin writes
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// Middleware to attach supabase client
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Middleware to attach supabase client and user info
const authMiddleware = require('./middleware/auth');
app.use(authMiddleware);

// Routes
const predictionsRouter = require('./routes/predictions');
const officialResultsRouter = require('./routes/officialResults');
const matchesRouter = require('./routes/matches');

app.use('/predictions', predictionsRouter);
app.use('/official-results', officialResultsRouter);
app.use('/matches', matchesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
