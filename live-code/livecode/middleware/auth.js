const jwt = require('jsonwebtoken');

// FORCE SYNC: Hardcoded secret to ensure Port 5000 and 5001 always agree.
const JWT_SECRET = 'skillfirst-hire-platform-super-secret-key-2024';

/**
 * Verify JWT and attach user to request
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const crypto = require('crypto');
  const currentHash = crypto.createHash('sha256').update(JWT_SECRET).digest('hex').substring(0, 8);
  console.log(`🔍 [AUTH CHECK] Request: ${req.method} ${req.originalUrl} | Header: ${authHeader ? 'Present' : 'Missing'} | Secret Sig: [${currentHash}]`);

  try {
    if (!token) {
      console.log('ℹ️ No token provided. Proceeding as Anonymous (Lenient Mode)');
      req.user = null;
      return next();
    }

    console.log(`🔑 Verifying Token: { len: ${token.length}, first: ${token.substring(0, 5)}... }`);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId, role: decoded.role, email: decoded.email };
    console.log(`✅ Token Valid. User: ${decoded.userId}`);
    next();
  } catch (err) {
    console.warn(`⚠️ JWT Verification Failed: ${err.message} (Lenient Mode: PROCEEDING)`);
    // Pass the error message to the request so routes know if auth failed
    req.authError = err.message;
    req.user = null; // Proceed as unauthenticated
    next();
  }
};

module.exports = { authenticate };
