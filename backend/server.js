require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const assessmentsRoutes = require('./routes/assessments');
const takeRoutes = require('./routes/take');
const certificatesRoutes = require('./routes/certificates');
const scoringRoutes = require('./routes/scoring');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' },
});

app.use(limiter);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/take', takeRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/scoring', scoringRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'skillfirst-hire-api' });
});

// Serve frontend static files (Docker: ./frontend, local: ../frontend)
const frontendPath = require('fs').existsSync(path.join(__dirname, 'frontend'))
  ? path.join(__dirname, 'frontend')
  : path.join(__dirname, '../frontend/api/assets');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SkillFirst Hire API running on http://localhost:${PORT}`);
});
