const { success, created } = require('../utils/response');
const { validateRequest } = require('../validators/validate');
const automationsService = require('../services/automations.service');

function toPagination(req) {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  return { page, limit };
}

function toSort(req) {
  const sortBy = req.query.sortBy || 'newest';
  const sortOrder = req.query.sortOrder || 'desc';
  return { sortBy, sortOrder };
}

function toFilters(req) {
  return {
    enabled: req.query.enabled,
    pinned: req.query.pinned,
    favorite: req.query.favorite,
    archived: req.query.archived,
    workspaceId: req.query.workspaceId,
  };
}

function toSearch(req) {
  return {
    name: req.query.name,
    description: req.query.description,
    triggerType: req.query.triggerType,
    actions: req.query.actions,
    category: req.query.category,
  };
}

async function list(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const { page, limit } = toPagination(req);
    const { sortBy, sortOrder } = toSort(req);

    const result = await automationsService.list({
      ownerId,
      page,
      limit,
      sortBy,
      sortOrder,
      filters: toFilters(req),
      search: toSearch(req),
    });

    return success(res, result);
  } catch (e) {
    return next(e);
  }
}

async function getById(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const automationId = req.params.id;

    const automation = await automationsService.getById({ ownerId, automationId });
    return success(res, { automation });
  } catch (e) {
    return next(e);
  }
}

async function create(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const payload = {
      workspaceId: req.body.workspaceId,
      name: req.body.name,
      description: req.body.description,
      trigger: req.body.trigger,
      conditions: req.body.conditions,
      actions: req.body.actions,
    };

    const automation = await automationsService.create({ ownerId, payload });
    return created(res, { automation });
  } catch (e) {
    return next(e);
  }
}

async function update(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const automationId = req.params.id;

    const payload = {
      name: req.body.name,
      description: req.body.description,
      trigger: req.body.trigger,
      conditions: req.body.conditions,
      actions: req.body.actions,
    };

    const automation = await automationsService.update({ ownerId, automationId, payload });
    return success(res, { automation });
  } catch (e) {
    return next(e);
  }
}

async function remove(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const automationId = req.params.id;

    const result = await automationsService.remove({ ownerId, automationId });
    return success(res, result);
  } catch (e) {
    return next(e);
  }
}

async function enable(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const automationId = req.params.id;

    const automation = await automationsService.enable({ ownerId, automationId });
    return success(res, { automation });
  } catch (e) {
    return next(e);
  }
}

async function disable(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const automationId = req.params.id;

    const automation = await automationsService.disable({ ownerId, automationId });
    return success(res, { automation });
  } catch (e) {
    return next(e);
  }
}

async function favorite(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const automationId = req.params.id;

    const automation = await automationsService.favorite({ ownerId, automationId, value: req.body.value });
    return success(res, { automation });
  } catch (e) {
    return next(e);
  }
}

async function pin(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const automationId = req.params.id;

    const automation = await automationsService.pin({ ownerId, automationId, value: req.body.value });
    return success(res, { automation });
  } catch (e) {
    return next(e);
  }
}

async function archive(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const automationId = req.params.id;

    const automation = await automationsService.archive({ ownerId, automationId, value: req.body.value });
    return success(res, { automation });
  } catch (e) {
    return next(e);
  }
}

async function restore(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const automationId = req.params.id;

    const automation = await automationsService.restore({ ownerId, automationId });
    return success(res, { automation });
  } catch (e) {
    return next(e);
  }
}

async function duplicate(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const automationId = req.params.id;

    const automation = await automationsService.duplicate({ ownerId, automationId, name: req.body.name });
    return created(res, { automation });
  } catch (e) {
    return next(e);
  }
}

async function history(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const automationId = req.params.id;

    const data = await automationsService.history({ ownerId, automationId });
    return success(res, data);
  } catch (e) {
    return next(e);
  }
}

async function run(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const automationId = req.params.id;

    const data = await automationsService.run({ ownerId, automationId });
    return success(res, data);
  } catch (e) {
    return next(e);
  }
}

async function test(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const automationId = req.params.id;

    const data = await automationsService.test({ ownerId, automationId });
    return success(res, data);
  } catch (e) {
    return next(e);
  }
}

async function templates(req, res, next) {
  try {
    validateRequest(req);

    const data = await automationsService.templates();
    return success(res, { templates: data });
  } catch (e) {
    return next(e);
  }
}

async function stats(req, res, next) {
  try {
    validateRequest(req);

    const ownerId = req.user.id;
    const data = await automationsService.stats({ ownerId });
    return success(res, data);
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  enable,
  disable,
  favorite,
  pin,
  archive,
  restore,
  duplicate,
  history,
  run,
  test,
  templates,
  stats,
};

