const VALID_CATEGORIES = ['general', 'personal', 'team', 'education', 'business', 'research'];

const CATEGORY_ALIASES = {
  development: 'general',
  dev: 'general',
  startup: 'business',
  'ai project': 'research',
  'ai-project': 'research',
  aiproject: 'research',
  college: 'education',
  freelancing: 'business',
  freelance: 'business',
  'open source': 'team',
  'open-source': 'team',
  opensource: 'team',
  client: 'business',
  learning: 'education',
};

const DEFAULT_COLOR = '#3B82F6';

function looksLikeTailwindColor(value) {
  if (typeof value !== 'string') return false;
  return /\bfrom-|\bto-|\bbg-|\btext-/i.test(value);
}

function looksLikeHex(value) {
  if (typeof value !== 'string') return false;
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(value.trim());
}

function normalizeWorkspaceCategory(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const lower = String(value).trim().toLowerCase();
  if (VALID_CATEGORIES.includes(lower)) return lower;
  return CATEGORY_ALIASES[lower] ?? 'general';
}

function normalizeWorkspaceColor(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const raw = String(value).trim();
  if (looksLikeTailwindColor(raw)) return undefined;
  if (looksLikeHex(raw)) return raw;
  return undefined;
}

function normalizeWorkspaceBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    if (req.body.category !== undefined) {
      req.body.category = normalizeWorkspaceCategory(req.body.category);
    }

    const rawColor = req.body.color ?? req.body.accentColor;
    const color = normalizeWorkspaceColor(rawColor);
    if (color) {
      req.body.color = color;
    } else if (req.body.color !== undefined || req.body.accentColor !== undefined) {
      delete req.body.color;
    }

    delete req.body.accentColor;
  }

  return next();
}

function normalizeWorkspaceQueryCategory(value) {
  if (!value) return undefined;
  return normalizeWorkspaceCategory(value);
}

module.exports = {
  VALID_CATEGORIES,
  DEFAULT_COLOR,
  looksLikeTailwindColor,
  looksLikeHex,
  normalizeWorkspaceCategory,
  normalizeWorkspaceColor,
  normalizeWorkspaceBody,
  normalizeWorkspaceQueryCategory,
};
