const mongoose = require('mongoose');

const ATLAS_BASE = 'mongodb+srv://hiredupuser:Hiredup123@cluster0.ycvsiap.mongodb.net/';

async function check() {
  try {
    console.log('--- Atlas Cross-DB Check ---');
    
    // Check 'test' database
    const connTest = await mongoose.createConnection(ATLAS_BASE + 'test').asPromise();
    const collectionsTest = await connTest.db.listCollections().toArray();
    console.log('\n--- [test] Database ---');
    for (const col of collectionsTest) {
      const count = await connTest.db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
    }
    await connTest.close();

    // Check 'livecode' database
    const connLive = await mongoose.createConnection(ATLAS_BASE + 'livecode').asPromise();
    const collectionsLive = await connLive.db.listCollections().toArray();
    console.log('\n--- [livecode] Database ---');
    for (const col of collectionsLive) {
      const count = await connLive.db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
    }
    await connLive.close();

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
