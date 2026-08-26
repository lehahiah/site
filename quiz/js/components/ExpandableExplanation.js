/** Approfondissement facultatif, replié par défaut (hors flux principal de lecture). */
import { el } from '../dom.js';
import { markdownElement } from '../markdown.js';

export function expandableExplanation({ title, markdown, onOpen }) {
  if (!markdown) return null;
  const details = el('details', { class: 'expandable' }, [
    el('summary', { text: title }),
    markdownElement(markdown, { className: 'expandable__body' }),
  ]);
  if (onOpen) details.addEventListener('toggle', () => { if (details.open) onOpen(); });
  return details;
}
