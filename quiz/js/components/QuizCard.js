/** Carte de présentation d'une série sur la page d'accueil. */
import { el } from '../dom.js';

const STATE_LABELS = {
  none: { action: 'Commencer', status: null },
  started: { action: 'Reprendre', status: 'Quiz commencé sur cet appareil' },
  completed: { action: 'Revoir ce quiz', status: 'Quiz terminé sur cet appareil' },
};

export function quizCard({ quiz, presentation, state = 'none', href }) {
  const labels = STATE_LABELS[state] ?? STATE_LABELS.none;

  return el('li', { class: 'card quiz-card' }, [
    el('p', { class: 'quiz-card__eyebrow', text: 'Série' }),
    el('h3', { class: 'quiz-card__title' }, [el('span', { text: quiz.shortTitle })]),
    el('p', { text: presentation?.summary ?? '' }),
    el('p', { class: 'quiz-card__count', text: `${quiz.itemCount} questions` }),
    labels.status ? el('p', { class: 'meta', text: labels.status }) : null,
    el('p', { class: 'quiz-card__actions' }, [
      el('a', { class: 'button', href }, [`${labels.action}`, el('span', { class: 'visually-hidden', text: ` : ${quiz.shortTitle}` })]),
    ]),
  ]);
}
