const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
console.log(`Using URI: ${MONGODB_URI ? MONGODB_URI.substring(0, 20) + '...' : 'UNDEFINED'}`);

const Problem = require('./models/Problem');
const AptitudeQuestion = require('./models/AptitudeQuestion');

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');
        const pCount = await Problem.countDocuments();
        const aCount = await AptitudeQuestion.countDocuments();
        console.log(`Problems: ${pCount}`);
        console.log(`Aptitude: ${aCount}`);
    } catch (e) {
        console.error('❌ Connection Error:', e.message);
    } finally {
        mongoose.disconnect();
    }
}

check();
