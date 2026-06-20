const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');
const { upload } = require('../../config/multer');

const router = Router();

router.use(authJwt(true));

router.post('/conversations', async (req, res) => {
  res.status(201).json({ success: true, data: { conversation: null } });
});

router.get('/conversations', async (req, res) => {
  res.json({ success: true, data: { conversations: [] } });
});

router.get('/conversations/:conversationId', async (req, res) => {
  res.json({ success: true, data: { conversation: null } });
});

router.patch('/conversations/:conversationId', async (req, res) => {
  res.json({ success: true, data: { message: 'TODO: update conversation' } });
});

router.post(
  '/conversations/:conversationId/messages',
  upload.array('attachments', 5),
  async (req, res) => {
    res.status(201).json({ success: true, data: { message: null } });
  }
);

module.exports = router;

