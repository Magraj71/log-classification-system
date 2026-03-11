import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  logText: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  confidence: {
    type: String,
    default: "95%"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Log || mongoose.model("Log", logSchema);