const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  password: String,
  role: String,

  // 🔽 PROFILE FIELDS
  about: String,
  education: String,
  experience: String,
  expertise: String,
  phone: String,
  resume: String,
certificate: String
});

module.exports = mongoose.model("User", userSchema);
