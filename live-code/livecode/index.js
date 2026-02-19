
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/livecode';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
const problemsRouter = require('./routes/problems');
const codeExecRouter = require('./routes/codeExec');
const submissionsRouter = require('./routes/submissions');

app.use('/api/problems', problemsRouter);
app.use('/api/execute', codeExecRouter);
app.use('/api/submissions', submissionsRouter);

app.get('/', (req, res) => {
    res.send('Live Code Practice API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

