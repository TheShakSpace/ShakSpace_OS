const { Router } = require('express');
const { authJwt } = require('../../middleware/authJwt');
const { validateRequest } = require('../../validators/validate');

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

router.get(
  "/",
  ...workspaceList(),
  validateRequest,
  workspacesController.list
);

router.post(
  "/",
  (req, res, next) => {
    console.log("POST ROUTE ENTERED");
    next();
  },
  ...workspaceCreate(),
  (req, res, next) => {
    console.log("POST VALIDATION PASSED");
    next();
  },
  validateRequest,
  (req, res, next) => {
    console.log("POST BEFORE CONTROLLER");
    next();
  },
  workspacesController.create
);

router.get('/:workspaceId', ...workspaceGet(), validateRequest, workspacesController.getById);

router.put('/:workspaceId', ...workspaceUpdate(), validateRequest, workspacesController.update);

router.delete('/:workspaceId', ...workspaceDelete(), validateRequest, workspacesController.remove);

router.patch('/:workspaceId/pin', ...workspacePin(), validateRequest, workspacesController.pin);
router.patch('/:workspaceId/favorite', ...workspaceFavorite(), validateRequest, workspacesController.favorite);
router.patch('/:workspaceId/archive', ...workspaceArchive(), validateRequest, workspacesController.archive);
router.patch('/:workspaceId/restore', ...workspaceRestore(), validateRequest, workspacesController.restore);
router.patch('/:workspaceId/open', ...workspaceOpen(), validateRequest, workspacesController.open);


module.exports = router;


