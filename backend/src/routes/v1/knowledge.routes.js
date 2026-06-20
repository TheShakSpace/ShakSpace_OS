const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');
const knowledgeController = require('../../controllers/knowledge.controller');
const knowledgeValidation = require('../../validators/knowledge.validation');

const router = Router();
router.use(authJwt(true));

// Knowledge Hub should also support express-validator result handling
// (validateRequest already throws on validationResult; controller calls validateRequest)


// Knowledge
router.get(
  '/',
  knowledgeValidation.listQuery,
  (req, res, next) => knowledgeController.list(req, res, next)
);

router.get(
  '/:id',
  knowledgeValidation.objectIdParam,
  (req, res, next) => knowledgeController.getById(req, res, next)
);

router.post(
  '/',
  knowledgeValidation.createPayload,
  (req, res, next) => knowledgeController.create(req, res, next)
);

router.put(
  '/:id',
  knowledgeValidation.objectIdParam,
  knowledgeValidation.updatePayload,
  (req, res, next) => knowledgeController.update(req, res, next)
);

router.delete(
  '/:id',
  knowledgeValidation.objectIdParam,
  (req, res, next) => knowledgeController.remove(req, res, next)
);

router.patch(
  '/:id/pin',
  knowledgeValidation.objectIdParam,
  knowledgeValidation.pinPayload,
  (req, res, next) => knowledgeController.pin(req, res, next)
);

router.patch(
  '/:id/favorite',
  knowledgeValidation.objectIdParam,
  knowledgeValidation.pinPayload,
  (req, res, next) => knowledgeController.favorite(req, res, next)
);

router.patch(
  '/:id/archive',
  knowledgeValidation.objectIdParam,
  knowledgeValidation.pinPayload,
  (req, res, next) => knowledgeController.archive(req, res, next)
);

router.patch(
  '/:id/restore',
  knowledgeValidation.objectIdParam,
  (req, res, next) => knowledgeController.restore(req, res, next)
);

router.patch(
  '/:id/open',
  knowledgeValidation.objectIdParam,
  (req, res, next) => knowledgeController.open(req, res, next)
);

// Tags
router.get(
  '/tags',
  [
    require('express-validator').query('workspaceId').optional().isMongoId().withMessage('Invalid workspaceId').bail(),
  ],
  (req, res, next) => knowledgeController.tags(req, res, next)
);

// Collections
router.get('/collections', (req, res, next) => knowledgeController.collectionsList(req, res, next));

router.post('/collections', knowledgeValidation.collectionCreate, (req, res, next) => knowledgeController.collectionsCreate(req, res, next));

router.put('/collections/:id', knowledgeValidation.collectionUpdate, (req, res, next) => knowledgeController.collectionsUpdate(req, res, next));

router.delete('/collections/:id', (req, res, next) => knowledgeController.collectionsDelete(req, res, next));


// Stats
router.get('/stats', (req, res, next) => knowledgeController.stats(req, res, next));

module.exports = router;


