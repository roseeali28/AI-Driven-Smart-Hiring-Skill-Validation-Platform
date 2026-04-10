const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Job = require('./models/Job');
const User = require('./models/User');
require('dotenv').config();

async function seedProData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hiredup');
    console.log('Connected to MongoDB...');

    // 1. Find a sample recruiter or create one
    let recruiter = await User.findOne({ role: 'RECRUITER' });
    if (!recruiter) {
      console.log('No recruiter found, creating sample...');
      recruiter = new User({
        _id: uuidv4(),
        email: 'recruiter@enterprise.com',
        passwordHash: 'no-pass',
        role: 'RECRUITER',
        fullName: 'Enterprise Hiring Team',
        companyName: 'Global Tech Corp'
      });
      await recruiter.save();
    }

    // 2. Clear existing sample jobs to avoid duplicates
    await Job.deleteMany({ title: { $in: ['Fullstack Developer (Node/React)', 'AI Solutions Architect'] } });

    const jobsData = [
      {
        _id: uuidv4(),
        recruiter_id: recruiter.id,
        title: 'Fullstack Developer (Node/React)',
        description: 'We are looking for a developer to build recursive, high-performance web applications using modern stacks.',
        skills_required: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'TailwindCSS'],
        location: 'Remote',
        salary_range: '$100k - $140k'
      },
      {
        _id: uuidv4(),
        recruiter_id: recruiter.id,
        title: 'AI Solutions Architect',
        description: 'Design and implement LLM-based solutions for enterprise scale. Knowledge of RAG and Vector DBs is a plus.',
        skills_required: ['Python', 'LLM', 'LangChain', 'Pinecone', 'AWS'],
        location: 'New York / Remote',
        salary_range: '$160k - $220k'
      }
    ];

    for (const data of jobsData) {
      const job = new Job(data);
      await job.save();
      console.log(`✅ Created Job: ${job.title}`);
    }

    // Also update the existing "Web Developer" job if it exists to have skills
    const webDev = await Job.findOne({ title: /Web Developer/i });
    if (webDev) {
      webDev.skills_required = ['Javascript', 'HTML', 'CSS', 'React'];
      await webDev.save();
      console.log('✅ Updated existing Web Developer job with skills');
    }

    console.log('🚀 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedProData();
