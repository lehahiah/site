/**
 * Chargement du contenu.
 *
 * `data/questions-31.json` est la source d'exécution ; `data/remediation.json`
 * porte les axes de remédiation des masters ; `data/quiz-presentation.json`
 * porte les objectifs de chaque série (cahier des charges §4).
 *
 * Le contenu est chargé une seule fois puis conservé en mémoire : aucune requête
 * réseau n'est nécessaire pour afficher une question.
 */

import { validateDataset } from './validate.js';

const url = (file) => new URL(`../data/${file}`, import.meta.url);

let cache = null;

async function fetchJson(file) {
  const response = await fetch(url(file));
  if (!response.ok) throw new Error(`Contenu indisponible : ${file} (${response.status}).`);
  return response.json();
}

/** Charge et valide le contenu. Échoue explicitement si le contenu est incomplet. */
export async function loadContent() {
  if (cache) return cache;
  const [dataset, remediation, presentation] = await Promise.all([
    fetchJson('questions-31.json'),
    fetchJson('remediation.json'),
    fetchJson('quiz-presentation.json'),
  ]);

  const { ok, errors } = validateDataset(dataset);
  if (!ok) throw new Error(`Contenu invalide :\n- ${errors.join('\n- ')}`);

  cache = { dataset, remediation, presentation };
  return cache;
}

export function getQuiz(dataset, quizId) {
  return dataset.quizzes.find((quiz) => quiz.id === quizId) ?? null;
}

export function getItems(dataset, quizId) {
  return dataset.items.filter((item) => item.quizId === quizId).sort((a, b) => a.order - b.order);
}

export function getItem(dataset, quizId, order) {
  return getItems(dataset, quizId).find((item) => item.order === order) ?? null;
}

export function getBlockLabel(quiz, blockId) {
  return quiz?.blocks.find((block) => block.id === blockId)?.label ?? '';
}
