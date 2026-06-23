function serializeConversation(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    owner: String(doc.owner),
    title: doc.title,
    provider: doc.provider,
    model: doc.model,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function serializeMessage(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    conversationId: String(doc.conversation),
    owner: String(doc.owner),
    role: doc.role,
    content: doc.content,
    tokenCount: doc.tokenCount ?? 0,
    metadata: doc.metadata ?? {},
    createdAt: doc.createdAt,
  };
}

function estimateTokens(text) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(String(text).length / 4));
}

function deriveTitle(message) {
  const trimmed = String(message ?? '').trim();
  if (!trimmed) return 'New conversation';
  return trimmed.length > 50 ? `${trimmed.slice(0, 50)}…` : trimmed;
}

module.exports = {
  serializeConversation,
  serializeMessage,
  estimateTokens,
  deriveTitle,
};
