const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');

const aiController = require('../../controllers/aiConversation.controller');
const aiValidation = require('../../validators/aiConversation.validation');

const router = Router();
router.use(authJwt(true));

// Conversations
router.get(
  '/conversations',
  [...aiValidation.pagination, ...aiValidation.sort, ...aiValidation.boolFilters, ...aiValidation.searchQuery],
  (req, res, next) => aiController.list(req, res, next)
);

router.get(
  '/conversations/:id',
  aiValidation.objectIdParam,
  (req, res, next) => aiController.getById(req, res, next)
);

router.post(
  '/conversations',
  aiValidation.createPayload,
  (req, res, next) => aiController.create(req, res, next)
);

router.put(
  '/conversations/:id',
  aiValidation.objectIdParam,
  aiValidation.updatePayload,
  (req, res, next) => aiController.update(req, res, next)
);

router.delete(
  '/conversations/:id',
  aiValidation.objectIdParam,
  (req, res, next) => aiController.remove(req, res, next)
);

// Conversation features
router.put('/conversations/:id/rename', aiValidation.objectIdParam, aiValidation.renamePayload, (req, res, next) => aiController.rename(req, res, next));
router.patch('/conversations/:id/pin', aiValidation.objectIdParam, aiValidation.pinFavoriteArchivePayload, (req, res, next) => aiController.pin(req, res, next));
router.patch('/conversations/:id/favorite', aiValidation.objectIdParam, aiValidation.pinFavoriteArchivePayload, (req, res, next) => aiController.favorite(req, res, next));
router.patch('/conversations/:id/archive', aiValidation.objectIdParam, aiValidation.pinFavoriteArchivePayload, (req, res, next) => aiController.archive(req, res, next));
router.patch('/conversations/:id/restore', aiValidation.objectIdParam, aiValidation.pinFavoriteArchivePayload, (req, res, next) => aiController.restore(req, res, next));
router.post('/conversations/:id/duplicate', aiValidation.objectIdParam, aiValidation.duplicatePayload, (req, res, next) => aiController.duplicate(req, res, next));

// Messages
router.post(
  '/conversations/:id/messages',
  aiValidation.objectIdParam,
  aiValidation.messageCreatePayload,
  (req, res, next) => aiController.addMessage(req, res, next)
);

router.put(
  '/conversations/:id/messages/:messageId',
  aiValidation.objectIdParam,
  aiValidation.messageIdParam,
  aiValidation.messageUpdatePayload,
  (req, res, next) => aiController.updateMessage(req, res, next)
);

router.delete(
  '/conversations/:id/messages/:messageId',
  aiValidation.objectIdParam,
  aiValidation.messageIdParam,
  (req, res, next) => aiController.deleteMessage(req, res, next)
);

// Stats
router.get('/stats', (req, res, next) => aiController.stats(req, res, next));

module.exports = router;


