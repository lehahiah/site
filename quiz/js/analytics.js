/**
 * Interface d'événements interne.
 *
 * Aucun outil d'analytics n'est branché par défaut : sans collecteur installé,
 * les événements sont ignorés. Un collecteur pourra être branché plus tard.
 *
 * Contraintes : noms d'événements sur liste blanche, aucune donnée de santé,
 * aucun texte libre, aucune donnée personnelle.
 */

export const ALLOWED_EVENTS = Object.freeze([
  'quiz_started',
  'item_validated',
  'quiz_completed',
  'explanation_opened',
  'sources_opened',
  'perception_change_reported',
  'progress_reset',
]);

const ALLOWED_PAYLOAD_KEYS = Object.freeze(['quizId', 'itemId', 'order', 'panel', 'value', 'expectedFound']);
const ALLOWED_VALUE_TYPES = Object.freeze(['string', 'number', 'boolean']);

let sink = null;

/** Installe un collecteur d'événements. `null` désactive la collecte. */
export function setSink(nextSink) {
  sink = typeof nextSink === 'function' ? nextSink : null;
}

/** Filtre une charge utile : clés autorisées, valeurs scalaires courtes uniquement. */
export function sanitizePayload(payload = {}) {
  const safe = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!ALLOWED_PAYLOAD_KEYS.includes(key)) continue;
    if (!ALLOWED_VALUE_TYPES.includes(typeof value)) continue;
    if (typeof value === 'string' && value.length > 40) continue;
    safe[key] = value;
  }
  return safe;
}

/** Émet un événement produit. Sans collecteur installé, l'appel est sans effet. */
export function track(eventName, payload = {}) {
  if (!ALLOWED_EVENTS.includes(eventName)) return false;
  if (!sink) return false;
  sink(eventName, sanitizePayload(payload));
  return true;
}
