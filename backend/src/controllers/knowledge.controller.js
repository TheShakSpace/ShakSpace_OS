const { success, created } = require('../utils/response');
const { validateRequest } = require('../validators/validate');
const knowledgeService = require('../services/knowledge.service');

function normalizeTags(qTags) {
  if (qTags === undefined) return undefined;
  return qTags;
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
      collection: req.query.collection,
      tags: normalizeTags(req.query.tags),
    };

    const searchParams = {
      search: req.query.search,
      title: req.query.title,
      content: req.query.content,
      summary: req.query.summary,
      tags: normalizeTags(req.query.tags),
      collection: req.query.collection,
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
    const knowledgeId = req.params.id;

    const item = await knowledgeService.getById({ ownerId, knowledgeId });
    return success(res, { item });
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
      content: req.body.content,
      summary: req.body.summary,
      tags: req.body.tags,
      collection: req.body.collection,
      favorite: req.body.favorite,
      pinned: req.body.pinned,
      archived: req.body.archived,
    };

    const item = await knowledgeService.create({ ownerId, payload });
    return created(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function update(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;

    const knowledgeId = req.params.id;
    const payload = {
      title: req.body.title,
      content: req.body.content,
      summary: req.body.summary,
      tags: req.body.tags,
      collection: req.body.collection,
      favorite: req.body.favorite,
      pinned: req.body.pinned,
      archived: req.body.archived,
    };

    const item = await knowledgeService.update({ ownerId, knowledgeId, payload });
    return success(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function remove(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const knowledgeId = req.params.id;

    const result = await knowledgeService.remove({ ownerId, knowledgeId });
    return success(res, result);
  } catch (e) {
    return next(e);
  }
}

async function pin(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const knowledgeId = req.params.id;
    const value = req.body.value;

    const item = await knowledgeService.setFlag({ ownerId, knowledgeId, flag: 'pinned', value });
    return success(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function favorite(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const knowledgeId = req.params.id;
    const value = req.body.value;

    const item = await knowledgeService.setFlag({ ownerId, knowledgeId, flag: 'favorite', value });
    return success(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function archive(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const knowledgeId = req.params.id;
    const value = req.body.value;

    const item = await knowledgeService.setFlag({ ownerId, knowledgeId, flag: 'archived', value });
    return success(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function restore(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const knowledgeId = req.params.id;

    const item = await knowledgeService.setFlag({ ownerId, knowledgeId, flag: 'archived', value: false });
    return success(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function open(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const knowledgeId = req.params.id;

    const item = await knowledgeService.setFlag({ ownerId, knowledgeId, flag: 'archived', value: false });
    return success(res, { item });
  } catch (e) {
    return next(e);
  }
}

async function tags(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const tagsList = await knowledgeService.getUniqueTags({ ownerId, workspaceId: req.query.workspaceId });
    return success(res, { tags: tagsList });
  } catch (e) {
    return next(e);
  }
}

async function collectionsList(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const collections = await knowledgeService.getCollections({ ownerId });
    return success(res, { collections });
  } catch (e) {
    return next(e);
  }
}

async function collectionsCreate(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const item = await knowledgeService.createCollection({ ownerId, name: req.body.name });
    return created(res, { collection: item });
  } catch (e) {
    return next(e);
  }
}

async function collectionsUpdate(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const from = req.params.id;
    const item = await knowledgeService.updateCollection({ ownerId, collectionId: from, payload: { name: req.body.name } });
    return success(res, { collection: item });
  } catch (e) {
    return next(e);
  }
}

async function collectionsDelete(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const from = req.params.id;
    const item = await knowledgeService.deleteCollection({ ownerId, collectionId: from });
    return success(res, { collection: item });
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
  collectionsList,
  collectionsCreate,
  collectionsUpdate,
  collectionsDelete,
  stats,
};

