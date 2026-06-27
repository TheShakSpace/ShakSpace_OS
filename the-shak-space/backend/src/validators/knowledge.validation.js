const { body, param, query } = require('express-validator');
const {
  normalizeKnowledgeQueryCategory,
  normalizeKnowledgeCategory,
  normalizeTags,
} = require('../utils/knowledgeNormalize');

const knowledgeId = param('id')
  .isString()
  .bail()
  .notEmpty()
  .bail()
  .isMongoId()
  .withMessage('id must be a valid ObjectId');

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('limit must be between 1 and 100'),
];

const sortQuery = [
  query('sortBy')
    .optional()
    .isIn(['newest', 'oldest', 'lastEdited', 'title', 'recent'])
    .withMessage('Invalid sortBy'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sortOrder'),
];

const boolFilters = [
  query('pinned').optional().isBoolean().withMessage('pinned must be boolean').toBoolean(),
  query('favorite').optional().isBoolean().withMessage('favorite must be boolean').toBoolean(),
  query('archived').optional().isBoolean().withMessage('archived must be boolean').toBoolean(),
];

const workspaceFilter = [
  query('workspaceId').optional().isMongoId().withMessage('Invalid workspaceId'),
];

const categoryFilter = [
  query('category')
    .optional()
    .customSanitizer(normalizeKnowledgeQueryCategory)
    .isIn(['general', 'personal', 'team', 'education', 'business', 'research']),
];

const tagsFilter = [
  query('tags')
    .optional()
    .custom((v) => typeof v === 'string' || Array.isArray(v))
    .withMessage('tags must be a comma-separated string or array'),
];

const searchQuery = [
  query('search').optional().isString().isLength({ min: 1, max: 500 }).withMessage('search must be 1-500 chars'),
  query('q').optional().isString().isLength({ min: 1, max: 500 }).withMessage('q must be 1-500 chars'),
];

const title = body('title')
  .isString()
  .bail()
  .trim()
  .notEmpty()
  .withMessage('title is required')
  .bail()
  .isLength({ min: 1, max: 200 })
  .withMessage('title must be between 1 and 200 characters');

const content = body('content').optional().isString().withMessage('content must be a string');

const summary = body('summary')
  .optional()
  .isString()
  .bail()
  .trim()
  .isLength({ max: 800 })
  .withMessage('summary must be at most 800 characters');

const workspaceIdBody = body('workspaceId')
  .exists()
  .withMessage('workspaceId is required')
  .bail()
  .isMongoId()
  .withMessage('workspaceId must be a valid ObjectId');

const workspaceIdOptional = body('workspaceId').optional().isMongoId().withMessage('workspaceId must be valid');

const categoryBody = body('category')
  .optional()
  .isString()
  .bail()
  .customSanitizer(normalizeKnowledgeCategory)
  .isIn(['general', 'personal', 'team', 'education', 'business', 'research'])
  .withMessage('Invalid category');

const colorBody = body('color')
  .optional()
  .isString()
  .bail()
  .matches(/^#([0-9a-fA-F]{3}){1,2}$/)
  .withMessage('color must be a valid hex color');

const iconBody = body('icon')
  .optional()
  .isString()
  .bail()
  .trim()
  .isLength({ max: 64 })
  .withMessage('icon must be at most 64 characters');

const tagsBody = body('tags')
  .optional()
  .customSanitizer(normalizeTags)
  .isArray()
  .withMessage('tags must be an array')
  .custom((arr) => arr.every((t) => typeof t === 'string' && t.length <= 40))
  .withMessage('each tag must be a string with max length 40');

const flagBody = body('value')
  .exists()
  .withMessage('value is required')
  .isBoolean()
  .withMessage('value must be boolean')
  .toBoolean();

function knowledgeList() {
  return [
    ...paginationQuery,
    ...sortQuery,
    ...boolFilters,
    ...workspaceFilter,
    ...categoryFilter,
    ...tagsFilter,
    ...searchQuery,
  ];
}

function knowledgeCreate() {
  return [workspaceIdBody, title, content, summary, categoryBody, colorBody, iconBody, tagsBody];
}

const titleOptional = body('title')
  .optional()
  .isString()
  .bail()
  .trim()
  .notEmpty()
  .withMessage('title cannot be empty')
  .bail()
  .isLength({ min: 1, max: 200 })
  .withMessage('title must be between 1 and 200 characters');

function knowledgeUpdate() {
  return [titleOptional, content, summary, categoryBody, colorBody, iconBody, tagsBody, workspaceIdOptional];
}

function knowledgePin() {
  return [knowledgeId, flagBody];
}

function knowledgeFavorite() {
  return [knowledgeId, flagBody];
}

function knowledgeArchive() {
  return [knowledgeId, flagBody];
}

function knowledgeRestore() {
  return [knowledgeId];
}

function knowledgeOpen() {
  return [knowledgeId];
}

function knowledgeDelete() {
  return [knowledgeId];
}

function knowledgeGet() {
  return [knowledgeId];
}

function knowledgeStats() {
  return [...workspaceFilter];
}

function knowledgeTags() {
  return [...workspaceFilter];
}

module.exports = {
  knowledgeList,
  knowledgeGet,
  knowledgeCreate,
  knowledgeUpdate,
  knowledgeDelete,
  knowledgePin,
  knowledgeFavorite,
  knowledgeArchive,
  knowledgeRestore,
  knowledgeOpen,
  knowledgeStats,
  knowledgeTags,
};
