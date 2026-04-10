const { Pool } = require('pg');
const mongoose = require('mongoose');
require('dotenv').config();

// Models - Local paths now correct
const Candidate = require('./models/Candidate');
const Job = require('./models/Job');
const { Assessment, Question, TestCase } = require('./models/Assessment');
const { CandidateAssessment, Answer } = require('./models/CandidateAssessment');
const { Certificate, CredibilityScore } = require('./models/Misc');

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/skillfirst_hire'
});

const ATLAS_URI = 'mongodb+srv://hiredupuser:Hiredup123@cluster0.ycvsiap.mongodb.net/livecode';

async function migrate() {
  try {
    console.log('--- Database Migration Started ---');
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const idMap = new Map(); // UUID -> ObjectId mapping

    // 1. Migrate Users
    console.log('⏳ Migrating Users...');
    const usersRes = await pgPool.query('SELECT * FROM users');
    for (const row of usersRes.rows) {
      const candidate = new Candidate({
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        fullName: row.full_name,
        companyName: row.company_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      });
      await candidate.save();
      idMap.set(row.id, candidate._id);
    }
    console.log(`✅ Migrated ${usersRes.rowCount} Users`);

    // 2. Migrate Jobs
    console.log('⏳ Migrating Jobs...');
    const jobsRes = await pgPool.query('SELECT * FROM jobs');
    for (const row of jobsRes.rows) {
      const job = new Job({
        recruiterId: idMap.get(row.recruiter_id),
        title: row.title,
        description: row.description,
        skillsRequired: row.skills_required || [],
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      });
      await job.save();
      idMap.set(row.id, job._id);
    }
    console.log(`✅ Migrated ${jobsRes.rowCount} Jobs`);

    // 3. Migrate Assessments
    console.log('⏳ Migrating Assessments...');
    const assessmentsRes = await pgPool.query('SELECT * FROM assessments');
    for (const row of assessmentsRes.rows) {
      const assessment = new Assessment({
        jobId: idMap.get(row.job_id),
        name: row.name,
        type: row.type,
        config: row.config || {},
        createdAt: row.created_at
      });
      await assessment.save();
      idMap.set(row.id, assessment._id);
    }
    console.log(`✅ Migrated ${assessmentsRes.rowCount} Assessments`);

    // 4. Migrate Questions
    console.log('⏳ Migrating Questions...');
    const questionsRes = await pgPool.query('SELECT * FROM questions');
    for (const row of questionsRes.rows) {
      const question = new Question({
        assessmentId: idMap.get(row.assessment_id),
        type: row.type,
        content: row.content,
        options: row.options,
        correctAnswer: row.correct_answer,
        difficulty: row.difficulty,
        points: row.points,
        orderIndex: row.order_index,
        createdAt: row.created_at
      });
      await question.save();
      idMap.set(row.id, question._id);
    }
    console.log(`✅ Migrated ${questionsRes.rowCount} Questions`);

    // 5. Migrate Test Cases
    console.log('⏳ Migrating Test Cases...');
    const tcRes = await pgPool.query('SELECT * FROM test_cases');
    for (const row of tcRes.rows) {
      const tc = new TestCase({
        questionId: idMap.get(row.question_id),
        inputData: row.input_data,
        expectedOutput: row.expected_output,
        isHidden: row.is_hidden,
        createdAt: row.created_at
      });
      await tc.save();
    }
    console.log(`✅ Migrated ${tcRes.rowCount} Test Cases`);

    // 6. Migrate Candidate Assessments
    console.log('⏳ Migrating Candidate Assessments...');
    const caRes = await pgPool.query('SELECT * FROM candidate_assessments');
    for (const row of caRes.rows) {
      const ca = new CandidateAssessment({
        candidateId: idMap.get(row.candidate_id),
        assessmentId: idMap.get(row.assessment_id),
        jobId: idMap.get(row.job_id),
        startedAt: row.started_at,
        completedAt: row.completed_at,
        status: row.status,
        rawScore: row.raw_score,
        weightedScore: row.weighted_score
      });
      await ca.save();
      idMap.set(row.id, ca._id);
    }
    console.log(`✅ Migrated ${caRes.rowCount} Candidate Assessments`);

    // 7. Migrate Certificates
    console.log('⏳ Migrating Certificates...');
    const certsRes = await pgPool.query('SELECT * FROM certificates');
    for (const row of certsRes.rows) {
      const cert = new Certificate({
        candidateId: idMap.get(row.candidate_id),
        platform: row.platform,
        credentialId: row.credential_id,
        credentialUrl: row.credential_url,
        filePath: row.file_path,
        trustScore: row.trust_score,
        status: row.status,
        metadata: row.metadata || {},
        createdAt: row.created_at
      });
      await cert.save();
    }
    console.log(`✅ Migrated ${certsRes.rowCount} Certificates`);

    console.log('--- Migration Finished Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Error:', err);
    process.exit(1);
  }
}

migrate();
