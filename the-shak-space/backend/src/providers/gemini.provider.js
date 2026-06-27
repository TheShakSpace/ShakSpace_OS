const { AppError } = require('../utils/AppError');

function estimateTokens(text) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(String(text).length / 4));
}

async function generateResponse({ messages, model }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !String(apiKey).trim()) {
    throw new AppError('Gemini API key is not configured', {
      statusCode: 503,
      code: 'GEMINI_NOT_CONFIGURED',
    });
  }

  const modelName = model || process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const contents = (messages ?? [])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content ?? '') }],
    }));

  if (!contents.length) {
    throw new AppError('No messages to send to Gemini', {
      statusCode: 400,
      code: 'EMPTY_MESSAGES',
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const providerMessage =
        data?.error?.message || data?.message || `Gemini request failed (${res.status})`;
      throw new AppError(providerMessage, {
        statusCode: res.status >= 400 && res.status < 600 ? res.status : 502,
        code: 'GEMINI_REQUEST_FAILED',
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text ?? '')
        .join('')
        .trim() ?? '';

    if (!text) {
      throw new AppError('Gemini returned an empty response', {
        statusCode: 502,
        code: 'GEMINI_EMPTY_RESPONSE',
      });
    }

    return {
      content: text,
      tokenCount: estimateTokens(text),
      metadata: {
        provider: 'gemini',
        model: modelName,
        finishReason: data?.candidates?.[0]?.finishReason ?? null,
      },
    };
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new AppError('Gemini request timed out', {
        statusCode: 504,
        code: 'GEMINI_TIMEOUT',
      });
    }
    if (err instanceof AppError) throw err;
    throw new AppError(err?.message || 'Gemini request failed', {
      statusCode: 502,
      code: 'GEMINI_REQUEST_FAILED',
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = { generateResponse };
