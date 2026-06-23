const { body, param } = require('express-validator');

const conversationIdParam = param('id')
  .isString()
  .bail()
  .notEmpty()
  .bail()
  .isMongoId()
  .withMessage('id must be a valid ObjectId');

const messagesConversationIdParam = param('conversationId')
  .isString()
  .bail()
  .notEmpty()
  .bail()
  .isMongoId()
  .withMessage('conversationId must be a valid ObjectId');

const titleBody = body('title')
  .optional()
  .isString()
  .bail()
  .trim()
  .notEmpty()
  .withMessage('title cannot be empty')
  .bail()
  .isLength({ max: 200 })
  .withMessage('title must be at most 200 characters');

const createTitleBody = body('title')
  .optional()
  .isString()
  .bail()
  .trim()
  .isLength({ max: 200 })
  .withMessage('title must be at most 200 characters');

const providerBody = body('provider')
  .optional()
  .isString()
  .bail()
  .trim()
  .isIn(['gemini', 'ollama', 'openai'])
  .withMessage('provider must be gemini, ollama, or openai');

const modelBody = body('model')
  .optional()
  .isString()
  .bail()
  .trim()
  .isLength({ min: 1, max: 80 })
  .withMessage('model must be between 1 and 80 characters');

const conversationIdBody = body('conversationId')
  .optional()
  .isMongoId()
  .withMessage('conversationId must be a valid ObjectId');

const messageBody = body('message')
  .isString()
  .bail()
  .trim()
  .notEmpty()
  .withMessage('message is required')
  .bail()
  .isLength({ max: 20000 })
  .withMessage('message must be at most 20000 characters');

function conversationCreate() {
  return [createTitleBody, providerBody, modelBody];
}

function conversationUpdate() {
  return [conversationIdParam, titleBody, providerBody, modelBody];
}

function conversationDelete() {
  return [conversationIdParam];
}

function conversationList() {
  return [];
}

function messagesList() {
  return [messagesConversationIdParam];
}

function chatPayload() {
  return [conversationIdBody, messageBody, providerBody, modelBody];
}

module.exports = {
  conversationCreate,
  conversationUpdate,
  conversationDelete,
  conversationList,
  messagesList,
  chatPayload,
};
