const { success, created } = require('../utils/response');
const { validateRequest } = require('../validators/validate');
const aiService = require('../services/ai.service');

async function listConversations(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(Math.max(1, Number(req.query.limit || 50)), 100);

    const result = await aiService.listConversations({ ownerId, page, limit });
    return success(res, result);
  } catch (e) {
    return next(e);
  }
}

async function createConversation(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversation = await aiService.createConversation({
      ownerId,
      payload: {
        title: req.body.title,
        provider: req.body.provider,
        model: req.body.model,
      },
    });

    return created(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

async function updateConversation(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await aiService.updateConversation({
      ownerId,
      conversationId,
      payload: {
        title: req.body.title,
        provider: req.body.provider,
        model: req.body.model,
      },
    });

    return success(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

async function deleteConversation(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;

    const result = await aiService.deleteConversation({ ownerId, conversationId });
    return success(res, result);
  } catch (e) {
    return next(e);
  }
}

async function listMessages(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.conversationId;

    const messages = await aiService.listMessages({ ownerId, conversationId });
    return success(res, { messages });
  } catch (e) {
    return next(e);
  }
}

async function chat(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const result = await aiService.chat({
      ownerId,
      conversationId: req.body.conversationId,
      message: req.body.message,
      provider: req.body.provider,
      model: req.body.model,
    });

    return success(res, result);
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  listConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  listMessages,
  chat,
};
