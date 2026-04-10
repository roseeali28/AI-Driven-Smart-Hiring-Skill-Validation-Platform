const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function diagnose() {
  try {
    console.log('--- GEMINI API DIAGNOSTIC ---');
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'FOUND (starts with ' + process.env.GEMINI_API_KEY.substring(0, 5) + ')' : 'MISSING');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Test basic connectivity
    console.log('\nTesting connection with gemini-1.5-flash...');
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Hello, are you active? answer in one word.');
        const response = await result.response;
        console.log('✅ Connection Sucessful. Response:', response.text());
    } catch (e) {
        console.error('❌ gemini-1.5-flash failed:', e.message);
    }

    console.log('\nTesting connection with gemini-1.5-flash-latest...');
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const result = await model.generateContent('Hi. answer "OK"');
        const response = await result.response;
        console.log('✅ gemini-1.5-flash-latest Successful. Response:', response.text());
    } catch (e) {
        console.error('❌ gemini-1.5-flash-latest failed:', e.message);
    }

    console.log('\nTesting connection with gemini-pro...');
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent('Hi. answer "OK"');
        const response = await result.response;
        console.log('✅ gemini-pro Successful. Response:', response.text());
    } catch (e) {
        console.error('❌ gemini-pro failed:', e.message);
    }

  } catch (err) {
    console.error('\n💥 CRITICAL DIAGNOSTIC ERROR:', err.message);
  }
}

diagnose();
