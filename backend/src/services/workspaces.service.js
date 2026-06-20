const Workspace = require('../models/Workspace');
const { AppError } = require('../utils/AppError');

function toObjectId(id) {
  // Let mongoose cast; we validate at route layer.
  return id;
}

async function getWorkspaceOrThrow({ ownerId, workspaceId }) {
  const workspace = await Workspace.findOne({ owner: ownerId, _id: toObjectId(workspaceId) });
  if (!workspace) throw new AppError('Workspace not found', { statusCode: 404, code: 'WORKSPACE_NOT_FOUND' });
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

async function listWorkspaces({ ownerId, page, limit, q, sortBy, sortOrder, category, pinnedOnly, favoriteOnly, archivedOnly }) {
  const skip = (page - 1) * limit;

  const query = {
    owner: ownerId,
  };

  Object.assign(query, buildWorkspaceSearchQuery(q));

  if (category) query.category = category;
  if (typeof pinnedOnly === 'boolean') query.pinned = pinnedOnly;
  if (typeof favoriteOnly === 'boolean') query.favorite = favoriteOnly;
  if (typeof archivedOnly === 'boolean') query.archived = archivedOnly;

  const sort = buildWorkspaceSort(sortBy, sortOrder);

  const [total, items] = await Promise.all([
    Workspace.countDocuments(query),
    Workspace.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
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
  // owner is always set from auth
  const workspace = await Workspace.create({ ...payload, owner: ownerId });
  return workspace.toObject();
}

async function updateWorkspace({ ownerId, workspaceId, payload }) {
  const workspace = await getWorkspaceOrThrow({ ownerId, workspaceId });

  // Immutable fields: owner and flags can still be changed via dedicated endpoints.
  // But PUT is full update; accept explicit fields excluding flags.
  const update = { ...payload };
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
  workspace[flag] = value;
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
  // Schema has no lastOpened; interpret open as un-archiving.
  const workspace = await getWorkspaceOrThrow({ ownerId, workspaceId });
  workspace.archived = false;
  await workspace.save();
  return workspace.toObject();
}

async function stats({ ownerId }) {
  const [total, pinned, archived, favorites, categoriesAgg] = await Promise.all([
    Workspace.countDocuments({ owner: ownerId }),
    Workspace.countDocuments({ owner: ownerId, pinned: true }),
    Workspace.countDocuments({ owner: ownerId, archived: true }),
    Workspace.countDocuments({ owner: ownerId, favorite: true }),
    Workspace.aggregate([
      { $match: { owner: ownerId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]),
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

