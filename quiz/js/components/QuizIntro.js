/** Écran d'introduction d'une série : titre, objectif, avertissement, nombre de questions. */
import { el } from '../dom.js';

export function quizIntro({ quiz, presentation, progress, startHref, resumeHref, resultsHref, onRestart }) {
  const started = Boolean(progress && progress.validatedItemIds.length > 0);
  const completed = Boolean(progress?.completed);

  return el('section', { class: 'card', 'aria-labelledby': 'quiz-intro-title' }, [
    el('h1', { id: 'quiz-intro-title', text: quiz.title }),
    el('p', { class: 'lede', text: presentation?.objective ?? '' }),
    el('div', { class: 'notice' }, [
      el('p', { class: 'notice__title', text: 'Avant de commencer' }),
      el('p', { text: quiz.introDisclaimer }),
    ]),
    el('p', { class: 'meta', text: `${quiz.itemCount} questions · réponses corrigées une par une · progression conservée sur cet appareil` }),
    el('div', { class: 'button-row' }, [
      el('a', { class: 'button', href: started ? resumeHref : startHref, text: started ? 'Reprendre le quiz' : 'Commencer le quiz' }),
      completed && resultsHref
        ? el('a', { class: 'button button--secondary', href: resultsHref, text: 'Revoir la fin du quiz' })
        : null,
      started ? el('button', { type: 'button', class: 'button button--quiet', text: 'Recommencer depuis le début', onClick: onRestart }) : null,
    ]),
  ]);
}
