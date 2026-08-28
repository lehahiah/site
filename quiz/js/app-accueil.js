/** Page d'accueil : présentation des trois séries et état local de progression. */

import { loadContent } from './dataset.js';
import { el, clear } from './dom.js';
import { loadProgress, clearAllProgress } from './storage.js';
import { track } from './analytics.js';
import { quizCard } from './components/QuizCard.js';
import { resetProgress } from './components/ResetProgress.js';

const list = document.getElementById('liste-quiz');
const resetSlot = document.getElementById('reset-progression');

function stateFor(quiz) {
  const progress = loadProgress(quiz.id, undefined);
  if (!progress || progress.validatedItemIds.length === 0) return 'none';
  return progress.completed ? 'completed' : 'started';
}

function renderCards(content) {
  clear(list);
  for (const quiz of content.dataset.quizzes) {
    list.append(
      quizCard({
        quiz,
        presentation: content.presentation[quiz.id],
        state: stateFor(quiz),
        href: `./parcours.html?quiz=${quiz.id}`,
      }),
    );
  }
}

async function start() {
  let content;
  try {
    content = await loadContent();
  } catch (error) {
    clear(list);
    list.append(el('li', { class: 'card error', text: error.message }));
    return;
  }

  renderCards(content);

  if (resetSlot) {
    clear(resetSlot);
    resetSlot.append(
      resetProgress({
        label: 'Effacer ma progression sur cet appareil',
        onReset: () => {
          clearAllProgress(undefined);
          track('progress_reset', {});
          renderCards(content);
        },
      }),
    );
  }
}

start();
