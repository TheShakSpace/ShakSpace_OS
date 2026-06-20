const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');

const router = Router();
router.use(authJwt(true));

router.get('/', async (req, res) => {
  res.json({ success: true, data: { notifications: [] } });
});

router.patch('/:notificationId', async (req, res) => {
  res.json({ success: true, data: { message: 'TODO: update notification' } });
});

router.patch('/read-all', async (req, res) => {
  res.json({ success: true, data: { message: 'TODO: mark read all' } });
});

module.exports = router;

