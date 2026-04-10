require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const assessmentsRoutes = require('./routes/assessments');
const takeRoutes = require('./routes/take');
const certificatesRoutes = require('./routes/certificates');
const scoringRoutes = require('./routes/scoring');
const performanceRoutes = require('./routes/performance');
const interviewRoutes = require('./routes/interview');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' },
});

// Rate limiting - Temporarily disabled for smoother demo experience
// app.use(limiter);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/take', takeRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/scoring', scoringRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/interview', interviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'skillfirst-hire-api' });
});

// Security Diagnostic
app.get('/api/diag/security', (req, res) => {
  const crypto = require('crypto');
  const signature = crypto.createHash('sha256').update(JWT_SECRET).digest('hex').substring(0, 8);
  res.json({ service: 'backend', port: PORT, signature, secret_len: JWT_SECRET.length });
});

// Serve frontend static files (Docker: ./frontend, local: ../frontend)
const frontendPath = require('fs').existsSync(path.join(__dirname, 'frontend'))
  ? path.join(__dirname, 'frontend')
  : path.join(__dirname, '../frontend');

app.use(express.static(frontendPath));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// FORCE SYNC: Hardcoded secret to ensure Port 5000 and 5001 always agree.
const JWT_SECRET = 'skillfirst-hire-platform-super-secret-key-2024';
const crypto = require('crypto');
const secretHash = crypto.createHash('sha256').update(JWT_SECRET).digest('hex').substring(0, 8);

app.listen(PORT, () => {
  console.log(`SkillFirst Hire API running on http://localhost:${PORT}`);
  console.log(`🔒 Security Signature: [${secretHash}]`);
});
