const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

/* ===================== SETUP UPLOADS DIRECTORY ===================== */
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ===================== MULTER SETUP ===================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Ensure we use absolute path or existing folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ===================== SIGNUP ===================== */
router.post("/signup", async (req, res) => {
  if (req.isOffline) {
    return res.status(201).json({
      message: "Account created (OFFLINE MODE)",
      user: {
        _id: "000000000000000000000000",
        fullname: req.body.fullname,
        email: req.body.email,
        role: req.body.role,
        companyName: req.body.companyName,
        designation: req.body.designation
      }
    });
  }
  try {
    const { fullname, email, password, role, companyName, designation } = req.body;
    console.log("📝 Incoming Signup Request:", { fullname, email, role, companyName, designation });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullname,
      email,
      password: hashedPassword,
      role,
      companyName,
      designation
    });

    console.log("💾 Attempting to save user:", user);
    await user.save();
    console.log("✅ User saved successfully!");

    res.status(201).json({
      message: "Account created",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        designation: user.designation
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================== LOGIN ===================== */
router.post("/login", async (req, res) => {
  if (req.isOffline) {
    return res.json({
      message: "Login successful (OFFLINE MODE)",
      user: {
        _id: req.body.email === "sample5@gmail.com" ? "678567856785678567856785" : "000000000000000000000000",
        fullname: "Offline User",
        email: req.body.email,
        role: req.body.email.includes("recruiter") ? "Recruiter" : "Candidate",
        companyName: "HiredUp Global Corp",
        designation: "Product Infiltrator",
        about: "Offline demo account"
      }
    });
  }
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
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        about: user.about || "",
        education: user.education || "",
        experience: user.experience || "",
        expertise: user.expertise || "",
        phone: user.phone || "",
        resume: user.resume || "",
        certificate: user.certificate || "",
        companyName: user.companyName || "",
        designation: user.designation || ""
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
      console.log("=== PROFILE UPDATE START ===");
      console.log("Request Body:", JSON.stringify(req.body, null, 2));
      console.log("Request Files:", req.files ? Object.keys(req.files) : "No files");

      const { email, about, education, experience, expertise, phone } = req.body;

      if (!email) {
        console.error("❌ ERROR: Email is missing in request body!");
        return res.status(400).json({ message: "Email is required to update profile" });
      }

      const updates = { about, education, experience, expertise, phone };

      if (req.files && req.files.resume && req.files.resume[0]) {
        updates.resume = req.files.resume[0].filename;
        console.log("✅ Setting resume:", updates.resume);
      }

      if (req.files && req.files.certificate && req.files.certificate[0]) {
        updates.certificate = req.files.certificate[0].filename;
        console.log("✅ Setting certificate:", updates.certificate);
      }

      console.log("Attempting to find user with email:", email);
      console.log("Updates being applied:", updates);

      const user = await User.findOneAndUpdate(
        { email },
        updates,
        { new: true, runValidators: true }
      );

      if (!user) {
        console.error("❌ ERROR: User not found in DB for email:", email);
        return res.status(404).json({ message: "User not found" });
      }

      console.log("✅ User updated successfully:", user.email);
      res.json({ message: "Profile updated successfully", user });
    } catch (err) {
      console.error("❌ SERVER ERROR:", err);
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

/* ===================== GET ALL CANDIDATES ===================== */
router.get("/candidates", async (req, res) => {
  try {
    const candidates = await User.find({ role: "Candidate" });
    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching candidates" });
  }
});

module.exports = router;
