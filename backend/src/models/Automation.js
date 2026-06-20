const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },

    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true, maxlength: 2000 },

    trigger: {
      type: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
        index: true,
      },
      params: { type: mongoose.Schema.Types.Mixed, default: {} },
    },

    conditions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    actions: { type: [mongoose.Schema.Types.Mixed], default: [] },

    enabled: { type: Boolean, default: true, index: true },

    favorite: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },

    lastRun: { type: Date, default: null, index: true },

    executionHistory: {
      type: [
        {
          ranAt: { type: Date, required: true },
          status: {
            type: String,
            enum: ['success', 'failed', 'skipped', 'running'],
            default: 'success',
            index: true,
          },
          durationMs: { type: Number, default: 0, min: 0 },
          meta: { type: mongoose.Schema.Types.Mixed, default: {} },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

automationSchema.index({ workspace: 1, enabled: 1, archived: 1 });
automationSchema.index({ workspace: 1, name: 1 });

module.exports = mongoose.model('Automation', automationSchema);

