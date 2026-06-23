const mongoose = require('mongoose');
const Knowledge = require('../models/Knowledge');
const Workspace = require('../models/Workspace');
const { AppError } = require('../utils/AppError');
const { computeContentMetrics } = require('../utils/knowledgeNormalize');

const QUERY_TIMEOUT_MS = 15000;

function toObjectId(id) {
  if (!id) return null;
  try {
    return new mongoose.Types.ObjectId(String(id));
  } catch {
    return null;
  }
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildTagList(tags) {
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
  const workspace = await Workspace.findOne({
    owner: toObjectId(ownerId),
    _id: toObjectId(workspaceId),
  })
    .lean()
    .maxTimeMS(QUERY_TIMEOUT_MS);

  if (!workspace) {
    throw new AppError('Workspace not found', { statusCode: 404, code: 'WORKSPACE_NOT_FOUND' });
  }
  return workspace;
}

async function getUserWorkspaceIds(ownerId) {
  const rows = await Workspace.find({ owner: toObjectId(ownerId) }, { _id: 1 })
    .lean()
    .maxTimeMS(QUERY_TIMEOUT_MS);
  return rows.map((w) => w._id);
}

async function knowledgeBelongsToUserOrThrow({ ownerId, knowledgeId }) {
  const knowledge = await Knowledge.findOne({ _id: toObjectId(knowledgeId) })
    .lean()
    .maxTimeMS(QUERY_TIMEOUT_MS);

  if (!knowledge) {
    throw new AppError('Knowledge not found', { statusCode: 404, code: 'KNOWLEDGE_NOT_FOUND' });
  }

  await assertWorkspaceOwnership({ ownerId, workspaceId: knowledge.workspace });
  return knowledge;
}

function buildSort({ sortBy, sortOrder }) {
  const order = sortOrder === 'asc' ? 1 : -1;
  switch (sortBy) {
    case 'oldest':
      return { createdAt: 1 };
    case 'lastEdited':
      return { lastEdited: order };
    case 'title':
      return { title: order };
    case 'recent':
      return { lastOpened: -1, lastEdited: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

function buildKnowledgeSearchQuery({ search, title, content, summary, tags }) {
  const orParts = [];

  const makeRegex = (v) => {
    const s = String(v).trim();
    if (!s) return null;
    return new RegExp(escapeRegExp(s), 'i');
  };

  if (search) {
    const rx = makeRegex(search);
    if (rx) {
      orParts.push({ title: rx }, { content: rx }, { summary: rx }, { tags: rx });
    }
  }

  if (title) {
    const rx = makeRegex(title);
    if (rx) orParts.push({ title: rx });
  }
  if (content) {
    const rx = makeRegex(content);
    if (rx) orParts.push({ content: rx });
  }
  if (summary) {
    const rx = makeRegex(summary);
    if (rx) orParts.push({ summary: rx });
  }

  const tagList = buildTagList(tags);
  if (tagList.length) {
    return { $and: [{ tags: { $all: tagList } }, orParts.length ? { $or: orParts } : {}].filter((p) => Object.keys(p).length) };
  }

  if (!orParts.length) return {};
  return { $or: orParts };
}

function buildBaseQuery({ ownerId, workspaceId, pinned, favorite, archived, category, tags }) {
  const query = { owner: toObjectId(ownerId) };

  if (workspaceId) {
    query.workspace = toObjectId(workspaceId);
  }

  if (typeof pinned === 'boolean') query.pinned = pinned;
  if (typeof favorite === 'boolean') query.favorite = favorite;
  if (typeof archived === 'boolean') query.archived = archived;
  if (category) query.category = category;

  const tagList = buildTagList(tags);
  if (tagList.length) query.tags = { $all: tagList };

  return query;
}

function mergeQuery(base, extra) {
  if (!extra || !Object.keys(extra).length) return base;
  return { $and: [base, extra] };
}

async function listKnowledge({
  ownerId,
  page,
  limit,
  sortBy,
  sortOrder,
  filters,
  searchParams,
}) {
  const { workspaceId, pinned, favorite, archived, category, tags } = filters;

  if (workspaceId) {
    await assertWorkspaceOwnership({ ownerId, workspaceId });
  } else {
    const workspaceIds = await getUserWorkspaceIds(ownerId);
    if (!workspaceIds.length) {
      return {
        items: [],
        pagination: { total: 0, page, limit, totalPages: 1 },
      };
    }
  }

  const base = buildBaseQuery({
    ownerId,
    workspaceId,
    pinned,
    favorite,
    archived,
    category,
    tags: workspaceId ? tags : tags,
  });

  if (!workspaceId) {
    const workspaceIds = await getUserWorkspaceIds(ownerId);
    base.workspace = { $in: workspaceIds };
  }

  const searchQuery = buildKnowledgeSearchQuery({ ...searchParams, tags: searchParams?.tags ?? tags });
  const query = mergeQuery(base, searchQuery);
  const sort = buildSort({ sortBy, sortOrder });
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    Knowledge.countDocuments(query).maxTimeMS(QUERY_TIMEOUT_MS).exec(),
    Knowledge.find(query)
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

async function getKnowledge({ ownerId, knowledgeId }) {
  return knowledgeBelongsToUserOrThrow({ ownerId, knowledgeId });
}

async function createKnowledge({ ownerId, payload }) {
  const workspaceId = payload.workspaceId;
  if (!workspaceId) {
    throw new AppError('workspaceId is required', { statusCode: 400, code: 'WORKSPACE_ID_REQUIRED' });
  }

  await assertWorkspaceOwnership({ ownerId, workspaceId });

  const metrics = computeContentMetrics(payload.content);
  const created = await Knowledge.create({
    owner: toObjectId(ownerId),
    workspace: toObjectId(workspaceId),
    title: payload.title,
    content: payload.content ?? '',
    summary: payload.summary ?? '',
    tags: payload.tags ?? [],
    category: payload.category ?? 'general',
    color: payload.color ?? '#8B5CF6',
    icon: payload.icon ?? '📝',
    favorite: Boolean(payload.favorite),
    pinned: Boolean(payload.pinned),
    archived: Boolean(payload.archived),
    wordCount: metrics.wordCount,
    readingTime: metrics.readingTime,
    lastEdited: new Date(),
  });

  return created.toObject();
}

async function updateKnowledge({ ownerId, knowledgeId, payload }) {
  const existing = await knowledgeBelongsToUserOrThrow({ ownerId, knowledgeId });

  if (payload.workspaceId) {
    throw new AppError('workspaceId cannot be updated', { statusCode: 400, code: 'WORKSPACE_ID_IMMUTABLE' });
  }

  const doc = await Knowledge.findById(existing._id);
  if (!doc) throw new AppError('Knowledge not found', { statusCode: 404, code: 'KNOWLEDGE_NOT_FOUND' });

  const fields = ['title', 'content', 'summary', 'tags', 'category', 'color', 'icon', 'favorite', 'pinned', 'archived'];
  for (const field of fields) {
    if (payload[field] !== undefined) doc[field] = payload[field];
  }

  if (payload.content !== undefined) {
    const metrics = computeContentMetrics(doc.content);
    doc.wordCount = metrics.wordCount;
    doc.readingTime = metrics.readingTime;
  }

  await doc.save();
  return doc.toObject();
}

async function deleteKnowledge({ ownerId, knowledgeId }) {
  const existing = await knowledgeBelongsToUserOrThrow({ ownerId, knowledgeId });
  await Knowledge.deleteOne({ _id: existing._id });
  return { deleted: true, id: String(existing._id) };
}

async function setFlag({ ownerId, knowledgeId, flag, value }) {
  const existing = await knowledgeBelongsToUserOrThrow({ ownerId, knowledgeId });
  const doc = await Knowledge.findById(existing._id);
  doc[flag] = Boolean(value);
  await doc.save();
  return doc.toObject();
}

async function openKnowledge({ ownerId, knowledgeId }) {
  const existing = await knowledgeBelongsToUserOrThrow({ ownerId, knowledgeId });
  const doc = await Knowledge.findById(existing._id);
  doc.archived = false;
  doc.lastOpened = new Date();
  await doc.save();
  return doc.toObject();
}

async function restoreKnowledge({ ownerId, knowledgeId }) {
  return setFlag({ ownerId, knowledgeId, flag: 'archived', value: false });
}

async function pinKnowledge(args) {
  return setFlag({ ...args, flag: 'pinned' });
}

async function favoriteKnowledge(args) {
  return setFlag({ ...args, flag: 'favorite' });
}

async function archiveKnowledge(args) {
  return setFlag({ ...args, flag: 'archived' });
}

async function getUniqueTags({ ownerId, workspaceId } = {}) {
  if (workspaceId) await assertWorkspaceOwnership({ ownerId, workspaceId });

  const match = workspaceId
    ? { owner: toObjectId(ownerId), workspace: toObjectId(workspaceId) }
    : { owner: toObjectId(ownerId), workspace: { $in: await getUserWorkspaceIds(ownerId) } };

  const tagsAgg = await Knowledge.aggregate([
    { $match: match },
    { $unwind: '$tags' },
    { $group: { _id: '$tags' } },
    { $project: { tag: '$_id', _id: 0 } },
    { $sort: { tag: 1 } },
  ]).option({ maxTimeMS: QUERY_TIMEOUT_MS });

  return tagsAgg.map((t) => t.tag);
}

async function stats({ ownerId, workspaceId } = {}) {
  if (workspaceId) await assertWorkspaceOwnership({ ownerId, workspaceId });

  const workspaceIds = workspaceId ? [toObjectId(workspaceId)] : await getUserWorkspaceIds(ownerId);
  const baseMatch = { owner: toObjectId(ownerId), workspace: { $in: workspaceIds } };

  const [total, pinned, favorites, archived, categoriesAgg, metricsAgg, recentEdited, recentOpened] =
    await Promise.all([
      Knowledge.countDocuments(baseMatch).maxTimeMS(QUERY_TIMEOUT_MS).exec(),
      Knowledge.countDocuments({ ...baseMatch, pinned: true }).maxTimeMS(QUERY_TIMEOUT_MS).exec(),
      Knowledge.countDocuments({ ...baseMatch, favorite: true }).maxTimeMS(QUERY_TIMEOUT_MS).exec(),
      Knowledge.countDocuments({ ...baseMatch, archived: true }).maxTimeMS(QUERY_TIMEOUT_MS).exec(),
      Knowledge.aggregate([
        { $match: baseMatch },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { _id: 0, category: '$_id', count: 1 } },
        { $sort: { count: -1 } },
      ]).option({ maxTimeMS: QUERY_TIMEOUT_MS }),
      Knowledge.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: null,
            wordCount: { $sum: '$wordCount' },
            readingTime: { $sum: '$readingTime' },
          },
        },
      ]).option({ maxTimeMS: QUERY_TIMEOUT_MS }),
      Knowledge.find(baseMatch).sort({ lastEdited: -1 }).limit(5).lean().maxTimeMS(QUERY_TIMEOUT_MS).exec(),
      Knowledge.find({ ...baseMatch, lastOpened: { $ne: null } })
        .sort({ lastOpened: -1 })
        .limit(5)
        .lean()
        .maxTimeMS(QUERY_TIMEOUT_MS)
        .exec(),
    ]);

  const metrics = metricsAgg[0] ?? { wordCount: 0, readingTime: 0 };

  return {
    total,
    pinned,
    favorites,
    archived,
    wordCount: metrics.wordCount ?? 0,
    readingTime: metrics.readingTime ?? 0,
    categories: categoriesAgg,
    recentEdited,
    recentOpened,
  };
}

module.exports = {
  listKnowledge,
  getKnowledge,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  pinKnowledge,
  favoriteKnowledge,
  archiveKnowledge,
  restoreKnowledge,
  openKnowledge,
  getUniqueTags,
  stats,
};
