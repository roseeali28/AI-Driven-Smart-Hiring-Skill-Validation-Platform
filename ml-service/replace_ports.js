const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/YUV RAJ SINGH YADAV/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main-main/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main-main/frontend/api/assets';

function processDirectory(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            content = content.replace(/http:\/\/localhost:5000/g, 'http://localhost:5050');
            content = content.replace(/http:\/\/localhost:5001/g, 'http://localhost:5051');
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}

processDirectory(directory);
console.log('Ports replaced successfully.');
