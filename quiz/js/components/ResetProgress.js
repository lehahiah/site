/** Effacement de la progression locale. */
import { el } from '../dom.js';

export function resetProgress({ label = 'Effacer ma progression', confirmLabel = 'Confirmer l’effacement', onReset }) {
  const wrapper = el('div', { class: 'button-row' });
  const status = el('p', { class: 'meta', role: 'status', 'aria-live': 'polite' });

  const askButton = el('button', {
    type: 'button',
    class: 'button button--quiet',
    text: label,
    onClick: () => {
      wrapper.replaceChildren(confirmButton, cancelButton);
      confirmButton.focus();
    },
  });

  const confirmButton = el('button', {
    type: 'button',
    class: 'button button--secondary',
    text: confirmLabel,
    onClick: () => {
      onReset();
      wrapper.replaceChildren(askButton);
      status.textContent = 'Progression effacée sur cet appareil.';
    },
  });

  const cancelButton = el('button', {
    type: 'button',
    class: 'button button--quiet',
    text: 'Annuler',
    onClick: () => {
      wrapper.replaceChildren(askButton);
      askButton.focus();
    },
  });

  wrapper.append(askButton);
  return el('div', {}, [wrapper, status]);
}
