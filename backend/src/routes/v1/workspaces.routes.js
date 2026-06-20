const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');

const router = Router();

router.use(authJwt(true));

router.get('/', async (req, res) => {
  res.json({ success: true, data: { workspaces: [] } });
});

router.post('/', async (req, res) => {
  res.status(201).json({ success: true, data: { workspace: null } });
});

router.get('/:workspaceId', async (req, res) => {
  res.json({ success: true, data: { workspace: null, workspaceId: req.params.workspaceId } });
});

router.patch('/:workspaceId', async (req, res) => {
  res.json({ success: true, data: { message: 'TODO: update workspace' } });
});

router.delete('/:workspaceId', async (req, res) => {
  res.json({ success: true, data: { message: 'TODO: delete workspace' } });
});

module.exports = router;

