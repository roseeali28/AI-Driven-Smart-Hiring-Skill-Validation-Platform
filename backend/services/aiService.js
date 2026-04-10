
// Initialize Gemini API (lazily)
let genAI;
function getGenAI() {
  if (!genAI) {
    genAI = new (require('@google/generative-ai').GoogleGenerativeAI)(process.env.GEMINI_API_KEY || 'N/A');
  }
  return genAI;
}

/**
 * Analyzes code for quality, complexity, and best practices.
 * @param {string} code - The candidate's code submission.
 * @param {string} problemDescription - The description of the coding task.
 * @param {string} language - The programming language used (default: python).
 * @returns {Promise<object>} - Analysis results.
 */
async function analyzeCode(code, problemDescription, language = 'python') {
  const modelsToTry = ['gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro'];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Attempting analysis with ${modelName}...`);
      const model = getGenAI().getGenerativeModel({ model: modelName });

      const prompt = `
        You are an expert software engineer and technical interviewer. 
        Analyze the following code submission for a coding challenge.
        
        Problem Description:
        "${problemDescription}"
        
        Candidate's Code (${language}):
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Please provide a detailed evaluation in JSON format with the following fields:
        - bigO: A string representing time and space complexity (e.g., "O(N) time, O(1) space").
        - qualityScore: A number from 1 to 10 for overall code quality.
        - readability: A brief comment on code readability.
        - bestPractices: A list of 2-3 key best practices followed or missed.
        - feedback: A concise, human-like summary of the code and how it could be improved.
        
        Return ONLY the JSON object.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in AI response');
      text = jsonMatch[0];

      console.log(`✅ AI Analysis successful with ${modelName}`);
      return JSON.parse(text);
    } catch (err) {
      console.error(`⚠️ ${modelName} failed:`, err.message);
      lastError = err;
      if (err.status !== 404) break;
    }
  }

  return {
    error: 'AI analysis failed after multiple attempts',
    bigO: 'Unknown',
    qualityScore: 0,
    readability: 'Error processing code',
    feedback: 'Gemini API Error: ' + (lastError ? lastError.message : 'Unknown error')
  };
}

/**
 * OCR for certificate verification using Gemini Vision.
 * @param {string} filePath - Path to the uploaded image file.
 * @returns {Promise<object>} - Extracted certificate details.
 */
async function verifyCertificateOCR(filePath) {
  try {
    console.log('👁️ Running Certificate OCR with Gemini (gemini-1.5-flash-latest)...');
    const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const fs = require('fs');

    const imageBuffer = fs.readFileSync(filePath);
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg', // Multer should handle type validation
      },
    };

    const prompt = `
      Analyze this certificate image carefully. 
      Identify the platform (e.g., Pearson, Coursera, Udemy, Cisco, Google) from any logos, headers, or footers.
      
      Extract the following information in JSON format:
      - platform: The issuing platform name.
      - candidateName: Full name of the certificate holder.
      - courseName: Full name of the course/exam/certification.
      - issueDate: Date issued (if visible).
      - credentialId: ID or serial number (if visible).
      - trustScore: Confidence score (0-100) based on authenticity indicators like official logos and professional formatting.
      
      Return ONLY the JSON object.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');
    text = jsonMatch[0];

    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini OCR Error:', err);
    return { error: 'OCR processing failed' };
  }
}

/**
 * Generates a technical assessment using Gemini.
 * @param {string} jobTitle 
 * @param {string} jobDescription 
 * @param {string[]} skills 
 * @returns {Promise<object>} - Assessment with questions
 */
async function generateAssessmentQuestions(jobTitle, jobDescription, skills = []) {
  try {
    console.log(`🧠 AI Generating assessment for: ${jobTitle}...`);
    const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `
      You are a world-class technical interviewer. Create a professional technical assessment for the following job:
      Job Title: ${jobTitle}
      Description: ${jobDescription}
      Required Skills: ${skills.join(', ')}

      Generate:
      1. EXACTLY 3 Multiple Choice Questions (MCQ_SINGLE).
      2. EXACTLY 1 Coding Challenge (CODING) with 2 test cases.

      Return ONLY a JSON object with this exact structure:
      {
        "name": "Technical Assessment for ${jobTitle}",
        "type": "SKILL_VALIDATION",
        "questions": [
          {
            "type": "MCQ_SINGLE",
            "content": "Question text?",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "Exact string of the correct option",
            "points": 10,
            "difficulty": "MEDIUM"
          },
          {
            "type": "CODING",
            "content": "Provide a coding problem description and the required function signature.",
            "points": 40,
            "difficulty": "HARD",
            "testCases": [
              { "input": "input1", "expectedOutput": "output1", "isHidden": false },
              { "input": "input2", "expectedOutput": "output2", "isHidden": true }
            ]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');
    text = jsonMatch[0];

    return JSON.parse(text);
  } catch (err) {
    console.error('⚠️ AI Assessment Generation Error (Falling back to Mock):', err.message);
    
    // Return a Dynamic Mock to keep the app functional and diverse
    const mainSkill = skills[0] || 'Software Engineering';
    const altSkill = skills[1] || 'System Design';
    
    return {
      "name": `Technical Proficiency Lab: ${jobTitle}`,
      "type": "SKILL_VALIDATION",
      "questions": [
        {
          "type": "MCQ_SINGLE",
          "content": `In professional ${mainSkill} development, what is the most critical factor for long-term maintainability?`,
          "options": ["Code Documentation", "High Test Coverage", "Minimal Complexity", "All of the above"],
          "correctAnswer": "All of the above",
          "points": 10,
          "difficulty": "MEDIUM"
        },
        {
          "type": "MCQ_SINGLE",
          "content": `Which of these concepts is a fundamental pillar of ${altSkill}?`,
          "options": ["Encapsulation", "Global Variables", "Manual Memory Management", "Monolithic State"],
          "correctAnswer": "Encapsulation",
          "points": 10,
          "difficulty": "MEDIUM"
        },
        {
          "type": "MCQ_SINGLE",
          "content": `What is a common bottleneck when scaling a ${jobTitle} application?`,
          "options": ["Unoptimized Database Queries", "Excessive Comments", "Proper Variable Naming", "Using a Version Control System"],
          "correctAnswer": "Unoptimized Database Queries",
          "points": 10,
          "difficulty": "MEDIUM"
        },
        {
          "type": "CODING",
          "content": `MISSION: Optimize a '${mainSkill}' module. 
          TASK: Write a function 'calculateMetric(data)' that processes a frequency array and returns the median value.
          Context: High-performance ${jobTitle} requirement.`,
          "points": 40,
          "difficulty": "HARD",
          "testCases": [
            { "input": "[1,3,3,6,7,8,9]", "expectedOutput": "6", "isHidden": false },
            { "input": "[1,2,3,4,5,6,8,9]", "expectedOutput": "4.5", "isHidden": true }
          ]
        }
      ]
    };
  }
}

module.exports = { analyzeCode, verifyCertificateOCR, generateAssessmentQuestions };
