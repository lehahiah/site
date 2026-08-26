/**
 * Tests de logique — QCM, association, classement, progression locale,
 * restitution non clinique, rendu Markdown, interface d'événements.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  evaluateAnswer,
  isAnswerComplete,
  computeSummary,
  selectAxes,
  buildClassificationElements,
  buildAssociationChoices,
} from '../js/scoring.js';
import {
  createEmptyProgress,
  setAnswer,
  markValidated,
  isValidated,
  setCurrentOrder,
  markCompleted,
  sanitizeProgress,
  loadProgress,
  saveProgress,
  clearProgress,
  clearAllProgress,
  STORAGE_PREFIX,
} from '../js/storage.js';
import { renderMarkdown, escapeHtml } from '../js/markdown.js';
import { track, setSink, sanitizePayload, ALLOWED_EVENTS } from '../js/analytics.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const dataset = JSON.parse(readFileSync(join(root, 'data/questions-31.json'), 'utf8'));
const remediation = JSON.parse(readFileSync(join(root, 'data/remediation.json'), 'utf8'));
const byId = Object.fromEntries(dataset.items.map((item) => [item.id, item]));
const itemsOf = (quizId) => dataset.items.filter((item) => item.quizId === quizId).sort((a, b) => a.order - b.order);

/* --- Formats ------------------------------------------------------------- */

test('vrai/faux : la réponse attendue est détectée', () => {
  const item = byId['Q1-01'];
  assert.equal(evaluateAnswer(item, 'false').expectedFound, true);
  assert.equal(evaluateAnswer(item, 'true').expectedFound, false);
});

test('QCM : la réponse attendue et les autres réponses sont distinguées', () => {
  const item = byId['Q1-02'];
  assert.equal(evaluateAnswer(item, 'B').expectedFound, true);
  assert.equal(evaluateAnswer(item, 'A').expectedFound, false);
  const details = evaluateAnswer(item, 'A').details;
  assert.equal(details.filter((detail) => detail.expected).length, 1);
  assert.equal(details.find((detail) => detail.chosen).id, 'A');
});

test("QCM : l'ordre des options reste celui du master", () => {
  assert.deepEqual(byId['Q1-02'].options.map((option) => option.id), ['A', 'B', 'C', 'D']);
});

test('association : une seule paire fausse suffit à ne pas trouver la réponse attendue', () => {
  const item = byId['Q1-06'];
  const complete = Object.fromEntries(item.pairs.map((pair) => [pair.id, pair.answer]));
  assert.equal(evaluateAnswer(item, complete).expectedFound, true);
  const partial = { ...complete, '1': item.pairs[1].answer };
  assert.equal(evaluateAnswer(item, partial).expectedFound, false);
  const wrong = evaluateAnswer(item, partial).details.filter((detail) => !detail.expectedFound);
  assert.deepEqual(wrong.map((detail) => detail.id), ['1']);
});

test('association : les réponses proposées sont ordonnées sans indiquer la position attendue', () => {
  const item = byId['Q1-14'];
  const choices = buildAssociationChoices(item);
  assert.equal(choices.length, item.pairs.length);
  assert.deepEqual(choices, [...choices].sort((a, b) => a.localeCompare(b, 'fr')));
});

test('classement : les éléments sont entrelacés entre catégories', () => {
  const item = byId['Q1-11'];
  const elements = buildClassificationElements(item);
  assert.equal(elements.length, 6);
  assert.notDeepEqual(
    elements.map((element) => element.categoryId),
    ['c1', 'c1', 'c1', 'c2', 'c2', 'c2'],
  );
  const answer = Object.fromEntries(elements.map((element) => [element.id, element.categoryId]));
  assert.equal(evaluateAnswer(item, answer).expectedFound, true);
  answer[elements[0].id] = 'c2';
  assert.equal(evaluateAnswer(item, answer).expectedFound, false);
});

test('la validation est impossible tant que la réponse est incomplète', () => {
  assert.equal(isAnswerComplete(byId['Q1-01'], undefined), false);
  assert.equal(isAnswerComplete(byId['Q1-01'], 'true'), true);
  const association = byId['Q1-06'];
  assert.equal(isAnswerComplete(association, { '1': association.pairs[0].answer }), false);
  assert.equal(
    isAnswerComplete(association, Object.fromEntries(association.pairs.map((pair) => [pair.id, pair.answer]))),
    true,
  );
});

/* --- Progression --------------------------------------------------------- */

test('une réponse peut être modifiée avant validation, plus après', () => {
  let progress = createEmptyProgress('Q1');
  progress = setAnswer(progress, 'Q1-01', 'true');
  progress = setAnswer(progress, 'Q1-01', 'false');
  assert.equal(progress.answers['Q1-01'], 'false');

  progress = markValidated(progress, 'Q1-01');
  const frozen = setAnswer(progress, 'Q1-01', 'true');
  assert.equal(frozen.answers['Q1-01'], 'false');
  assert.equal(isValidated(frozen, 'Q1-01'), true);
});

test('la progression suit la question courante et la fin de quiz', () => {
  let progress = createEmptyProgress('Q2');
  progress = setCurrentOrder(progress, 4);
  assert.equal(progress.currentOrder, 4);
  progress = markCompleted(progress);
  assert.equal(progress.completed, true);
});

test('la relecture du stockage ignore les champs inattendus', () => {
  const dirty = {
    quizId: 'Q1',
    currentOrder: 3,
    answers: { 'Q1-01': 'false', 'Q1-02': ['tableau ignoré'] },
    validatedItemIds: ['Q1-01', 42],
    completed: false,
    diagnostic: 'burn-out',
    email: 'personne@example.org',
    commentaireSante: 'texte libre',
  };
  const clean = sanitizeProgress(dirty, 'Q1');
  assert.deepEqual(Object.keys(clean).sort(), ['answers', 'completed', 'currentOrder', 'quizId', 'updatedAt', 'validatedItemIds', 'version']);
  assert.deepEqual(clean.validatedItemIds, ['Q1-01']);
  assert.deepEqual(Object.keys(clean.answers), ['Q1-01']);
});

test('reprise et remise à zéro du stockage local', () => {
  const store = createMemoryStorage();
  let progress = createEmptyProgress('Q3');
  progress = markValidated(setAnswer(progress, 'Q3-01', 'B'), 'Q3-01');
  saveProgress(progress, store);

  const reloaded = loadProgress('Q3', store);
  assert.equal(reloaded.answers['Q3-01'], 'B');
  assert.deepEqual(reloaded.validatedItemIds, ['Q3-01']);

  clearProgress('Q3', store);
  assert.equal(loadProgress('Q3', store), null);

  saveProgress(progress, store);
  store.setItem('autre-application', 'à conserver');
  clearAllProgress(store);
  assert.equal(loadProgress('Q3', store), null);
  assert.equal(store.getItem('autre-application'), 'à conserver');
  assert.equal([...store.keys()].some((key) => key.startsWith(STORAGE_PREFIX)), false);
});

test('un stockage indisponible ne casse pas le parcours', () => {
  const hostile = {
    get length() { throw new Error('stockage désactivé'); },
    getItem() { throw new Error('stockage désactivé'); },
    setItem() { throw new Error('stockage désactivé'); },
    removeItem() { throw new Error('stockage désactivé'); },
    key() { throw new Error('stockage désactivé'); },
  };
  assert.equal(loadProgress('Q1', hostile), null);
  assert.equal(saveProgress(createEmptyProgress('Q1'), hostile), false);
  assert.equal(clearAllProgress(hostile), false);
});

/* --- Restitution --------------------------------------------------------- */

test('la synthèse décrit des réponses, pas une personne', () => {
  const items = itemsOf('Q1');
  let progress = createEmptyProgress('Q1');
  for (const item of items) {
    const answer = item.format === 'single_choice' || item.format === 'true_false'
      ? item.correctOptionIds[0]
      : buildAnswerFor(item);
    progress = markValidated(setAnswer(progress, item.id, answer), item.id);
  }
  const summary = computeSummary(items, progress);
  assert.deepEqual(Object.keys(summary).sort(), ['expectedFound', 'missedOrders', 'reviewed', 'total']);
  assert.equal(summary.total, 14);
  assert.equal(summary.reviewed, 14);
  assert.equal(summary.expectedFound, 14);
  assert.deepEqual(summary.missedOrders, []);
});

test('tout faux : au maximum deux axes, jamais de profil', () => {
  const items = itemsOf('Q1');
  const summary = { missedOrders: items.map((item) => item.order) };
  const axes = selectAxes(remediation.quizzes.Q1, summary.missedOrders, remediation.maxAxes);
  assert.equal(axes.length, 2);
  for (const axis of axes) {
    assert.equal(typeof axis.message, 'string');
    for (const forbidden of FORBIDDEN_RESTITUTION) {
      assert.ok(!forbidden.test(axis.message), `${axis.id} : ${forbidden}`);
    }
  }
});

test('tout juste : aucun axe proposé', () => {
  assert.deepEqual(selectAxes(remediation.quizzes.Q1, [], 2), []);
  assert.deepEqual(selectAxes(remediation.quizzes.Q3, [], 2), []);
});

test('le seuil de déclenchement des axes est respecté', () => {
  // Quiz 1 : deux erreurs minimum dans l'axe.
  assert.deepEqual(selectAxes(remediation.quizzes.Q1, [1], 2), []);
  assert.equal(selectAxes(remediation.quizzes.Q1, [1, 2], 2).length, 1);
  // Quiz 3 : une erreur suffit.
  assert.equal(selectAxes(remediation.quizzes.Q3, [9], 2).length, 1);
});

test('les axes les plus concernés passent en premier', () => {
  const axes = selectAxes(remediation.quizzes.Q1, [1, 2, 3, 7, 8], 2);
  assert.deepEqual(axes.map((axis) => axis.id), ['Q1-axe-A', 'Q1-axe-C']);
});

/* --- Rendu et événements -------------------------------------------------- */

test('le rendu Markdown échappe le HTML du contenu', () => {
  const html = renderMarkdown('Texte <img src=x onerror=alert(1)> **gras**');
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('<strong>gras</strong>'));
  assert.equal(escapeHtml('a & b'), 'a &amp; b');
});

test('le rendu Markdown restitue citations, listes et intertitres', () => {
  const html = renderMarkdown('### Titre\n\n> **Repère**\n\n- un\n- deux');
  assert.ok(html.includes('<h3>Titre</h3>'));
  assert.ok(html.includes('<blockquote><p><strong>Repère</strong></p></blockquote>'));
  assert.ok(html.includes('<ul><li>un</li><li>deux</li></ul>'));
});

test('aucun événement n’est émis sans collecteur installé', () => {
  assert.equal(track('quiz_started', { quizId: 'Q1' }), false);
});

test('les événements filtrent les données non produit', () => {
  const received = [];
  setSink((name, payload) => received.push([name, payload]));
  track('item_validated', {
    quizId: 'Q1',
    itemId: 'Q1-01',
    expectedFound: true,
    diagnostic: 'burn-out',
    commentaire: 'texte libre de la personne',
  });
  track('événement_inconnu', { quizId: 'Q1' });
  setSink(null);

  assert.equal(received.length, 1);
  assert.deepEqual(received[0][1], { quizId: 'Q1', itemId: 'Q1-01', expectedFound: true });
  assert.deepEqual(sanitizePayload({ email: 'a@b.c' }), {});
  assert.ok(!ALLOWED_EVENTS.includes('événement_inconnu'));
});

/* --- Utilitaires ---------------------------------------------------------- */

/** Formulations interdites dans la restitution (règles pédagogiques §4). */
const FORBIDDEN_RESTITUTION = [
  /vous êtes/i,
  /votre profil/i,
  /à risque/i,
  /niveau de risque/i,
  /sévérité/i,
  /vulnérab/i,
  /vous connaissez mal/i,
  /diagnostic/i,
];

function buildAnswerFor(item) {
  if (item.format === 'association') return Object.fromEntries(item.pairs.map((pair) => [pair.id, pair.answer]));
  if (item.format === 'classification') {
    return Object.fromEntries(buildClassificationElements(item).map((element) => [element.id, element.categoryId]));
  }
  return item.correctOptionIds[0];
}

function createMemoryStorage() {
  const map = new Map();
  return {
    get length() { return map.size; },
    key(index) { return [...map.keys()][index] ?? null; },
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { map.set(key, String(value)); },
    removeItem(key) { map.delete(key); },
    keys() { return map.keys(); },
  };
}
