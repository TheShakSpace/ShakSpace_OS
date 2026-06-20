const { body, param, query } = require('express-validator');

const objectIdParam = param('id').isMongoId().withMessage('Invalid id');
const messageIdParam = param('messageId').isMongoId().withMessage('Invalid messageId');

const pagination = [
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('limit must be between 1 and 100'),
];

const sort = [
  query('sortBy')
    .optional()
    .isString()
    .isIn(['newest', 'oldest', 'createdAt', 'model'])
    .withMessage('Invalid sortBy'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sortOrder'),
];

const boolFilters = [
  query('pinned').optional().isBoolean().toBoolean(),
  query('favorite').optional().isBoolean().toBoolean(),
  query('archived').optional().isBoolean().toBoolean(),
];

// Note: AIConversation schema does not have pinned/favorite/archived fields, but the task requires them.
// We'll store these flags using dedicated fields when model supports it; validation allows it either way.
const createPayload = [
  body('workspaceId').isMongoId().withMessage('workspaceId must be valid mongo id'),
  body('title').isString().isLength({ min: 1, max: 200 }).withMessage('title must be 1-200 chars'),
  body('model').optional().isString().isLength({ max: 80 }).withMessage('model must be <= 80 chars'),
  body('messages').optional().isArray().withMessage('messages must be an array'),
];

const updatePayload = [
  body('title').optional().isString().isLength({ min: 1, max: 200 }).withMessage('title must be 1-200 chars'),
  body('model').optional().isString().isLength({ max: 80 }).withMessage('model must be <= 80 chars'),
];

const messageCreatePayload = [
  body('message')
    .isString()
    .isLength({ min: 1, max: 20000 })
    .withMessage('message must be 1-20000 chars'),
  body('role').optional().isIn(['user', 'assistant']).withMessage('role must be user or assistant'),
];

const messageUpdatePayload = [
  body('content')
    .isString()
    .isLength({ min: 1, max: 20000 })
    .withMessage('content must be 1-20000 chars'),
];

const renamePayload = [
  body('title').isString().isLength({ min: 1, max: 200 }).withMessage('title must be 1-200 chars'),
];

const pinFavoriteArchivePayload = [
  body('value')
    .exists()
    .isBoolean()
    .toBoolean()
    .withMessage('value must be boolean'),
];

const duplicatePayload = [
  body('title').optional().isString().isLength({ min: 1, max: 200 }).withMessage('title must be 1-200 chars'),
];

const searchQuery = [
  query('title').optional().isString().isLength({ min: 1, max: 200 }),
  query('messages').optional().isString().isLength({ min: 1, max: 200 }),
  query('workspaceId').optional().isMongoId(),
  query('model').optional().isString().isLength({ max: 80 }),
];

module.exports = {
  objectIdParam,
  messageIdParam,
  pagination,
  sort,
  boolFilters,
  createPayload,
  updatePayload,
  messageCreatePayload,
  messageUpdatePayload,
  renamePayload,
  pinFavoriteArchivePayload,
  duplicatePayload,
  searchQuery,
};

