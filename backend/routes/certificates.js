const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { authenticate, candidateOnly } = require('../middleware/auth');

const router = express.Router();
const multer = require('multer');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'certificates');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname || '.pdf')),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = (file.originalname || '').toLowerCase();
    if (ext.endsWith('.pdf')) return cb(null, true);
    cb(new Error('Only PDF files allowed'));
  },
});

router.use(authenticate);
router.use(candidateOnly);

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

async function callMLVerify(filePath, url) {
  try {
    const body = url ? { credential_url: url } : { file_path: filePath };
    const res = await fetch(ML_URL + '/verify/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return { trust_score: 0, status: 'FAILED', error: e.message };
  }
}

/**
 * GET /certificates - List candidate's certificates
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, platform, credential_url, trust_score, status, created_at FROM certificates WHERE candidate_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Certificates list error:', err);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

/**
 * POST /certificates/upload - Upload and verify PDF
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const verifyResult = await callMLVerify(filePath);

    const id = uuidv4();
    const trustScore = verifyResult.trust_score ?? 0;
    const status = (verifyResult.status || 'PENDING').toUpperCase().replace('UNVERIFIABLE', 'FAILED');

    await pool.query(
      `INSERT INTO certificates (id, candidate_id, platform, file_path, trust_score, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, req.user.id, verifyResult.platform || 'unknown', filePath, trustScore, status, JSON.stringify(verifyResult.metadata || {})]
    );

    res.status(201).json({
      id,
      platform: verifyResult.platform,
      trustScore,
      status,
    });
  } catch (err) {
    console.error('Certificate upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

/**
 * POST /certificates/url - Verify by URL
 */
router.post('/url', async (req, res) => {
  try {
    const { credentialUrl } = req.body;
    if (!credentialUrl || typeof credentialUrl !== 'string') {
      return res.status(400).json({ error: 'credentialUrl required' });
    }

    const verifyResult = await callMLVerify(null, credentialUrl);

    const id = uuidv4();
    const trustScore = verifyResult.trust_score ?? 0;
    const status = (verifyResult.status || 'PENDING').toUpperCase().replace('UNVERIFIABLE', 'FAILED');

    await pool.query(
      `INSERT INTO certificates (id, candidate_id, platform, credential_url, trust_score, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, req.user.id, verifyResult.platform || 'unknown', credentialUrl, trustScore, status, JSON.stringify(verifyResult.metadata || {})]
    );

    res.status(201).json({
      id,
      platform: verifyResult.platform,
      trustScore,
      status,
    });
  } catch (err) {
    console.error('Certificate URL error:', err);
    res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

module.exports = router;
