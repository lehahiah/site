/** Repère « À retenir » : une seule idée, jamais une règle clinique individuelle. */
import { el } from '../dom.js';
import { markdownElement } from '../markdown.js';

export function takeaway({ markdown }) {
  if (!markdown) return null;
  return el('div', { class: 'takeaway' }, [
    el('p', { class: 'takeaway__label', text: 'À retenir' }),
    markdownElement(markdown),
  ]);
}
