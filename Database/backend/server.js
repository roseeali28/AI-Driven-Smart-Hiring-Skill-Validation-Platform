const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/job");

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection with Offline Fallback
let isOffline = false;

const connectDB = async () => {
  try {
    // We set this to true initially to silence any events during the discovery phase
    // If it succeeds, we switch it back to false
    isOffline = true;

    console.log("📡 Attempting to reach MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
      socketTimeoutMS: 45000,
    });

    isOffline = false;
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    // Keep isOffline = true
    console.error("❌ MongoDB Connection Error:", err.message);
    console.log("\n⚠️ RUNNING IN OFFLINE MODE (Safety Fallback Active) ⚠️");
    console.log("The server will stay active. Press Ctrl+C to close manually.");
    console.log("---------------------------\n");
  }
};

connectDB();

// Handle mid-run disconnections or topology errors quietly
// We only log if we weren't already offline
mongoose.connection.on('error', err => {
  if (!isOffline) {
    console.error('💥 Mongoose topology update error:', err.message);
    isOffline = true;
  }
});

mongoose.connection.on('disconnected', () => {
  if (!isOffline) {
    console.log('🔌 Mongoose disconnected. Safety mode active.');
    isOffline = true;
  }
});

// Prevention of server crash from MongoDB topology issues
process.on('unhandledRejection', (reason) => {
  if (reason && reason.name === 'MongooseServerSelectionError') {
    if (!isOffline) {
      console.log('🔄 Topology discovery failed. Staying active in Offline Mode.');
      isOffline = true;
    }
    return;
  }
  console.error('⚠️ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  if (err && err.name === 'MongooseServerSelectionError') {
    isOffline = true;
    return;
  }
  console.error('💥 Uncaught Exception:', err);
});

// Global middleware to handle offline state for certain routes
app.use((req, res, next) => {
  req.isOffline = isOffline;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/uploads", express.static("uploads"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("💥 Global Error Handler:", err.stack);
  res.status(500).json({ error: "Something went wrong on the server!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
