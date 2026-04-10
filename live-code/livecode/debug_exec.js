const fs = require('fs');
const { execSync } = require('child_process');

const testCases = [
    { input: "[2,7,11,15]\n9", output: "[0,1]", hidden: false },
    { input: "[3,2,4]\n6", output: "[1,2]", hidden: false },
    { input: "[3,3]\n6", output: "[0,1]", hidden: true },
    { input: "[-1,-2,-3,-4,-5]\n-8", output: "[2,4]", hidden: true },
    { input: "[0,4,3,0]\n0", output: "[0,3]", hidden: true },
    { input: "[1,5,1,5]\n10", output: "[1,3]", hidden: true },
    { input: "[1,2]\n3", output: "[0,1]", hidden: true },
    { input: "[1000000,-1000000]\n0", output: "[0,1]", hidden: true },
    { input: "[2,7,11,15]\n18", output: "[1,2]", hidden: true },
    { input: "[5,5,5]\n10", output: "[0,1]", hidden: true }
];

let log = '';
for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    fs.writeFileSync('temp.in', tc.input);
    try {
        const out = execSync('temp.exe < temp.in').toString().trim();
        log += `Case ${i+1}: Expected: ${tc.output}, Got: ${out}, pass: ${out === tc.output}\n`;
    } catch (e) {
        log += `Case ${i+1}: Error ${e.message}\n`;
    }
}
fs.writeFileSync('debug.log', log);
