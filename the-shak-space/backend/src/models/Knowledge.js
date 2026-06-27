const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },

    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    content: { type: String, default: '' },
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

    category: {
      type: String,
      default: 'general',
      enum: ['general', 'personal', 'team', 'education', 'business', 'research'],
      index: true,
    },

    color: {
      type: String,
      default: '#8B5CF6',
      validate: {
        validator: (v) => /^#([0-9a-fA-F]{3}){1,2}$/.test(v),
        message: (props) => `${props.value} is not a valid hex color`,
      },
    },

    icon: { type: String, default: '📝', trim: true, maxlength: 64 },

    favorite: { type: Boolean, default: false, index: true },
    pinned: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },

    lastOpened: { type: Date, default: null, index: true },
    lastEdited: { type: Date, default: Date.now, index: true },

    wordCount: { type: Number, default: 0, min: 0 },
    readingTime: { type: Number, default: 1, min: 0 },
  },
  { timestamps: true }
);

knowledgeSchema.index({ owner: 1, workspace: 1, title: 1 });
knowledgeSchema.index({ workspace: 1, archived: 1 });
knowledgeSchema.index({ owner: 1, lastEdited: -1 });

knowledgeSchema.pre('save', function preSave(next) {
  if (
    this.isModified('content') ||
    this.isModified('summary') ||
    this.isModified('title') ||
    this.isModified('tags')
  ) {
    this.lastEdited = new Date();
  }
  next();
});

module.exports = mongoose.model('Knowledge', knowledgeSchema);
