const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 2000 },
    category: {
      type: String,
      default: 'general',
      enum: ['general', 'personal', 'team', 'education', 'business', 'research'],
      index: true,
    },
    color: {
      type: String,
      default: '#3B82F6',
      validate: {
        validator: (v) => /^#([0-9a-fA-F]{3}){1,2}$/.test(v),
        message: (props) => `${props.value} is not a valid hex color`,
      },
    },
    icon: { type: String, default: 'workspace', trim: true, maxlength: 64 },

    favorite: { type: Boolean, default: false, index: true },
    pinned: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

workspaceSchema.index({ owner: 1, name: 1 }, { unique: true });
workspaceSchema.index({ owner: 1, archived: 1 });

module.exports = mongoose.model('Workspace', workspaceSchema);

