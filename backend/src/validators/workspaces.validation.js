const { body, param, query } = require('express-validator');
const {
  normalizeWorkspaceQueryCategory,
  normalizeWorkspaceCategory,
} = require('../utils/workspaceNormalize');

const workspaceId = param('workspaceId')
  .isString()
  .bail()
  .notEmpty()
  .bail()
  .isMongoId()
  .withMessage('workspaceId must be a valid ObjectId');

const name = body('name')
  .isString()
  .bail()
  .trim()
  .notEmpty()
  .withMessage('name is required')
  .bail()
  .isLength({ min: 1, max: 120 })
  .withMessage('name must be between 1 and 120 characters');

const description = body('description')
  .optional()
  .isString()
  .bail()
  .trim()
  .isLength({ max: 2000 })
  .withMessage('description must be at most 2000 characters');

const category = body('category')
  .optional()
  .isString()
  .bail()
  .customSanitizer(normalizeWorkspaceCategory)
  .isIn(['general', 'personal', 'team', 'education', 'business', 'research'])
  .withMessage('Invalid category');

const color = body('color')
  .optional()
  .isString()
  .bail()
  .matches(/^#([0-9a-fA-F]{3}){1,2}$/)
  .withMessage('color must be a valid hex color');

const icon = body('icon')
  .optional()
  .isString()
  .bail()
  .trim()
  .isLength({ max: 64 })
  .withMessage('icon must be at most 64 characters');

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('q').optional().isString(),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'name', 'category']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('category')
    .optional()
    .customSanitizer(normalizeWorkspaceQueryCategory)
    .isIn(['general', 'personal', 'team', 'education', 'business', 'research']),
  query('pinnedOnly').optional().isBoolean().withMessage('pinnedOnly must be boolean').toBoolean(),
  query('favoriteOnly').optional().isBoolean().withMessage('favoriteOnly must be boolean').toBoolean(),
  query('archivedOnly').optional().isBoolean().withMessage('archivedOnly must be boolean').toBoolean(),
];

const pinValue = body('value')
  .exists()
  .withMessage('value is required')
  .isBoolean()
  .withMessage('value must be boolean')
  .toBoolean();

function workspaceCreate() {
  return [name, description, category, color, icon];
}

function workspaceUpdate() {
  return [name, description, category, color, icon];
}

function workspacePin() {
  return [workspaceId, pinValue];
}

function workspaceFavorite() {
  return [workspaceId, pinValue];
}

function workspaceArchive() {
  return [workspaceId, pinValue];
}

function workspaceRestore() {
  return [workspaceId];
}

function workspaceOpen() {
  return [workspaceId];
}

function workspaceDelete() {
  return [workspaceId];
}

function workspaceGet() {
  return [workspaceId];
}

function workspaceList() {
  return paginationQuery;
}

function workspaceStats() {
  return [];
}

module.exports = {
  workspaceList,
  workspaceGet,
  workspaceCreate,
  workspaceUpdate,
  workspaceDelete,
  workspacePin,
  workspaceFavorite,
  workspaceArchive,
  workspaceRestore,
  workspaceOpen,
  workspaceStats,
};
