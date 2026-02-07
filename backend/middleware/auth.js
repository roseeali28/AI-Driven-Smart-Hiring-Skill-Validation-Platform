const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Verify JWT and attach user to request
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId, role: decoded.role, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Restrict access to recruiters only
 */
const recruiterOnly = (req, res, next) => {
  if (req.user?.role !== 'RECRUITER') {
    return res.status(403).json({ error: 'Recruiter access required' });
  }
  next();
};

/**
 * Restrict access to candidates only
 */
const candidateOnly = (req, res, next) => {
  if (req.user?.role !== 'CANDIDATE') {
    return res.status(403).json({ error: 'Candidate access required' });
  }
  next();
};

module.exports = { authenticate, recruiterOnly, candidateOnly };
