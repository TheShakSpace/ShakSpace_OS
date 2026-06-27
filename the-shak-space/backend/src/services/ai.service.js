const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { AppError } = require('../utils/AppError');
const { getProvider } = require('../providers');
const {
  serializeConversation,
  serializeMessage,
  estimateTokens,
  deriveTitle,
} = require('../utils/aiNormalize');

const QUERY_TIMEOUT_MS = 15000;

function toObjectId(id) {
  if (!id) return null;
  try {
    return new mongoose.Types.ObjectId(String(id));
  } catch {
    return null;
  }
}

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

async function getConversationOrThrow({ ownerId, conversationId }) {
  const conversation = await Conversation.findOne({
    _id: toObjectId(conversationId),
    owner: toObjectId(ownerId),
  })
    .lean()
    .maxTimeMS(QUERY_TIMEOUT_MS);

  if (!conversation) {
    throw new AppError('Conversation not found', {
      statusCode: 404,
      code: 'CONVERSATION_NOT_FOUND',
    });
  }

  return conversation;
}

async function listConversations({ ownerId, page = 1, limit = 50 }) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const skip = (safePage - 1) * safeLimit;
  const owner = toObjectId(ownerId);

  const [total, rows] = await Promise.all([
    Conversation.countDocuments({ owner }).maxTimeMS(QUERY_TIMEOUT_MS),
    Conversation.find({ owner })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean()
      .maxTimeMS(QUERY_TIMEOUT_MS),
  ]);

  return {
    items: rows.map(serializeConversation),
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

async function createConversation({ ownerId, payload }) {
  const provider = payload.provider || 'gemini';
  const model = payload.model || process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.0-flash';

  const created = await Conversation.create({
    owner: toObjectId(ownerId),
    title: payload.title?.trim() || 'New conversation',
    provider,
    model,
  });

  return serializeConversation(created.toObject());
}

async function updateConversation({ ownerId, conversationId, payload }) {
  const existing = await getConversationOrThrow({ ownerId, conversationId });

  const update = stripUndefined({
    title: payload.title !== undefined ? String(payload.title).trim() : undefined,
    provider: payload.provider,
    model: payload.model,
  });

  if (update.title !== undefined && !update.title) {
    throw new AppError('title cannot be empty', { statusCode: 400, code: 'VALIDATION_ERROR' });
  }

  await Conversation.updateOne({ _id: existing._id }, { $set: update });
  const updated = await Conversation.findById(existing._id).lean().maxTimeMS(QUERY_TIMEOUT_MS);
  return serializeConversation(updated);
}

async function deleteConversation({ ownerId, conversationId }) {
  const existing = await getConversationOrThrow({ ownerId, conversationId });

  await Promise.all([
    Message.deleteMany({ conversation: existing._id }),
    Conversation.deleteOne({ _id: existing._id }),
  ]);

  return { deleted: true, id: String(existing._id) };
}

async function listMessages({ ownerId, conversationId }) {
  await getConversationOrThrow({ ownerId, conversationId });

  const messages = await Message.find({ conversation: toObjectId(conversationId) })
    .sort({ createdAt: 1 })
    .lean()
    .maxTimeMS(QUERY_TIMEOUT_MS);

  return messages.map(serializeMessage);
}

async function chat({ ownerId, conversationId, message, provider, model }) {
  const content = String(message ?? '').trim();
  if (!content) {
    throw new AppError('message is required', { statusCode: 400, code: 'VALIDATION_ERROR' });
  }

  let conversation;
  if (conversationId) {
    conversation = await getConversationOrThrow({ ownerId, conversationId });
  } else {
    const created = await Conversation.create({
      owner: toObjectId(ownerId),
      title: deriveTitle(content),
      provider: provider || 'gemini',
      model: model || process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.0-flash',
    });
    conversation = created.toObject();
  }

  const userMessageDoc = await Message.create({
    conversation: conversation._id,
    owner: toObjectId(ownerId),
    role: 'user',
    content,
    tokenCount: estimateTokens(content),
    metadata: {},
  });

  const history = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .lean()
    .maxTimeMS(QUERY_TIMEOUT_MS);

  const activeProvider = provider || conversation.provider || 'gemini';
  const activeModel = model || conversation.model;
  const providerImpl = getProvider(activeProvider);

  const aiResult = await providerImpl.generateResponse({
    model: activeModel,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  const assistantMessageDoc = await Message.create({
    conversation: conversation._id,
    owner: toObjectId(ownerId),
    role: 'assistant',
    content: aiResult.content,
    tokenCount: aiResult.tokenCount ?? estimateTokens(aiResult.content),
    metadata: aiResult.metadata ?? {},
  });

  await Conversation.updateOne(
    { _id: conversation._id },
    {
      $set: stripUndefined({
        provider: activeProvider,
        model: activeModel,
        updatedAt: new Date(),
      }),
    }
  );

  const refreshed = await Conversation.findById(conversation._id).lean().maxTimeMS(QUERY_TIMEOUT_MS);

  return {
    conversation: serializeConversation(refreshed),
    userMessage: serializeMessage(userMessageDoc.toObject()),
    assistantMessage: serializeMessage(assistantMessageDoc.toObject()),
  };
}

module.exports = {
  listConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  listMessages,
  chat,
};
