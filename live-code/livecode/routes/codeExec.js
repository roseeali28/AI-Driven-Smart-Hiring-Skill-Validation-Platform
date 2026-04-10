const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { authenticate } = require('../middleware/auth');

// PUBLIC ACCESS (Matching project1): No authentication required for code execution.休憩

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const API_KEY = process.env.RAPIDAPI_KEY || process.env.JUDGE0_API_KEY;

router.post('/run', async (req, res) => {
    console.log("🚀 Incoming /run request:", req.body.language_id);
    const { language_id, source_code, stdin, problemId } = req.body;

    // Validate that source_code is not empty or just comments
    if (!source_code || source_code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').trim().length === 0) {
        return res.status(400).json({ error: 'Source code cannot be empty' });
    }

    let problem = null;
    if (problemId && !stdin) {
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
                                // Dynamic evaluation logic to turn string test cases like "[2,7,11,15]\n9" into arguments
                                let argsScript = `
                                    let rawInput = \`${testCase.input.replace(/`/g, '\\`')}\`;
                                    let args = rawInput.split('\\n').filter(l => l.trim()).map(l => {
                                        try { return JSON.parse(l); } catch(e) { return l; }
                                    });
                                    JSON.stringify(solution(...args));
                                `;
                                const scriptToRun = `${source_code}\n\n// Run test\n${argsScript}`;
                                const result = vm.run(scriptToRun);

                                // STRICT: If solution() returns undefined/null (missing return statement or empty body),
                                // we must treat it as a failure — NOT convert to a string that could accidentally match.
                                let finalOutput;
                                if (result === undefined || result === null) {
                                    finalOutput = "No Return Value (undefined)";
                                } else {
                                    finalOutput = String(result);
                                }

                                const status = finalOutput.trim() === testCase.output.trim() ? "Accepted" : "Wrong Answer";

                                return {
                                    testCaseId: index + 1,
                                    input: testCase.input,
                                    expectedOutput: testCase.output,
                                    actualOutput: finalOutput,
                                    status: status
                                };
                            } catch (err) {
                                const errMsg = err.message || String(err);
                                const friendlyMsg = errMsg.includes('solution is not defined')
                                    ? "Error: 'solution' function not found. Make sure your function is named 'solution'."
                                    : "Runtime Error: " + errMsg;
                                return {
                                    testCaseId: index + 1,
                                    input: testCase.input,
                                    expectedOutput: testCase.output,
                                    actualOutput: friendlyMsg,
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
                    if (stdin) {
                        try {
                            const scriptToRun = `${source_code}\n\n// Run test\nconsole.log(JSON.stringify(solution(${stdin})));`;
                            vm.run(scriptToRun);
                        } catch (e) {
                            vm.run(source_code);
                        }
                    } else {
                        vm.run(source_code);
                    }
                    return res.json({
                        stdout: logOutput.join('\n') || "No output",
                        stderr: null,
                        status: { id: 3, description: 'Accepted' },
                        time: '0.01',
                        memory: 'Local'
                    });
                } catch (err) {
                    console.error("VM2 Logic Error:", err);
                    return res.json({
                        stdout: "",
                        stderr: "Execution Error: " + err.message,
                        status: { id: 11, description: 'Runtime Error' },
                        time: '0.01',
                        memory: 'Local'
                    });
                }
            }

            // 2. Local Python Execution (71)
            if (langId === 71) {
                // Check if python is available
                const pyCheck = await new Promise(r => exec('python --version', err => r(!err)));
                if (!pyCheck) {
                    return res.status(500).json({ 
                        error: "Python Environment Not Found", 
                        details: "The server does not have Python installed or in its PATH. Please contact the administrator." 
                    });
                }
                if (problem && problem.testCases && problem.testCases.length > 0) {
                    const results = [];
                    for (let i = 0; i < problem.testCases.length; i++) {
                        const testCase = problem.testCases[i];
                        const baseName = `solution_${Date.now()}_${i}`;
                        const pyFile = path.join(tempDir, `${baseName}.py`);
                        
                        // Create Python wrapper that auto-calls solution
                        const wrapperCode = `
import ast
import sys
import json

${source_code}

if __name__ == "__main__":
    try:
        # Parse arguments from stdin safely
        args_str = sys.stdin.read().strip()
        # Fallback if multiple args are separated by newlines instead of one tuple
        lines = [l.strip() for l in args_str.split('\\n') if l.strip()]
        
        parsed_args = []
        for line in lines:
            try:
                parsed_args.append(ast.literal_eval(line))
            except:
                parsed_args.append(line)
                
        # Call solution function
        if 'solution' in globals():
            res = solution(*parsed_args)
            if res is not None:
                # Format boolean/null to json to match expected output format
                if isinstance(res, bool):
                    print(str(res).lower())
                else:
                    print(json.dumps(res).replace(' ', ''))
    except Exception as e:
        print(f"Runtime Error: {e}", file=sys.stderr)
`;
                        fs.writeFileSync(pyFile, wrapperCode);
                        
                        const inFile = path.join(tempDir, `${baseName}.in`);
                        fs.writeFileSync(inFile, testCase.input);
                        
                        try {
                            const { stdout, stderr } = await new Promise((resolve) => {
                                exec(`python "${pyFile}" < "${inFile}"`, (error, stdout, stderr) => {
                                    resolve({ error, stdout, stderr });
                                });
                            });
                            
                            if (fs.existsSync(pyFile)) fs.unlinkSync(pyFile);
                            if (fs.existsSync(inFile)) fs.unlinkSync(inFile);

                            const actualOutput = stdout ? stdout.trim() : (stderr ? "Runtime Error" : "No output");
                            const status = actualOutput === testCase.output.trim() ? "Accepted" : "Wrong Answer";

                            results.push({
                                testCaseId: i + 1,
                                input: testCase.input,
                                expectedOutput: testCase.output,
                                actualOutput: actualOutput,
                                status: stderr ? "Runtime Error" : status
                            });
                        } catch (e) {
                            if (fs.existsSync(pyFile)) fs.unlinkSync(pyFile);
                            if (fs.existsSync(inFile)) fs.unlinkSync(inFile);
                            results.push({
                                testCaseId: i + 1,
                                input: testCase.input,
                                expectedOutput: testCase.output,
                                actualOutput: "Execution Failed",
                                status: "Runtime Error"
                            });
                        }
                    }
                    
                    const allPassed = results.every(r => r.status === "Accepted");
                    return res.json({
                        status: { description: allPassed ? "Accepted" : "Wrong Answer" },
                        testCaseResults: results,
                        stdout: "Test cases processed locally."
                    });
                } else {
                    // Single execution (Custom testcase or no testcases)
                    const baseName = `solution_${Date.now()}`;
                    const pyFile = path.join(tempDir, `${baseName}.py`);
                    const inFile = path.join(tempDir, `${baseName}.in`);
                    fs.writeFileSync(pyFile, source_code);
                    if (stdin) fs.writeFileSync(inFile, stdin);

                    const cmd = stdin ? `python "${pyFile}" < "${inFile}"` : `python "${pyFile}"`;

                    return new Promise((resolve) => {
                        exec(cmd, (error, stdout, stderr) => {
                            if (fs.existsSync(pyFile)) fs.unlinkSync(pyFile);
                            if (fs.existsSync(inFile)) fs.unlinkSync(inFile);

                            res.json({
                                stdout: stdout || "",
                                stderr: stderr || (error ? error.message : null),
                                status: { id: error ? 11 : 3, description: error ? 'Runtime Error' : 'Accepted' }
                            });
                            resolve();
                        });
                    });
                }
            }

            // 3. Local C++ Execution (54)
            if (langId === 54) {
                // Check if g++ is available
                const gppCheck = await new Promise(r => exec('g++ --version', err => r(!err)));
                if (!gppCheck) {
                    return res.status(500).json({ 
                        error: "C++ Compiler Not Found", 
                        details: "The server does not have g++ installed. Please install MinGW or similar." 
                    });
                }

                if (problem && problem.testCases && problem.testCases.length > 0) {
                    const baseName = `solution_${Date.now()}`;
                    const cppFile = path.join(tempDir, `${baseName}.cpp`);
                    const exeFile = path.join(tempDir, `${baseName}.exe`);
                    fs.writeFileSync(cppFile, source_code);

                    return new Promise((resolve) => {
                        exec(`g++ "${cppFile}" -o "${exeFile}"`, async (compileError, compileStdout, compileStderr) => {
                            if (compileError) {
                                if (fs.existsSync(cppFile)) fs.unlinkSync(cppFile);
                                res.json({
                                    stdout: "",
                                    stderr: compileStderr || compileError.message,
                                    status: { id: 6, description: 'Compilation Error' }
                                });
                                return resolve();
                            }

                            const results = [];
                            for (let i = 0; i < problem.testCases.length; i++) {
                                const testCase = problem.testCases[i];
                                const inFile = path.join(tempDir, `${baseName}_${i}.in`);
                                fs.writeFileSync(inFile, testCase.input);

                                try {
                                    const { stdout, stderr } = await new Promise((runResolve) => {
                                        exec(`"${exeFile}" < "${inFile}"`, (error, stdout, stderr) => {
                                            runResolve({ error, stdout, stderr });
                                        });
                                    });

                                    if (fs.existsSync(inFile)) fs.unlinkSync(inFile);

                                    const actualOutput = stdout ? stdout.trim() : (stderr ? "Runtime Error" : "No output");
                                    const status = actualOutput === testCase.output.trim() ? "Accepted" : "Wrong Answer";

                                    results.push({
                                        testCaseId: i + 1,
                                        input: testCase.input,
                                        expectedOutput: testCase.output,
                                        actualOutput: actualOutput,
                                        status: stderr ? "Runtime Error" : status
                                    });
                                } catch (e) {
                                    if (fs.existsSync(inFile)) fs.unlinkSync(inFile);
                                    results.push({
                                        testCaseId: i + 1,
                                        input: testCase.input,
                                        expectedOutput: testCase.output,
                                        actualOutput: "Execution Failed",
                                        status: "Runtime Error"
                                    });
                                }
                            }

                            if (fs.existsSync(cppFile)) fs.unlinkSync(cppFile);
                            if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile);

                            const allPassed = results.every(r => r.status === "Accepted");
                            res.json({
                                status: { description: allPassed ? "Accepted" : "Wrong Answer" },
                                testCaseResults: results,
                                stdout: "Test cases processed locally."
                            });
                            resolve();
                        });
                    });
                } else {
                    // Single execution (Custom testcase or no testcases)
                    const baseName = `solution_${Date.now()}`;
                    const cppFile = path.join(tempDir, `${baseName}.cpp`);
                    const exeFile = path.join(tempDir, `${baseName}.exe`);
                    const inFile = path.join(tempDir, `${baseName}.in`);
                    fs.writeFileSync(cppFile, source_code);
                    if (stdin) fs.writeFileSync(inFile, stdin);

                    return new Promise((resolve) => {
                        exec(`g++ "${cppFile}" -o "${exeFile}"`, (compileError, compileStdout, compileStderr) => {
                            if (compileError) {
                                if (fs.existsSync(cppFile)) fs.unlinkSync(cppFile);
                                if (fs.existsSync(inFile)) fs.unlinkSync(inFile);
                                res.json({
                                    stdout: "",
                                    stderr: compileStderr || compileError.message,
                                    status: { id: 6, description: 'Compilation Error' }
                                });
                                return resolve();
                            }

                            const cmd = stdin ? `"${exeFile}" < "${inFile}"` : `"${exeFile}"`;
                            exec(cmd, (runError, runStdout, runStderr) => {
                                if (fs.existsSync(cppFile)) fs.unlinkSync(cppFile);
                                if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile);
                                if (fs.existsSync(inFile)) fs.unlinkSync(inFile);

                                res.json({
                                    stdout: runStdout || "",
                                    stderr: runStderr || (runError ? runError.message : null),
                                    status: { id: runError ? 11 : 3, description: runError ? 'Runtime Error' : 'Accepted' }
                                });
                                resolve();
                            });
                        });
                    });
                }
            }

            // Fallback
            return res.json({
                stdout: `[Local Execution Mode]\nLanguage ID ${langId} is not supported for local execution.\nTo enable more languages, please add a 'RAPIDAPI_KEY' or 'JUDGE0_API_KEY' from Judge0 to your .env file.\n\nCode received:\n${source_code}`,
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
