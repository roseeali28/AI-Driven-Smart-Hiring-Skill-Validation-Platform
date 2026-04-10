const axios = require('axios');
async function test() {
    const payload = {
      source_code: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string line;\n    getline(cin, line);\n    line = line.substr(1, line.size() - 2);\n    vector<int> nums;\n    stringstream ss(line);\n    string num;\n    while (getline(ss, num, ',')) { nums.push_back(stoi(num)); }\n    int target;\n    cin >> target;\n    unordered_map<int, int> mp;\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i];\n        if (mp.find(complement) != mp.end()) {\n            cout << "[" << mp[complement] << "," << i << "]";\n            return 0;\n        }\n        mp[nums[i]] = i;\n    }\n    return 0;\n}`,
      language_id: 54,
      problemId: '69c5764136f0a926311c390a'
    };
    
    try {
        const res = await axios.post('http://localhost:5001/api/execute/run', payload);
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log(e.response ? e.response.data : e.message);
    }
}
test();
