const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');
const { validateRequest } = require('../../validators/validate');

const aiController = require('../../controllers/ai.controller');
const {
  conversationCreate,
  conversationUpdate,
  conversationDelete,
  conversationList,
  messagesList,
  chatPayload,
} = require('../../validators/ai.validation');

const router = Router();

router.use(authJwt(true));

router.get('/conversations', ...conversationList(), validateRequest, aiController.listConversations);

router.post(
  '/conversations',
  ...conversationCreate(),
  validateRequest,
  aiController.createConversation
);

router.patch(
  '/conversations/:id',
  ...conversationUpdate(),
  validateRequest,
  aiController.updateConversation
);

router.delete(
  '/conversations/:id',
  ...conversationDelete(),
  validateRequest,
  aiController.deleteConversation
);

router.get(
  '/messages/:conversationId',
  ...messagesList(),
  validateRequest,
  aiController.listMessages
);

router.post('/chat', ...chatPayload(), validateRequest, aiController.chat);

module.exports = router;
