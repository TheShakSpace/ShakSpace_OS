const Automation = require('../models/Automation');
const Workspace = require('../models/Workspace');
const { AppError } = require('../utils/AppError');

function parseBoolean(val) {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    if (val.toLowerCase() === 'true') return true;
    if (val.toLowerCase() === 'false') return false;
  }
  return undefined;
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function assertWorkspaceOwnership({ ownerId, workspaceId }) {
  const workspace = await Workspace.findOne({ owner: ownerId, _id: workspaceId }).lean();
  if (!workspace) throw new AppError('Workspace not found', { statusCode: 404, code: 'WORKSPACE_NOT_FOUND' });
  return workspace;
}

async function automationBelongsToUserOrThrow({ ownerId, automationId }) {
  const automation = await Automation.findById(automationId).lean();
  if (!automation) throw new AppError('Automation not found', { statusCode: 404, code: 'AUTOMATION_NOT_FOUND' });

  await assertWorkspaceOwnership({ ownerId, workspaceId: automation.workspace });
  return automation;
}

function buildAutomationSort({ sortBy, sortOrder }) {
  const order = sortOrder === 'asc' ? 1 : -1;
  // Task requires newest/oldest; accept both styles.
  if (sortBy === 'oldest') return { createdAt: 1 };
  if (sortBy === 'newest') return { createdAt: -1 };
  return { createdAt: order === 1 ? 1 : -1 };
}

function defaultTemplateByName(name) {
  const templates = {
    'Daily Backup': {
      name: 'Daily Backup',
      description: 'Automatically back up important files every day.',
      trigger: { type: 'schedule.daily', params: { hour: 2, timezone: 'UTC' } },
      conditions: [],
      actions: [{ type: 'backup.run', params: { target: 'workspace' } }],
    },
    'AI Summary': {
      name: 'AI Summary',
      description: 'Summarize selected notes and meetings using AI.',
      trigger: { type: 'manual', params: {} },
      conditions: [],
      actions: [{ type: 'ai.summarize', params: { model: 'gpt-4o-mini' } }],
    },
    'Research Assistant': {
      name: 'Research Assistant',
      description: 'Collect sources and draft research briefs.',
      trigger: { type: 'web.schedule', params: { interval: 'daily' } },
      conditions: [],
      actions: [{ type: 'web.collect', params: {} }, { type: 'doc.draft', params: {} }],
    },
    'Meeting Notes': {
      name: 'Meeting Notes',
      description: 'Generate structured meeting notes and action items.',
      trigger: { type: 'calendar.event', params: { type: 'meeting' } },
      conditions: [],
      actions: [{ type: 'ai.notes', params: {} }],
    },
    'Email Automation': {
      name: 'Email Automation',
      description: 'Send customized emails based on triggers.',
      trigger: { type: 'manual', params: {} },
      conditions: [],
      actions: [{ type: 'email.send', params: { template: 'default' } }],
    },
    'Code Review': {
      name: 'Code Review',
      description: 'Analyze diffs and provide a code review checklist.',
      trigger: { type: 'git.webhook', params: { events: ['push'] } },
      conditions: [],
      actions: [{ type: 'ai.codeReview', params: {} }],
    },
    'Morning Routine': {
      name: 'Morning Routine',
      description: 'Daily tasks to keep your mornings productive.',
      trigger: { type: 'schedule.daily', params: { hour: 8, timezone: 'UTC' } },
      conditions: [],
      actions: [{ type: 'todo.create', params: { list: 'Morning' } }],
    },
    'Document Organizer': {
      name: 'Document Organizer',
      description: 'Classify and organize documents automatically.',
      trigger: { type: 'upload.detect', params: { folder: '/' } },
      conditions: [],
      actions: [{ type: 'doc.classify', params: {} }, { type: 'doc.move', params: {} }],
    },
  };
  return templates[name] || null;
}

function buildSearchQuery({ name, description, triggerType, actions, category }) {
  const or = [];

  if (name) {
    const rx = new RegExp(escapeRegExp(name.trim()), 'i');
    or.push({ name: rx });
  }
  if (description) {
    const rx = new RegExp(escapeRegExp(description.trim()), 'i');
    or.push({ description: rx });
  }
  if (triggerType) {
    const rx = new RegExp(escapeRegExp(triggerType.trim()), 'i');
    or.push({ 'trigger.type': rx });
  }
  if (actions) {
    const rx = new RegExp(escapeRegExp(actions.trim()), 'i');
    // actions is array of mixed: best-effort stringification match
    or.push({ actions: { $elemMatch: { type: rx } } });
    or.push({ actions: { $elemMatch: { params: { $regex: rx } } } });
  }
  if (category) {
    // No category field in schema; interpret as trigger.type or name match.
    const rx = new RegExp(escapeRegExp(category.trim()), 'i');
    or.push({ name: rx });
    or.push({ description: rx });
  }

  if (!or.length) return {};
  return { $or: or };
}

function applyPinnedCompatFilter({ match, pinned }) {
  // Automation schema does not define `pinned`.
  // We implement pinned via `favorite`? No.
  // To keep production behavior stable, we treat `pinned` as filtering on `executionHistory.meta.pinned` if present.
  // If not present, pinned filter returns empty unless pinned=false.
  if (pinned === undefined) return;

  if (pinned === false) {
    match['executionHistory.meta.pinned'] = { $ne: true };
    return;
  }

  match['executionHistory.meta.pinned'] = true;
}

async function list({ ownerId, page, limit, sortBy, sortOrder, filters, search }) {
  const skip = (page - 1) * limit;

  const q = { $and: [] };

  if (filters.workspaceId) {
    await assertWorkspaceOwnership({ ownerId, workspaceId: filters.workspaceId });
    q.$and.push({ workspace: filters.workspaceId });
  } else {
    const workspaces = await Workspace.find({ owner: ownerId }, { _id: 1 }).lean();
    q.$and.push({ workspace: { $in: workspaces.map((w) => w._id) } });
  }

  const enabled = parseBoolean(filters.enabled);
  const favorite = parseBoolean(filters.favorite);
  const archived = parseBoolean(filters.archived);
  const pinned = parseBoolean(filters.pinned);

  if (enabled !== undefined) q.$and.push({ enabled });
  if (favorite !== undefined) q.$and.push({ favorite });
  if (archived !== undefined) q.$and.push({ archived });
  if (pinned !== undefined) applyPinnedCompatFilter({ match: q.$and, pinned });

  const searchQ = buildSearchQuery(search);
  if (Object.keys(searchQ).length) q.$and.push(searchQ);

  const sort = buildAutomationSort({ sortBy, sortOrder });

  const match = q.$and.length ? { $and: q.$and } : {};

  const [total, items] = await Promise.all([
    Automation.countDocuments(match),
    Automation.find(match).sort(sort).skip(skip).limit(limit).lean(),
  ]);

  const normalized = items.map((a) => ({
    ...a,
    pinned: a.executionHistory?.some?.((h) => h?.meta?.pinned === true) || false,
  }));

  return {
    automations: normalized,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function getById({ ownerId, automationId }) {
  const automation = await automationBelongsToUserOrThrow({ ownerId, automationId });
  return {
    ...automation,
    pinned: automation.executionHistory?.some?.((h) => h?.meta?.pinned === true) || false,
  };
}

async function create({ ownerId, payload }) {
  await assertWorkspaceOwnership({ ownerId, workspaceId: payload.workspaceId });

  const doc = await Automation.create({
    workspace: payload.workspaceId,
    name: payload.name,
    description: payload.description || '',
    trigger: payload.trigger,
    conditions: payload.conditions || [],
    actions: payload.actions || [],
    enabled: payload.enabled !== undefined ? payload.enabled : true,
    favorite: false,
    archived: false,
    executionHistory: [],
  });

  return {
    ...doc.toObject(),
    pinned: false,
  };
}

async function update({ ownerId, automationId, payload }) {
  const existing = await automationBelongsToUserOrThrow({ ownerId, automationId });

  const update = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.description !== undefined) update.description = payload.description;
  if (payload.trigger !== undefined) update.trigger = payload.trigger;
  if (payload.conditions !== undefined) update.conditions = payload.conditions;
  if (payload.actions !== undefined) update.actions = payload.actions;
  if (payload.enabled !== undefined) update.enabled = payload.enabled;
  if (payload.favorite !== undefined) update.favorite = payload.favorite;
  if (payload.archived !== undefined) update.archived = payload.archived;

  await Automation.updateOne({ _id: existing._id }, { $set: update });
  const updated = await Automation.findById(existing._id).lean();

  return {
    ...updated,
    pinned: updated.executionHistory?.some?.((h) => h?.meta?.pinned === true) || false,
  };
}

async function remove({ ownerId, automationId }) {
  const existing = await automationBelongsToUserOrThrow({ ownerId, automationId });
  await Automation.deleteOne({ _id: existing._id });
  return { deleted: true, id: String(existing._id) };
}

async function setFlag({ ownerId, automationId, flag, value }) {
  const existing = await automationBelongsToUserOrThrow({ ownerId, automationId });

  if (flag === 'pin') {
    // Persist pseudo-pin into the most recent executionHistory entry's meta (or create one)
    const history = existing.executionHistory || [];
    if (!history.length) {
      history.push({ ranAt: new Date(), status: 'skipped', durationMs: 0, meta: { pinned: value } });
    } else {
      // Set on all entries to make filter work reliably
      history.forEach((h) => {
        if (!h.meta) h.meta = {};
        h.meta.pinned = value;
      });
    }
    await Automation.updateOne({ _id: existing._id }, { $set: { executionHistory: history } });
  } else {
    const field = flag === 'favorite' ? 'favorite' : flag === 'archive' ? 'archived' : flag === 'enable' ? 'enabled' : null;
    if (!field) throw new AppError('Invalid flag', { statusCode: 400, code: 'INVALID_FLAG' });
    await Automation.updateOne({ _id: existing._id }, { $set: { [field]: value } });
  }

  const updated = await Automation.findById(existing._id).lean();
  return {
    ...updated,
    pinned: updated.executionHistory?.some?.((h) => h?.meta?.pinned === true) || false,
  };
}

async function enable({ ownerId, automationId }) {
  return setFlag({ ownerId, automationId, flag: 'enable', value: true });
}
async function disable({ ownerId, automationId }) {
  return setFlag({ ownerId, automationId, flag: 'enable', value: false });
}
async function favorite({ ownerId, automationId, value }) {
  return setFlag({ ownerId, automationId, flag: 'favorite', value });
}
async function pin({ ownerId, automationId, value }) {
  return setFlag({ ownerId, automationId, flag: 'pin', value });
}
async function archive({ ownerId, automationId, value }) {
  return setFlag({ ownerId, automationId, flag: 'archive', value });
}
async function restore({ ownerId, automationId }) {
  return archive({ ownerId, automationId, value: false });
}

async function duplicate({ ownerId, automationId, name }) {
  const existing = await automationBelongsToUserOrThrow({ ownerId, automationId });

  const copyName = name || `${existing.name} (Copy)`;

  const doc = await Automation.create({
    workspace: existing.workspace,
    name: copyName,
    description: existing.description,
    trigger: existing.trigger,
    conditions: existing.conditions,
    actions: existing.actions,
    enabled: true,
    favorite: false,
    archived: false,
    executionHistory: [],
  });

  return {
    ...doc.toObject(),
    pinned: false,
  };
}

async function mockExecution({ ownerId, automationId, kind }) {
  const existing = await automationBelongsToUserOrThrow({ ownerId, automationId });
  const ranAt = new Date();

  const status = existing.enabled ? 'success' : 'skipped';

  const entry = {
    ranAt,
    status: status,
    durationMs: kind === 'test' ? 5 : 20,
    meta: {
      kind,
      mock: true,
      pinned: undefined,
    },
  };

  // Preserve any pin metadata already encoded in executionHistory
  const history = existing.executionHistory || [];
  entry.meta.pinned = history.some((h) => h?.meta?.pinned === true);
  history.push(entry);

  await Automation.updateOne({ _id: existing._id }, { $set: { executionHistory: history, lastRun: ranAt } });

  const updated = await Automation.findById(existing._id).lean();

  return {
    result: {
      mock: true,
      automationId: String(existing._id),
      kind,
      status,
    },
    automation: {
      ...updated,
      pinned: updated.executionHistory?.some?.((h) => h?.meta?.pinned === true) || false,
    },
  };
}

async function history({ ownerId, automationId }) {
  const existing = await automationBelongsToUserOrThrow({ ownerId, automationId });
  return {
    executionHistory: existing.executionHistory || [],
  };
}

async function templates() {
  const names = [
    'Daily Backup',
    'AI Summary',
    'Research Assistant',
    'Meeting Notes',
    'Email Automation',
    'Code Review',
    'Morning Routine',
    'Document Organizer',
  ];

  return names
    .map((n) => defaultTemplateByName(n))
    .filter(Boolean);
}

async function stats({ ownerId }) {
  const workspaces = await Workspace.find({ owner: ownerId }, { _id: 1 }).lean();
  const ids = workspaces.map((w) => w._id);

  const [total, active, disabled, favoritesCount, archivedCount, recent, execAgg] = await Promise.all([
    Automation.countDocuments({ workspace: { $in: ids } }),
    Automation.countDocuments({ workspace: { $in: ids }, enabled: true }),
    Automation.countDocuments({ workspace: { $in: ids }, enabled: false }),
    Automation.countDocuments({ workspace: { $in: ids }, favorite: true }),
    Automation.countDocuments({ workspace: { $in: ids }, archived: true }),
    Automation.find({ workspace: { $in: ids } }).sort({ createdAt: -1 }).limit(10).lean(),
    Automation.aggregate([
      { $match: { workspace: { $in: ids } } },
      { $project: { execCount: { $size: '$executionHistory' } } },
      { $group: { _id: null, totalExec: { $sum: '$execCount' } } },
      { $project: { _id: 0, totalExec: 1 } },
    ]),
  ]);

  const executionCount = execAgg[0]?.totalExec || 0;

  // Recent executions: flatten last history entries
  const recentExecutions = (await Promise.all(
    recent.map(async (a) => {
      const doc = await Automation.findById(a._id).lean();
      const last = (doc.executionHistory || []).slice(-3).reverse();
      return last.map((h) => ({ automationId: String(doc._id), ranAt: h.ranAt, status: h.status, durationMs: h.durationMs, meta: h.meta }));
    })
  )).flat();

  return {
    totalWorkflows: total,
    active,
    disabled,
    favorites: favoritesCount,
    pinned: undefined,
    archived: archivedCount,
    executionCount,
    recentExecutions,
  };
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
  run: async ({ ownerId, automationId }) => mockExecution({ ownerId, automationId, kind: 'run' }),
  test: async ({ ownerId, automationId }) => mockExecution({ ownerId, automationId, kind: 'test' }),
  history,
  templates,
  stats,
};

