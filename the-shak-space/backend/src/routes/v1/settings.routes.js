const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');

const router = Router();
router.use(authJwt(true));

router.get('/me', async (req, res) => {
  res.json({ success: true, data: { settings: {} } });
});

router.patch('/me', async (req, res) => {
  res.json({ success: true, data: { message: 'TODO: update settings' } });
});

module.exports = router;

