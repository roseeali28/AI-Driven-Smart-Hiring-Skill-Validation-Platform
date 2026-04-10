/**
 * Simple in-memory token blacklist for logout
 * For production, use Redis.
 */
const blacklist = new Set();

const isBlacklisted = (token) => blacklist.has(token);
const addToBlacklist = (token) => blacklist.add(token);

module.exports = { isBlacklisted, addToBlacklist };
