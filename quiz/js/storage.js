/**
 * Progression locale.
 *
 * Stockée uniquement dans le navigateur (localStorage). Ne contient que des
 * données de progression : identifiants d'items, réponses choisies, avancement.
 * Aucun nom, e-mail, diagnostic, motif d'arrêt, donnée de santé ou texte libre.
 *
 * Les réducteurs sont purs ; l'accès au stockage est isolé et tolérant aux erreurs
 * (navigation privée, stockage désactivé).
 */

export const STORAGE_PREFIX = 'quizBurnout.progress.';
export const STORAGE_VERSION = 1;

/** Progression vide pour un quiz. */
export function createEmptyProgress(quizId) {
  return {
    version: STORAGE_VERSION,
    quizId,
    currentOrder: 1,
    answers: {},
    validatedItemIds: [],
    completed: false,
    updatedAt: new Date().toISOString(),
  };
}

const touch = (progress) => ({ ...progress, updatedAt: new Date().toISOString() });

/** Enregistre une réponse (possible tant que l'item n'est pas validé). */
export function setAnswer(progress, itemId, value) {
  if (progress.validatedItemIds.includes(itemId)) return progress;
  return touch({ ...progress, answers: { ...progress.answers, [itemId]: value } });
}

/** Fige la réponse d'un item : elle ne peut plus être modifiée pour cet essai. */
export function markValidated(progress, itemId) {
  if (progress.validatedItemIds.includes(itemId)) return progress;
  return touch({ ...progress, validatedItemIds: [...progress.validatedItemIds, itemId] });
}

export function isValidated(progress, itemId) {
  return progress.validatedItemIds.includes(itemId);
}

export function setCurrentOrder(progress, order) {
  if (progress.currentOrder === order) return progress;
  return touch({ ...progress, currentOrder: order });
}

export function markCompleted(progress) {
  if (progress.completed) return progress;
  return touch({ ...progress, completed: true });
}

/** Contrôle défensif : aucune clé inattendue ne doit être relue depuis le stockage. */
export function sanitizeProgress(raw, quizId) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.quizId !== quizId) return null;
  const answers = {};
  for (const [itemId, value] of Object.entries(raw.answers ?? {})) {
    if (typeof value === 'string' || (value && typeof value === 'object' && !Array.isArray(value))) {
      answers[itemId] = value;
    }
  }
  return {
    version: STORAGE_VERSION,
    quizId,
    currentOrder: Number.isInteger(raw.currentOrder) && raw.currentOrder > 0 ? raw.currentOrder : 1,
    answers,
    validatedItemIds: Array.isArray(raw.validatedItemIds) ? raw.validatedItemIds.filter((id) => typeof id === 'string') : [],
    completed: raw.completed === true,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
}

function safeStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadProgress(quizId, storage) {
  const store = safeStorage(storage);
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_PREFIX + quizId);
    return raw ? sanitizeProgress(JSON.parse(raw), quizId) : null;
  } catch {
    return null;
  }
}

export function saveProgress(progress, storage) {
  const store = safeStorage(storage);
  if (!store) return false;
  try {
    store.setItem(STORAGE_PREFIX + progress.quizId, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function clearProgress(quizId, storage) {
  const store = safeStorage(storage);
  if (!store) return false;
  try {
    store.removeItem(STORAGE_PREFIX + quizId);
    return true;
  } catch {
    return false;
  }
}

/** Efface toute la progression locale du quiz, quelle que soit la série. */
export function clearAllProgress(storage) {
  const store = safeStorage(storage);
  if (!store) return false;
  try {
    const keys = [];
    for (let index = 0; index < store.length; index += 1) {
      const key = store.key(index);
      if (key && key.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => store.removeItem(key));
    return true;
  } catch {
    return false;
  }
}
