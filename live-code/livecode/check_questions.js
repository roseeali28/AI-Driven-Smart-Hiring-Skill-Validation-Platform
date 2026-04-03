const fs = require('fs');
const path = require('path');
const questionsPath = path.join(__dirname, 'data', 'aptitude_questions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

const stats = {};

questions.forEach(q => {
  const key = `${q.category} - ${q.topic}`;
  stats[key] = (stats[key] || 0) + 1;
});

console.log('--- Aptitude Question Statistics ---');
Object.keys(stats).sort().forEach(key => {
  console.log(`${key}: ${stats[key]}`);
});
console.log('Total Questions:', questions.length);
