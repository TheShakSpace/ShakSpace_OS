const { body, param, query } = require('express-validator');

function optionalEnum(allowed) {
  return query('value').optional().isIn(allowed);
}

const objectIdParam = param('id').isMongoId().withMessage('Invalid id');

// Common query parsing
const pagination = [
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('limit must be between 1 and 100'),
];

const sort = [
  query('sortBy')
    .optional()
    .isString()
    .isIn(['newest', 'oldest', 'lastEdited', 'title'])
    .withMessage('Invalid sortBy'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sortOrder'),
];

const boolFilters = [
  query('pinned').optional().isBoolean().withMessage('pinned must be boolean').toBoolean(),
  query('favorite').optional().isBoolean().withMessage('favorite must be boolean').toBoolean(),
  query('archived').optional().isBoolean().withMessage('archived must be boolean').toBoolean(),
];

const workspaceFilter = [query('workspaceId').optional().isMongoId().withMessage('Invalid workspaceId')];

const collectionFilter = [
  query('collection')
    .optional()
    .isString()
    .isLength({ min: 1, max: 80 })
    .withMessage('collection must be 1-80 chars'),
];

const tagsFilter = [
  query('tags')
    .optional()
    .custom((v) => {
      // Accept either comma-separated string or array of strings
      if (typeof v === 'string') return v.split(',').map((x) => x.trim()).filter(Boolean).length >= 0;
      if (Array.isArray(v)) return true;
      return false;
    })
    .withMessage('tags must be a comma-separated string or array'),
];

const textSearch = [
  query('title').optional().isString().isLength({ min: 1, max: 200 }).withMessage('title search must be 1-200 chars'),
  query('content')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 }).withMessage('content search must be 1-200 chars'),
  query('summary')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 }).withMessage('summary search must be 1-200 chars'),
  query('collection')
    .optional()
    .isString()
    .isLength({ min: 1, max: 80 })
    .withMessage('collection must be 1-80 chars'),
  query('tags')
    .optional()
    .custom((v) => {
      if (typeof v === 'string') return true;
      if (Array.isArray(v)) return v.every((t) => typeof t === 'string' && t.length <= 40);
      return false;
    })
    .withMessage('Invalid tags'),
];

// Unified endpoint spec uses: /api/knowledge + filters/search via query params
const listQuery = [
  ...pagination,
  ...sort,
  ...boolFilters,
  ...workspaceFilter,
  ...collectionFilter,
  ...tagsFilter,
  query('search')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('search must be 1-500 chars'),
  query('title').optional().isString().isLength({ min: 1, max: 200 }),
  query('content').optional().isString().isLength({ min: 1, max: 200 }),
  query('summary').optional().isString().isLength({ min: 1, max: 200 }),
  query('tags').optional(),
  query('collection').optional(),
];

const createPayload = [
  body('workspaceId').optional().isMongoId().withMessage('workspaceId must be valid mongo id'),
  body('title').isString().isLength({ min: 1, max: 200 }).withMessage('title must be 1-200 chars'),
  body('content').optional().isString().withMessage('content must be a string'),
  body('summary').optional().isString().isLength({ max: 800 }).withMessage('summary must be <= 800 chars'),
  body('collection')
    .optional()
    .isString()
    .isLength({ max: 80 })
    .withMessage('collection must be <= 80 chars'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('tags must be an array')
    .custom((arr) => arr.every((t) => typeof t === 'string' && t.length <= 40))
    .withMessage('each tag must be a string with max length 40'),
  body('favorite').optional().isBoolean().toBoolean(),
  body('pinned').optional().isBoolean().toBoolean(),
  body('archived').optional().isBoolean().toBoolean(),
];

const updatePayload = [
  body('title').optional().isString().isLength({ min: 1, max: 200 }).withMessage('title must be 1-200 chars'),
  body('content').optional().isString().withMessage('content must be a string'),
  body('summary').optional().isString().isLength({ max: 800 }).withMessage('summary must be <= 800 chars'),
  body('collection').optional().isString().isLength({ max: 80 }).withMessage('collection must be <= 80 chars'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('tags must be an array')
    .custom((arr) => arr.every((t) => typeof t === 'string' && t.length <= 40))
    .withMessage('each tag must be a string with max length 40'),
  body('favorite').optional().isBoolean().toBoolean(),
  body('pinned').optional().isBoolean().toBoolean(),
  body('archived').optional().isBoolean().toBoolean(),
];

const pinPayload = [
  body('value')
    .exists()
    .withMessage('value is required')
    .isBoolean()
    .toBoolean()
    .withMessage('value must be boolean'),
];

const noOwnershipFieldUpdate = [
  body('workspaceId')
    .optional()
    .custom((v, { req }) => {
      // Disallow setting workspaceId via update endpoints
      if (req.route?.path?.includes('/knowledge/collections')) return true;
      return false;
    }),
];

// Collection CRUD
const collectionCreate = [
  body('name').isString().isLength({ min: 1, max: 80 }).withMessage('name must be 1-80 chars'),
];

const collectionUpdate = [
  body('name').optional().isString().isLength({ min: 1, max: 80 }).withMessage('name must be 1-80 chars'),
];

module.exports = {
  listQuery,
  objectIdParam,
  createPayload,
  updatePayload,
  pinPayload,
  textSearch,
  pagination,
  sort,
  boolFilters,
  workspaceFilter,
  collectionFilter,
  tagsFilter,
  createPayload,
  updatePayload,
  collectionCreate,
  collectionUpdate,
};

