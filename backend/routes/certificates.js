const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const Certificate = require('../models/Certificate');
const { authenticate } = require('../middleware/auth');

const SECRET_HASH_KEY = 'hired-up-authority-secret-key';
const UPLOADS_DIR = path.join(__dirname, '../uploads/generated_certificates');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * GET /api/certificates
 * Private: Returns all certificates for the logged-in user.
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const certs = await Certificate.find({
      candidate_id: req.user.id
    }).sort({ created_at: -1 });
    res.json(certs);
  } catch (err) {
    console.error('Certificates fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

/**
 * POST /api/certificates/issue
 * Private: Only Authorities/Recruiters can issue verifiable certificates.
 */
router.post('/issue', authenticate, async (req, res) => {
  try {
    const { issued_to_name, course_name, candidate_id, expiry_days } = req.body;

    if (!issued_to_name || !course_name) {
      return res.status(400).json({ error: 'Name and Course are required' });
    }

    const certId = uuidv4();
    const issueDate = new Date();
    let expiryDate = null;
    if (expiry_days) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiry_days));
    }

    // 1. Digital Signature for Integrity
    const signature = crypto.createHmac('sha256', SECRET_HASH_KEY)
      .update(`${certId}|${issued_to_name}|${course_name}`)
      .digest('hex');

    // 2. Generate QR Code
    const verifyUrl = `http://localhost:5173/verify.html?id=${certId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);

    // 3. Generate PDF Certificate
    const fileName = `cert_${certId}.pdf`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });

    doc.pipe(fs.createWriteStream(filePath));

    // Design the certificate
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a'); // Background
    
    // Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .lineWidth(2).stroke('#6d5cff');

    doc.fillColor('#6d5cff').fontSize(40).text('CERTIFICATE OF ACHIEVEMENT', 0, 100, { align: 'center' });
    doc.fillColor('#94a3b8').fontSize(16).text('This is to certify that', 0, 160, { align: 'center' });
    
    doc.fillColor('#ffffff').fontSize(32).text(issued_to_name, 0, 200, { align: 'center' });
    
    doc.fillColor('#94a3b8').fontSize(16).text('has successfully completed the course', 0, 260, { align: 'center' });
    doc.fillColor('#38e6c5').fontSize(24).text(course_name, 0, 300, { align: 'center' });
    
    doc.fillColor('#64748b').fontSize(12).text(`Issued on: ${issueDate.toLocaleDateString()}`, 0, 360, { align: 'center' });
    doc.text(`Credential ID: ${certId}`, 0, 380, { align: 'center' });

    // Add QR Code
    doc.image(qrCodeDataUrl, doc.page.width - 150, doc.page.height - 150, { width: 100 });
    doc.fontSize(10).text('Scan to verify authenticity', doc.page.width - 150, doc.page.height - 40, { width: 100, align: 'center' });

    doc.end();

    const certificate = new Certificate({
      _id: certId,
      candidate_id: candidate_id || null,
      issued_to_name,
      course_name,
      issue_date: issueDate,
      expiry_date: expiryDate,
      hash_signature: signature,
      file_path: `/uploads/generated_certificates/${fileName}`,
      status: 'VALID'
    });

    await certificate.save();

    res.status(201).json({
      message: 'Certificate issued successfully',
      certificate_id: certId,
      verification_url: verifyUrl,
      pdf_url: certificate.file_path,
      qr_code: qrCodeDataUrl,
      details: certificate
    });
  } catch (err) {
    console.error('Issuance error:', err);
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
});

/**
 * GET /api/certificates/verify/:id
 * Public: Anyone can verify a certificate by ID or QR link.
 */
router.get('/verify/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({ 
        status: 'INVALID', 
        message: 'Certificate not found in our database.' 
      });
    }

    // Verify signature integrity
    const expectedSignature = crypto.createHmac('sha256', SECRET_HASH_KEY)
      .update(`${certificate._id}|${certificate.issued_to_name}|${certificate.course_name}`)
      .digest('hex');

    const isTampered = certificate.hash_signature && certificate.hash_signature !== expectedSignature;

    if (isTampered) {
      return res.json({
        status: 'TAMPERED',
        message: 'WARNING: Certificate record has been tampered with or corrupted.',
        details: {
          id: certificate.id,
          issued_to: certificate.issued_to_name,
          course: certificate.course_name
        }
      });
    }

    // Check expiry
    if (certificate.expiry_date && new Date() > certificate.expiry_date) {
      certificate.status = 'EXPIRED';
    }

    res.json({
      status: certificate.status,
      details: {
        id: certificate.id,
        issued_to: certificate.issued_to_name,
        course: certificate.course_name,
        issue_date: certificate.issue_date,
        expiry_date: certificate.expiry_date,
        issued_by: certificate.issued_by,
        platform: certificate.platform
      },
      trust_score: certificate.trust_score
    });

  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Verification service error' });
  }
});

module.exports = router;
