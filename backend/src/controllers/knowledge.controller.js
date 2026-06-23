const { success, created } = require('../utils/response');
const { validateRequest } = require('../validators/validate');
const knowledgeService = require('../services/knowledge.service');
const { normalizeKnowledgeQueryCategory } = require('../utils/knowledgeNormalize');

function parseBoolean(val) {
  if (val === undefined) return undefined;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    if (val.toLowerCase() === 'true') return true;
    if (val.toLowerCase() === 'false') return false;
  }
  return undefined;
}

function buildPayload(body) {
  const payload = {};
  if (body.title !== undefined) payload.title = body.title;
  if (body.content !== undefined) payload.content = body.content;
  if (body.summary !== undefined) payload.summary = body.summary;
  if (body.tags !== undefined) payload.tags = body.tags;
  if (body.category !== undefined) payload.category = body.category;
  if (body.color !== undefined) payload.color = body.color;
  if (body.icon !== undefined) payload.icon = body.icon;
  if (body.workspaceId !== undefined) payload.workspaceId = body.workspaceId;
  if (body.favorite !== undefined) payload.favorite = body.favorite;
  if (body.pinned !== undefined) payload.pinned = body.pinned;
  if (body.archived !== undefined) payload.archived = body.archived;
  return payload;
}

async function list(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;

    const page = Math.max(1, Number(req.query.page || 1));
    const limitRaw = Number(req.query.limit || 20);
    const limit = Math.min(Math.max(1, limitRaw), 100);

    const sortBy = req.query.sortBy ? String(req.query.sortBy) : 'newest';
    const sortOrder = req.query.sortOrder ? String(req.query.sortOrder) : 'desc';

    const filters = {
      workspaceId: req.query.workspaceId,
      pinned: parseBoolean(req.query.pinned),
      favorite: parseBoolean(req.query.favorite),
      archived: parseBoolean(req.query.archived),
      category: req.query.category ? normalizeKnowledgeQueryCategory(req.query.category) : undefined,
      tags: req.query.tags,
    };

    const searchParams = {
      search: req.query.search || req.query.q,
      tags: req.query.tags,
    };

    const result = await knowledgeService.listKnowledge({
      ownerId,
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
      searchParams,
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
    const item = await knowledgeService.getKnowledge({ ownerId, knowledgeId: req.params.id });
    return success(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function create(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const payload = buildPayload(req.body);
    const item = await knowledgeService.createKnowledge({ ownerId, payload });
    return created(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function update(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const payload = buildPayload(req.body);
    const item = await knowledgeService.updateKnowledge({
      ownerId,
      knowledgeId: req.params.id,
      payload,
    });
    return success(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function remove(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const result = await knowledgeService.deleteKnowledge({
      ownerId,
      knowledgeId: req.params.id,
    });
    return success(res, result);
  } catch (e) {
    return next(e);
  }
}

async function pin(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const value = parseBoolean(req.body.value);
    const item = await knowledgeService.pinKnowledge({
      ownerId,
      knowledgeId: req.params.id,
      value,
    });
    return success(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function favorite(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const value = parseBoolean(req.body.value);
    const item = await knowledgeService.favoriteKnowledge({
      ownerId,
      knowledgeId: req.params.id,
      value,
    });
    return success(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function archive(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const value = parseBoolean(req.body.value);
    const item = await knowledgeService.archiveKnowledge({
      ownerId,
      knowledgeId: req.params.id,
      value,
    });
    return success(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function restore(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const item = await knowledgeService.restoreKnowledge({
      ownerId,
      knowledgeId: req.params.id,
    });
    return success(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function open(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const item = await knowledgeService.openKnowledge({
      ownerId,
      knowledgeId: req.params.id,
    });
    return success(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function tags(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const tagsList = await knowledgeService.getUniqueTags({
      ownerId,
      workspaceId: req.query.workspaceId,
    });
    return success(res, { tags: tagsList });
  } catch (e) {
    return next(e);
  }
}

async function stats(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const data = await knowledgeService.stats({ ownerId, workspaceId: req.query.workspaceId });
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
  pin,
  favorite,
  archive,
  restore,
  open,
  tags,
  stats,
};
