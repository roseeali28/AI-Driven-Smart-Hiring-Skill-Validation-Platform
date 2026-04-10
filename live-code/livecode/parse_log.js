const fs = require('fs');
const content = fs.readFileSync('test_api.log', 'utf16le');
if (content.includes('"description": "Accepted"')) {
    console.log("THE API RETURNED ACCEPTED");
} else {
    console.log("THE API RETURNED WRONG ANSWER");
}
