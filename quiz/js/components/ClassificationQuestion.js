/**
 * Classement.
 * Chaque élément reçoit une catégorie via des boutons radio : interaction clavier
 * et tactile native, sans glisser-déposer.
 * Les éléments sont entrelacés entre catégories (voir scoring.buildClassificationElements).
 *
 * `onChange` reçoit uniquement l'élément modifié ; la fusion avec les réponses
 * déjà données est faite par le contrôleur, qui détient l'état courant.
 */
import { el } from '../dom.js';
import { buildClassificationElements } from '../scoring.js';

export function classificationQuestion({ item, answer = {}, validated, evaluation, onChange }) {
  const elements = buildClassificationElements(item);

  const rows = elements.map((element) => {
    const detail = evaluation?.details.find((entry) => entry.id === element.id);
    const classes = ['assign'];
    if (validated && detail?.expectedFound) classes.push('assign--expected');
    if (validated && detail && !detail.expectedFound) classes.push('assign--chosen');

    const expectedLabel = item.categories.find((category) => category.id === element.categoryId)?.label ?? '';

    return el('fieldset', { class: classes.join(' ') }, [
      el('legend', { text: element.label }),
      el(
        'div',
        { class: 'option-list' },
        item.categories.map((category) =>
          el('label', { class: 'option' }, [
            el('input', {
              type: 'radio',
              name: `class-${item.id}-${element.id}`,
              value: category.id,
              checked: answer[element.id] === category.id,
              disabled: validated,
              onChange: () => onChange({ [element.id]: category.id }),
            }),
            el('span', { class: 'option__text', text: category.label }),
          ]),
        ),
      ),
      validated && detail
        ? el('span', { class: 'assign__status', text: detail.expectedFound ? 'Catégorie attendue' : 'Catégorie attendue différente' })
        : null,
      validated && detail && !detail.expectedFound
        ? el('span', { class: 'assign__expected', text: `Catégorie attendue : ${expectedLabel}` })
        : null,
    ]);
  });

  return el('div', { class: 'assign-list' }, rows);
}
