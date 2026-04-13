const problemRoutes = require('./routes/problems');
const aptitudeRoutes = require('./routes/aptitude');
const codeExecRoutes = require('./routes/codeExec');
const submissionRoutes = require('./routes/submissions');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const assessmentsRoutes = require('./routes/assessments');
const takeRoutes = require('./routes/take');
const certificatesRoutes = require('./routes/certificates');
const scoringRoutes = require('./routes/scoring');
const performanceRoutes = require('./routes/performance');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' },
});

app.use(limiter);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API is running', service: 'hired-up-api' });
});

// API base route
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Hired-Up API',
    endpoints: ['/api/auth', '/api/jobs', '/api/assessments', '/api/take', '/api/certificates', '/api/scoring', '/api/performance', '/api/health'],
  });
});

// API routes
app.use('/api/auth', authRoutes);
console.log('✅ Route loaded: /api/auth');
app.use('/api/jobs', jobsRoutes);
console.log('✅ Route loaded: /api/jobs');
app.use('/api/assessments', assessmentsRoutes);
console.log('✅ Route loaded: /api/assessments');
app.use('/api/take', takeRoutes);
console.log('✅ Route loaded: /api/take');
app.use('/api/certificates', certificatesRoutes);
console.log('✅ Route loaded: /api/certificates');
app.use('/api/scoring', scoringRoutes);
console.log('✅ Route loaded: /api/scoring');
app.use('/api/performance', performanceRoutes);
console.log('✅ Route loaded: /api/performance');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'hired-up-api' });
});
console.log('✅ Route loaded: /api/health');
app.use('/api/problems', problemRoutes);
console.log("Route loaded: /api/problems");

app.use('/api/aptitude', aptitudeRoutes);
console.log("Route loaded: /api/aptitude");

app.use('/api/execute', codeExecRoutes);
console.log("Route loaded: /api/execute");

app.use('/api/submissions', submissionRoutes);
console.log("Route loaded: /api/submissions");

// 404 handler for unmatched routes (MUST be after all route definitions)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

app.listen(PORT, () => {
  console.log(`🚀 Hired-Up API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
