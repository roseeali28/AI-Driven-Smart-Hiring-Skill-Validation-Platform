
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

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => console.log('✅ Live Code DB Connected'))
    .catch(err => {
        isOffline = true;
        console.log('⚠️ Live Code DB Error: Running in OFFLINE MODE');
    });

// Middleware to pass offline status
app.use((req, res, next) => {
    req.isOffline = isOffline;
    next();
});

// Routes
const problemsRouter = require('./routes/problems');
const codeExecRouter = require('./routes/codeExec');
const submissionsRouter = require('./routes/submissions');
const aptitudeRouter = require('./routes/aptitude');

app.use('/api/problems', problemsRouter);
app.use('/api/execute', codeExecRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/aptitude', aptitudeRouter);

app.get('/', (req, res) => {
    res.send('Live Code Practice API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
