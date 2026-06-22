const { Router } = require('express');
const { body } = require('express-validator');

const authController = require('../../controllers/auth.controller');
const { validateRequest } = require('../../validators/validate');

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 chars'),
    body('name').isString().trim().isLength({ min: 1, max: 80 }),
  ],
  (req, res, next) => {
    try {
      validateRequest(req);
      return authController.register(req, res, next);
    } catch (e) {
      return next(e);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 1 }),
  ],
  (req, res, next) => {
    try {
      validateRequest(req);
      return authController.login(req, res, next);
    } catch (e) {
      return next(e);
    }
  }
);

router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));

router.post('/logout', (req, res, next) => authController.logout(req, res, next));

const { authJwt } = require('../../middleware/authJwt');

router.get('/me', authJwt(), (req, res, next) => authController.me(req, res, next));

module.exports = router;


