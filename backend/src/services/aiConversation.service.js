const AIConversation = require('../models/AIConversation');
const Workspace = require('../models/Workspace');
const { AppError } = require('../utils/AppError');

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function assertWorkspaceOwnership({ ownerId, workspaceId }) {
  const workspace = await Workspace.findOne({ owner: ownerId, _id: workspaceId }).lean();
  if (!workspace) throw new AppError('Workspace not found', { statusCode: 404, code: 'WORKSPACE_NOT_FOUND' });
  return workspace;
}

async function conversationBelongsToUserOrThrow({ ownerId, conversationId }) {
  const conversation = await AIConversation.findById(conversationId).lean();
  if (!conversation) throw new AppError('Conversation not found', { statusCode: 404, code: 'CONVERSATION_NOT_FOUND' });

  await assertWorkspaceOwnership({ ownerId, workspaceId: conversation.workspace });
  return conversation;
}

function applyFlagDefaults(doc) {
  // Model has no flags, but task requires them.
  // We store flags in the document using dynamic fields when updating.
  return {
    ...doc,
    pinned: !!doc.pinned,
    favorite: !!doc.favorite,
    archived: !!doc.archived,
  };
}

function buildSort({ sortBy, sortOrder }) {
  const order = sortOrder === 'asc' ? 1 : -1;
  switch (sortBy) {
    case 'oldest':
      return { createdAt: 1 };
    case 'createdAt':
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

function buildSearchQuery({ title, messages, model }) {
  const or = [];
  if (title) {
    const rx = new RegExp(escapeRegExp(title.trim()), 'i');
    or.push({ title: rx });
  }
  if (messages) {
    const rx = new RegExp(escapeRegExp(messages.trim()), 'i');
    // messages is stored as array of subdocs; use $elemMatch content regex
    or.push({ messages: { $elemMatch: { content: rx } } });
  }
  if (model) {
    const rx = new RegExp(escapeRegExp(model.trim()), 'i');
    or.push({ model: rx });
  }
  if (!or.length) return {};
  return { $or: or };
}

async function list({ ownerId, page, limit, sortBy, sortOrder, filters, search }) {
  const skip = (page - 1) * limit;

  const match = {};

  if (filters.workspaceId) {
    await assertWorkspaceOwnership({ ownerId, workspaceId: filters.workspaceId });
    match.workspace = filters.workspaceId;
  } else {
    // Restrict to user's workspaces via aggregation-like approach: fetch workspace ids.
    const workspaces = await Workspace.find({ owner: ownerId }, { _id: 1 }).lean();
    const ids = workspaces.map((w) => w._id);
    match.workspace = { $in: ids };
  }

  if (typeof filters.pinned === 'boolean') match.pinned = filters.pinned;
  if (typeof filters.favorite === 'boolean') match.favorite = filters.favorite;
  if (typeof filters.archived === 'boolean') match.archived = filters.archived;

  const searchQuery = buildSearchQuery(search);
  Object.assign(match, searchQuery);

  const sort = buildSort({ sortBy, sortOrder });

  const [total, conversations] = await Promise.all([
    AIConversation.countDocuments(match),
    AIConversation.find(match).sort(sort).skip(skip).limit(limit).lean(),
  ]);

  return {
    conversations: conversations.map(applyFlagDefaults),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function getById({ ownerId, conversationId }) {
  const c = await conversationBelongsToUserOrThrow({ ownerId, conversationId });
  return applyFlagDefaults(c);
}

async function create({ ownerId, payload }) {
  await assertWorkspaceOwnership({ ownerId, workspaceId: payload.workspaceId });

  const created = await AIConversation.create({
    workspace: payload.workspaceId,
    user: ownerId,
    title: payload.title,
    model: payload.model || 'gpt-4o-mini',
    messages: [],
  });

  return applyFlagDefaults(created.toObject());
}

async function update({ ownerId, conversationId, payload }) {
  const existing = await conversationBelongsToUserOrThrow({ ownerId, conversationId });

  const update = {};
  if (payload.title !== undefined) update.title = payload.title;
  if (payload.model !== undefined) update.model = payload.model;

  await AIConversation.updateOne({ _id: existing._id }, { $set: update });
  const updated = await AIConversation.findById(existing._id).lean();
  return applyFlagDefaults(updated);
}

async function remove({ ownerId, conversationId }) {
  const existing = await conversationBelongsToUserOrThrow({ ownerId, conversationId });
  await AIConversation.deleteOne({ _id: existing._id });
  return { deleted: true, id: String(existing._id) };
}

async function setConversationFlag({ ownerId, conversationId, flag, value }) {
  const existing = await conversationBelongsToUserOrThrow({ ownerId, conversationId });
  await AIConversation.updateOne({ _id: existing._id }, { $set: { [flag]: value } });
  const updated = await AIConversation.findById(existing._id).lean();
  return applyFlagDefaults(updated);
}

async function rename({ ownerId, conversationId, title }) {
  return update({ ownerId, conversationId, payload: { title } });
}

async function addMessage({ ownerId, conversationId, message }) {
  const existing = await conversationBelongsToUserOrThrow({ ownerId, conversationId });

  const msg = {
    role: message.role || 'user',
    content: message.content,
  };

  existing.messages.push({ role: msg.role, content: msg.content });

  await AIConversation.updateOne({ _id: existing._id }, { $set: { messages: existing.messages } });
  const updated = await AIConversation.findById(existing._id).lean();
  return applyFlagDefaults(updated);
}

function findMessageIndexById(messages, messageId) {
  return messages.findIndex((m) => String(m._id) === String(messageId));
}

async function updateMessage({ ownerId, conversationId, messageId, content }) {
  const existing = await conversationBelongsToUserOrThrow({ ownerId, conversationId });

  const idx = findMessageIndexById(existing.messages, messageId);
  if (idx === -1) throw new AppError('Message not found', { statusCode: 404, code: 'MESSAGE_NOT_FOUND' });

  existing.messages[idx].content = content;

  await AIConversation.updateOne({ _id: existing._id }, { $set: { messages: existing.messages } });
  const updated = await AIConversation.findById(existing._id).lean();
  return applyFlagDefaults(updated);
}

async function deleteMessage({ ownerId, conversationId, messageId }) {
  const existing = await conversationBelongsToUserOrThrow({ ownerId, conversationId });

  const idx = findMessageIndexById(existing.messages, messageId);
  if (idx === -1) throw new AppError('Message not found', { statusCode: 404, code: 'MESSAGE_NOT_FOUND' });

  existing.messages.splice(idx, 1);

  await AIConversation.updateOne({ _id: existing._id }, { $set: { messages: existing.messages } });
  const updated = await AIConversation.findById(existing._id).lean();
  return applyFlagDefaults(updated);
}

async function duplicate({ ownerId, conversationId, title }) {
  const existing = await conversationBelongsToUserOrThrow({ ownerId, conversationId });

  const copy = await AIConversation.create({
    workspace: existing.workspace,
    user: ownerId,
    title: title || `${existing.title} (Copy)`,
    model: existing.model,
    messages: existing.messages,
    pinned: false,
    favorite: false,
    archived: false,
  });

  return applyFlagDefaults(copy.toObject());
}

async function stats({ ownerId }) {
  const workspaces = await Workspace.find({ owner: ownerId }, { _id: 1 }).lean();
  const ids = workspaces.map((w) => w._id);

  const [totalConversations, pinned, favorites, archived, mostUsedModelAgg, recentConversations] = await Promise.all([
    AIConversation.countDocuments({ workspace: { $in: ids } }),
    AIConversation.countDocuments({ workspace: { $in: ids }, pinned: true }),
    AIConversation.countDocuments({ workspace: { $in: ids }, favorite: true }),
    AIConversation.countDocuments({ workspace: { $in: ids }, archived: true }),
    AIConversation.aggregate([
      { $match: { workspace: { $in: ids } } },
      { $group: { _id: '$model', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      { $project: { _id: 0, model: '$_id', count: 1 } },
    ]),
    AIConversation.find({ workspace: { $in: ids } }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const messagesAgg = await AIConversation.aggregate([
    { $match: { workspace: { $in: ids } } },
    { $project: { count: { $size: '$messages' } } },
    { $group: { _id: null, totalMessages: { $sum: '$count' } } },
    { $project: { _id: 0, totalMessages: 1 } },
  ]);

  const totalMessages = messagesAgg[0]?.totalMessages || 0;
  const mostUsedModel = mostUsedModelAgg[0]?.model || null;

  return {
    totalConversations,
    totalMessages,
    favoriteConversations: favorites,
    pinnedConversations: pinned,
    archivedConversations: archived,
    mostUsedModel,
    recentConversations: recentConversations.map(applyFlagDefaults),
  };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  setConversationFlag,
  rename,
  addMessage,
  updateMessage,
  deleteMessage,
  duplicate,
  stats,
};

