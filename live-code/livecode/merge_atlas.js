const mongoose = require('mongoose');

const ATLAS_BASE = 'mongodb+srv://hiredupuser:Hiredup123@cluster0.ycvsiap.mongodb.net/';

async function migrate() {
  try {
    console.log('--- Atlas Internal Migration: test -> livecode ---');
    
    const connTest = await mongoose.createConnection(ATLAS_BASE + 'test').asPromise();
    const connLive = await mongoose.createConnection(ATLAS_BASE + 'livecode').asPromise();
    
    // 1. Move 'users'
    const users = await connTest.db.collection('users').find().toArray();
    console.log(`⏳ Moving ${users.length} users...`);
    if (users.length > 0) {
      // We'll insert them into 'users' collection in livecode (to match Mongoose default)
      // If 'candidates' was intended, we'll sync them there too or rename later.
      await connLive.db.collection('users').insertMany(users);
      console.log('✅ Users moved');
    }

    // 2. Check and Sync 'jobs' if missing
    const liveJobsCount = await connLive.db.collection('jobs').countDocuments();
    if (liveJobsCount === 0) {
      const jobs = await connTest.db.collection('jobs').find().toArray();
      console.log(`⏳ Moving ${jobs.length} jobs...`);
      if (jobs.length > 0) {
        await connLive.db.collection('jobs').insertMany(jobs);
        console.log('✅ Jobs moved');
      }
    } else {
      console.log(`ℹ️ livecode already has ${liveJobsCount} jobs. Skipping sync.`);
    }

    await connTest.close();
    await connLive.close();
    console.log('--- Migration Finished ---');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
