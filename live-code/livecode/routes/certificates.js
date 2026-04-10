const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Certificate = require('../models/Certificate');
const { verifyCertificateOCR } = require('../services/aiService');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs allowed'));
        }
    }
});

// POST /api/certificates/upload
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const filePath = req.file.path;
        const ocrData = await verifyCertificateOCR(filePath);

        const newCertificate = new Certificate({
            platform: ocrData.platform || 'unknown',
            candidateName: ocrData.candidateName || 'Unknown',
            courseName: ocrData.courseName,
            issueDate: ocrData.issueDate,
            credentialId: ocrData.credentialId,
            filePath: `/uploads/certificates/${path.basename(filePath)}`,
            trustScore: ocrData.trustScore || 0,
            status: (ocrData.trustScore > 75) ? 'VERIFIED' : 'PENDING',
            metadata: ocrData
        });

        const savedCert = await newCertificate.save();
        res.status(201).json(savedCert);
    } catch (err) {
        console.error('Certificate processing error:', err);
        res.status(500).json({ error: 'Failed to process certificate' });
    }
});

// GET /api/certificates
router.get('/', async (req, res) => {
    try {
        const certs = await Certificate.find().sort({ createdAt: -1 });
        res.json(certs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
});

module.exports = router;
