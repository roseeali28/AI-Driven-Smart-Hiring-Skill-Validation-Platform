
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection with Offline Fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/livecode';
let isOffline = false;

mongoose.connect(MONGODB_URI, { 
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000 
})
    .then(() => console.log('✅ Live Code DB Connected (Atlas/Cloud)'))
    .catch(err => {
        isOffline = true;
        console.log('⚠️ Live Code DB Error: Running in OFFLINE MODE (Fallback to Local may be needed)');
        console.error('Connection Error:', err.message);
    });

// Middleware to pass offline status
app.use((req, res, next) => {
    req.isOffline = isOffline;
    next();
});

// Import and apply auth middleware globally
const { authenticate } = require('./middleware/auth');
app.use(authenticate);

// Routes
const problemsRouter = require('./routes/problems');
const codeExecRouter = require('./routes/codeExec');
const submissionsRouter = require('./routes/submissions');
const aptitudeRouter = require('./routes/aptitude');
const certificatesRouter = require('./routes/certificates');

app.use('/api/problems', problemsRouter);
app.use('/api/execute', codeExecRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/aptitude', aptitudeRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Live Code Practice API is running');
});

// Security Diagnostic
app.get('/api/diag/security', (req, res) => {
    const crypto = require('crypto');
    const signature = crypto.createHash('sha256').update(JWT_SECRET).digest('hex').substring(0, 8);
    res.json({ service: 'live-code', port: PORT, signature, secret_len: JWT_SECRET.length });
});

// Start Server
const crypto = require('crypto');
const JWT_SECRET = 'skillfirst-hire-platform-super-secret-key-2024';
const secretHash = crypto.createHash('sha256').update(JWT_SECRET).digest('hex').substring(0, 8);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
    console.log(`🔒 Security Signature: [${secretHash}]`);
});
