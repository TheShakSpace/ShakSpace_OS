const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');

const router = Router();
router.use(authJwt(true));

router.post('/', async (req, res) => {
  res.status(201).json({ success: true, data: { automation: null } });
});

router.get('/', async (req, res) => {
  res.json({ success: true, data: { automations: [] } });
});

router.get('/:automationId', async (req, res) => {
  res.json({ success: true, data: { automation: null } });
});

router.patch('/:automationId', async (req, res) => {
  res.json({ success: true, data: { message: 'TODO: update automation' } });
});

router.delete('/:automationId', async (req, res) => {
  res.json({ success: true, data: { message: 'TODO: delete automation' } });
});

router.post('/:automationId/execute', async (req, res) => {
  res.json({ success: true, data: { result: null } });
});

module.exports = router;

