const { success, created } = require('../utils/response');
const { validateRequest } = require('../validators/validate');
const workspacesService = require('../services/workspaces.service');

function parseBoolean(val) {
  if (val === undefined) return undefined;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    if (val.toLowerCase() === 'true') return true;
    if (val.toLowerCase() === 'false') return false;
  }
  return undefined;
}

async function list(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;

    const page = Math.max(1, Number(req.query.page || 1));
    const limitRaw = Number(req.query.limit || 20);
    const limit = Math.min(Math.max(1, limitRaw), 100);

    const q = req.query.q ? String(req.query.q) : undefined;

    const sortBy = req.query.sortBy ? String(req.query.sortBy) : 'createdAt';
    const sortOrder = req.query.sortOrder ? String(req.query.sortOrder) : 'desc';

    const category = req.query.category ? String(req.query.category) : undefined;

    const pinnedOnly = parseBoolean(req.query.pinnedOnly);
    const favoriteOnly = parseBoolean(req.query.favoriteOnly);
    const archivedOnly = parseBoolean(req.query.archivedOnly);

    const result = await workspacesService.listWorkspaces({
      ownerId,
      page,
      limit,
      q,
      sortBy,
      sortOrder,
      category,
      pinnedOnly,
      favoriteOnly,
      archivedOnly,
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
    const workspaceId = req.params.workspaceId;

    const workspace = await workspacesService.getWorkspace({ ownerId, workspaceId });
    return success(res, { workspace });
  } catch (e) {
    return next(e);
  }
}

async function create(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;

    const payload = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      color: req.body.color,
      icon: req.body.icon,
    };

    const workspace = await workspacesService.createWorkspace({ ownerId, payload });
    return created(res, { workspace });
  } catch (e) {
    return next(e);
  }
}

async function update(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const workspaceId = req.params.workspaceId;

    const payload = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      color: req.body.color,
      icon: req.body.icon,
    };

    const workspace = await workspacesService.updateWorkspace({ ownerId, workspaceId, payload });
    return success(res, { workspace });
  } catch (e) {
    return next(e);
  }
}

async function remove(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const workspaceId = req.params.workspaceId;

    const result = await workspacesService.deleteWorkspace({ ownerId, workspaceId });
    return success(res, result);
  } catch (e) {
    return next(e);
  }
}

async function pin(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const workspaceId = req.params.workspaceId;
    const value = parseBoolean(req.body.value);

    const workspace = await workspacesService.pinWorkspace({ ownerId, workspaceId, value });
    return success(res, { workspace });
  } catch (e) {
    return next(e);
  }
}

async function favorite(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const workspaceId = req.params.workspaceId;
    const value = parseBoolean(req.body.value);

    const workspace = await workspacesService.favoriteWorkspace({ ownerId, workspaceId, value });
    return success(res, { workspace });
  } catch (e) {
    return next(e);
  }
}

async function archive(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const workspaceId = req.params.workspaceId;
    const value = parseBoolean(req.body.value);

    const workspace = await workspacesService.archiveWorkspace({ ownerId, workspaceId, value });
    return success(res, { workspace });
  } catch (e) {
    return next(e);
  }
}

async function restore(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const workspaceId = req.params.workspaceId;

    const workspace = await workspacesService.restoreWorkspace({ ownerId, workspaceId });
    return success(res, { workspace });
  } catch (e) {
    return next(e);
  }
}

async function open(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;
    const workspaceId = req.params.workspaceId;

    const workspace = await workspacesService.openWorkspace({ ownerId, workspaceId });
    return success(res, { workspace });
  } catch (e) {
    return next(e);
  }
}

async function stats(req, res, next) {
  try {
    validateRequest(req);
    const ownerId = req.user.id;

    const data = await workspacesService.stats({ ownerId });
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
  stats,
};

