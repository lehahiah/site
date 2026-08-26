/** Indicateur de progression : position dans la série, jamais un score. */
import { el } from '../dom.js';

export function progressIndicator({ current, total, blockLabel }) {
  const percent = Math.round((current / total) * 100);
  // Le compteur figure déjà dans le titre de l'écran : seul le bloc est répété ici.
  return el('div', { class: 'progress' }, [
    el('p', { class: 'progress__label' }, [
      blockLabel ? el('span', { text: blockLabel }) : el('span', {}),
      el('span', { class: 'visually-hidden', text: `Question ${current} sur ${total}` }),
    ]),
    el('div', { class: 'progress__track', 'aria-hidden': 'true' }, [
      el('div', { class: 'progress__bar', style: `width: ${percent}%` }),
    ]),
  ]);
}
