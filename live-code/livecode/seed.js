const mongoose = require('mongoose');
const Problem = require('./models/Problem');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/livecode';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

/* =========================
   TEST CASE GENERATOR
========================= */

const createQuestion = (title, tags, difficulty, testCasesArray) => {
    const visibleCases = testCasesArray.filter(tc => !tc.hidden);
    const exampleInput = visibleCases.length > 0 ? visibleCases[0].input : (testCasesArray[0]?.input || "None");
    const exampleOutput = visibleCases.length > 0 ? visibleCases[0].output : (testCasesArray[0]?.output || "None");

    return {
        title,
        description: `Write an efficient algorithm to solve the **${title}** problem.\n\n### Example\n**Input:** ${exampleInput}\n**Output:** ${exampleOutput}`,
        exampleInput,
        exampleOutput,
        tags,
        difficulty,
        testCases: testCasesArray
    };
};

/* =========================
   QUESTIONS (75 AUTO)
========================= */

const problems = [

/* ===== ARRAYS ===== */
createQuestion("Two Sum", ["Arrays"], "Easy", [
    // ✅ Visible test cases
    { input: "[2,7,11,15]\n9", output: "[0,1]", hidden: false },
    { input: "[3,2,4]\n6", output: "[1,2]", hidden: false },

    // 🔒 Hidden test cases
    { input: "[3,3]\n6", output: "[0,1]", hidden: true },
    { input: "[-1,-2,-3,-4,-5]\n-8", output: "[2,4]", hidden: true },
    { input: "[0,4,3,0]\n0", output: "[0,3]", hidden: true },
    { input: "[1,5,1,5]\n10", output: "[1,3]", hidden: true },
    { input: "[1,2]\n3", output: "[0,1]", hidden: true },
    { input: "[1000000,-1000000]\n0", output: "[0,1]", hidden: true },
    { input: "[2,7,11,15]\n18", output: "[1,2]", hidden: true },
    { input: "[5,5,5]\n10", output: "[0,1]", hidden: true }
]),

createQuestion("3Sum", ["Arrays"], "Medium", [
    // ✅ Visible
    { input: "[-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", hidden: false },

    // 🔒 Hidden (important coverage)
    { input: "[0,0,0]", output: "[[0,0,0]]", hidden: true },
    { input: "[1,-1,-1,0]", output: "[[-1,0,1]]", hidden: true },
    { input: "[-2,0,1,1,2]", output: "[[-2,0,2],[-2,1,1]]", hidden: true },
    { input: "[-1,0,1,0]", output: "[[-1,0,1]]", hidden: true },
    { input: "[3,-2,1,0]", output: "[]", hidden: true },
    { input: "[]", output: "[]", hidden: true },
    { input: "[0,1,1]", output: "[]", hidden: true },
    { input: "[-1,-1,-1,2,2]", output: "[[-1,-1,2]]", hidden: true },
    { input: "[1000000,-1000000,0]", output: "[[-1000000,0,1000000]]", hidden: true }
]),

createQuestion("Container With Most Water", ["Arrays"], "Medium", [
    // ✅ Visible
    { input: "[1,8,6,2,5,4,8,3,7]", output: "49", hidden: false },

    // 🔒 Hidden test cases (full coverage)

    // Minimum size
    { input: "[1,1]", output: "1", hidden: true },

    // Increasing heights
    { input: "[1,2,3,4,5]", output: "6", hidden: true },

    // Decreasing heights
    { input: "[5,4,3,2,1]", output: "6", hidden: true },

    // All same heights
    { input: "[5,5,5,5,5]", output: "20", hidden: true },

    // Zeros included
    { input: "[0,2,0,4,0]", output: "4", hidden: true },

    // Large values
    { input: "[100000,1,100000]", output: "200000", hidden: true },

    // Peak in middle
    { input: "[1,3,2,5,25,24,5]", output: "24", hidden: true },

    // Two max far apart
    { input: "[1,100,1,1,1,100,1]", output: "400", hidden: true },

    // Random case
    { input: "[4,3,2,1,4]", output: "16", hidden: true },

    // Another tricky case
    { input: "[1,2,1]", output: "2", hidden: true }
]),

createQuestion("Maximum Subarray", ["Arrays"], "Medium", [
    // ✅ Visible
    { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", hidden: false },

    // 🔒 Hidden test cases

    // All positive
    { input: "[1,2,3,4,5]", output: "15", hidden: true },

    // All negative (MOST IMPORTANT EDGE CASE)
    { input: "[-1,-2,-3,-4]", output: "-1", hidden: true },

    // Single element (positive)
    { input: "[5]", output: "5", hidden: true },

    // Single element (negative)
    { input: "[-5]", output: "-5", hidden: true },

    // Mixed with best in middle
    { input: "[5,-2,3,4]", output: "10", hidden: true },

    // Mixed with reset needed
    { input: "[-2,1]", output: "1", hidden: true },

    // Large negative interruption
    { input: "[2,3,-10,4,5]", output: "9", hidden: true },

    // Multiple equal max subarrays
    { input: "[1,-1,1,-1,1,-1,1]", output: "1", hidden: true },

    // Zero handling
    { input: "[0,0,0,0]", output: "0", hidden: true },

    // Large values
    { input: "[100000,-1,100000]", output: "199999", hidden: true }
]),

createQuestion("Move Zeroes", ["Arrays"], "Easy", [
    // ✅ Visible
    { input: "[0,1,0,3,12]", output: "[1,3,12,0,0]", hidden: false },

    // 🔒 Hidden test cases

    // No zeroes
    { input: "[1,2,3,4]", output: "[1,2,3,4]", hidden: true },

    // All zeroes
    { input: "[0,0,0,0]", output: "[0,0,0,0]", hidden: true },

    // Single element zero
    { input: "[0]", output: "[0]", hidden: true },

    // Single element non-zero
    { input: "[5]", output: "[5]", hidden: true },

    // Zeroes at end already
    { input: "[1,2,3,0,0]", output: "[1,2,3,0,0]", hidden: true },

    // Zeroes at beginning
    { input: "[0,0,1,2,3]", output: "[1,2,3,0,0]", hidden: true },

    // Alternate zeroes
    { input: "[0,1,0,2,0,3]", output: "[1,2,3,0,0,0]", hidden: true },

    // Large input style
    { input: "[1,0,2,0,3,0,4,0,5]", output: "[1,2,3,4,5,0,0,0,0]", hidden: true },

    // Negative numbers included
    { input: "[-1,0,-2,0,-3]", output: "[-1,-2,-3,0,0]", hidden: true },

    // Mixed tricky case
    { input: "[0,0,1]", output: "[1,0,0]", hidden: true }
]),

createQuestion("Product of Array Except Self", ["Arrays"], "Medium", [
    { input: "[1,2,3,4]", output: "[24,12,8,6]", hidden: false },

    // 🔒 Hidden
    { input: "[0,0]", output: "[0,0]", hidden: true },
    { input: "[1,0]", output: "[0,1]", hidden: true },
    { input: "[0,1,2,3]", output: "[6,0,0,0]", hidden: true },
    { input: "[-1,1,-1,1]", output: "[-1,1,-1,1]", hidden: true },
    { input: "[5]", output: "[1]", hidden: true },
    { input: "[2,3]", output: "[3,2]", hidden: true },
    { input: "[1,1,1,1]", output: "[1,1,1,1]", hidden: true },
    { input: "[100000,100000]", output: "[100000,100000]", hidden: true },
    { input: "[2,0,4]", output: "[0,8,0]", hidden: true },
    { input: "[-1,-2,-3,-4]", output: "[-24,-12,-8,-6]", hidden: true }
]),

createQuestion("Rotate Array", ["Arrays"], "Medium", [
    { input: "[1,2,3,4,5,6,7], k=3", output: "[5,6,7,1,2,3,4]", hidden: false },

    // 🔒 Hidden
    { input: "[1,2,3], k=0", output: "[1,2,3]", hidden: true },
    { input: "[1,2,3], k=3", output: "[1,2,3]", hidden: true },
    { input: "[1,2,3], k=4", output: "[3,1,2]", hidden: true },
    { input: "[1], k=10", output: "[1]", hidden: true },
    { input: "[1,2], k=1", output: "[2,1]", hidden: true },
    { input: "[1,2,3,4], k=2", output: "[3,4,1,2]", hidden: true },
    { input: "[-1,-100,3,99], k=2", output: "[3,99,-1,-100]", hidden: true },
    { input: "[1,2,3,4,5], k=7", output: "[4,5,1,2,3]", hidden: true },
    { input: "[0,0,0], k=1", output: "[0,0,0]", hidden: true },
    { input: "[1,2,3,4], k=1", output: "[4,1,2,3]", hidden: true }
]),

createQuestion("Subarray Sum Equals K", ["Arrays"], "Medium", [
    { input: "[1,1,1], k=2", output: "2", hidden: false },

    // 🔒 Hidden
    { input: "[1,2,3], k=3", output: "2", hidden: true },
    { input: "[1,-1,0], k=0", output: "3", hidden: true },
    { input: "[3,4,7,2,-3,1,4,2], k=7", output: "4", hidden: true },
    { input: "[1], k=1", output: "1", hidden: true },
    { input: "[1], k=0", output: "0", hidden: true },
    { input: "[0,0,0], k=0", output: "6", hidden: true },
    { input: "[-1,-1,1], k=0", output: "1", hidden: true },
    { input: "[2,2,2], k=4", output: "2", hidden: true },
    { input: "[1,2,1,2,1], k=3", output: "4", hidden: true },
    { input: "[100000,-100000], k=0", output: "1", hidden: true }
]),

/* ===== STRINGS ===== */
createQuestion("Valid Palindrome", ["Strings"], "Easy", [
    { input: "'racecar'", output: "true", hidden: false },

    // 🔒 Hidden
    { input: "'A man, a plan, a canal: Panama'", output: "true", hidden: true },
    { input: "'race a car'", output: "false", hidden: true },
    { input: "' '", output: "true", hidden: true },
    { input: "'0P'", output: "false", hidden: true },
    { input: "'Madam'", output: "true", hidden: true },
    { input: "'No lemon, no melon'", output: "true", hidden: true },
    { input: "'abc'", output: "false", hidden: true },
    { input: "'a'", output: "true", hidden: true },
    { input: "'!!!'", output: "true", hidden: true },
    { input: "'12321'", output: "true", hidden: true }
]),

createQuestion("Valid Anagram", ["Strings"], "Easy", [
    { input: "'anagram','nagaram'", output: "true", hidden: false },

    // 🔒 Hidden
    { input: "'rat','car'", output: "false", hidden: true },
    { input: "'a','a'", output: "true", hidden: true },
    { input: "'ab','a'", output: "false", hidden: true },
    { input: "'listen','silent'", output: "true", hidden: true },
    { input: "'hello','bello'", output: "false", hidden: true },
    { input: "'',''", output: "true", hidden: true },
    { input: "'aacc','ccac'", output: "false", hidden: true },
    { input: "'123','321'", output: "true", hidden: true },
    { input: "'a!b','b!a'", output: "true", hidden: true },
    { input: "'abcd','dcba'", output: "true", hidden: true }
]),

createQuestion("Longest Substring Without Repeating Characters", ["Strings"], "Medium", [
    { input: "'abcabcbb'", output: "3", hidden: false },

    // 🔒 Hidden
    { input: "'bbbbb'", output: "1", hidden: true },
    { input: "'pwwkew'", output: "3", hidden: true },
    { input: "' '", output: "1", hidden: true },
    { input: "'abcdef'", output: "6", hidden: true },
    { input: "'abba'", output: "2", hidden: true },
    { input: "'dvdf'", output: "3", hidden: true },
    { input: "'anviaj'", output: "5", hidden: true },
    { input: "'tmmzuxt'", output: "5", hidden: true },
    { input: "'aab'", output: "2", hidden: true },
    { input: "'abcdeafbdgcbb'", output: "7", hidden: true }
]),

createQuestion("Group Anagrams", ["Strings"], "Medium", [
    { input: "['eat','tea','tan','ate','nat','bat']", output: "[['eat','tea','ate'],['tan','nat'],['bat']]", hidden: false },

    // 🔒 Hidden
    { input: "['']", output: "[['']]", hidden: true },
    { input: "['a']", output: "[['a']]", hidden: true },
    { input: "['abc','bca','cab']", output: "[['abc','bca','cab']]", hidden: true },
    { input: "['a','b','c']", output: "[['a'],['b'],['c']]", hidden: true },
    { input: "['ab','ba','abc']", output: "[['ab','ba'],['abc']]", hidden: true },
    { input: "[]", output: "[]", hidden: true },
    { input: "['aa','aa']", output: "[['aa','aa']]", hidden: true },
    { input: "['abc','def','ghi']", output: "[['abc'],['def'],['ghi']]", hidden: true },
    { input: "['listen','silent']", output: "[['listen','silent']]", hidden: true },
    { input: "['aab','aba','baa']", output: "[['aab','aba','baa']]", hidden: true }
]),

createQuestion("Longest Palindromic Substring", ["Strings"], "Medium", [
    { input: "'babad'", output: "'bab'", hidden: false },

    // 🔒 Hidden
    { input: "'cbbd'", output: "'bb'", hidden: true },
    { input: "'a'", output: "'a'", hidden: true },
    { input: "'ac'", output: "'a'", hidden: true },
    { input: "'racecar'", output: "'racecar'", hidden: true },
    { input: "'aaaa'", output: "'aaaa'", hidden: true },
    { input: "'abcda'", output: "'a'", hidden: true },
    { input: "'abccba'", output: "'abccba'", hidden: true },
    { input: "'bananas'", output: "'anana'", hidden: true },
    { input: "'abc'", output: "'a'", hidden: true },
    { input: "'forgeeksskeegfor'", output: "'geeksskeeg'", hidden: true }
]),

createQuestion("String Compression", ["Strings"], "Easy", [
    { input: "['a','a','b','b','c','c','c']", output: "['a','2','b','2','c','3']", hidden: false },

    // 🔒 Hidden
    { input: "['a']", output: "['a']", hidden: true },
    { input: "['a','b','c']", output: "['a','b','c']", hidden: true },
    { input: "['a','a','a','a']", output: "['a','4']", hidden: true },
    { input: "['a','b','b','b']", output: "['a','b','3']", hidden: true },
    { input: "['a','a','b','a','a']", output: "['a','2','b','a','2']", hidden: true },
    { input: "['z','z','z','z','z']", output: "['z','5']", hidden: true },
    { input: "[]", output: "[]", hidden: true },
    { input: "['a','a','a','b','b','a','a']", output: "compressed", hidden: true },
    { input: "['1','1','1']", output: "['1','3']", hidden: true },
    { input: "['a','b','c','c','c']", output: "['a','b','c','3']", hidden: true }
]),

/* ===== LINKED LIST ===== */
createQuestion("Reverse Linked List", ["Linked List"], "Easy", [
    { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", hidden: false },

    { input: "[1]", output: "[1]", hidden: true },
    { input: "[]", output: "[]", hidden: true },
    { input: "[1,2]", output: "[2,1]", hidden: true },
    { input: "[1,2,3]", output: "[3,2,1]", hidden: true },
    { input: "[5,4,3,2,1]", output: "[1,2,3,4,5]", hidden: true },
    { input: "[0,0,0]", output: "[0,0,0]", hidden: true },
    { input: "[-1,-2,-3]", output: "[-3,-2,-1]", hidden: true },
    { input: "[1,1,1]", output: "[1,1,1]", hidden: true },
    { input: "[10,20,30]", output: "[30,20,10]", hidden: true }
]),

createQuestion("Linked List Cycle", ["Linked List"], "Easy", [
    { input: "[3,2,0,-4], pos=1", output: "true", hidden: false },

    { input: "[1,2], pos=0", output: "true", hidden: true },
    { input: "[1], pos=-1", output: "false", hidden: true },
    { input: "[1,2,3], pos=-1", output: "false", hidden: true },
    { input: "[1,2,3], pos=2", output: "true", hidden: true },
    { input: "[]", output: "false", hidden: true }
]),

createQuestion("Merge Two Sorted Lists", ["Linked List"], "Easy", [
    { input: "[1,2,4],[1,3,4]", output: "[1,1,2,3,4,4]", hidden: false },

    { input: "[],[]", output: "[]", hidden: true },
    { input: "[1],[]", output: "[1]", hidden: true },
    { input: "[],[1]", output: "[1]", hidden: true },
    { input: "[2],[1]", output: "[1,2]", hidden: true },
    { input: "[1,1,1],[1,1]", output: "[1,1,1,1,1]", hidden: true }
]),

createQuestion("Remove Nth Node", ["Linked List"], "Medium", [
    { input: "[1,2,3,4,5], n=2", output: "[1,2,3,5]", hidden: false },

    { input: "[1], n=1", output: "[]", hidden: true },
    { input: "[1,2], n=1", output: "[1]", hidden: true },
    { input: "[1,2], n=2", output: "[2]", hidden: true },
    { input: "[1,2,3], n=3", output: "[2,3]", hidden: true },
    { input: "[1,2,3,4], n=4", output: "[2,3,4]", hidden: true }
]),

/* ===== TREES ===== */
createQuestion("Max Depth Binary Tree", ["Tree"], "Easy", [
    { input: "[3,9,20,null,null,15,7]", output: "3", hidden: false },

    { input: "[]", output: "0", hidden: true },
    { input: "[1]", output: "1", hidden: true },
    { input: "[1,null,2]", output: "2", hidden: true },
    { input: "[1,2,3,4,5]", output: "3", hidden: true }
]),

createQuestion("Level Order Traversal", ["Tree"], "Medium", [
    // ✅ Visible
    { input: "[3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]", hidden: false },

    // 🔒 Hidden test cases

    // Empty tree
    { input: "[]", output: "[]", hidden: true },

    // Single node
    { input: "[1]", output: "[[1]]", hidden: true },

    // Left skewed
    { input: "[1,2,null,3,null,4]", output: "[[1],[2],[3],[4]]", hidden: true },

    // Right skewed
    { input: "[1,null,2,null,3,null,4]", output: "[[1],[2],[3],[4]]", hidden: true },

    // Complete tree
    { input: "[1,2,3,4,5,6,7]", output: "[[1],[2,3],[4,5,6,7]]", hidden: true },

    // Mixed nulls
    { input: "[1,2,3,null,4,null,5]", output: "[[1],[2,3],[4,5]]", hidden: true },

    // Unbalanced tree
    { input: "[1,2,3,4,null,null,5,6]", output: "[[1],[2,3],[4,5],[6]]", hidden: true },

    // Only left children
    { input: "[1,2,null,3,null,4,null]", output: "[[1],[2],[3],[4]]", hidden: true },

    // Only right children
    { input: "[1,null,2,null,3,null,4]", output: "[[1],[2],[3],[4]]", hidden: true },

    // Larger tree
    { input: "[10,5,15,3,7,null,18]", output: "[[10],[5,15],[3,7,18]]", hidden: true }
]),

createQuestion("Validate BST", ["Tree"], "Medium", [
    { input: "[2,1,3]", output: "true", hidden: false },

    { input: "[5,1,4,null,null,3,6]", output: "false", hidden: true },
    { input: "[1,1]", output: "false", hidden: true },
    { input: "[10,5,15,null,null,6,20]", output: "false", hidden: true },
    { input: "[1]", output: "true", hidden: true }
]),

createQuestion("Lowest Common Ancestor", ["Tree"], "Medium", [
    { input: "[3,5,1,6,2,0,8,null,null,7,4], p=5, q=1", output: "3", hidden: false },

    // 🔒 Hidden
    { input: "[3,5,1,6,2,0,8,null,null,7,4], p=5, q=4", output: "5", hidden: true },
    { input: "[1,2], p=1, q=2", output: "1", hidden: true },
    { input: "[1], p=1, q=1", output: "1", hidden: true },
    { input: "[2,1], p=2, q=1", output: "2", hidden: true },
    { input: "[6,2,8,0,4,7,9,null,null,3,5], p=2, q=8", output: "6", hidden: true },
    { input: "[6,2,8,0,4,7,9,null,null,3,5], p=2, q=4", output: "2", hidden: true }
]),

/* ===== STACK ===== */
createQuestion("Valid Parentheses", ["Stack"], "Easy", [
    { input: "'()[]{}'", output: "true", hidden: false },

    { input: "'(]'", output: "false", hidden: true },
    { input: "'([)]'", output: "false", hidden: true },
    { input: "'{[]}'", output: "true", hidden: true },
    { input: "''", output: "true", hidden: true },
    { input: "'((((('", output: "false", hidden: true },
    { input: "')('", output: "false", hidden: true },
    { input: "'()()()'", output: "true", hidden: true },
    { input: "'[{()}]'", output: "true", hidden: true },
    { input: "'[(])'", output: "false", hidden: true }
]),

createQuestion("Min Stack", ["Stack"], "Medium", [
    { input: "push(-2), push(0), push(-3), getMin()", output: "-3", hidden: false },

    { input: "push(1), getMin()", output: "1", hidden: true },
    { input: "push(2), push(3), getMin()", output: "2", hidden: true },
    { input: "push(2), push(1), pop(), getMin()", output: "2", hidden: true },
    { input: "push(-1), push(-2), push(-3), getMin()", output: "-3", hidden: true },
    { input: "push(5), push(4), push(3), getMin()", output: "3", hidden: true }
]),

/* ===== DP ===== */
createQuestion("Climbing Stairs", ["DP"], "Easy", [
    { input: "3", output: "3", hidden: false },

    { input: "1", output: "1", hidden: true },
    { input: "2", output: "2", hidden: true },
    { input: "4", output: "5", hidden: true },
    { input: "5", output: "8", hidden: true },
    { input: "10", output: "89", hidden: true },
    { input: "0", output: "0", hidden: true }
]),

createQuestion("House Robber", ["DP"], "Medium", [
    { input: "[2,7,9,3,1]", output: "12", hidden: false },

    { input: "[1,2,3,1]", output: "4", hidden: true },
    { input: "[2,1,1,2]", output: "4", hidden: true },
    { input: "[5]", output: "5", hidden: true },
    { input: "[2,1]", output: "2", hidden: true },
    { input: "[0,0,0]", output: "0", hidden: true }
]),

createQuestion("Coin Change", ["DP"], "Medium", [
    { input: "[1,2,5], amount=11", output: "3", hidden: false },

    { input: "[2], amount=3", output: "-1", hidden: true },
    { input: "[1], amount=0", output: "0", hidden: true },
    { input: "[1], amount=2", output: "2", hidden: true },
    { input: "[2,5,10,1], amount=27", output: "4", hidden: true },
    { input: "[186,419,83,408], amount=6249", output: "20", hidden: true }
]),

/* ===== GRAPH ===== */
createQuestion("Number of Islands", ["Graph"], "Medium", [
    { input: "[['1','1','1'],['0','1','0'],['1','1','1']]", output: "1", hidden: false },

    { input: "[['1','1','0'],['0','1','0'],['1','0','1']]", output: "3", hidden: true },
    { input: "[['0','0'],['0','0']]", output: "0", hidden: true },
    { input: "[['1']]", output: "1", hidden: true },
    { input: "[]", output: "0", hidden: true }
]),

createQuestion("Course Schedule", ["Graph"], "Medium", [
    { input: "numCourses=2, [[1,0]]", output: "true", hidden: false },

    { input: "numCourses=2, [[1,0],[0,1]]", output: "false", hidden: true },
    { input: "numCourses=1, []", output: "true", hidden: true },
    { input: "numCourses=3, [[1,0],[2,1]]", output: "true", hidden: true },
    { input: "numCourses=3, [[1,0],[2,1],[0,2]]", output: "false", hidden: true }
]),

/* ===== FRONTEND ===== */
createQuestion("Debounce Function", ["JS"], "Medium", [
    { input: "delay=1000", output: "delayed", hidden: false },

    // 🔒 Hidden
    { input: "rapid calls within delay", output: "only last call executes", hidden: true },
    { input: "single call", output: "executes after delay", hidden: true },
    { input: "calls spaced > delay", output: "each executes", hidden: true },
    { input: "multiple bursts", output: "one execution per burst", hidden: true },
    { input: "delay=0", output: "immediate execution", hidden: true },
    { input: "different arguments", output: "last arguments used", hidden: true },
    { input: "preserve this context", output: "correct context binding", hidden: true },
    { input: "async function debounce", output: "promise resolves correctly", hidden: true },
    { input: "cancel previous timeout", output: "only latest scheduled", hidden: true }
]),

createQuestion("Throttle Function", ["JS"], "Medium", [
    { input: "limit=500", output: "limited", hidden: false },

    // 🔒 Hidden
    { input: "rapid calls", output: "executes at fixed intervals", hidden: true },
    { input: "single call", output: "executes immediately", hidden: true },
    { input: "calls spaced > limit", output: "each executes", hidden: true },
    { input: "multiple bursts", output: "one call per interval", hidden: true },
    { input: "leading=true", output: "executes immediately", hidden: true },
    { input: "trailing=true", output: "last call executed", hidden: true },
    { input: "preserve arguments", output: "correct args used", hidden: true },
    { input: "preserve context", output: "this binding correct", hidden: true },
    { input: "limit=0", output: "all calls execute", hidden: true }
]),

createQuestion("Deep Clone", ["JS"], "Medium", [
    { input: "{a:1,b:{c:2}}", output: "deep copy", hidden: false },

    // 🔒 Hidden
    { input: "{a:1}", output: "new reference", hidden: true },
    { input: "[1,2,3]", output: "deep copy array", hidden: true },
    { input: "{a:[1,2,{b:3}]}", output: "nested deep copy", hidden: true },
    { input: "{a:null,b:undefined}", output: "handles null/undefined", hidden: true },
    { input: "{a:new Date()}", output: "date copied correctly", hidden: true },
    { input: "{a:/regex/}", output: "regex copied", hidden: true },
    { input: "circular reference", output: "handled or avoided crash", hidden: true },
    { input: "{a: function(){}}", output: "function reference preserved", hidden: true },
    { input: "deep nested object", output: "no shared references", hidden: true }
]),

/* ===== BACKEND ===== */
createQuestion("JWT Generator", ["Backend"], "Medium", [
    { input: "payload={id:1}", output: "token", hidden: false },

    // 🔒 Hidden
    { input: "payload with multiple fields", output: "valid token", hidden: true },
    { input: "empty payload", output: "valid token", hidden: true },
    { input: "custom expiry", output: "token with exp", hidden: true },
    { input: "invalid secret", output: "error or invalid token", hidden: true },
    { input: "verify generated token", output: "payload matches", hidden: true },
    { input: "tampered token", output: "verification fails", hidden: true },
    { input: "large payload", output: "token generated", hidden: true },
    { input: "unicode payload", output: "handled correctly", hidden: true },
    { input: "missing payload", output: "error handled", hidden: true }
]),

createQuestion("Rate Limiter", ["Backend"], "Hard", [
    { input: "101 requests", output: "429", hidden: false },

    // 🔒 Hidden
    { input: "100 requests", output: "allowed", hidden: true },
    { input: "burst traffic", output: "limited correctly", hidden: true },
    { input: "requests reset after time window", output: "allowed again", hidden: true },
    { input: "multiple IPs", output: "tracked separately", hidden: true },
    { input: "slow requests", output: "all allowed", hidden: true },
    { input: "exact boundary (100th request)", output: "allowed", hidden: true },
    { input: "101st request immediately", output: "blocked", hidden: true },
    { input: "distributed requests", output: "count maintained correctly", hidden: true },
    { input: "memory cleanup", output: "old entries cleared", hidden: true }
]),

/* ===== ADDITIONAL INTERVIEW QUESTIONS ===== */
createQuestion("Best Time to Buy and Sell Stock", ["Arrays"], "Easy", [
    { input: "[7,1,5,3,6,4]", output: "5", hidden: false },
    { input: "[7,6,4,3,1]", output: "0", hidden: true },
    { input: "[1,2,3,4,5]", output: "4", hidden: true },
    { input: "[2,4,1]", output: "2", hidden: true },
    { input: "[2,1,2,1,0,1,2]", output: "2", hidden: true }
]),

createQuestion("Binary Search", ["Arrays", "Search"], "Easy", [
    { input: "[-1,0,3,5,9,12], target=9", output: "4", hidden: false },
    { input: "[-1,0,3,5,9,12], target=2", output: "-1", hidden: true },
    { input: "[5], target=5", output: "0", hidden: true },
    { input: "[2,5], target=2", output: "0", hidden: true }
]),

createQuestion("Contains Duplicate", ["Arrays"], "Easy", [
    { input: "[1,2,3,1]", output: "true", hidden: false },
    { input: "[1,2,3,4]", output: "false", hidden: true },
    { input: "[1,1,1,3,3,4,3,2,4,2]", output: "true", hidden: true },
    { input: "[]", output: "false", hidden: true }
])

];

/* =========================
   SEED DB
========================= */

const seedDB = async () => {
    try {
        await Problem.deleteMany({});
        await Problem.insertMany(problems);

        console.log(`✅ Seeded ${problems.length} Problems`);
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
