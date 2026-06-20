const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const env = require('../config/env');
const { AppError } = require('../utils/AppError');
const { created, success } = require('../utils/response');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const { cookieOptions } = require('../config/config');

function signAccessToken(user) {
  const payload = {
    sub: String(user._id),
    roles: user.roles,
  };
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessTtlSeconds,
    jwtid: crypto.randomUUID(),
  });
}

function signRefreshToken(userId) {
  const jti = crypto.randomUUID();
  const payload = {
    sub: String(userId),
  };
  const token = jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshTtlSeconds,
    jwtid: jti,
  });
  return { token, jti };
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: env.jwt.accessTtlSeconds * 1000,
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: env.jwt.refreshTtlSeconds * 1000,
    path: '/api/v1/auth/refresh',
  });
}

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw new AppError('Email already in use', { statusCode: 409, code: 'EMAIL_TAKEN' });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      passwordHash,
      name,
    });

    const accessToken = signAccessToken(user);
    const { token: refreshToken, jti } = signRefreshToken(user._id);

    await RefreshToken.create({
      userId: user._id,
      jti,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + env.jwt.refreshTtlSeconds * 1000),
    });

    setAuthCookies(res, { accessToken, refreshToken });

    return created(res, {
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        roles: user.roles,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (e) {
    return next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new AppError('Invalid credentials', { statusCode: 401, code: 'INVALID_CREDENTIALS' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError('Invalid credentials', { statusCode: 401, code: 'INVALID_CREDENTIALS' });

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = signAccessToken(user);
    const { token: refreshToken, jti } = signRefreshToken(user._id);

    await RefreshToken.create({
      userId: user._id,
      jti,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + env.jwt.refreshTtlSeconds * 1000),
    });

    setAuthCookies(res, { accessToken, refreshToken });

    return success(res, {
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        roles: user.roles,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (e) {
    return next(e);
  }
}

async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new AppError('Unauthorized', { statusCode: 401, code: 'NO_REFRESH_TOKEN' });

    const decoded = jwt.verify(refreshToken, env.jwt.refreshSecret);
    const userId = decoded.sub;
    const jti = decoded.jti;

    const record = await RefreshToken.findOne({ jti, userId });
    if (!record || record.revokedAt) {
      throw new AppError('Unauthorized', { statusCode: 401, code: 'REFRESH_REVOKED' });
    }

    if (record.expiresAt <= new Date()) {
      throw new AppError('Unauthorized', { statusCode: 401, code: 'REFRESH_EXPIRED' });
    }

    // Rotate: revoke old and issue new
    record.revokedAt = new Date();
    await record.save();

    const user = await User.findById(userId);
    if (!user) throw new AppError('Unauthorized', { statusCode: 401, code: 'USER_NOT_FOUND' });

    const accessToken = signAccessToken(user);
    const { token: newRefreshToken, jti: newJti } = signRefreshToken(user._id);

    await RefreshToken.create({
      userId: user._id,
      jti: newJti,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + env.jwt.refreshTtlSeconds * 1000),
    });

    setAuthCookies(res, { accessToken, refreshToken: newRefreshToken });

    return success(res, {
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        roles: user.roles,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (e) {
    return next(e);
  }
}

async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, env.jwt.refreshSecret);
        const userId = decoded.sub;
        const jti = decoded.jti;
        await RefreshToken.updateOne({ jti, userId }, { $set: { revokedAt: new Date() } });
      } catch {
        // ignore invalid tokens
      }
    }

    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });

    return success(res, { message: 'Logged out' });
  } catch (e) {
    return next(e);
  }
}

module.exports = { register, login, refresh, logout };

