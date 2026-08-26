/**
 * Association.
 * Interaction par sélection (situation → réponse associée), utilisable à la souris,
 * au toucher et au clavier. Aucun glisser-déposer n'est requis.
 *
 * `onChange` reçoit uniquement la paire modifiée ; la fusion avec les réponses
 * déjà données est faite par le contrôleur, qui détient l'état courant.
 */
import { el } from '../dom.js';
import { buildAssociationChoices } from '../scoring.js';

export function associationQuestion({ item, answer = {}, validated, evaluation, onChange }) {
  const choices = buildAssociationChoices(item);

  const rows = item.pairs.map((pair, index) => {
    const detail = evaluation?.details.find((entry) => entry.id === pair.id);
    const selectId = `pair-${item.id}-${pair.id}`;
    const classes = ['assign'];
    if (validated && detail?.expectedFound) classes.push('assign--expected');
    if (validated && detail && !detail.expectedFound) classes.push('assign--chosen');

    return el('div', { class: classes.join(' ') }, [
      el('label', { class: 'assign__prompt', for: selectId }, [
        el('span', { class: 'meta', text: `Situation ${index + 1} — ` }),
        el('span', { text: pair.promptMarkdown }),
      ]),
      el(
        'select',
        {
          id: selectId,
          disabled: validated,
          onChange: (event) => onChange({ [pair.id]: event.target.value }),
        },
        [
          el('option', { value: '', selected: !answer[pair.id], text: '— Choisir une réponse —' }),
          ...choices.map((choice) => el('option', { value: choice, selected: answer[pair.id] === choice, text: choice })),
        ],
      ),
      validated && detail
        ? el('span', { class: 'assign__status', text: detail.expectedFound ? 'Association attendue' : 'Association attendue différente' })
        : null,
      validated && detail && !detail.expectedFound
        ? el('span', { class: 'assign__expected', text: `Réponse attendue : ${detail.expectedValue}` })
        : null,
    ]);
  });

  return el('fieldset', {}, [
    el('legend', { class: 'visually-hidden', text: 'Associez chaque situation à une réponse' }),
    el('div', { class: 'assign-list' }, rows),
  ]);
}
