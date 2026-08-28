/**
 * Tests de contenu — critères de recette A (intégrité du contenu).
 * Lancement : node --test quiz/tests/
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  validateDataset,
  INTERNAL_METADATA_PATTERNS,
  PUBLIC_MARKDOWN_FIELDS,
  VIGILANCE_PHRASING,
  INTERNAL_FIELDS,
} from '../js/validate.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const read = (file) => JSON.parse(readFileSync(join(root, file), 'utf8'));

const dataset = read('data/questions-31.json');
const remediation = read('data/remediation.json');
const presentation = read('data/quiz-presentation.json');

test('le jeu de données passe la validation complète', () => {
  const { ok, errors } = validateDataset(dataset);
  assert.deepEqual(errors, []);
  assert.equal(ok, true);
});

test('31 items répartis en 14 / 8 / 9', () => {
  assert.equal(dataset.items.length, 31);
  assert.equal(dataset.items.filter((item) => item.quizId === 'Q1').length, 14);
  assert.equal(dataset.items.filter((item) => item.quizId === 'Q2').length, 8);
  assert.equal(dataset.items.filter((item) => item.quizId === 'Q3').length, 9);
});

test('identifiants uniques et ordre conforme aux masters', () => {
  const ids = dataset.items.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const quizId of ['Q1', 'Q2', 'Q3']) {
    const orders = dataset.items.filter((item) => item.quizId === quizId).map((item) => item.order);
    assert.deepEqual(orders, [...orders].sort((a, b) => a - b));
  }
});

test('un seul choix correct par QCM et vrai/faux', () => {
  for (const item of dataset.items) {
    if (!['single_choice', 'true_false'].includes(item.format)) continue;
    assert.equal(item.options.filter((option) => option.correct).length, 1, item.id);
    assert.equal(item.correctOptionIds.length, 1, item.id);
  }
});

test('Q1-06 : 6 associations, Q1-14 : 4 associations, Q1-11 : 2 catégories', () => {
  const byId = Object.fromEntries(dataset.items.map((item) => [item.id, item]));
  assert.equal(byId['Q1-06'].pairs.length, 6);
  assert.equal(byId['Q1-14'].pairs.length, 4);
  assert.equal(byId['Q1-11'].categories.length, 2);
});

test('chaque item a un corrigé court, un « À retenir » et au moins une source', () => {
  for (const item of dataset.items) {
    assert.ok(item.correctionShortMarkdown?.trim(), `${item.id} corrigé`);
    assert.ok(item.takeawayMarkdown?.trim(), `${item.id} à retenir`);
    assert.ok(item.sources?.length > 0, `${item.id} sources`);
  }
});

test('aucune métadonnée interne dans les champs affichés au public', () => {
  for (const item of dataset.items) {
    for (const field of PUBLIC_MARKDOWN_FIELDS) {
      const value = item[field];
      if (typeof value !== 'string') continue;
      for (const pattern of INTERNAL_METADATA_PATTERNS) {
        assert.ok(!pattern.test(value), `${item.id}.${field} contient ${pattern}`);
      }
    }
  }
});

test('aucun champ interne n’est servi au public', () => {
  for (const item of dataset.items) {
    for (const field of INTERNAL_FIELDS) {
      assert.ok(!(field in item), `${item.id} : ${field} présent dans le contenu public`);
    }
  }
});

test('aucune note de vigilance interne n’est publiée comme source', () => {
  const source = read('data/questions-31.source.json');
  const vigilanceById = Object.fromEntries(
    source.items.map((item) => [
      item.id,
      (item.vigilanceMarkdown ?? '')
        .split('\n')
        .map((line) => line.replace(/^[-•]\s+/, '').trim().toLowerCase())
        .filter(Boolean),
    ]),
  );

  for (const item of dataset.items) {
    for (const entry of item.sources) {
      assert.ok(!VIGILANCE_PHRASING.test(entry), `${item.id} : source rédigée comme une note de vigilance`);
      assert.ok(
        !vigilanceById[item.id].includes(entry.trim().toLowerCase()),
        `${item.id} : « ${entry.slice(0, 50)}… » provient du point de vigilance interne`,
      );
      assert.ok(!entry.includes('*'), `${item.id} : marque Markdown visible dans une source`);
    }
  }
});

test('aucun énoncé ne révèle la réponse attendue', () => {
  for (const item of dataset.items) {
    assert.ok(!/Réponse attendue/i.test(item.promptMarkdown), item.id);
    assert.ok(!item.promptMarkdown.includes('✅'), item.id);
  }
});

test('les axes de remédiation couvrent des items existants et restent limités à deux', () => {
  assert.equal(remediation.maxAxes, 2);
  for (const [quizId, axes] of Object.entries(remediation.quizzes)) {
    const orders = dataset.items.filter((item) => item.quizId === quizId).map((item) => item.order);
    for (const axis of axes) {
      assert.ok(axis.items.length > 0, axis.id);
      assert.ok(axis.message.trim().length > 0, axis.id);
      for (const order of axis.items) assert.ok(orders.includes(order), `${axis.id} → item ${order}`);
    }
  }
});

test('chaque série a un objectif et un avertissement propre', () => {
  for (const quiz of dataset.quizzes) {
    assert.ok(quiz.introDisclaimer?.trim(), quiz.id);
    assert.ok(presentation[quiz.id]?.objective?.trim(), quiz.id);
  }
});

test('aucun texte de question n’est codé en dur dans le code de l’application', async () => {
  const { readdirSync, statSync } = await import('node:fs');
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory)) {
      const full = join(directory, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(js|html)$/.test(entry)) files.push(full);
    }
  };
  // Portée : le code de l'application. Les pages statiques (« À propos ») peuvent
  // légitimement reprendre le vocabulaire institutionnel du bloc orientation.
  walk(join(root, 'js'));
  files.push(join(root, 'parcours.html'));
  const sources = files.map((file) => readFileSync(file, 'utf8')).join('\n');

  const fragments = [];
  for (const item of dataset.items) {
    fragments.push(item.promptMarkdown.replace(/[#>*\n]/g, ' ').trim().slice(0, 40));
    for (const option of item.options ?? []) fragments.push(option.text.slice(0, 40));
    for (const pair of item.pairs ?? []) fragments.push(pair.answer.slice(0, 40));
    fragments.push(item.takeawayMarkdown.replace(/[#>*\n]/g, ' ').trim().slice(0, 40));
  }

  for (const fragment of fragments) {
    if (fragment.length < 20) continue;
    assert.ok(!sources.includes(fragment), `fragment de contenu trouvé dans le code : « ${fragment} »`);
  }
});

test('le fichier runtime est aligné sur la source normalisée', () => {
  execFileSync(process.execPath, [join(root, 'tools', 'normalize-dataset.mjs'), '--check'], { stdio: 'pipe' });
});
