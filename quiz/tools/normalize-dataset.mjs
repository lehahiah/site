#!/usr/bin/env node
/**
 * Normalisation du jeu de données runtime.
 *
 * Entrée  : quiz/data/questions-31.source.json  (export fourni dans le dossier de passation)
 * Sortie  : quiz/data/questions-31.json         (format d'exécution de l'application)
 *
 * Le script NE réécrit AUCUN contenu éditorial. Il réaligne le JSON sur les masters
 * `content/quiz*-master.md` en corrigeant trois artefacts d'extraction :
 *
 *  1. des métadonnées internes (Nature, Sources, Niveau de confiance, Point de vigilance)
 *     recopiées à la fin de champs destinés à l'affichage public ;
 *  2. la mention « **Réponse attendue : X** » laissée à la fin de 17 énoncés de question,
 *     qui révélait la bonne réponse avant validation ;
 *  3. des espaces parasites dans les éléments de classement et les réponses d'association ;
 *  4. des puces de « Point de vigilance » versées dans la liste publique `sources`.
 *
 * Le fichier produit est le CONTENU PUBLIC : les champs internes (`confidence`,
 * `sourceNature`, `vigilanceMarkdown`) en sont retirés pour ne pas être servis au
 * navigateur. Ils restent disponibles dans le fichier source d'origine, qui est le
 * registre interne.
 *
 * Les informations retirées ne sont pas perdues : elles existent déjà dans les champs
 * structurés `sources`, `sourceNature`, `confidence` et `vigilanceMarkdown`.
 *
 * Usage : node quiz/tools/normalize-dataset.mjs [--check]
 *   --check : ne réécrit rien, échoue si la sortie n'est pas à jour.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(here, '..', 'data', 'questions-31.source.json');
const TARGET = join(here, '..', 'data', 'questions-31.json');

/** Marqueurs de début de bloc de métadonnées internes, en début de ligne. */
const METADATA_MARKERS = [
  /^\*\*Nature\s*:\*\*/,
  /^\*\*Sources?\s*:\*\*/,
  /^\*\*Source primaire\s*:\*\*/,
  /^\*\*Niveau de confiance\s*:\*\*/,
  /^\*\*Point de vigilance\s*:\*\*/,
  /^#{2,4}\s+Sources\s*$/,
  /^#{2,4}\s+Contrôle qualité interne\s*$/,
  /^#{2,4}\s+Accessibilité\s*$/,
];

const EXPECTED_ANSWER_TAIL = /\n+\*\*Réponse attendue\s*:\s*([^*]+?)\*\*\s*$/;

const PUBLIC_MARKDOWN_FIELDS = [
  'promptMarkdown',
  'correctionShortMarkdown',
  'takeawayMarkdown',
  'whyMythMarkdown',
  'deeperMarkdown',
];

/** Coupe le texte à la première ligne de métadonnées internes. Retourne [texte, queueRetirée]. */
function stripInternalTail(text) {
  if (typeof text !== 'string') return [text, null];
  const lines = text.split('\n');
  const cut = lines.findIndex((line) => METADATA_MARKERS.some((re) => re.test(line.trim())));
  if (cut === -1) return [trimTrailingRule(text), null];
  const kept = trimTrailingRule(lines.slice(0, cut).join('\n'));
  const removed = lines.slice(cut).join('\n').trim();
  return [kept, removed];
}

/** Retire les séparateurs `---` et espaces en fin de champ. */
function trimTrailingRule(text) {
  return text.replace(/(\n+\s*-{3,}\s*)+$/g, '').replace(/\s+$/g, '');
}

function normalizeItem(item, report) {
  const changes = [];

  for (const field of PUBLIC_MARKDOWN_FIELDS) {
    const value = item[field];
    if (typeof value !== 'string') continue;
    const [kept, removed] = stripInternalTail(value);
    if (removed) {
      changes.push({ field, reason: 'métadonnées internes retirées du champ public', removed });
      item[field] = kept;
    } else if (kept !== value) {
      changes.push({ field, reason: 'séparateur / espaces de fin retirés', removed: null });
      item[field] = kept;
    }
  }

  const answerMatch = item.promptMarkdown?.match(EXPECTED_ANSWER_TAIL);
  if (answerMatch) {
    const letter = answerMatch[1].trim().replace(/\.$/, '');
    item.promptMarkdown = trimTrailingRule(item.promptMarkdown.replace(EXPECTED_ANSWER_TAIL, ''));
    if (!item.expectedAnswer) item.expectedAnswer = `${letter}.`;
    changes.push({
      field: 'promptMarkdown',
      reason: `réponse attendue (« ${letter} ») retirée de l'énoncé et reportée dans expectedAnswer`,
      removed: answerMatch[0].trim(),
    });
  }

  // Puces de « Point de vigilance » versées dans `sources` par l'extraction :
  // elles sont internes (règles pédagogiques §3) et ne doivent pas être publiées.
  if (Array.isArray(item.sources) && item.vigilanceMarkdown) {
    const vigilanceLines = item.vigilanceMarkdown
      .split('\n')
      .map((line) => normalizeForCompare(line.replace(/^[-•]\s+/, '')))
      .filter(Boolean);
    const kept = item.sources.filter((source) => !vigilanceLines.includes(normalizeForCompare(source)));
    if (kept.length !== item.sources.length) {
      changes.push({
        field: 'sources',
        reason: `${item.sources.length - kept.length} note(s) de vigilance interne retirée(s) de la liste publique des sources`,
        removed: item.sources.filter((source) => !kept.includes(source)).join('\n'),
      });
      item.sources = kept;
    }
  }

  // Les références sont affichées en texte brut : les marques d'emphase Markdown
  // resteraient visibles telles quelles.
  if (Array.isArray(item.sources)) {
    const before = item.sources.join('|');
    item.sources = item.sources.map((source) => source.replace(/\*\*?([^*]+)\*\*?/g, '$1').trim());
    if (before !== item.sources.join('|')) {
      changes.push({ field: 'sources', reason: 'marques d’emphase Markdown retirées des références', removed: null });
    }
  }

  // Titres de bloc du master collés à la fin d'une note d'accessibilité.
  if (typeof item.accessibilityMarkdown === 'string') {
    const cleaned = item.accessibilityMarkdown.replace(/\n#{1,6}\s+BLOC[\s\S]*$/i, '').trim();
    if (cleaned !== item.accessibilityMarkdown) {
      changes.push({ field: 'accessibilityMarkdown', reason: 'titre de bloc du master retiré', removed: null });
      item.accessibilityMarkdown = cleaned;
    }
  }

  if (Array.isArray(item.categories)) {
    for (const category of item.categories) {
      const before = category.items.slice();
      category.items = category.items.map((entry) => entry.trim());
      if (before.join('|') !== category.items.join('|')) {
        changes.push({ field: `categories.${category.id}.items`, reason: 'espaces parasites retirés', removed: null });
      }
    }
  }

  if (Array.isArray(item.pairs)) {
    for (const pair of item.pairs) {
      const before = [pair.promptMarkdown, pair.answer].join('|');
      pair.promptMarkdown = pair.promptMarkdown.trim();
      pair.answer = pair.answer.trim();
      if (before !== [pair.promptMarkdown, pair.answer].join('|')) {
        changes.push({ field: `pairs.${pair.id}`, reason: 'espaces parasites retirés', removed: null });
      }
    }
  }

  if (changes.length) report.push({ id: item.id, changes });
  return item;
}

/**
 * Contrôle de non-perte : chaque référence citée dans une queue retirée doit déjà
 * figurer dans le champ structuré `sources` de l'item.
 */
function checkSourcesPreserved(item, changes, warnings) {
  const removedSources = changes
    .flatMap((change) => (change.removed ? change.removed.split('\n') : []))
    .filter((line) => /^[-•]\s+/.test(line.trim()))
    .map((line) => line.trim().replace(/^[-•]\s+/, ''))
    .filter((line) => !/^(ne pas |l'item |respecter |distinguer |aucune |éviter |rester |ne jamais |déplacer |rappeler )/i.test(line));

  const known = (item.sources ?? []).map(normalizeForCompare);
  const vigilance = (item.vigilanceMarkdown ?? '').split('\n').map((l) => normalizeForCompare(l.replace(/^[-•]\s+/, '')));
  for (const source of removedSources) {
    const key = normalizeForCompare(source);
    const isKnown = known.some((k) => k.includes(key.slice(0, 40)) || key.includes(k.slice(0, 40)));
    const isVigilance = vigilance.some((v) => v && (v.includes(key.slice(0, 30)) || key.includes(v.slice(0, 30))));
    if (!isKnown && !isVigilance) warnings.push(`${item.id} : « ${source} » retiré sans équivalent dans sources[] / vigilanceMarkdown`);
  }
}

function normalizeForCompare(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const dataset = JSON.parse(readFileSync(SOURCE, 'utf8'));
const report = [];
const warnings = [];

dataset.items = dataset.items.map((item) => normalizeItem(item, report));
for (const entry of report) {
  const item = dataset.items.find((i) => i.id === entry.id);
  checkSourcesPreserved(item, entry.changes, warnings);
}

/** Champs internes (cahier des charges §9) : jamais servis au navigateur. */
const INTERNAL_FIELDS = ['confidence', 'sourceNature', 'vigilanceMarkdown'];

const publicDataset = {
  ...dataset,
  items: dataset.items.map((item) => {
    const publicItem = { ...item };
    for (const field of INTERNAL_FIELDS) delete publicItem[field];
    return publicItem;
  }),
};

const output = `${JSON.stringify(publicDataset, null, 2)}\n`;
const checkOnly = process.argv.includes('--check');

if (checkOnly) {
  let current = null;
  try {
    current = readFileSync(TARGET, 'utf8');
  } catch {
    console.error('questions-31.json absent : lancer `node quiz/tools/normalize-dataset.mjs`.');
    process.exit(1);
  }
  if (current !== output) {
    console.error('questions-31.json n’est pas à jour par rapport à questions-31.source.json.');
    process.exit(1);
  }
  console.log('questions-31.json est à jour.');
} else {
  writeFileSync(TARGET, output);
}

console.log(`Items modifiés : ${report.length} / ${dataset.items.length}`);
for (const entry of report) {
  for (const change of entry.changes) {
    console.log(`  ${entry.id} · ${change.field} · ${change.reason}`);
  }
}
if (warnings.length) {
  console.log('\nAvertissements (vérification manuelle requise) :');
  for (const warning of warnings) console.log(`  - ${warning}`);
}
