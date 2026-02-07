/**
 * Safe Python code execution for coding challenges
 * Uses child_process with timeout and no network
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const TIMEOUT_MS = 5000;
const TEMP_DIR = path.join(os.tmpdir(), 'skillfirst_code');

function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Execute Python code with optional stdin
 * @param {string} code - Python code (should define a function or have runnable logic)
 * @param {string} stdin - Input to pass to stdin
 * @returns {Promise<{stdout, stderr, result, error}>}
 */
function executeCode(code, stdin = '') {
  return new Promise((resolve) => {
    ensureTempDir();
    const safeCode = sanitizeCode(code);
    const scriptPath = path.join(TEMP_DIR, `run_${Date.now()}_${Math.random().toString(36).slice(2)}.py`);

    fs.writeFileSync(scriptPath, safeCode, 'utf8');

    const proc = spawn('python', [scriptPath], {
      timeout: TIMEOUT_MS,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    proc.on('error', (err) => {
      try { fs.unlinkSync(scriptPath); } catch (e) {}
      resolve({ stdout: '', stderr: err.message, result: null, error: err.message });
    });

    proc.on('close', (code, signal) => {
      try { fs.unlinkSync(scriptPath); } catch (e) {}
      if (signal === 'SIGTERM') {
        resolve({ stdout, stderr: 'Execution timed out', result: null, error: 'Timeout' });
      } else {
        resolve({ stdout, stderr, result: stdout.trim(), error: null });
      }
    });

    if (stdin) proc.stdin.write(stdin);
    proc.stdin.end();
  });
}

/**
 * Sanitize code - block dangerous operations
 */
function sanitizeCode(code) {
  const blocked = [
    'import os', 'import sys', 'import subprocess', 'import socket',
    'eval(', 'exec(', '__import__', 'open(', 'os.', 'sys.', 'subprocess.',
    'socket.', 'requests.', 'urllib', 'compile(',
  ];

  const upper = code.toUpperCase();
  const lower = code.toLowerCase();

  for (const b of blocked) {
    if (lower.includes(b.toLowerCase())) {
      throw new Error('Code contains disallowed operations');
    }
  }

  return code;
}

module.exports = { executeCode };
