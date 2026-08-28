/**
 * Validation du jeu de données.
 *
 * Exécutée au chargement de l'application (échec visible plutôt que contenu
 * silencieusement incomplet) et dans les tests automatisés.
 *
 * Contrôles issus du cahier des charges §17 et des critères de recette A.
 */

export const EXPECTED_ITEM_COUNTS = Object.freeze({ Q1: 14, Q2: 8, Q3: 9 });
export const EXPECTED_TOTAL = 31;
export const EXPECTED_STRUCTURED_ITEMS = Object.freeze({
  'Q1-06': { format: 'association', pairs: 6 },
  'Q1-11': { format: 'classification', categories: 2 },
  'Q1-14': { format: 'association', pairs: 4 },
});

/** Champs affichés au public : ils ne doivent contenir aucune métadonnée interne. */
export const PUBLIC_MARKDOWN_FIELDS = Object.freeze([
  'promptMarkdown',
  'correctionShortMarkdown',
  'takeawayMarkdown',
  'whyMythMarkdown',
  'deeperMarkdown',
]);

/** Motifs interdits dans les champs publics (métadonnées éditoriales internes). */
export const INTERNAL_METADATA_PATTERNS = Object.freeze([
  /Niveau de confiance/i,
  /\*\*Nature\s*:/i,
  /\*\*Sources?\s*:/i,
  /\*\*Source primaire\s*:/i,
  /Point de vigilance/i,
  /\[LEGAL\]/,
  /\[DONNEE\]/,
  /\[DONNÉE\]/,
  /\[PRATIQUE\]/,
  /Réponse attendue/i,
]);

/** Tournures propres aux notes de vigilance internes (consignes à l'équipe éditoriale). */
export const VIGILANCE_PHRASING = /^(ne pas |ne jamais |éviter |distinguer |respecter |rester |déplacer |rappeler |l'item |le maintien )/i;

/** Champs internes qui ne doivent pas figurer dans le contenu servi au public. */
export const INTERNAL_FIELDS = Object.freeze(['confidence', 'sourceNature', 'vigilanceMarkdown']);

const CHOICE_FORMATS = ['single_choice', 'true_false'];

/**
 * Valide un dataset complet.
 * @returns {{ok: boolean, errors: string[]}}
 */
export function validateDataset(dataset) {
  const errors = [];
  const fail = (message) => errors.push(message);

  if (!dataset || typeof dataset !== 'object') {
    return { ok: false, errors: ['Jeu de données absent ou illisible.'] };
  }
  if (dataset.clinicalAssessment !== false) fail('clinicalAssessment doit valoir false.');
  if (!Array.isArray(dataset.quizzes) || dataset.quizzes.length !== 3) fail('Trois quiz attendus.');
  if (!Array.isArray(dataset.items)) return { ok: false, errors: [...errors, 'items manquant.'] };

  if (dataset.items.length !== EXPECTED_TOTAL) {
    fail(`${EXPECTED_TOTAL} items attendus, ${dataset.items.length} trouvés.`);
  }

  const seenIds = new Set();
  for (const item of dataset.items) {
    const id = item.id ?? '(sans id)';
    if (seenIds.has(item.id)) fail(`Identifiant dupliqué : ${id}.`);
    seenIds.add(item.id);

    if (!EXPECTED_ITEM_COUNTS[item.quizId]) fail(`${id} : quizId inconnu (${item.quizId}).`);
    if (!Number.isInteger(item.order) || item.order < 1) fail(`${id} : order invalide.`);
    if (!item.blockId) fail(`${id} : blockId manquant.`);
    if (!item.promptMarkdown) fail(`${id} : énoncé manquant.`);
    if (!item.correctionShortMarkdown) fail(`${id} : corrigé court manquant.`);
    if (!item.takeawayMarkdown) fail(`${id} : « À retenir » manquant.`);
    if (!Array.isArray(item.sources) || item.sources.length === 0) fail(`${id} : aucune source.`);

    for (const field of PUBLIC_MARKDOWN_FIELDS) {
      const value = item[field];
      if (typeof value !== 'string') continue;
      for (const pattern of INTERNAL_METADATA_PATTERNS) {
        if (pattern.test(value)) fail(`${id} : métadonnée interne (${pattern}) dans le champ public ${field}.`);
      }
    }

    // Les références sont publiques : elles ne doivent contenir ni métadonnée
    // interne, ni note de vigilance rédigée à l'impératif.
    for (const source of item.sources ?? []) {
      if (typeof source !== 'string') {
        fail(`${id} : référence de source non textuelle.`);
        continue;
      }
      for (const pattern of INTERNAL_METADATA_PATTERNS) {
        if (pattern.test(source)) fail(`${id} : métadonnée interne (${pattern}) dans une source publique.`);
      }
      if (VIGILANCE_PHRASING.test(source)) {
        fail(`${id} : note de vigilance interne publiée comme source (« ${source.slice(0, 60)}… »).`);
      }
    }

    // Les champs internes ne doivent pas être servis au navigateur.
    for (const field of INTERNAL_FIELDS) {
      if (field in item) fail(`${id} : champ interne ${field} présent dans le contenu public.`);
    }

    if (CHOICE_FORMATS.includes(item.format)) {
      if (!Array.isArray(item.options) || item.options.length < 2) {
        fail(`${id} : options manquantes.`);
      } else {
        const correct = item.options.filter((option) => option.correct);
        if (correct.length !== 1) fail(`${id} : ${correct.length} bonne(s) réponse(s), une seule attendue.`);
        const ids = item.options.map((option) => option.id);
        if (new Set(ids).size !== ids.length) fail(`${id} : identifiants d'options dupliqués.`);
        const declared = (item.correctOptionIds ?? []).join('|');
        if (declared !== correct.map((option) => option.id).join('|')) {
          fail(`${id} : correctOptionIds incohérent avec les options.`);
        }
      }
    } else if (item.format === 'association') {
      if (!Array.isArray(item.pairs) || item.pairs.length === 0) fail(`${id} : associations manquantes.`);
      else if (item.pairs.some((pair) => !pair.promptMarkdown || !pair.answer)) fail(`${id} : association incomplète.`);
    } else if (item.format === 'classification') {
      if (!Array.isArray(item.categories) || item.categories.length < 2) fail(`${id} : catégories manquantes.`);
      else if (item.categories.some((category) => !category.label || !Array.isArray(category.items) || category.items.length === 0)) {
        fail(`${id} : catégorie incomplète.`);
      }
    } else {
      fail(`${id} : format inconnu (${item.format}).`);
    }
  }

  for (const [quizId, expectedCount] of Object.entries(EXPECTED_ITEM_COUNTS)) {
    const items = dataset.items.filter((item) => item.quizId === quizId);
    if (items.length !== expectedCount) fail(`${quizId} : ${expectedCount} items attendus, ${items.length} trouvés.`);

    const orders = items.map((item) => item.order).sort((a, b) => a - b);
    const expectedOrders = Array.from({ length: items.length }, (_value, index) => index + 1);
    if (orders.join(',') !== expectedOrders.join(',')) fail(`${quizId} : numérotation des items non continue.`);

    const quiz = dataset.quizzes.find((entry) => entry.id === quizId);
    if (!quiz) {
      fail(`${quizId} : définition de quiz manquante.`);
      continue;
    }
    if (quiz.itemCount !== expectedCount) fail(`${quizId} : itemCount incohérent.`);
    if (!quiz.introDisclaimer) fail(`${quizId} : avertissement d'introduction manquant.`);

    const blockOrders = quiz.blocks.flatMap((block) => block.items).sort((a, b) => a - b);
    if (blockOrders.join(',') !== expectedOrders.join(',')) fail(`${quizId} : les blocs ne couvrent pas exactement les items.`);

    for (const item of items) {
      const block = quiz.blocks.find((entry) => entry.id === item.blockId);
      if (!block || !block.items.includes(item.order)) fail(`${item.id} : bloc incohérent.`);
    }
  }

  for (const [itemId, expectation] of Object.entries(EXPECTED_STRUCTURED_ITEMS)) {
    const item = dataset.items.find((entry) => entry.id === itemId);
    if (!item) {
      fail(`${itemId} : item attendu absent.`);
      continue;
    }
    if (item.format !== expectation.format) fail(`${itemId} : format ${expectation.format} attendu.`);
    if (expectation.pairs && (item.pairs ?? []).length !== expectation.pairs) {
      fail(`${itemId} : ${expectation.pairs} associations attendues.`);
    }
    if (expectation.categories && (item.categories ?? []).length !== expectation.categories) {
      fail(`${itemId} : ${expectation.categories} catégories attendues.`);
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Valide les fichiers de contenu annexes (axes de remédiation, présentation des séries).
 * Sans ce contrôle, un fichier annexe malformé casse le rendu au lieu d'être signalé.
 */
export function validateSideFiles(remediation, presentation, dataset) {
  const errors = [];
  const fail = (message) => errors.push(message);

  if (!remediation || typeof remediation !== 'object' || !remediation.quizzes) {
    fail('Axes de remédiation absents ou illisibles.');
  } else {
    const maxAxes = remediation.maxAxes;
    if (!Number.isInteger(maxAxes) || maxAxes < 1 || maxAxes > 2) {
      fail('maxAxes doit valoir 1 ou 2 (règles pédagogiques §4 : deux axes au maximum).');
    }
    for (const quizId of Object.keys(EXPECTED_ITEM_COUNTS)) {
      const axes = remediation.quizzes[quizId];
      if (!Array.isArray(axes) || axes.length === 0) {
        fail(`${quizId} : aucun axe de remédiation.`);
        continue;
      }
      const orders = (dataset?.items ?? []).filter((item) => item.quizId === quizId).map((item) => item.order);
      for (const axis of axes) {
        if (!axis.id || !axis.label || !axis.message) fail(`${quizId} : axe incomplet (${axis.id ?? '?'}).`);
        if (!Array.isArray(axis.items) || axis.items.length === 0) {
          fail(`${quizId} : axe ${axis.id} sans item.`);
          continue;
        }
        for (const order of axis.items) {
          if (!orders.includes(order)) fail(`${quizId} : axe ${axis.id} référence l'item ${order}, inexistant.`);
        }
        for (const order of Object.keys(axis.minSubErrors ?? {})) {
          if (!axis.items.includes(Number(order))) {
            fail(`${quizId} : axe ${axis.id} exige des sous-erreurs sur l'item ${order}, hors de son périmètre.`);
          }
        }
      }
    }
  }

  if (!presentation || typeof presentation !== 'object') {
    fail('Présentation des séries absente ou illisible.');
  } else {
    for (const quizId of Object.keys(EXPECTED_ITEM_COUNTS)) {
      if (!presentation[quizId]?.objective) fail(`${quizId} : objectif de série manquant.`);
      if (!presentation[quizId]?.summary) fail(`${quizId} : description de série manquante.`);
    }
  }

  return { ok: errors.length === 0, errors };
}
