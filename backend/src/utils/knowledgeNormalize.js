const VALID_CATEGORIES = ['general', 'personal', 'team', 'education', 'business', 'research'];

const CATEGORY_ALIASES = {
  development: 'general',
  dev: 'general',
  startup: 'business',
  research: 'research',
  college: 'education',
  learning: 'education',
  personal: 'personal',
  business: 'business',
  team: 'team',
  education: 'education',
  general: 'general',
};

const DEFAULT_COLOR = '#8B5CF6';

function looksLikeTailwindColor(value) {
  if (typeof value !== 'string') return false;
  return /\bfrom-|\bto-|\bbg-|\btext-/i.test(value);
}

function looksLikeHex(value) {
  if (typeof value !== 'string') return false;
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(value.trim());
}

function normalizeKnowledgeCategory(value) {
  if (value === undefined || value === null || value === '') return 'general';
  const lower = String(value).trim().toLowerCase();
  if (VALID_CATEGORIES.includes(lower)) return lower;
  return CATEGORY_ALIASES[lower] ?? 'general';
}

function normalizeKnowledgeColor(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const raw = String(value).trim();
  if (looksLikeTailwindColor(raw)) return undefined;
  if (looksLikeHex(raw)) return raw;
  return undefined;
}

function normalizeTags(tags) {
  if (tags === undefined || tags === null) return undefined;
  const list = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
      ? tags.split(',')
      : [];
  const seen = new Set();
  const result = [];
  for (const raw of list) {
    const tag = String(raw).trim().toLowerCase();
    if (!tag || tag.length > 40 || seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
  }
  return result;
}

function normalizeKnowledgeBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    if (req.body.category !== undefined) {
      req.body.category = normalizeKnowledgeCategory(req.body.category);
    }

    if (req.body.tags !== undefined) {
      req.body.tags = normalizeTags(req.body.tags);
    }

    const rawColor = req.body.color ?? req.body.accentColor;
    const color = normalizeKnowledgeColor(rawColor);
    if (color) {
      req.body.color = color;
    } else if (req.body.color !== undefined || req.body.accentColor !== undefined) {
      delete req.body.color;
    }

    delete req.body.accentColor;

    if (typeof req.body.title === 'string') req.body.title = req.body.title.trim();
    if (typeof req.body.summary === 'string') req.body.summary = req.body.summary.trim();
    if (typeof req.body.icon === 'string') req.body.icon = req.body.icon.trim();
  }

  return next();
}

function normalizeKnowledgeQueryCategory(value) {
  if (!value) return undefined;
  return normalizeKnowledgeCategory(value);
}

function computeContentMetrics(content) {
  const text = String(content ?? '').trim();
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = wordCount === 0 ? 0 : Math.max(1, Math.ceil(wordCount / 200));
  return { wordCount, readingTime };
}

module.exports = {
  VALID_CATEGORIES,
  DEFAULT_COLOR,
  normalizeKnowledgeCategory,
  normalizeKnowledgeColor,
  normalizeTags,
  normalizeKnowledgeBody,
  normalizeKnowledgeQueryCategory,
  computeContentMetrics,
};
