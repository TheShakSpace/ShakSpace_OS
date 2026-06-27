const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');
const { validateRequest } = require('../../validators/validate');
const { normalizeKnowledgeBody } = require('../../utils/knowledgeNormalize');

const knowledgeController = require('../../controllers/knowledge.controller');
const {
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
} = require('../../validators/knowledge.validation');

const router = Router();

router.use(authJwt(true));

router.get('/', ...knowledgeList(), validateRequest, knowledgeController.list);

router.get('/stats', ...knowledgeStats(), validateRequest, knowledgeController.stats);

router.get('/tags', ...knowledgeTags(), validateRequest, knowledgeController.tags);

router.post(
  '/',
  normalizeKnowledgeBody,
  ...knowledgeCreate(),
  validateRequest,
  knowledgeController.create
);

router.get('/:id', ...knowledgeGet(), validateRequest, knowledgeController.getById);

router.put(
  '/:id',
  normalizeKnowledgeBody,
  ...knowledgeUpdate(),
  validateRequest,
  knowledgeController.update
);

router.delete('/:id', ...knowledgeDelete(), validateRequest, knowledgeController.remove);

router.patch('/:id/pin', ...knowledgePin(), validateRequest, knowledgeController.pin);
router.patch('/:id/favorite', ...knowledgeFavorite(), validateRequest, knowledgeController.favorite);
router.patch('/:id/archive', ...knowledgeArchive(), validateRequest, knowledgeController.archive);
router.patch('/:id/restore', ...knowledgeRestore(), validateRequest, knowledgeController.restore);
router.patch('/:id/open', ...knowledgeOpen(), validateRequest, knowledgeController.open);

module.exports = router;
