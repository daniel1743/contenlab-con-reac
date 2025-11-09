export const stripJsonCodeFences = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
};

export const safeJsonParse = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const cleaned = stripJsonCodeFences(value);

  if (!cleaned) {
    return null;
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn('[safeJsonParse] Invalid JSON payload', error);
    return null;
  }
};
