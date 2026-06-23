const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    provider: {
      type: String,
      required: true,
      enum: ['gemini', 'ollama', 'openai'],
      default: 'gemini',
      index: true,
    },
    model: { type: String, required: true, trim: true, maxlength: 80, default: 'gemini-2.0-flash' },
  },
  { timestamps: true }
);

conversationSchema.index({ owner: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
