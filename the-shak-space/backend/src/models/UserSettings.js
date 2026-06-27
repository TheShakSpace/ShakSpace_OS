const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },

    theme: { type: String, default: 'dark', enum: ['light', 'dark'], index: true },
    accentColor: {
      type: String,
      default: '#8B5CF6',
      validate: {
        validator: (v) => /^#([0-9a-fA-F]{3}){1,2}$/.test(v),
        message: (props) => `${props.value} is not a valid hex color`,
      },
    },

    language: { type: String, default: 'en', trim: true, maxlength: 10, index: true },
    timezone: { type: String, default: 'UTC', trim: true, maxlength: 50 },

    defaultModel: { type: String, default: 'gpt-4o-mini', trim: true, maxlength: 80 },

    notificationPreferences: {
      type: {
        email: { type: Boolean, default: false },
        inApp: { type: Boolean, default: true },
        automationRuns: { type: Boolean, default: true },
      },
      default: undefined,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserSettings', userSettingsSchema);

