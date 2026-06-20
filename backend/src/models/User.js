const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const rolesEnum = ['user', 'manager', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 80, index: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: (v) => /^\S+@\S+\.\S+$/.test(v),
        message: 'Invalid email format',
      },
    },

    // keeps existing auth compatibility (auth.controller uses passwordHash)
    passwordHash: { type: String, required: true, minlength: 60, select: false },

    avatar: { type: String, default: null },

    role: { type: String, default: 'user', enum: rolesEnum, index: true },

    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    refreshTokens: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RefreshToken' }],

    // legacy fields used by the current backend
    roles: { type: [String], default: ['user'], index: true },
    avatarUrl: { type: String, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_doc, ret) => { delete ret.passwordHash; return ret; } },
    toObject: { virtuals: true },
  }
);

// keep indexes minimal but production-friendly
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Virtual: unify role+roles (for JWT payload compatibility)
userSchema.virtual('effectiveRoles').get(function effectiveRoles() {
  const fromRoles = Array.isArray(this.roles) && this.roles.length ? this.roles : [];
  const fromRole = this.role ? [this.role] : [];
  const set = new Set([...fromRoles, ...fromRole]);
  return Array.from(set);
});

// Instance methods (schema methods)
userSchema.methods.verifyPassword = async function verifyPassword(plainPassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.methods.setPassword = async function setPassword(plainPassword) {
  this.passwordHash = await bcrypt.hash(plainPassword, 12);
};

// Pre-save hook: password hashing when passwordHash is provided in plaintext (safety)
userSchema.pre('save', async function preSave(next) {
  try {
    if (this.isModified('passwordHash')) {
      const looksHashed = typeof this.passwordHash === 'string' && this.passwordHash.startsWith('$2');
      if (!looksHashed) {
        this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
      }
    }

    // normalize legacy fields
    if (!this.avatar && this.avatarUrl) this.avatar = this.avatarUrl;
    if (this.role && (!Array.isArray(this.roles) || this.roles.length === 0)) this.roles = [this.role];

    next();
  } catch (e) {
    next(e);
  }
});

module.exports = mongoose.model('User', userSchema);


