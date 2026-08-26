/**
 * Logique de justesse et de restitution.
 *
 * Le calcul sert uniquement à afficher la correction, à proposer des contenus à
 * revoir et à vérifier la cohérence de l'application (cahier des charges §8).
 * Il ne produit jamais de profil, de niveau de risque ou d'interprétation clinique.
 *
 * Module pur : aucune dépendance au DOM (utilisé aussi par les tests).
 */

/**
 * Éléments à classer, entrelacés entre catégories.
 * Les présenter dans l'ordre du master reviendrait à afficher les catégories
 * déjà constituées : l'entrelacement est déterministe (aucun aléatoire) et ne
 * modifie ni les libellés ni les catégories attendues.
 */
export function buildClassificationElements(item) {
  const columns = item.categories.map((category) =>
    category.items.map((label) => ({ id: '', label, categoryId: category.id })),
  );
  const elements = [];
  const longest = Math.max(...columns.map((column) => column.length));
  for (let row = 0; row < longest; row += 1) {
    for (const column of columns) {
      if (column[row]) elements.push(column[row]);
    }
  }
  return elements.map((element, index) => ({ ...element, id: `e${index + 1}` }));
}

/** Réponses proposées pour une association : ordre alphabétique, sans indice de position. */
export function buildAssociationChoices(item) {
  return item.pairs.map((pair) => pair.answer).sort((a, b) => a.localeCompare(b, 'fr'));
}

/** Une réponse est-elle exploitable (l'utilisateur a-t-il répondu à tout) ? */
export function isAnswerComplete(item, answer) {
  if (answer === undefined || answer === null) return false;
  if (item.format === 'single_choice' || item.format === 'true_false') {
    return typeof answer === 'string' && answer !== '';
  }
  if (item.format === 'association') {
    return item.pairs.every((pair) => Boolean(answer[pair.id]));
  }
  if (item.format === 'classification') {
    return buildClassificationElements(item).every((element) => Boolean(answer[element.id]));
  }
  return false;
}

/**
 * Évalue une réponse.
 * @returns {{expectedFound: boolean, details: Array}} `details` décrit chaque
 * sous-réponse pour l'affichage de la correction (jamais un score clinique).
 */
export function evaluateAnswer(item, answer) {
  if (item.format === 'single_choice' || item.format === 'true_false') {
    const expectedFound = (item.correctOptionIds ?? []).includes(answer);
    return {
      expectedFound,
      details: item.options.map((option) => ({
        id: option.id,
        expected: Boolean(option.correct),
        chosen: option.id === answer,
      })),
    };
  }

  if (item.format === 'association') {
    const details = item.pairs.map((pair) => ({
      id: pair.id,
      chosen: answer?.[pair.id] ?? null,
      expectedValue: pair.answer,
      expectedFound: answer?.[pair.id] === pair.answer,
    }));
    return { expectedFound: details.every((detail) => detail.expectedFound), details };
  }

  if (item.format === 'classification') {
    const details = buildClassificationElements(item).map((element) => ({
      id: element.id,
      label: element.label,
      chosen: answer?.[element.id] ?? null,
      expectedValue: element.categoryId,
      expectedFound: answer?.[element.id] === element.categoryId,
    }));
    return { expectedFound: details.every((detail) => detail.expectedFound), details };
  }

  return { expectedFound: false, details: [] };
}

/**
 * Synthèse d'un quiz : uniquement des faits sur les réponses, jamais sur la personne.
 */
export function computeSummary(items, progress) {
  const answers = progress?.answers ?? {};
  const validated = new Set(progress?.validatedItemIds ?? []);
  let expectedFound = 0;
  const missedOrders = [];

  for (const item of items) {
    if (!validated.has(item.id)) continue;
    if (evaluateAnswer(item, answers[item.id]).expectedFound) expectedFound += 1;
    else missedOrders.push(item.order);
  }

  return {
    total: items.length,
    reviewed: items.filter((item) => validated.has(item.id)).length,
    expectedFound,
    missedOrders,
  };
}

/**
 * Sélectionne au maximum `maxAxes` axes de remédiation (règles pédagogiques §4).
 * Les axes sont ceux des masters ; aucun message n'est généré dynamiquement.
 */
export function selectAxes(axes, missedOrders, maxAxes = 2) {
  const missed = new Set(missedOrders);
  return axes
    .map((axis, index) => ({
      axis,
      index,
      missedCount: axis.items.filter((order) => missed.has(order)).length,
    }))
    .filter((entry) => entry.missedCount >= (entry.axis.minMissed ?? 1))
    .sort((a, b) => b.missedCount - a.missedCount || a.index - b.index)
    .slice(0, maxAxes)
    .map((entry) => entry.axis);
}
