const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');
const { requireRole } = require('../../middleware/requireRole');

const router = Router();

router.get('/me', authJwt(true), async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

router.get('/', authJwt(true), requireRole('admin', 'manager'), async (req, res) => {
  res.json({ success: true, data: { users: [] } });
});

router.patch('/me', authJwt(true), async (req, res) => {
  res.json({ success: true, data: { message: 'TODO: update user' } });
});

module.exports = router;

