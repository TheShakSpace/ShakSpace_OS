const { body, param, query } = require('express-validator');

const automationId = param('automationId')
  .isString()
  .bail()
  .notEmpty()
  .withMessage('automationId is required')
  .isMongoId()
  .withMessage('automationId must be a valid ObjectId');

const idParam = param('id')
  .isString()
  .bail()
  .notEmpty()
  .withMessage('id is required')
  .isMongoId()
  .withMessage('id must be a valid ObjectId');

const pageLimitQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

const sortQuery = [
  query('sortBy').optional().isIn(['newest', 'oldest']).withMessage('Invalid sortBy'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sortOrder'),
];

const booleanFilters = [
  query('enabled').optional().isBoolean().withMessage('enabled must be boolean'),
  query('pinned').optional().isBoolean().withMessage('pinned must be boolean'),
  query('favorite').optional().isBoolean().withMessage('favorite must be boolean'),
  query('archived').optional().isBoolean().withMessage('archived must be boolean'),
];

const workspaceFilter = [
  query('workspaceId').optional().isMongoId().withMessage('workspaceId must be a valid ObjectId'),
];

const searchFilters = [
  query('name').optional().isString().trim().isLength({ max: 200 }).withMessage('name too long'),
  query('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('description too long'),
  query('triggerType').optional().isString().trim().isLength({ max: 80 }).withMessage('triggerType too long'),
  query('actions')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('actions filter too long'),
  query('category')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('category too long'),
];

const filtersQuery = [
  query('enabled').optional().isBoolean().withMessage('enabled must be boolean'),
  query('favorite').optional().isBoolean().withMessage('favorite must be boolean'),
  query('pinned').optional().isBoolean().withMessage('pinned must be boolean'),
  query('archived').optional().isBoolean().withMessage('archived must be boolean'),
  query('workspaceId').optional().isMongoId().withMessage('workspaceId must be a valid ObjectId'),
  ...pageLimitQuery,
  ...sortQuery,
  query('newest').optional(),
  query('oldest').optional(),
];

const createUpdateBody = [
  body('workspaceId')
    .isMongoId()
    .withMessage('workspaceId must be a valid ObjectId'),
  body('name').isString().trim().isLength({ min: 1, max: 200 }).withMessage('name must be 1-200 chars'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('description must be <= 2000 chars'),
  body('trigger')
    .isObject()
    .withMessage('trigger must be an object')
    .bail(),
  body('trigger.type')
    .isString()
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('trigger.type must be 1-80 chars'),
  body('trigger.params')
    .optional()
    .isObject()
    .withMessage('trigger.params must be an object'),
  body('conditions')
    .optional()
    .isArray()
    .withMessage('conditions must be an array'),
  body('actions')
    .optional()
    .isArray()
    .withMessage('actions must be an array'),
];

const updateBody = [
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('name must be 1-200 chars'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('description must be <= 2000 chars'),
  body('trigger')
    .optional()
    .isObject()
    .withMessage('trigger must be an object')
    .bail(),
  body('trigger.type')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('trigger.type must be 1-80 chars'),
  body('trigger.params')
    .optional()
    .isObject()
    .withMessage('trigger.params must be an object'),
  body('conditions')
    .optional()
    .isArray()
    .withMessage('conditions must be an array'),
  body('actions')
    .optional()
    .isArray()
    .withMessage('actions must be an array'),
];

const flagBody = (fieldName) => [
  body(fieldName).exists().withMessage(`${fieldName} is required`).isBoolean().withMessage(`${fieldName} must be boolean`),
];

const categoryQuery = [
  query('category').optional().isString().trim().isLength({ max: 200 }).withMessage('category too long'),
];

function automationsList() {
  return [
    ...pageLimitQuery,
    ...sortQuery,
    ...booleanFilters,
    ...workspaceFilter,
    ...searchFilters,
    query('category').optional().isString().trim().isLength({ max: 200 }).withMessage('category too long'),
  ];
}

function automationsGetById() {
  return [idParam];
}

function automationsCreate() {
  return createUpdateBody;
}

function automationsUpdate() {
  return [idParam, ...updateBody];
}

function automationsDelete() {
  return [idParam];
}

function automationsActionById() {
  return [idParam];
}

function automationsDuplicate() {
  return [
    idParam,
    body('name')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 200 })
      .withMessage('name must be <= 200 chars'),
  ];
}

function automationsHistory() {
  return [idParam];
}

function automationsRunTest() {
  return [idParam];
}

function automationsTemplates() {
  return [];
}

function automationsStats() {
  return [];
}

module.exports = {
  automationsList,
  automationsGetById,
  automationsCreate,
  automationsUpdate,
  automationsDelete,
  automationsActionById,
  automationsDuplicate,
  automationsHistory,
  automationsRunTest,
  automationsTemplates,
  automationsStats,
  flagBody,
};

