const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },

    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    content: { type: String, required: true, default: '' },
    summary: { type: String, default: '', trim: true, maxlength: 800 },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((t) => typeof t === 'string' && t.length <= 40),
        message: 'Each tag must be a string with max length 40',
      },
      index: true,
    },

    collection: { type: String, default: 'default', trim: true, maxlength: 80, index: true },

    attachments: {
      type: [
        {
          filename: { type: String, required: true, trim: true, maxlength: 200 },
          url: { type: String, required: true, trim: true, maxlength: 2000 },
          mimeType: { type: String, default: null, trim: true, maxlength: 120 },
          sizeBytes: { type: Number, default: 0, min: 0 },
        },
      ],
      default: [],
    },

    favorite: { type: Boolean, default: false, index: true },
    pinned: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },

    lastEdited: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

knowledgeSchema.index({ workspace: 1, title: 1 });
knowledgeSchema.index({ workspace: 1, archived: 1 });
knowledgeSchema.index({ workspace: 1, collection: 1 });

knowledgeSchema.pre('save', function (next) {
  if (this.isModified('content') || this.isModified('summary') || this.isModified('title') || this.isModified('tags')) {
    this.lastEdited = new Date();
  }
  next();
});

module.exports = mongoose.model('Knowledge', knowledgeSchema);

