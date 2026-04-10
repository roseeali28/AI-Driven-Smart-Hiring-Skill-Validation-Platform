const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://hiredupuser:Hiredup123@cluster0.ycvsiap.mongodb.net/livecode';

async function rename() {
  try {
    console.log('--- Collection Rename ---');
    const conn = await mongoose.createConnection(ATLAS_URI).asPromise();
    
    // Check if 'users' exists and 'candidates' is empty/missing
    const collections = await conn.db.listCollections().toArray();
    const hasUsers = collections.some(c => c.name === 'users');
    const hasCandidates = collections.some(c => c.name === 'candidates');

    if (hasUsers) {
      if (hasCandidates) {
        const candidateCount = await conn.db.collection('candidates').countDocuments();
        if (candidateCount === 0) {
          console.log('🗑️ Deleting empty candidates collection...');
          await conn.db.collection('candidates').drop();
        } else {
          console.log('⚠️ candidates collection is NOT empty. Skipping rename to avoid data loss.');
          await conn.close();
          process.exit(0);
        }
      }
      
      console.log('🔄 Renaming users -> candidates...');
      await conn.db.collection('users').rename('candidates');
      console.log('✅ Rename complete');
    }

    await conn.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

rename();
