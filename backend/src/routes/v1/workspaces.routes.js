const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');
const { validateRequest } = require('../../validators/validate');
const { normalizeWorkspaceBody } = require('../../utils/workspaceNormalize');

const workspacesController = require('../../controllers/workspaces.controller');
const {
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
} = require('../../validators/workspaces.validation');

const router = Router();

router.use(authJwt(true));

router.get('/', ...workspaceList(), validateRequest, workspacesController.list);

router.get('/stats', ...workspaceStats(), validateRequest, workspacesController.stats);

router.post(
  '/',
  normalizeWorkspaceBody,
  ...workspaceCreate(),
  validateRequest,
  workspacesController.create
);

router.get('/:workspaceId', ...workspaceGet(), validateRequest, workspacesController.getById);

router.put(
  '/:workspaceId',
  normalizeWorkspaceBody,
  ...workspaceUpdate(),
  validateRequest,
  workspacesController.update
);

router.delete('/:workspaceId', ...workspaceDelete(), validateRequest, workspacesController.remove);

router.patch('/:workspaceId/pin', ...workspacePin(), validateRequest, workspacesController.pin);
router.patch('/:workspaceId/favorite', ...workspaceFavorite(), validateRequest, workspacesController.favorite);
router.patch('/:workspaceId/archive', ...workspaceArchive(), validateRequest, workspacesController.archive);
router.patch('/:workspaceId/restore', ...workspaceRestore(), validateRequest, workspacesController.restore);
router.patch('/:workspaceId/open', ...workspaceOpen(), validateRequest, workspacesController.open);

module.exports = router;
