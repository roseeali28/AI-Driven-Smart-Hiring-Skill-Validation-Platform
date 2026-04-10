const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
// FORCE SYNC: Hardcoded secret to ensure Port 5000 and 5001 always agree.
const JWT_SECRET = 'skillfirst-hire-platform-super-secret-key-2024';
const crypto = require('crypto');
const secretHash = crypto.createHash('sha256').update(JWT_SECRET).digest('hex').substring(0, 8);
console.log(`🔒 Token Signing Secret Signature: [${secretHash}]`);
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '24h';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * POST /auth/register
 * Body: { email, password, role, fullName?, companyName? }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, fullname, fullName, companyName, designation } = req.body;
    
    // Normalize Role for consistency
    const finalRole = role ? role.toUpperCase() : null;
    const finalFullName = fullName || fullname;

    if (!email || !password || !finalRole) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    if (!['RECRUITER', 'CANDIDATE'].includes(finalRole)) {
      return res.status(400).json({ error: 'Role must be RECRUITER or CANDIDATE' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const user = new User({
      _id: id,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      role: finalRole,
      fullName: finalFullName || null,
      companyName: companyName || null,
      designation: designation || null
    });
    await user.save();

    const accessToken = jwt.sign(
      { userId: id, role: finalRole, email: email.toLowerCase() },
      JWT_SECRET,
      { expiresIn: ACCESS_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: REFRESH_EXPIRY }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: { id, email: email.toLowerCase(), role, fullName: finalFullName, fullname: finalFullName, companyName, designation, skills: user.skills },
      accessToken,
      refreshToken,
      expiresIn: 900,
    });
  } catch (err) {
    console.error('❌ Registration Fatal Error:', err);
    // Return the specific error message for debugging purposes (Temporary)
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

/**
 * POST /auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: ACCESS_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: REFRESH_EXPIRY }
    );

    console.log(`🔑 Token Issued: { len: ${accessToken.length}, first: ${accessToken.substring(0, 10)}, last: ${accessToken.substring(accessToken.length - 10)} }`);
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        fullname: user.fullName,   // alias for frontend compat
        companyName: user.companyName,
        designation: user.designation,
        skills: user.skills,
      },
      accessToken,
      refreshToken,
      expiresIn: 900,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /auth/refresh
 * Body: { refreshToken }
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: ACCESS_EXPIRY }
    );

    res.json({
      accessToken,
      expiresIn: 900,
    });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

/**
 * GET /auth/me - Get current user (protected)
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      companyName: user.companyName,
      designation: user.designation,
      about: user.about,
      education: user.education,
      experience: user.experience,
      github: user.github,
      githubUrl: user.githubUrl || user.github,
      leetcode: user.leetcode,
      linkedinUrl: user.linkedinUrl,
      phone: user.phone,
      skills: user.skills,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * GET /auth/candidates - Get all candidates
 */
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await User.find({ role: { $regex: /^candidate$/i } }).select('-passwordHash -__v');
    
    // Map _id to id and fullName to fullname to match frontend expectations if necessary
    const mappedCandidates = candidates.map(c => ({
      id: c._id,
      fullname: c.fullName || c.fullname || 'Candidate', 
      email: c.email,
      role: c.role,
      expertise: c.expertise || 'DEVELOPER',
    }));

    res.json(mappedCandidates);
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ error: 'Error fetching candidates' });
  }
});

/**
 * POST /auth/profile - Update user profile
 */
router.post('/profile', authenticate, async (req, res) => {
  try {
    const { about, education, experience, github, githubUrl, leetcode, linkedinUrl, phone, skills } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (about !== undefined) user.about = about;
    if (education !== undefined) user.education = education;
    if (experience !== undefined) user.experience = experience;
    if (github !== undefined) user.github = github;
    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (leetcode !== undefined) user.leetcode = leetcode;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
    if (phone !== undefined) user.phone = phone;
    if (skills !== undefined) user.skills = skills;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        about: user.about,
        education: user.education,
        experience: user.experience,
        github: user.github,
        leetcode: user.leetcode,
        linkedinUrl: user.linkedinUrl,
        phone: user.phone,
        skills: user.skills
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
