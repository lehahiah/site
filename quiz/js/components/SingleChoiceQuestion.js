/**
 * QCM à choix unique.
 * L'ordre des options est celui du jeu de données (identique au master) : aucun mélange.
 * Après validation, les choix sont figés et le statut est porté par du texte, pas par la couleur seule.
 */
import { el } from '../dom.js';

export function choiceQuestion({ item, answer, validated, legend, onChange }) {
  const options = item.options.map((option) => {
    const chosen = answer === option.id;
    const classes = ['option'];
    if (validated && option.correct) classes.push('option--expected');
    if (validated && chosen && !option.correct) classes.push('option--chosen');

    let marker = null;
    if (validated && option.correct) marker = chosen ? 'Réponse attendue · votre réponse' : 'Réponse attendue';
    else if (validated && chosen) marker = 'Votre réponse';

    return el('label', { class: classes.join(' ') }, [
      el('input', {
        type: 'radio',
        name: `answer-${item.id}`,
        value: option.id,
        checked: chosen,
        disabled: validated,
        onChange: () => onChange(option.id),
      }),
      el('span', { class: 'option__text' }, [
        el('span', { text: option.text }),
        marker ? el('span', { class: 'option__marker', text: marker }) : null,
      ]),
    ]);
  });

  return el('fieldset', {}, [
    el('legend', { class: 'visually-hidden', text: legend }),
    el('div', { class: 'option-list', role: 'presentation' }, options),
  ]);
}

export function singleChoiceQuestion(props) {
  return choiceQuestion({ ...props, legend: 'Choisissez une réponse' });
}
