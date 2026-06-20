const { success, created } = require('../utils/response');
const { validateRequest } = require('../validators/validate');
const aiConversationService = require('../services/aiConversation.service');

function parseReqFlags(req) {
  return {
    pinned: req.query.pinned,
    favorite: req.query.favorite,
    archived: req.query.archived,
  };
}

async function list(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;

    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const sortBy = req.query.sortBy || 'newest';
    const sortOrder = req.query.sortOrder || 'desc';

    const filters = {
      workspaceId: req.query.workspaceId,
      pinned: req.query.pinned,
      favorite: req.query.favorite,
      archived: req.query.archived,
    };

    const search = {
      title: req.query.title,
      messages: req.query.messages,
      workspaceId: req.query.workspaceId,
      model: req.query.model,
    };

    const result = await aiConversationService.list({
      ownerId,
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
      search,
    });

    return success(res, result);
  } catch (e) {
    return next(e);
  }
}

async function getById(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await aiConversationService.getById({ ownerId, conversationId });
    return success(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

async function create(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;

    const payload = {
      workspaceId: req.body.workspaceId,
      title: req.body.title,
      model: req.body.model,
    };

    const conversation = await aiConversationService.create({ ownerId, payload });
    return created(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

async function update(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;

    const payload = {
      title: req.body.title,
      model: req.body.model,
    };

    const conversation = await aiConversationService.update({ ownerId, conversationId, payload });
    return success(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

async function remove(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;

    const result = await aiConversationService.remove({ ownerId, conversationId });
    return success(res, result);
  } catch (e) {
    return next(e);
  }
}

async function rename(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await aiConversationService.rename({
      ownerId,
      conversationId,
      title: req.body.title,
    });

    return success(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

async function pin(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await aiConversationService.setConversationFlag({
      ownerId,
      conversationId,
      flag: 'pinned',
      value: req.body.value,
    });

    return success(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

async function favorite(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await aiConversationService.setConversationFlag({
      ownerId,
      conversationId,
      flag: 'favorite',
      value: req.body.value,
    });

    return success(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

async function archive(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await aiConversationService.setConversationFlag({
      ownerId,
      conversationId,
      flag: 'archived',
      value: req.body.value,
    });

    return success(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

async function restore(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await aiConversationService.setConversationFlag({
      ownerId,
      conversationId,
      flag: 'archived',
      value: false,
    });

    return success(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

async function duplicate(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await aiConversationService.duplicate({
      ownerId,
      conversationId,
      title: req.body.title,
    });

    return created(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

// Messages
async function addMessage(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;

    const message = {
      role: req.body.role,
      content: req.body.content,
    };

    const conversation = await aiConversationService.addMessage({
      ownerId,
      conversationId,
      message,
    });

    return created(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

async function updateMessage(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;
    const messageId = req.params.messageId;

    const conversation = await aiConversationService.updateMessage({
      ownerId,
      conversationId,
      messageId,
      content: req.body.content,
    });

    return success(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

async function deleteMessage(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const conversationId = req.params.id;
    const messageId = req.params.messageId;

    const conversation = await aiConversationService.deleteMessage({
      ownerId,
      conversationId,
      messageId,
    });

    return success(res, { conversation });
  } catch (e) {
    return next(e);
  }
}

async function stats(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const data = await aiConversationService.stats({ ownerId });
    return success(res, data);
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  rename,
  pin,
  favorite,
  archive,
  restore,
  duplicate,
  addMessage,
  updateMessage,
  deleteMessage,
  stats,
};

