const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

async function verify() {
  try {
    console.log('--- Final Connectivity Verification ---');
    console.log('URI:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const userCount = await User.countDocuments();
    console.log(`📊 Final User/Candidate Count: ${userCount}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
