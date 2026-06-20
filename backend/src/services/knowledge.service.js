const Knowledge = require('../models/Knowledge');
const Workspace = require('../models/Workspace');
const { AppError } = require('../utils/AppError');

function toObjectId(id) {
  return id;
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildTagSet(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

async function assertWorkspaceOwnership({ ownerId, workspaceId }) {
  const workspace = await Workspace.findOne({ owner: ownerId, _id: toObjectId(workspaceId) }).lean();
  if (!workspace) {
    throw new AppError('Workspace not found', { statusCode: 404, code: 'WORKSPACE_NOT_FOUND' });
  }
  return workspace;
}

async function knowledgeBelongsToUserOrThrow({ ownerId, knowledgeId }) {
  const knowledge = await Knowledge.findOne({ _id: toObjectId(knowledgeId) }).lean();
  if (!knowledge) throw new AppError('Knowledge not found', { statusCode: 404, code: 'KNOWLEDGE_NOT_FOUND' });

  // Ownership via workspace
  await assertWorkspaceOwnership({ ownerId, workspaceId: knowledge.workspace });
  return knowledge;
}

function buildSort({ sortBy, sortOrder }) {
  // sortBy defaults handled at controller; here we just map
  const order = sortOrder === 'asc' ? 1 : -1;
  switch (sortBy) {
    case 'oldest':
      return { createdAt: 1 };
    case 'lastEdited':
      return { lastEdited: order };
    case 'title':
      return { title: order };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

function buildKnowledgeSearchQuery(params) {
  const {
    search,
    title,
    content,
    summary,
    collection,
    tags,
  } = params;

  const qParts = [];

  const makeRegex = (v) => {
    const s = String(v).trim();
    if (!s) return null;
    return new RegExp(escapeRegExp(s), 'i');
  };

  if (search) {
    const rx = makeRegex(search);
    if (rx) {
      qParts.push({ title: rx });
      qParts.push({ content: rx });
      qParts.push({ summary: rx });
      qParts.push({ collection: rx });
      // tags handled separately for exact match
    }
  }
  if (title) {
    const rx = makeRegex(title);
    if (rx) qParts.push({ title: rx });
  }
  if (content) {
    const rx = makeRegex(content);
    if (rx) qParts.push({ content: rx });
  }
  if (summary) {
    const rx = makeRegex(summary);
    if (rx) qParts.push({ summary: rx });
  }

  if (collection) {
    const rx = makeRegex(collection);
    if (rx) qParts.push({ collection: rx });
  }

  const tagList = buildTagSet(tags);
  const tagMatch = tagList.length ? { tags: { $all: tagList } } : null;

  const base = qParts.length ? { $or: qParts } : {};
  if (tagMatch) {
    // If there is also other text search parts, we AND tag match with them.
    return base.$or ? { $and: [base, tagMatch] } : tagMatch;
  }

  return base;
}

function buildFilters({ ownerId, workspaceId, pinned, favorite, archived, collection, tags }) {
  const query = {};

  // Workspace ownership: restrict to user's workspaces
  query.workspace = { $in: [] }; // filled later
  // For performance: we will handle by using workspaces list from DB.

  if (typeof pinned === 'boolean') query.pinned = pinned;
  if (typeof favorite === 'boolean') query.favorite = favorite;
  if (typeof archived === 'boolean') query.archived = archived;
  if (collection) query.collection = collection;

  const tagList = buildTagSet(tags);
  if (tagList.length) query.tags = { $all: tagList };

  if (workspaceId) query.workspace = toObjectId(workspaceId);

  return query;
}

async function getUserWorkspaceIds(ownerId) {
  const ws = await Workspace.find({ owner: ownerId }, { _id: 1 }).lean();
  return ws.map((w) => w._id);
}

async function listKnowledge({ ownerId, page, limit, sortBy, sortOrder, filters, searchParams }) {
  const skip = (page - 1) * limit;

  const { pinned, favorite, archived, collection, workspaceId, tags } = filters;

  const userWorkspaceIds = workspaceId ? null : await getUserWorkspaceIds(ownerId);

  const query = {};
  if (workspaceId) {
    await assertWorkspaceOwnership({ ownerId, workspaceId });
    query.workspace = toObjectId(workspaceId);
  } else {
    query.workspace = { $in: userWorkspaceIds };
  }

  if (typeof pinned === 'boolean') query.pinned = pinned;
  if (typeof favorite === 'boolean') query.favorite = favorite;
  if (typeof archived === 'boolean') query.archived = archived;
  if (collection) query.collection = collection;

  const tagList = buildTagSet(tags);
  if (tagList.length) query.tags = { $all: tagList };

  const searchQuery = buildKnowledgeSearchQuery(searchParams);
  if (searchQuery && Object.keys(searchQuery).length) {
    // When searchQuery is a regex/or/and structure, merge with base via $and.
    Object.assign(query, { $and: [query, searchQuery] });
  }

  const sort = buildSort({ sortBy, sortOrder });

  const [total, items] = await Promise.all([
    Knowledge.countDocuments(query),
    Knowledge.find(query)
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

async function getById({ ownerId, knowledgeId }) {
  const knowledge = await knowledgeBelongsToUserOrThrow({ ownerId, knowledgeId });
  return knowledge;
}

async function create({ ownerId, payload }) {
  const workspaceId = payload.workspaceId;
  if (!workspaceId) {
    throw new AppError('workspaceId is required', { statusCode: 400, code: 'WORKSPACE_ID_REQUIRED' });
  }

  await assertWorkspaceOwnership({ ownerId, workspaceId });

  const created = await Knowledge.create({
    workspace: workspaceId,
    title: payload.title,
    content: payload.content ?? '',
    summary: payload.summary ?? '',
    tags: payload.tags ?? [],
    collection: payload.collection ?? 'default',
    favorite: payload.favorite ?? false,
    pinned: payload.pinned ?? false,
    archived: payload.archived ?? false,
    attachments: [],
  });

  return created.toObject();
}

async function update({ ownerId, knowledgeId, payload }) {
  const existing = await knowledgeBelongsToUserOrThrow({ ownerId, knowledgeId });

  // workspace is immutable for ownership checks; disallow workspace changes
  if (payload.workspaceId) {
    throw new AppError('workspaceId cannot be updated', { statusCode: 400, code: 'WORKSPACE_ID_IMMUTABLE' });
  }

  const update = {
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.content !== undefined ? { content: payload.content } : {}),
    ...(payload.summary !== undefined ? { summary: payload.summary } : {}),
    ...(payload.tags !== undefined ? { tags: payload.tags } : {}),
    ...(payload.collection !== undefined ? { collection: payload.collection } : {}),
    ...(payload.favorite !== undefined ? { favorite: payload.favorite } : {}),
    ...(payload.pinned !== undefined ? { pinned: payload.pinned } : {}),
    ...(payload.archived !== undefined ? { archived: payload.archived } : {}),
  };

  await Knowledge.updateOne({ _id: existing._id }, { $set: update });
  const updated = await Knowledge.findById(existing._id).lean();
  return updated;
}

async function remove({ ownerId, knowledgeId }) {
  const existing = await knowledgeBelongsToUserOrThrow({ ownerId, knowledgeId });
  await Knowledge.deleteOne({ _id: existing._id });
  return { deleted: true, id: String(existing._id) };
}

async function setFlag({ ownerId, knowledgeId, flag, value }) {
  const existing = await knowledgeBelongsToUserOrThrow({ ownerId, knowledgeId });
  await Knowledge.updateOne({ _id: existing._id }, { $set: { [flag]: value } });
  const updated = await Knowledge.findById(existing._id).lean();
  return updated;
}

async function getUniqueTags({ ownerId, workspaceId } = {}) {
  const wsQuery = workspaceId ? await Workspace.findOne({ owner: ownerId, _id: workspaceId }).lean() : null;
  if (workspaceId && !wsQuery) throw new AppError('Workspace not found', { statusCode: 404, code: 'WORKSPACE_NOT_FOUND' });

  const match = workspaceId ? { workspace: workspaceId } : { workspace: { $in: await getUserWorkspaceIds(ownerId) } };

  const tagsAgg = await Knowledge.aggregate([
    { $match: match },
    { $unwind: '$tags' },
    { $group: { _id: '$tags' } },
    { $project: { tag: '$_id', _id: 0 } },
  ]);

  return tagsAgg.map((t) => t.tag).sort();
}

async function getCollections({ ownerId } = {}) {
  const userWorkspaceIds = await getUserWorkspaceIds(ownerId);
  const collections = await Knowledge.aggregate([
    { $match: { workspace: { $in: userWorkspaceIds } } },
    { $group: { _id: '$collection' } },
    { $project: { name: '$_id', _id: 0 } },
  ]);
  return collections.map((c) => c.name).filter(Boolean).sort();
}

// Collections in this implementation are backed by the Knowledge.collection string.
// Creating a collection simply ensures at least one note exists? Spec asks CRUD.
// Since there is no separate Collection model, we implement CRUD by managing Knowledge.collection values.
async function createCollection({ ownerId, name }) {
  // If no notes exist for this collection yet, we can create a placeholder by creating an empty note.
  // But spec says use existing Knowledge model; still, creating empty notes would be bad.
  // Alternative: treat collection CRUD as rename of existing collections only.
  // For production correctness, we'll implement as: ensure name is not already used; return { name }.
  const existing = await getCollections({ ownerId });
  if (existing.includes(name)) throw new AppError('Collection already exists', { statusCode: 409, code: 'COLLECTION_EXISTS' });
  return { name };
}

async function updateCollection({ ownerId, collectionId, payload }) {
  // collectionId is the old collection name.
  const from = collectionId;
  const to = payload.name;

  if (!to) throw new AppError('name is required', { statusCode: 400, code: 'NAME_REQUIRED' });

  const userWorkspaceIds = await getUserWorkspaceIds(ownerId);

  const res = await Knowledge.updateMany(
    { workspace: { $in: userWorkspaceIds }, collection: from },
    { $set: { collection: to } }
  );

  return { from, to, updated: res.modifiedCount ?? res.nModified ?? 0 };
}

async function deleteCollection({ ownerId, collectionId }) {
  const userWorkspaceIds = await getUserWorkspaceIds(ownerId);

  const res = await Knowledge.updateMany(
    { workspace: { $in: userWorkspaceIds }, collection: collectionId },
    { $set: { collection: 'default' } }
  );

  return { deleted: true, from: collectionId, updated: res.modifiedCount ?? res.nModified ?? 0 };
}

async function stats({ ownerId, workspaceId } = {}) {
  const userWorkspaceIds = workspaceId ? [workspaceId] : await getUserWorkspaceIds(ownerId);
  if (workspaceId) await assertWorkspaceOwnership({ ownerId, workspaceId });

  const baseMatch = { workspace: { $in: userWorkspaceIds } };

  const [total, collectionsAgg, pinned, favorites, archived, tagsAgg, recent] = await Promise.all([
    Knowledge.countDocuments(baseMatch),
    Knowledge.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$collection', count: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]),
    Knowledge.countDocuments({ ...baseMatch, pinned: true }),
    Knowledge.countDocuments({ ...baseMatch, favorite: true }),
    Knowledge.countDocuments({ ...baseMatch, archived: true }),
    Knowledge.aggregate([
      { $match: baseMatch },
      { $unwind: '$tags' },
      { $group: { _id: '$tags' } },
      { $count: 'count' },
    ]),
    Knowledge.find(baseMatch).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const tagsCount = (tagsAgg[0] && tagsAgg[0].count) || 0;

  return {
    totalNotes: total,
    collections: collectionsAgg,
    pinned,
    favorites,
    archived,
    tagsCount,
    recentNotes: recent,
  };
}

module.exports = {
  listKnowledge,
  getById,
  create,
  update,
  remove,
  setFlag,
  getUniqueTags,
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  stats,
};

