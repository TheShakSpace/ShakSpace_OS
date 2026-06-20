const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['system', 'user', 'assistant'],
      index: true,
    },
    content: { type: String, required: true, default: '' },
  },
  { _id: false }
);

const aiConversationSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    messages: { type: [messageSchema], default: [] },

    model: { type: String, default: 'gpt-4o-mini', trim: true, maxlength: 80 },
    tokensUsed: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

aiConversationSchema.index({ workspace: 1, user: 1, createdAt: -1 });
aiConversationSchema.index({ workspace: 1, user: 1, model: 1 });

module.exports = mongoose.model('AIConversation', aiConversationSchema);


