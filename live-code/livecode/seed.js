
const mongoose = require('mongoose');
const Problem = require('./models/Problem');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/livecode';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.log('MongoDB Connection Error:', err);
        process.exit(1);
    });

const problems = [
    // === DSA - ARRAYS & STRINGS ===
    {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        difficulty: "Easy",
        tags: ["DSA", "Arrays"],
        exampleInput: "nums = [2,7,11,15], target = 9",
        exampleOutput: "[0,1]",
        constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
        testCases: [
            { input: "[2,7,11,15]\n9", output: "[0,1]", hidden: false },
            { input: "[3,2,4]\n6", output: "[1,2]", hidden: false },
            { input: "[3,3]\n6", output: "[0,1]", hidden: true }
        ]
    },
    {
        title: "Valid Palindrome",
        description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
        difficulty: "Easy",
        tags: ["DSA", "Strings"],
        exampleInput: "s = 'A man, a plan, a canal: Panama'",
        exampleOutput: "true",
        constraints: ["1 <= s.length <= 2 * 10^5"],
        testCases: [
            { input: "'A man, a plan, a canal: Panama'", output: "true", hidden: false },
            { input: "'race a car'", output: "false", hidden: false },
            { input: "' '", output: "true", hidden: true }
        ]
    },
    {
        title: "Contains Duplicate",
        description: "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
        difficulty: "Easy",
        tags: ["DSA", "Arrays"],
        exampleInput: "[1,2,3,1]",
        exampleOutput: "true",
        testCases: [
            { input: "[1,2,3,1]", output: "true", hidden: false },
            { input: "[1,2,3,4]", output: "false", hidden: false },
            { input: "[1,1,1,3,3,4,3,2,4,2]", output: "true", hidden: true }
        ]
    },
    {
        title: "Valid Anagram",
        description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
        difficulty: "Easy",
        tags: ["DSA", "Strings"],
        exampleInput: "s = 'anagram', t = 'nagaram'",
        exampleOutput: "true",
        testCases: [
            { input: "'anagram'\n'nagaram'", output: "true", hidden: false },
            { input: "'rat'\n'car'", output: "false", hidden: false }
        ]
    },
    {
        title: "Best Time to Buy and Sell Stock",
        description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`-th day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
        difficulty: "Easy",
        tags: ["DSA", "Arrays"],
        exampleInput: "[7,1,5,3,6,4]",
        exampleOutput: "5",
        testCases: [
            { input: "[7,1,5,3,6,4]", output: "5", hidden: false },
            { input: "[7,6,4,3,1]", output: "0", hidden: false }
        ]
    },
    // === DSA - LINKED LISTS & TREES ===
    {
        title: "Reverse Linked List",
        description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        difficulty: "Easy",
        tags: ["DSA", "Linked List"],
        exampleInput: "[1,2,3,4,5]",
        exampleOutput: "[5,4,3,2,1]",
        testCases: [
            { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", hidden: false },
            { input: "[1,2]", output: "[2,1]", hidden: false }
        ]
    },
    {
        title: "Maximum Depth of Binary Tree",
        description: "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
        difficulty: "Easy",
        tags: ["DSA", "Tree"],
        exampleInput: "root = [3,9,20,null,null,15,7]",
        exampleOutput: "3",
        testCases: [
            { input: "[3,9,20,null,null,15,7]", output: "3", hidden: false },
            { input: "[1,null,2]", output: "2", hidden: false }
        ]
    },
    // === FRONTEND - JAVASCRIPT & REACT ===
    {
        title: "Debounce Function",
        description: "Implement a `debounce` function that delays the execution of a function until after a certain amount of time has passed since the last time it was invoked.",
        difficulty: "Medium",
        tags: ["Frontend", "JavaScript"],
        exampleInput: "delay = 1000",
        exampleOutput: "Function executed once",
        testCases: []
    },
    {
        title: "Array Polyfill: map",
        description: "Implement the `Array.prototype.map` method from scratch. It should take a callback function and return a new array with the results of calling the function on every element.",
        difficulty: "Medium",
        tags: ["Frontend", "JavaScript"],
        exampleInput: "[1,2,3], (x) => x * 2",
        exampleOutput: "[2,4,6]",
        testCases: []
    },
    {
        title: "Deep Clone Object",
        description: "Write a function that creates a deep copy of a given object. It should handle nested objects, arrays, and primitive types.",
        difficulty: "Medium",
        tags: ["Frontend", "JavaScript"],
        exampleInput: "{a: 1, b: {c: 2}}",
        exampleOutput: "{a: 1, b: {c: 2}} (new reference)",
        testCases: []
    },
    // === BACKEND - NODE.JS & SYSTEM DESIGN ===
    {
        title: "JWT Token Generator",
        description: "Implement a function that generates a JWT token using a secret key and user payload. Use the `jsonwebtoken` library logic.",
        difficulty: "Medium",
        tags: ["Backend", "Node.js"],
        exampleInput: "payload = {id: 1}, secret = 'xyz'",
        exampleOutput: "Token String",
        testCases: []
    },
    {
        title: "Password Hashing (Bcrypt)",
        description: "Create a utility to hash passwords using BCRYPT with a specified salt round and another function to compare the hash with a plain text password.",
        difficulty: "Medium",
        tags: ["Backend", "Node.js"],
        exampleInput: "password = '123'",
        exampleOutput: "Hashed String",
        testCases: []
    },
    // === DSA - MORE ARRAY & STRING ===
    {
        title: "Move Zeroes",
        description: "Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements. You must do this in-place without making a copy of the array.",
        difficulty: "Easy",
        tags: ["DSA", "Arrays"],
        exampleInput: "[0,1,0,3,12]",
        exampleOutput: "[1,3,12,0,0]",
        testCases: [
            { input: "[0,1,0,3,12]", output: "[1,3,12,0,0]", hidden: false },
            { input: "[0]", output: "[0]", hidden: false }
        ]
    },
    {
        title: "Longest Common Prefix",
        description: "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string \"\".",
        difficulty: "Easy",
        tags: ["DSA", "Strings"],
        exampleInput: "['flower','flow','flight']",
        exampleOutput: "'fl'",
        testCases: [
            { input: "['flower','flow','flight']", output: "'fl'", hidden: false },
            { input: "['dog','racecar','car']", output: "''", hidden: false }
        ]
    },
    {
        title: "Valid Parentheses",
        description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: "Easy",
        tags: ["DSA", "Stack"],
        exampleInput: "'()[]{}'",
        exampleOutput: "true",
        testCases: [
            { input: "'()'", output: "true", hidden: false },
            { input: "'()[]{}'", output: "true", hidden: false },
            { input: "'(]'", output: "false", hidden: false }
        ]
    },
    // === DSA - MORE LINKED LISTS & TREES ===
    {
        title: "Merge Two Sorted Lists",
        description: "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists in a one sorted list.",
        difficulty: "Easy",
        tags: ["DSA", "Linked List"],
        exampleInput: "[1,2,4], [1,3,4]",
        exampleOutput: "[1,1,2,3,4,4]",
        testCases: []
    },
    {
        title: "Inorder Traversal",
        description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
        difficulty: "Easy",
        tags: ["DSA", "Tree"],
        exampleInput: "[1,null,2,3]",
        exampleOutput: "[1,3,2]",
        testCases: []
    },
    // === MORE FRONTEND ===
    {
        title: "Throttle Function",
        description: "Implement a `throttle` function that ensures a function is called at most once in a specified time period.",
        difficulty: "Medium",
        tags: ["Frontend", "JavaScript"],
        exampleInput: "wait = 500ms",
        exampleOutput: "Execution limited",
        testCases: []
    },
    {
        title: "Flatten Array",
        description: "Write a function to flatten a nested array structure to a single level. Handle any depth of nesting.",
        difficulty: "Easy",
        tags: ["Frontend", "JavaScript"],
        exampleInput: "[1, [2, [3, [4]], 5]]",
        exampleOutput: "[1, 2, 3, 4, 5]",
        testCases: [
            { input: "[1, [2, [3, [4]], 5]]", output: "[1,2,3,4,5]", hidden: false }
        ]
    },
    {
        title: "Currying Function",
        description: "Implement a function that supports currying, allowing it to be called with multiple arguments or one at a time.",
        difficulty: "Medium",
        tags: ["Frontend", "JavaScript"],
        exampleInput: "sum(1)(2)(3)",
        exampleOutput: "6",
        testCases: [
            { input: "1,2,3", output: "6", hidden: false }
        ]
    },
    // === MORE BACKEND ===
    {
        title: "Rate Limiter Middleware",
        description: "Implement a simple rate limiter middleware for an Express application that limits requests from a single IP to 100 per hour.",
        difficulty: "Hard",
        tags: ["Backend", "Node.js"],
        exampleInput: "101st request",
        exampleOutput: "429 Too Many Requests",
        testCases: []
    },
    {
        title: "Data Type Validator",
        description: "Create a schema validation utility that checks if an object matches a defined structure (e.g., has required fields and correct types).",
        difficulty: "Medium",
        tags: ["Backend", "Node.js"],
        exampleInput: "{ name: 'Vansh', age: '20' }, schema: { age: 'number' }",
        exampleOutput: "Invalid Type: age should be number",
        testCases: []
    },
    // === DSA - ADVANCED & MISC ===
    {
        title: "Fibonacci Number",
        description: "The Fibonacci numbers, commonly denoted `F(n)` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.",
        difficulty: "Easy",
        tags: ["DSA", "Recursion", "DP"],
        exampleInput: "n = 4",
        exampleOutput: "3",
        testCases: [
            { input: "4", output: "3", hidden: false },
            { input: "2", output: "1", hidden: false }
        ]
    },
    {
        title: "Maximum Subarray (Kadane's)",
        description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
        difficulty: "Medium",
        tags: ["DSA", "Arrays"],
        exampleInput: "[-2,1,-3,4,-1,2,1,-5,4]",
        exampleOutput: "6",
        testCases: [
            { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", hidden: false }
        ]
    },
    {
        title: "Merge Intervals",
        description: "Given an array of intervals where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        difficulty: "Medium",
        tags: ["DSA", "Arrays"],
        exampleInput: "[[1,3],[2,6],[8,10],[15,18]]",
        exampleOutput: "[[1,6],[8,10],[15,18]]",
        testCases: []
    },
    {
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        difficulty: "Easy",
        tags: ["DSA", "DP"],
        exampleInput: "3",
        exampleOutput: "3",
        testCases: [
            { input: "3", output: "3", hidden: false },
            { input: "2", output: "2", hidden: false }
        ]
    }
];

const seedDB = async () => {
    try {
        await Problem.deleteMany({});
        await Problem.insertMany(problems);
        console.log(`Database Seeded with ${problems.length} Problems!`);
    } catch (err) {
        console.error('Seeding Error:', err);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
