/**
 * Mesure facultative et non bloquante (règles pédagogiques §5).
 * La réponse ne modifie jamais le résultat du répondant et n'est pas conservée
 * localement : elle alimente uniquement l'interface d'événements interne.
 */
import { el } from '../dom.js';

const CHOICES = [
  { value: 'yes', label: 'Oui, clairement.' },
  { value: 'somewhat', label: 'Un peu.' },
  { value: 'known', label: 'Non, je le savais déjà.' },
];

export function perceptionCheck({ onAnswer }) {
  const container = el('div', { class: 'surprise' });
  const question = el('p', { class: 'surprise__question', id: 'surprise-question', text: 'Cette question a-t-elle changé ou nuancé ce que vous pensiez ?' });

  const buttons = el(
    'div',
    { class: 'button-row', role: 'group', 'aria-labelledby': 'surprise-question' },
    CHOICES.map((choice) =>
      el('button', {
        type: 'button',
        class: 'button button--secondary',
        text: choice.label,
        onClick: () => {
          onAnswer?.(choice.value);
          container.replaceChildren(el('p', { class: 'surprise__done', role: 'status', text: 'Merci, réponse notée. Elle ne modifie pas votre parcours.' }));
        },
      }),
    ),
  );

  container.append(question, buttons);
  return container;
}
