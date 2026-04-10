const mongoose = require('mongoose');
require('dotenv').config();

const Problem = require('./models/Problem');
const AptitudeQuestion = require('./models/AptitudeQuestion');

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const pCount = await Problem.countDocuments();
        const aCount = await AptitudeQuestion.countDocuments();
        console.log(`Problems: ${pCount}`);
        console.log(`Aptitude: ${aCount}`);
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

check();
