const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const { AppError } = require('../utils/AppError');

const QUERY_TIMEOUT_MS = 15000;

function toOwnerId(ownerId) {
  if (!ownerId) return null;
  try {
    return new mongoose.Types.ObjectId(String(ownerId));
  } catch {
    return ownerId;
  }
}

async function getWorkspaceOrThrow({ ownerId, workspaceId }) {
  const workspace = await Workspace.findOne({
    owner: toOwnerId(ownerId),
    _id: workspaceId,
  }).maxTimeMS(QUERY_TIMEOUT_MS);

  if (!workspace) {
    throw new AppError('Workspace not found', { statusCode: 404, code: 'WORKSPACE_NOT_FOUND' });
  }
  return workspace;
}

function buildWorkspaceSort(sortBy, sortOrder) {
  const order = sortOrder === 'asc' ? 1 : -1;
  const allowed = new Set(['createdAt', 'updatedAt', 'name', 'category']);
  if (!allowed.has(sortBy)) return { createdAt: -1 };
  return { [sortBy]: order };
}

function buildWorkspaceSearchQuery(q) {
  if (!q) return {};
  const regex = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return {
    $or: [{ name: regex }, { description: regex }],
  };
}

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

async function listWorkspaces({
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
}) {
  if (!ownerId) {
    throw new AppError('Unauthorized', { statusCode: 401, code: 'UNAUTHORIZED' });
  }

  const skip = (page - 1) * limit;
  const owner = toOwnerId(ownerId);

  const query = {
    owner,
  };

  Object.assign(query, buildWorkspaceSearchQuery(q));

  if (category) query.category = category;
  if (typeof pinnedOnly === 'boolean') query.pinned = pinnedOnly;
  if (typeof favoriteOnly === 'boolean') query.favorite = favoriteOnly;
  if (typeof archivedOnly === 'boolean') query.archived = archivedOnly;

  const sort = buildWorkspaceSort(sortBy, sortOrder);

  const [total, items] = await Promise.all([
    Workspace.countDocuments(query).maxTimeMS(QUERY_TIMEOUT_MS).exec(),
    Workspace.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .maxTimeMS(QUERY_TIMEOUT_MS)
      .exec(),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function getWorkspace({ ownerId, workspaceId }) {
  const workspace = await getWorkspaceOrThrow({ ownerId, workspaceId });
  return workspace.toObject();
}

async function createWorkspace({ ownerId, payload }) {
  try {
    const workspace = await Workspace.create({ ...payload, owner: toOwnerId(ownerId) });
    return workspace.toObject();
  } catch (e) {
    if (e?.code === 11000) {
      throw new AppError('Workspace name already exists', {
        statusCode: 409,
        code: 'WORKSPACE_NAME_TAKEN',
      });
    }
    throw e;
  }
}

async function updateWorkspace({ ownerId, workspaceId, payload }) {
  const workspace = await getWorkspaceOrThrow({ ownerId, workspaceId });

  const update = stripUndefined({ ...payload });
  delete update.owner;

  Object.assign(workspace, update);
  await workspace.save();
  return workspace.toObject();
}

async function deleteWorkspace({ ownerId, workspaceId }) {
  const workspace = await getWorkspaceOrThrow({ ownerId, workspaceId });
  await Workspace.deleteOne({ _id: workspace._id });
  return { deleted: true, id: String(workspace._id) };
}

async function setFlag({ ownerId, workspaceId, flag, value }) {
  const workspace = await getWorkspaceOrThrow({ ownerId, workspaceId });
  workspace[flag] = Boolean(value);
  await workspace.save();
  return workspace.toObject();
}

async function pinWorkspace({ ownerId, workspaceId, value }) {
  return setFlag({ ownerId, workspaceId, flag: 'pinned', value });
}

async function favoriteWorkspace({ ownerId, workspaceId, value }) {
  return setFlag({ ownerId, workspaceId, flag: 'favorite', value });
}

async function archiveWorkspace({ ownerId, workspaceId, value }) {
  return setFlag({ ownerId, workspaceId, flag: 'archived', value });
}

async function restoreWorkspace({ ownerId, workspaceId }) {
  return archiveWorkspace({ ownerId, workspaceId, value: false });
}

async function openWorkspace({ ownerId, workspaceId }) {
  const workspace = await getWorkspaceOrThrow({ ownerId, workspaceId });
  workspace.archived = false;
  await workspace.save();
  return workspace.toObject();
}

async function stats({ ownerId }) {
  const owner = toOwnerId(ownerId);

  const [total, pinned, archived, favorites, categoriesAgg] = await Promise.all([
    Workspace.countDocuments({ owner }).maxTimeMS(QUERY_TIMEOUT_MS).exec(),
    Workspace.countDocuments({ owner, pinned: true }).maxTimeMS(QUERY_TIMEOUT_MS).exec(),
    Workspace.countDocuments({ owner, archived: true }).maxTimeMS(QUERY_TIMEOUT_MS).exec(),
    Workspace.countDocuments({ owner, favorite: true }).maxTimeMS(QUERY_TIMEOUT_MS).exec(),
    Workspace.aggregate([
      { $match: { owner } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]).option({ maxTimeMS: QUERY_TIMEOUT_MS }),
  ]);

  return {
    total,
    pinned,
    archived,
    favorites,
    categories: categoriesAgg,
  };
}

module.exports = {
  listWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  pinWorkspace,
  favoriteWorkspace,
  archiveWorkspace,
  restoreWorkspace,
  openWorkspace,
  stats,
};
