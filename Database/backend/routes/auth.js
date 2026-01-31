const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");

const router = express.Router();

/* ===================== MULTER SETUP ===================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ===================== SIGNUP ===================== */
router.post("/signup", async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullname,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    res.status(201).json({
      message: "Account created",
      user: {
        fullname: user.fullname,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================== LOGIN ===================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Return full profile
    res.json({
      message: "Login successful",
      user: {
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        about: user.about || "",
        education: user.education || "",
        experience: user.experience || "",
        expertise: user.expertise || "",
        phone: user.phone || "",
        resume: user.resume || "",
        certificate: user.certificate || ""
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================== SAVE / UPDATE PROFILE (MERGED WITH FILES) ===================== */
router.post(
  "/profile",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "certificate", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log("Profile body:", req.body); // Debugging
      console.log("Uploaded files:", req.files); // Debugging

      const { email, about, education, experience, expertise, phone } = req.body;
      const updates = { about, education, experience, expertise, phone };

      if (req.files && req.files.resume) updates.resume = req.files.resume[0].filename;
      if (req.files && req.files.certificate) updates.certificate = req.files.certificate[0].filename;

      const user = await User.findOneAndUpdate(
        { email },
        updates,
        { new: true, runValidators: true }
      );

      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ message: "Profile updated successfully", user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating profile" });
    }
  }
);

/* ===================== UPLOAD RESUME (KEPT FOR BACKWARD COMPATIBILITY) ===================== */
router.post("/upload/resume", upload.single("resume"), async (req, res) => {
  try {
    console.log("Resume upload body:", req.body); // Debugging
    console.log("Resume file:", req.file); // Debugging

    const { email } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { resume: req.file.filename },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Resume uploaded successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Resume upload failed" });
  }
});

/* ===================== UPLOAD CERTIFICATE (KEPT FOR BACKWARD COMPATIBILITY) ===================== */
router.post("/upload/certificate", upload.single("certificate"), async (req, res) => {
  try {
    console.log("Certificate upload body:", req.body); // Debugging
    console.log("Certificate file:", req.file); // Debugging

    const { email } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { certificate: req.file.filename },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Certificate uploaded successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Certificate upload failed" });
  }
});

/* ===================== GET PROFILE ===================== */
router.get("/profile/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

module.exports = router;
