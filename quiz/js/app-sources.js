/**
 * Page « Sources ».
 * Affiche les références publiques de chaque question, telles qu'elles figurent
 * dans les données. Aucun niveau de confiance, aucune balise interne, aucune
 * note de vigilance, aucune URL fabriquée.
 */

import { loadContent, getItems, getBlockLabel } from './dataset.js';
import { el, clear } from './dom.js';
import { sourcesList } from './components/SourcesList.js';

const container = document.getElementById('liste-sources');

async function start() {
  let content;
  try {
    content = await loadContent();
  } catch (error) {
    clear(container);
    container.append(el('p', { class: 'error', text: error.message }));
    return;
  }

  clear(container);
  for (const quiz of content.dataset.quizzes) {
    const items = getItems(content.dataset, quiz.id);
    container.append(
      el('section', { class: 'card', id: quiz.id, 'aria-labelledby': `titre-${quiz.id}` }, [
        el('h2', { id: `titre-${quiz.id}`, text: quiz.title }),
        el('p', { class: 'meta', text: `${quiz.itemCount} questions` }),
        ...items.map((item) =>
          el('div', {}, [
            el('h3', { text: `Question ${item.order} — ${getBlockLabel(quiz, item.blockId)}` }),
            sourcesList({ sources: item.sources, title: `Références de la question ${item.order}` }),
          ]),
        ),
      ]),
    );
  }
}

start();
