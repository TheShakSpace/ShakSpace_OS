const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');

const automationsController = require('../../controllers/automations.controller');
const {
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
} = require('../../validators/automations.validation');

const router = Router();
router.use(authJwt(true));

// CRUD
router.get('/', automationsList(), (req, res, next) => automationsController.list(req, res, next));
router.get('/:id', automationsGetById(), (req, res, next) => automationsController.getById(req, res, next));
router.post('/', automationsCreate(), (req, res, next) => automationsController.create(req, res, next));
router.put('/:id', automationsUpdate(), (req, res, next) => automationsController.update(req, res, next));
router.delete('/:id', automationsDelete(), (req, res, next) => automationsController.remove(req, res, next));

// Workflow actions
router.patch('/:id/enable', automationsActionById(), (req, res, next) => automationsController.enable(req, res, next));
router.patch('/:id/disable', automationsActionById(), (req, res, next) => automationsController.disable(req, res, next));
router.patch(
  '/:id/favorite',
  [...automationsActionById(), ...flagBody('value')],
  (req, res, next) => automationsController.favorite(req, res, next)
);
router.patch(
  '/:id/pin',
  [...automationsActionById(), ...flagBody('value')],
  (req, res, next) => automationsController.pin(req, res, next)
);
router.patch(
  '/:id/archive',
  [...automationsActionById(), ...flagBody('value')],
  (req, res, next) => automationsController.archive(req, res, next)
);
router.patch('/:id/restore', automationsActionById(), (req, res, next) => automationsController.restore(req, res, next));
router.patch('/:id/duplicate', automationsDuplicate(), (req, res, next) => automationsController.duplicate(req, res, next));

// Execution history + mock run/test
router.get('/:id/history', automationsHistory(), (req, res, next) => automationsController.history(req, res, next));
router.post('/:id/run', automationsRunTest(), (req, res, next) => automationsController.run(req, res, next));
router.post('/:id/test', automationsRunTest(), (req, res, next) => automationsController.test(req, res, next));

// Templates
router.get('/templates', automationsTemplates(), (req, res, next) => automationsController.templates(req, res, next));

// Search (best-effort: reuse list query params)
// Frontend may use filters/search on GET /; no extra route required by core behavior.
router.get('/search', automationsList(), (req, res, next) => automationsController.list(req, res, next));

// Statistics
router.get('/stats', automationsStats(), (req, res, next) => automationsController.stats(req, res, next));

module.exports = router;


