/**
 * Références d'un item.
 * Accessibles sans être imposées à la lecture. Un lien n'est cliquable que si une
 * URL validée figure dans les données : aucune URL n'est fabriquée.
 */
import { el } from '../dom.js';

export function sourcesList({ sources = [], onOpen, title = 'Sources' }) {
  if (!sources.length) return null;

  const entries = sources.map((source) => {
    if (typeof source === 'string') return el('li', { text: source });
    const label = source.label ?? source.title ?? '';
    if (source.url) {
      return el('li', {}, [el('a', { href: source.url, rel: 'noopener noreferrer', target: '_blank', text: label })]);
    }
    return el('li', { text: label });
  });

  const details = el('details', { class: 'expandable sources' }, [
    el('summary', { text: title }),
    el('div', { class: 'expandable__body' }, [el('ul', { class: 'sources__list' }, entries)]),
  ]);
  if (onOpen) details.addEventListener('toggle', () => { if (details.open) onOpen(); });
  return details;
}
