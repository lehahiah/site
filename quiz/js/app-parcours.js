/**
 * Parcours d'une série : introduction, questions une par une, restitution finale.
 *
 * L'état est conservé côté client et dans `localStorage`. L'historique du
 * navigateur est respecté (une adresse par écran, retour arrière fonctionnel).
 */

import { loadContent, getQuiz, getItems, getItem, getBlockLabel } from './dataset.js';
import { el, clear } from './dom.js';
import { track } from './analytics.js';
import {
  STORAGE_PREFIX,
  createEmptyProgress,
  loadProgress,
  saveProgress,
  clearProgress,
  setAnswer,
  markValidated,
  isValidated,
  setCurrentOrder,
  markCompleted,
} from './storage.js';
import { evaluateAnswer, isAnswerComplete, computeSummary, selectAxes } from './scoring.js';
import { quizIntro } from './components/QuizIntro.js';
import { progressIndicator } from './components/ProgressIndicator.js';
import { questionRenderer } from './components/QuestionRenderer.js';
import { answerFeedback } from './components/AnswerFeedback.js';
import { quizSummary } from './components/QuizSummary.js';
import { resetProgress } from './components/ResetProgress.js';

const main = document.getElementById('contenu');
const liveRegion = document.getElementById('annonces');

const state = {
  content: null,
  quizId: null,
  view: 'intro',
  order: 1,
  progress: null,
  pendingFocus: null,
  firstRender: true,
};

/* --- Adresses ------------------------------------------------------------ */

function buildUrl({ quizId = state.quizId, view = 'intro', order = 1 }) {
  const params = new URLSearchParams({ quiz: quizId });
  if (view === 'question') params.set('q', String(order));
  if (view === 'resultats') params.set('vue', 'resultats');
  return `?${params.toString()}`;
}

function readLocation() {
  const params = new URLSearchParams(window.location.search);
  const quizId = params.get('quiz');
  if (params.get('vue') === 'resultats') return { quizId, view: 'resultats', order: 1 };
  const order = Number.parseInt(params.get('q') ?? '', 10);
  if (Number.isInteger(order) && order > 0) return { quizId, view: 'question', order };
  return { quizId, view: 'intro', order: 1 };
}

function navigate(target, { replace = false } = {}) {
  const url = buildUrl(target);
  if (replace) window.history.replaceState({}, '', url);
  else window.history.pushState({}, '', url);
  state.view = target.view;
  state.order = target.order ?? 1;
  render();
}

/** Aligne l'état sur l'adresse courante, puis rend. */
function syncFromLocation() {
  const next = readLocation();
  state.view = next.view;
  state.order = next.order;
  render();
}

/* --- Progression --------------------------------------------------------- */

function persist(next) {
  if (next === state.progress) return; // les réducteurs renvoient l'objet inchangé
  state.progress = next;
  saveProgress(next, undefined);
}

function restart() {
  clearProgress(state.quizId, undefined);
  state.progress = createEmptyProgress(state.quizId);
  saveProgress(state.progress, undefined);
  track('progress_reset', { quizId: state.quizId });
  navigate({ view: 'question', order: 1 });
}

/* --- Écrans -------------------------------------------------------------- */

function renderIntro(quiz, presentation) {
  const resumeOrder = Math.min(state.progress.currentOrder, quiz.itemCount);
  return quizIntro({
    quiz,
    presentation,
    progress: state.progress,
    startHref: buildUrl({ view: 'question', order: 1 }),
    resumeHref: buildUrl({ view: 'question', order: resumeOrder }),
    resultsHref: buildUrl({ view: 'resultats' }),
    onRestart: restart,
  });
}

function renderQuestion(quiz) {
  const items = getItems(state.content.dataset, state.quizId);
  const total = items.length;
  const order = Math.min(Math.max(state.order, 1), total);
  if (order !== state.order) {
    // Adresse hors bornes : on corrige l'URL plutôt que d'afficher un contenu
    // qui ne correspond pas à ce qui est demandé.
    state.order = order;
    window.history.replaceState({}, '', buildUrl({ view: 'question', order }));
  }
  const item = getItem(state.content.dataset, state.quizId, order);
  const validated = isValidated(state.progress, item.id);
  const answer = state.progress.answers[item.id];
  const evaluation = validated ? evaluateAnswer(item, answer) : null;

  if (state.progress.currentOrder !== order && !state.progress.completed) {
    persist(setCurrentOrder(state.progress, order));
  }

  const heading = el('h1', { id: 'ecran-titre', tabindex: '-1' }, [
    el('span', { class: 'visually-hidden', text: `${quiz.shortTitle} — ` }),
    `Question ${order} sur ${total}`,
  ]);

  const section = el('section', { class: 'card' }, [
    heading,
    progressIndicator({ current: order, total, blockLabel: getBlockLabel(quiz, item.blockId) }),
  ]);

  const questionNode = questionRenderer({
    item,
    answer,
    validated,
    evaluation,
    onChange: (value) => {
      // Les formats structurés n'émettent que la sous-réponse modifiée : la fusion
      // se fait ici, sur l'état courant, jamais sur une copie figée au rendu.
      const previous = state.progress.answers[item.id];
      const next = typeof value === 'string' ? value : { ...(previous ?? {}), ...value };
      persist(setAnswer(state.progress, item.id, next));
      refreshValidateButton();
    },
  });
  section.append(questionNode);

  const validateButton = el('button', {
    type: 'button',
    class: 'button',
    text: 'Valider ma réponse',
    onClick: () => {
      const current = state.progress.answers[item.id];
      if (!isAnswerComplete(item, current)) return;
      persist(markValidated(state.progress, item.id));
      const result = evaluateAnswer(item, current);
      track('item_validated', { quizId: quiz.id, itemId: item.id, expectedFound: result.expectedFound });
      announce(result.expectedFound
        ? 'Réponse validée. Exact. La correction est affichée.'
        : 'Réponse validée. La réponse attendue et la correction sont affichées.');
      state.pendingFocus = 'feedback';
      render();
    },
  });

  function refreshValidateButton() {
    validateButton.disabled = !isAnswerComplete(item, state.progress.answers[item.id]);
  }

  if (!validated) {
    refreshValidateButton();
    section.append(
      el('div', { class: 'question-actions' }, [
        order > 1
          ? el('a', { class: 'button button--quiet', href: buildUrl({ view: 'question', order: order - 1 }), text: 'Question précédente' })
          : el('a', { class: 'button button--quiet', href: buildUrl({ view: 'intro' }), text: 'Retour à la présentation' }),
        validateButton,
      ]),
    );
    return section;
  }

  section.append(
    answerFeedback({
      item,
      evaluation,
      onPanelOpen: (panel) => track('explanation_opened', { quizId: quiz.id, itemId: item.id, panel }),
      onPerceptionChange: (value) => track('perception_change_reported', { quizId: quiz.id, itemId: item.id, value }),
    }),
  );

  const isLast = order === total;
  section.append(
    el('div', { class: 'question-actions' }, [
      order > 1
        ? el('a', { class: 'button button--quiet', href: buildUrl({ view: 'question', order: order - 1 }), text: 'Question précédente' })
        : el('span', {}),
      el('button', {
        type: 'button',
        class: 'button',
        text: isLast ? 'Voir la fin du quiz' : 'Question suivante',
        onClick: () => {
          if (isLast) {
            persist(markCompleted(state.progress));
            track('quiz_completed', { quizId: quiz.id });
            navigate({ view: 'resultats' });
          } else {
            navigate({ view: 'question', order: order + 1 });
          }
        },
      }),
    ]),
  );

  return section;
}

function renderResults(quiz) {
  const items = getItems(state.content.dataset, state.quizId);
  const summary = computeSummary(items, state.progress);

  // Aucune réponse validée : afficher « Quiz terminé / 0 sur 0 » n'aurait aucun sens.
  if (summary.reviewed === 0) {
    return el('section', { class: 'card' }, [
      el('h1', { text: 'Rien à afficher pour l’instant' }),
      el('p', { text: `Aucune réponse n’est enregistrée pour la série « ${quiz.shortTitle} » sur cet appareil.` }),
      el('div', { class: 'button-row' }, [
        el('a', { class: 'button', href: buildUrl({ view: 'question', order: 1 }), text: 'Commencer le quiz' }),
        el('a', { class: 'button button--quiet', href: './', text: 'Choisir un autre quiz' }),
      ]),
    ]);
  }

  const axesConfig = state.content.remediation.quizzes[state.quizId] ?? [];
  const axes = selectAxes(
    axesConfig,
    summary.missedOrders,
    state.content.remediation.maxAxes ?? 2,
    summary.subErrors,
  );

  const expectedFoundIds = items
    .filter((item) => isValidated(state.progress, item.id) && evaluateAnswer(item, state.progress.answers[item.id]).expectedFound)
    .map((item) => item.id);

  const node = quizSummary({
    summary,
    axes,
    items,
    validatedIds: state.progress.validatedItemIds,
    expectedFoundIds,
    links: {
      review: buildUrl({ view: 'question', order: 1 }),
      home: './',
      sources: `./sources.html#${state.quizId}`,
      question: (order) => buildUrl({ view: 'question', order }),
      onRestart: restart,
    },
  });

  const first = node.querySelector('h1');
  if (first) first.setAttribute('tabindex', '-1');
  node.append(
    el('section', { class: 'card' }, [
      el('h2', { text: 'Progression enregistrée sur cet appareil' }),
      el('p', { class: 'meta', text: 'Vos réponses restent dans ce navigateur. Aucune donnée personnelle ni de santé n’est collectée.' }),
      resetProgress({
        label: 'Effacer ma progression pour cette série',
        onReset: () => {
          clearProgress(state.quizId, undefined);
          state.progress = createEmptyProgress(state.quizId);
          track('progress_reset', { quizId: state.quizId });
          // Sans nouveau rendu, l'écran continuerait d'afficher des réponses effacées.
          render();
        },
      }),
    ]),
  );
  return node;
}

/* --- Rendu --------------------------------------------------------------- */

function announce(message) {
  if (!liveRegion) return;
  liveRegion.textContent = '';
  window.setTimeout(() => {
    liveRegion.textContent = message;
  }, 50);
}

function render() {
  const quiz = getQuiz(state.content.dataset, state.quizId);
  const presentation = state.content.presentation[state.quizId];
  document.title = `${quiz.shortTitle} — Quiz burn-out`;

  let screen;
  try {
    if (state.view === 'question') screen = renderQuestion(quiz);
    else if (state.view === 'resultats') screen = renderResults(quiz);
    else screen = renderIntro(quiz, presentation);
  } catch (error) {
    // Un écran vide serait pire qu'un message : on n'efface `main` qu'une fois
    // le nouvel écran construit.
    console.error(error);
    renderError("Cet écran n’a pas pu être affiché.");
    return;
  }

  clear(main);
  main.append(screen);

  if (state.pendingFocus === 'feedback') {
    state.pendingFocus = null;
    const status = main.querySelector('.feedback__status');
    if (status) {
      status.setAttribute('tabindex', '-1');
      status.focus();
      return;
    }
  }
  const heading = main.querySelector('h1');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    // Au premier affichage, la page n'a pas encore été parcourue : on ne déplace
    // le focus que lors des changements d'écran provoqués par la personne.
    if (!state.firstRender) heading.focus({ preventScroll: true });
  }
  state.firstRender = false;
}

function renderError(message) {
  clear(main);
  main.append(
    el('section', { class: 'card' }, [
      el('h1', { text: 'Contenu indisponible' }),
      el('p', { text: message }),
      el('p', {}, [el('a', { href: './', text: 'Revenir à l’accueil' })]),
    ]),
  );
}

async function start() {
  try {
    state.content = await loadContent();
  } catch (error) {
    renderError(error.message);
    return;
  }

  const location = readLocation();
  const quiz = getQuiz(state.content.dataset, location.quizId);
  if (!quiz) {
    renderError('Cette série de questions n’existe pas.');
    return;
  }

  state.quizId = quiz.id;
  state.view = location.view;
  state.order = location.order;
  state.progress = loadProgress(quiz.id, undefined) ?? createEmptyProgress(quiz.id);

  if (state.view === 'intro') track('quiz_started', { quizId: quiz.id });

  window.addEventListener('popstate', syncFromLocation);

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="?"]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    window.history.pushState({}, '', link.getAttribute('href'));
    syncFromLocation();
  });

  // Même série ouverte dans deux onglets : sans cette resynchronisation, le dernier
  // onglet à valider écraserait les réponses enregistrées par l'autre.
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_PREFIX + state.quizId) return;
    state.progress = loadProgress(state.quizId, undefined) ?? createEmptyProgress(state.quizId);
    render();
  });

  render();
}

start();
