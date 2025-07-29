// models/Snippet.js

import mongoose from "mongoose";

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  description: String,
  tags: [String],
  createdBy: {
    type: String,
    required: true, // Admin email
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

snippetSchema.index({ title: "text", description: "text", code: "text" });

export default mongoose.model("Snippet", snippetSchema);
