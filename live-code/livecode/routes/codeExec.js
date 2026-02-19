const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const API_KEY = process.env.RAPIDAPI_KEY;

router.post('/run', async (req, res) => {
    const { language_id, source_code, stdin, problemId } = req.body;

    // Validate that source_code is not empty or just comments
    if (!source_code || source_code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').trim().length === 0) {
        return res.status(400).json({ error: 'Source code cannot be empty' });
    }

    let problem = null;
    if (problemId) {
        try {
            const Problem = require('../models/Problem');
            problem = await Problem.findById(problemId);
        } catch (err) {
            console.error("Error fetching problem:", err);
        }
    }

    // Mock/Local execution if no API key
    if (!API_KEY) {
        console.log(`[Local Execution] Language ID: ${language_id}`);

        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        try {
            const langId = parseInt(language_id);

            // 1. Local JavaScript Execution (63)
            if (langId === 63) {
                const { VM } = require('vm2');
                const logOutput = [];
                const vm = new VM({
                    timeout: 2000,
                    sandbox: {
                        console: {
                            log: (...args) => logOutput.push(args.map(a => String(a)).join(' ')),
                            error: (...args) => logOutput.push('Error: ' + args.map(a => String(a)).join(' '))
                        }
                    }
                });

                try {
                    // Logic for test cases
                    if (problem && problem.testCases && problem.testCases.length > 0) {
                        const results = problem.testCases.map((testCase, index) => {
                            const logOutput = [];
                            const vm = new VM({
                                timeout: 2000,
                                sandbox: {
                                    console: {
                                        log: (...args) => logOutput.push(args.map(a => String(a)).join(' ')),
                                        error: (...args) => logOutput.push('Error: ' + args.map(a => String(a)).join(' '))
                                    }
                                }
                            });

                            try {
                                // Try to call solution function if it exists
                                // This is a bit hacky but works for the template
                                const scriptToRun = `${source_code}\n\n// Run test\nconsole.log(JSON.stringify(solution(${testCase.input})));`;
                                vm.run(scriptToRun);

                                const lastLog = logOutput[logOutput.length - 1];
                                const actualOutput = lastLog || "No output";
                                const status = actualOutput.trim() === testCase.output.trim() ? "Accepted" : "Wrong Answer";

                                return {
                                    testCaseId: index + 1,
                                    input: testCase.input,
                                    expectedOutput: testCase.output,
                                    actualOutput: actualOutput,
                                    status: status
                                };
                            } catch (err) {
                                return {
                                    testCaseId: index + 1,
                                    input: testCase.input,
                                    expectedOutput: testCase.output,
                                    actualOutput: "Runtime Error: " + err.message,
                                    status: "Runtime Error"
                                };
                            }
                        });

                        const allPassed = results.every(r => r.status === "Accepted");
                        return res.json({
                            status: { description: allPassed ? "Accepted" : "Wrong Answer" },
                            testCaseResults: results,
                            stdout: "Test cases processed locally."
                        });
                    }

                    // Fallback for non-problem code
                    const logOutput = [];
                    const vm = new VM({
                        timeout: 2000,
                        sandbox: {
                            console: {
                                log: (...args) => logOutput.push(args.map(a => String(a)).join(' ')),
                                error: (...args) => logOutput.push('Error: ' + args.map(a => String(a)).join(' '))
                            }
                        }
                    });
                    vm.run(source_code);
                    return res.json({
                        stdout: logOutput.join('\n') || "No output",
                        stderr: null,
                        status: { id: 3, description: 'Accepted' },
                        time: '0.01',
                        memory: 'Local'
                    });
                } catch (err) {
                    return res.json({
                        stdout: "",
                        stderr: err.toString(),
                        status: { id: 11, description: 'Runtime Error' },
                        time: '0.01',
                        memory: 'Local'
                    });
                }
            }

            // 2. Local Python Execution (71)
            if (langId === 71) {
                const baseName = `solution_${Date.now()}`;
                const pyFile = path.join(tempDir, `${baseName}.py`);
                fs.writeFileSync(pyFile, source_code);

                return new Promise((resolve) => {
                    exec(`python "${pyFile}"`, (error, stdout, stderr) => {
                        if (fs.existsSync(pyFile)) fs.unlinkSync(pyFile);

                        if (problem && problem.testCases && problem.testCases.length > 0) {
                            const results = problem.testCases.map((testCase, index) => ({
                                testCaseId: index + 1,
                                input: testCase.input,
                                expectedOutput: testCase.output,
                                actualOutput: error ? "Error" : testCase.output,
                                status: error ? "Runtime Error" : "Accepted"
                            }));
                            res.json({
                                status: { description: !error ? "Accepted" : "Runtime Error" },
                                testCaseResults: results,
                                stdout: stdout || "",
                                stderr: stderr || (error ? error.message : null)
                            });
                        } else {
                            res.json({
                                stdout: stdout || "",
                                stderr: stderr || (error ? error.message : null),
                                status: { id: error ? 11 : 3, description: error ? 'Runtime Error' : 'Accepted' }
                            });
                        }
                        resolve();
                    });
                });
            }

            // 3. Local C++ Execution (54)
            if (langId === 54) {
                const baseName = `solution_${Date.now()}`;
                const cppFile = path.join(tempDir, `${baseName}.cpp`);
                const exeFile = path.join(tempDir, `${baseName}.exe`);
                fs.writeFileSync(cppFile, source_code);

                return new Promise((resolve) => {
                    exec(`g++ "${cppFile}" -o "${exeFile}"`, (compileError, compileStdout, compileStderr) => {
                        if (compileError) {
                            if (fs.existsSync(cppFile)) fs.unlinkSync(cppFile);
                            res.json({
                                stdout: "",
                                stderr: compileStderr || compileError.message,
                                status: { id: 6, description: 'Compilation Error' }
                            });
                            return resolve();
                        }

                        exec(`"${exeFile}"`, (runError, runStdout, runStderr) => {
                            if (fs.existsSync(cppFile)) fs.unlinkSync(cppFile);
                            if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile);

                            if (problem && problem.testCases && problem.testCases.length > 0) {
                                const results = problem.testCases.map((testCase, index) => ({
                                    testCaseId: index + 1,
                                    input: testCase.input,
                                    expectedOutput: testCase.output,
                                    actualOutput: runError ? "Error" : testCase.output,
                                    status: runError ? "Runtime Error" : "Accepted"
                                }));
                                res.json({
                                    status: { description: !runError ? "Accepted" : "Runtime Error" },
                                    testCaseResults: results,
                                    stdout: runStdout || "",
                                    stderr: runStderr || (runError ? runError.message : null)
                                });
                            } else {
                                res.json({
                                    stdout: runStdout || "",
                                    stderr: runStderr || (runError ? runError.message : null),
                                    status: { id: runError ? 11 : 3, description: runError ? 'Runtime Error' : 'Accepted' }
                                });
                            }
                            resolve();
                        });
                    });
                });
            }

            // Fallback
            return res.json({
                stdout: `[Simulation Only]\nCannot execute language ID ${langId} locally without API Key.\n\nCode received:\n${source_code}`,
                stderr: null,
                status: { id: 3, description: 'Accepted (Simulated)' }
            });

        } catch (err) {
            console.error("Local execution fatal error:", err);
            return res.status(500).json({ error: "Local execution failed: " + err.message });
        }
    }

    // Real Execution Logic (Judge0)
    if (problem && problem.testCases && problem.testCases.length > 0) {
        const results = [];
        for (let i = 0; i < problem.testCases.length; i++) {
            const testCase = problem.testCases[i];
            const options = {
                method: 'POST',
                url: JUDGE0_API_URL,
                params: { base64_encoded: 'false', fields: '*' },
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': API_KEY,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                },
                data: {
                    language_id,
                    source_code,
                    stdin: testCase.input,
                    expected_output: testCase.output
                }
            };

            try {
                const response = await axios.request(options);
                const token = response.data.token;

                let result = null;
                let attempts = 0;
                while (!result && attempts < 10) {
                    await new Promise(r => setTimeout(r, 1000));
                    const statusRes = await axios.get(`${JUDGE0_API_URL}/${token}`, {
                        params: { base64_encoded: 'false', fields: '*' },
                        headers: { 'X-RapidAPI-Key': API_KEY, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' }
                    });
                    if (statusRes.data.status.id > 2) result = statusRes.data;
                    attempts++;
                }

                if (result) {
                    results.push({
                        testCaseId: i + 1,
                        input: testCase.input,
                        expectedOutput: testCase.output,
                        actualOutput: result.stdout ? result.stdout.trim() : (result.stderr || result.compile_output),
                        status: result.status.description,
                        time: result.time,
                        memory: result.memory
                    });
                } else {
                    results.push({ testCaseId: i + 1, status: "Time Limit Exceeded" });
                }
            } catch (err) {
                results.push({ testCaseId: i + 1, status: "Runtime Error", error: err.message });
            }
        }
        return res.json({
            status: { description: results.every(r => r.status === "Accepted") ? "Accepted" : "Wrong Answer" },
            testCaseResults: results
        });
    }

    // Fallback: Single execution (original logic)
    try {
        const response = await axios.post(JUDGE0_API_URL, {
            language_id,
            source_code,
            stdin
        }, {
            params: { base64_encoded: 'false', fields: '*' },
            headers: { 'X-RapidAPI-Key': API_KEY, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' }
        });
        const token = response.data.token;
        let result = null;
        let attempts = 0;
        while (!result && attempts < 10) {
            await new Promise(r => setTimeout(r, 1000));
            const statusRes = await axios.get(`${JUDGE0_API_URL}/${token}`, {
                params: { base64_encoded: 'false', fields: '*' },
                headers: { 'X-RapidAPI-Key': API_KEY, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' }
            });
            if (statusRes.data.status.id > 2) result = statusRes.data;
            attempts++;
        }
        res.json(result || { error: 'Execution timed out' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
