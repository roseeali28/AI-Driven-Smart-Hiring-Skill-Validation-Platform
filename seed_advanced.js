const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Job = require('./backend/models/Job');
require('dotenv').config({ path: './backend/.env' });

async function seedAdvancedJobs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hiredup');
    console.log('Connected to MongoDB for advanced seeding...');

    const jobs = [
      {
        _id: uuidv4(),
        title: 'Senior AI Research Engineer',
        description: 'Leading the development of next-gen LLM agents and multi-modal models.',
        skills_required: ['Python', 'PyTorch', 'Transformers', 'MLOps', 'Vector DBs'],
        location: 'San Francisco / Remote',
        salary_range: '$180k - $250k',
        status: 'ACTIVE'
      },
      {
        _id: uuidv4(),
        title: 'Full Stack Product Engineer',
        description: 'Building beautiful, recursive UIs and robust backend services.',
        skills_required: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
        location: 'Austin / Hybrid',
        salary_range: '$130k - $170k',
        status: 'ACTIVE'
      },
      {
        _id: uuidv4(),
        title: 'Cloud Infrastructure Architect',
        description: 'Architecting high-availability systems on AWS and Kubernetes.',
        skills_required: ['AWS', 'Kubernetes', 'Terraform', 'Go', 'GCP'],
        location: 'Remote',
        salary_range: '$160k - $210k',
        status: 'ACTIVE'
      }
    ];

    for (const job of jobs) {
      const exists = await Job.findOne({ title: job.title });
      if (!exists) {
        await new Job(job).save();
        console.log(`Added job: ${job.title}`);
      }
    }

    console.log('Advanced seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedAdvancedJobs();
