const fs = require('fs');
const path = 'c:/Users/YUV RAJ SINGH YADAV/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main-main/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main-main/live-code/livecode/routes/codeExec.js';
let content = fs.readFileSync(path, 'utf8');

const targetStart = '// 3. Local C++ Execution (54)';
let startIndex = content.indexOf(targetStart);
let endIndex = content.indexOf('// Fallback', startIndex);

if(startIndex !== -1 && endIndex !== -1) {
    const replacement = `// 3. Local + Cloud Fallback C++ Execution (54)
            if (langId === 54) {
                const executeCppPiston = async (code, input) => {
                    const res = await axios.post('https://emkc.org/api/v2/piston/execute', {
                        language: "cpp",
                        version: "10.2.0",
                        files: [{ content: code }],
                        stdin: input || ""
                    });
                    return {
                        stdout: res.data.run.stdout,
                        stderr: res.data.run.stderr || res.data.compile?.stderr,
                        error: res.data.compile?.code !== 0 || res.data.run.code !== 0
                    };
                };

                if (problem && problem.testCases && problem.testCases.length > 0) {
                    const results = [];
                    for (let i = 0; i < problem.testCases.length; i++) {
                        const testCase = problem.testCases[i];
                        try {
                            const { stdout, stderr, error } = await executeCppPiston(source_code, testCase.input);
                            const actualOutput = stdout ? stdout.trim() : (stderr ? "Runtime Error" : "No output");
                            const status = actualOutput === testCase.output.trim() ? "Accepted" : (error ? "Runtime Error" : "Wrong Answer");
                            
                            results.push({
                                testCaseId: i + 1,
                                input: testCase.input,
                                expectedOutput: testCase.output,
                                actualOutput: stderr ? "Runtime/Compile Error\\n" + stderr.substring(0, 100) : actualOutput,
                                status: status
                            });
                        } catch (e) {
                            results.push({
                                testCaseId: i + 1,
                                input: testCase.input,
                                expectedOutput: testCase.output,
                                actualOutput: "Execution Failed via Cloud Fallback",
                                status: "Runtime Error"
                            });
                        }
                    }
                    const allPassed = results.every(r => r.status === "Accepted");
                    return res.json({
                        status: { description: allPassed ? "Accepted" : "Wrong Answer" },
                        testCaseResults: results,
                        stdout: "Test cases processed via Cloud Fallback."
                    });
                } else {
                    // Single execution
                    try {
                        const { stdout, stderr, error } = await executeCppPiston(source_code, stdin);
                        return res.json({
                            stdout: stdout || "",
                            stderr: stderr || null,
                            status: { id: error ? 11 : 3, description: error ? 'Runtime Error' : 'Accepted' }
                        });
                    } catch (e) {
                        return res.json({
                            stdout: "",
                            stderr: "Failed to connect to fallback execution engine.\\n" + String(e),
                            status: { id: 11, description: 'Runtime Error' }
                        });
                    }
                }
            }

            `;
    
    content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully replaced C++ execution logic.");
} else {
    console.log("Could not find the target blocks.");
}
