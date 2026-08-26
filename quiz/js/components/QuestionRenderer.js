/**
 * Affichage d'un item : contexte / idée reçue, question, puis interaction.
 * Aucun texte de question n'est écrit ici : tout provient du jeu de données.
 */
import { el } from '../dom.js';
import { markdownElement } from '../markdown.js';
import { singleChoiceQuestion } from './SingleChoiceQuestion.js';
import { trueFalseQuestion } from './TrueFalseQuestion.js';
import { associationQuestion } from './AssociationQuestion.js';
import { classificationQuestion } from './ClassificationQuestion.js';

const RENDERERS = {
  single_choice: singleChoiceQuestion,
  true_false: trueFalseQuestion,
  association: associationQuestion,
  classification: classificationQuestion,
};

export function questionRenderer({ item, answer, validated, evaluation, onChange }) {
  const render = RENDERERS[item.format];
  if (!render) {
    return el('div', { class: 'error', text: "Ce format de question n'est pas pris en charge." });
  }

  return el('div', { class: 'question' }, [
    markdownElement(item.promptMarkdown, { className: 'question__prompt' }),
    render({ item, answer, validated, evaluation, onChange }),
  ]);
}
