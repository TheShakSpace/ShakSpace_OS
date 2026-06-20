const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');
const { upload } = require('../../config/multer');

const router = Router();

router.use(authJwt(true));

router.get('/items', async (req, res) => {
  res.json({ success: true, data: { items: [] } });
});

router.post('/items', upload.single('file'), async (req, res) => {
  res.status(201).json({ success: true, data: { item: null } });
});

router.get('/items/:itemId', async (req, res) => {
  res.json({ success: true, data: { item: null, itemId: req.params.itemId } });
});

router.patch('/items/:itemId', async (req, res) => {
  res.json({ success: true, data: { message: 'TODO: update knowledge item' } });
});

router.delete('/items/:itemId', async (req, res) => {
  res.json({ success: true, data: { message: 'TODO: delete knowledge item' } });
});

router.post('/search', async (req, res) => {
  res.json({ success: true, data: { results: [] } });
});

module.exports = router;

